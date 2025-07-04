import type { ValidationAcceptor, AstNode } from 'langium';
import type { FlowRule, FlowOperand } from '#src/parser/ast';
import { isSection, isFlowRule } from '#src/parser/ast';
import type { Section } from '#src/parser/ast';
import { KW } from '#src/constants.js';

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
        property: 'operands',
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
          return rule.operands.some(op => this.getFlowOperandValue(op) === node);
        });

        if (ruleWithUnreachableNode) {
          const operandIndex = ruleWithUnreachableNode.operands.findIndex(op => this.getFlowOperandValue(op) === node);
          accept('warning', `Flow operand '${node}' appears to be unreachable`, {
            node: ruleWithUnreachableNode,
            property: 'operands',
            index: operandIndex,
            code: 'unreachable-flow-operand'
          });
        }
      }
    }
  }

  /**
   * Check for undefined references in flow rules
   */
  checkFlowReferences(flowRule: FlowRule, accept: ValidationAcceptor): void {
    const parentSection = this.getParentFlowSection(flowRule);
    if (!parentSection) {
      return;
    }

    const messagesSection = this.getMessagesSection(parentSection);
    if (!messagesSection) {
      return;
    }

    const definedMessages = this.getDefinedMessages(messagesSection);

    for (const operand of flowRule.operands) {
      const operandValue = this.getFlowOperandValue(operand);
      if (operandValue && !definedMessages.has(operandValue) && operandValue !== KW.Start && operandValue !== KW.End) {
        accept('error', `Reference to undefined message '${operandValue}'`, {
          node: operand,
          property: 'value',
          code: 'undefined-flow-reference'
        });
      }
    }
  }

  /**
   * Get the messages section from the root section
   */
  private getMessagesSection(section: Section): Section | undefined {
    let current: AstNode | undefined = section;
    while (current.$container) {
      current = current.$container;
    }

    if (isSection(current) && 'messages' in current) {
      return (current as any).messages;
    }

    return undefined;
  }

  /**
   * Get all defined message names from a messages section
   */
  private getDefinedMessages(messagesSection: Section): Set<string> {
    const definedMessages = new Set<string>();

    if ('messages' in messagesSection && Array.isArray((messagesSection as any).messages)) {
      for (const message of (messagesSection as any).messages) {
        if (message.name) {
          definedMessages.add(message.name);
        }
      }
    }

    return definedMessages;
  }

  /**
   * Build a directed graph from flow rules
   */
  private buildFlowGraph(flowRules: FlowRule[]): FlowGraph {
    const graph = new Map<string, Set<string>>();

    for (const rule of flowRules) {
        for (let i = 0; i < rule.operands.length - 1; i++) {
            const source = this.getFlowOperandValue(rule.operands[i]);
            const target = this.getFlowOperandValue(rule.operands[i + 1]);

            if (source && target) {
                if (!graph.has(source)) {
                    graph.set(source, new Set());
                }
                graph.get(source)!.add(target);
            }
        }
    }

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

    if ('rules' in section && Array.isArray((section as any).rules)) {
        for (const content of (section as any).rules) {
            if (isFlowRule(content)) {
                flowRules.push(content);
            }
        }
    }
    
    if ('flows' in section && Array.isArray((section as any).flows)) {
        for (const subSection of (section as any).flows) {
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
    
    for (const rule of flowRules) {
        for (const operand of rule.operands) {
            const value = this.getFlowOperandValue(operand);
            if (value) {
                operands.add(value);
            }
        }
    }

    return Array.from(operands);
  }

  /**
   * Extract string value from a FlowOperand
   */
  private getFlowOperandValue(operand: FlowOperand | undefined): string | undefined {
    if (!operand) {
        return undefined;
    }
    let value = operand.value;
    if (operand.operandType === 'atom') {
        value = value.slice(1);
    }
    return value;
  }
}

type FlowGraph = Map<string, Set<string>>;