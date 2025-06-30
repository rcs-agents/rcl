import type { ValidationAcceptor, AstNode } from 'langium';
import type { FlowRule, Section } from '../generated/ast.js';
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
          if (!rule.source) {
            return false; // Skip malformed flow rules
          }
          return this.getFlowOperandValue(rule.source) === node ||
            (rule.destination?.ref && this.getFlowOperandValue(rule.destination.ref.name) === node);
        });

        if (ruleWithUnreachableNode && ruleWithUnreachableNode.source) {
          const isSource = this.getFlowOperandValue(ruleWithUnreachableNode.source) === node;
          const property = isSource ? 'source' : 'destination';
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

    const processRule = (rule: FlowRule) => {
        const source = this.getFlowOperandValue(rule.source);
        if (!source) return;

        if (!graph.has(source)) {
            graph.set(source, new Set());
        }

        if (rule.destination?.ref?.name) {
            const target = this.getFlowOperandValue(rule.destination.ref.name);
            if (target) {
                graph.get(source)!.add(target);
            }
        }

        if (rule.rules) {
            rule.rules.forEach(processRule);
        }
    };

    flowRules.forEach(processRule);

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
    
    const processRule = (rule: FlowRule) => {
        const source = this.getFlowOperandValue(rule.source);
        if (source) operands.add(source);

        if (rule.destination?.ref?.name) {
            const target = this.getFlowOperandValue(rule.destination.ref.name);
            if (target) operands.add(target);
        }
        if (rule.rules) {
            rule.rules.forEach(processRule);
        }
    };

    flowRules.forEach(processRule);

    return Array.from(operands);
  }

  /**
   * Extract string value from a FlowOperand
   */
  private getFlowOperandValue(operand: string | undefined): string | undefined {
    if (!operand) {
      return undefined;
    }
    return operand.startsWith(':') ? operand.substring(1) : operand;
  }
}

type FlowGraph = Map<string, Set<string>>;