import type { ValidationAcceptor, AstNode } from 'langium';
import type { FlowRule, FlowOperand, Section } from '../generated/ast.js';
import { isSection, isFlowRule } from '../generated/ast.js';
import { KW } from '../constants.js';

/**
 * Validates dependencies and detects circular references in flow rules and sections.
 */
export class DependencyValidator {
  constructor() {
    // Constructor simplified for current grammar implementation
  }

  /**
   * Check for circular dependencies in flow rules within a section
   */
  checkFlowRuleCycles(flowRule: FlowRule, accept: ValidationAcceptor): void {
    const parentSection = this.getParentFlowSection(flowRule);
    if (!parentSection) {
      return;
    }

    const flowRules = this.getAllFlowRules(parentSection);
    const flowGraph = this.buildFlowGraph(flowRules);

    const cycles = this.detectCycles(flowGraph);

    cycles.forEach(cycle => {
      const cycleDescription = cycle.join(' -> ');
      accept('error', `Circular dependency detected in flow: ${cycleDescription}`, {
        node: flowRule,
        property: 'source',
        code: 'circular-flow-dependency'
      });
    });
  }

  /**
   * Check for unreachable flow operands
   */
  checkFlowReachability(flowRule: FlowRule, accept: ValidationAcceptor): void {
    const parentSection = this.getParentFlowSection(flowRule);
    if (!parentSection) {
      return;
    }

    const flowRules = this.getAllFlowRules(parentSection);
    const flowGraph = this.buildFlowGraph(flowRules);

    const reachableNodes = this.findReachableNodes(flowGraph);
    const allNodes = this.getAllFlowOperands(flowRules);

    for (const node of allNodes) {
      if (!reachableNodes.has(node) && node !== KW.Start && node !== KW.End) {
        // Find the first flow rule that references this unreachable node
        const ruleWithUnreachableNode = flowRules.find(rule => {
          if (!rule.source || !rule.transitions || rule.transitions.length === 0) {
            return false; // Skip malformed flow rules
          }
          return this.getFlowOperandValue(rule.source) === node ||
            rule.transitions.some(transition => this.getFlowOperandValue(transition) === node);
        });

        if (ruleWithUnreachableNode && ruleWithUnreachableNode.source && ruleWithUnreachableNode.transitions) {
          const isSource = this.getFlowOperandValue(ruleWithUnreachableNode.source) === node;
          const property = isSource ? 'source' : 'transitions';
          accept('warning', `Flow operand '${node}' appears to be unreachable`, {
            node: ruleWithUnreachableNode,
            property,
            code: 'unreachable-flow-operand'
          });
        }
      }
    }
  }

  /**
   * Build a directed graph from flow rules
   */
  private buildFlowGraph(flowRules: FlowRule[]): FlowGraph {
    const graph = new Map<string, Set<string>>();

    flowRules.forEach(rule => {
      // Check if source and transitions exist before processing
      if (!rule.source || !rule.transitions || rule.transitions.length === 0) {
        return; // Skip malformed flow rules
      }

      const source = this.getFlowOperandValue(rule.source);

      if (source) {
        if (!graph.has(source)) {
          graph.set(source, new Set());
        }

        // Add all transitions from this source
        for (const transition of rule.transitions) {
          const target = this.getFlowOperandValue(transition);
          if (target) {
            graph.get(source)!.add(target);
          }
        }
      }
    });

    return graph;
  }

  /**
   * Detect cycles in a directed graph using DFS
   */
  private detectCycles(graph: FlowGraph): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        this.dfsDetectCycle(graph, node, visited, recursionStack, [], cycles);
      }
    }

    return cycles;
  }

  /**
   * DFS algorithm to detect cycles
   */
  private dfsDetectCycle(
    graph: FlowGraph,
    node: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    currentPath: string[],
    cycles: string[][]
  ): void {
    visited.add(node);
    recursionStack.add(node);
    currentPath.push(node);

    const neighbors = graph.get(node) || new Set();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsDetectCycle(graph, neighbor, visited, recursionStack, currentPath, cycles);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = currentPath.indexOf(neighbor);
        if (cycleStart >= 0) {
          const cycle = currentPath.slice(cycleStart).concat([neighbor]);
          cycles.push(cycle);
        }
      }
    }

    recursionStack.delete(node);
    currentPath.pop();
  }

  /**
   * Find all nodes reachable from :start
   */
  private findReachableNodes(graph: FlowGraph): Set<string> {
    const reachable = new Set<string>();
    const queue: string[] = [KW.Start];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) {
        continue;
      }

      reachable.add(current);
      const neighbors = graph.get(current) || new Set();

      for (const neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return reachable;
  }

  /**
   * Get the parent section that contains flow rules
   */
  private getParentFlowSection(flowRule: FlowRule): Section | undefined {
    let current: AstNode | undefined = flowRule.$container;
    while (current) {
      if (isSection(current)) {
        return current;
      }
      current = current.$container;
    }
    return undefined;
  }

  /**
   * Get all flow rules within a section
   */
  private getAllFlowRules(section: Section): FlowRule[] {
    const flowRules: FlowRule[] = [];

    if (section.flowContent) {
      for (const content of section.flowContent) {
        if (isFlowRule(content)) {
          flowRules.push(content);
        }
      }
    }

    // Also check subsections for flow rules
    if (section.subSections) {
      for (const subSection of section.subSections) {
        flowRules.push(...this.getAllFlowRules(subSection));
      }
    }

    return flowRules;
  }

  /**
   * Get all unique flow operands from flow rules
   */
  private getAllFlowOperands(flowRules: FlowRule[]): string[] {
    const operands = new Set<string>();

    flowRules.forEach(rule => {
      // Check if source and transitions exist before processing
      if (!rule.source || !rule.transitions || rule.transitions.length === 0) {
        return; // Skip malformed flow rules
      }

      const source = this.getFlowOperandValue(rule.source);
      if (source) operands.add(source);

      // Add all transitions
      for (const transition of rule.transitions) {
        const target = this.getFlowOperandValue(transition);
        if (target) operands.add(target);
      }
    });

    return Array.from(operands);
  }

  /**
   * Extract string value from a FlowOperand
   */
  private getFlowOperandValue(operand: FlowOperand): string | undefined {
    // Early return for undefined operands
    if (!operand) {
      return undefined;
    }

    // FlowOperand can be string | FlowStartAction | FlowTextAction
    if (typeof operand === 'string') {
      return operand;
    }

    // Handle FlowStartAction and FlowTextAction objects
    if (typeof operand === 'object' && operand !== null) {
      // Type guard to ensure we have an AST node
      const astNode = operand as any;
      
      // Check if it has $cstNode (it's an AstNode)
      if ('$cstNode' in astNode && astNode.$cstNode) {
        return astNode.$cstNode.text?.trim() || undefined;
      }
      
      // Check for specific action types
      if ('$type' in astNode) {
        if (astNode.$type === 'FlowStartAction') {
          return ':start';
        }
        if (astNode.$type === 'FlowTextAction') {
          // Extract text from FlowTextAction if it has a text property
          if ('text' in astNode && typeof astNode.text === 'string') {
            return astNode.text;
          }
        }
      }
    }

    return undefined;
  }
}

type FlowGraph = Map<string, Set<string>>;