import type { Section, FlowRule } from '../../generated/ast.js';
import { isFlowRule } from '../../generated/ast.js';
import { ValueConverter } from './value-converter.js';

/**
 * Converts RCL flow sections to XState-compatible configurations
 * Note: Simplified implementation for current grammar structure
 */
export class FlowConverter {
  private valueConverter: ValueConverter;

  constructor() {
    this.valueConverter = new ValueConverter();
  }

  /**
   * Convert a flow section to XState configuration
   */
  convert(flowSection: Section): Record<string, any> {
    const states: Record<string, any> = {};
    const transitions: Record<string, any> = {};
    
    // Extract flow attributes for configuration
    const flowAttributes = this.valueConverter.convertAttributes(flowSection.attributes);
    
    // Process flow content to find flow rules
    for (const flowContent of flowSection.flowContent) {
      if (isFlowRule(flowContent)) {
        this.processFlowRule(flowContent, states, transitions);
      }
    }

    // Create XState configuration
    const xstateConfig: Record<string, any> = {
      id: flowSection.name || 'flow',
      initial: this.determineInitialState(states),
      states: states,
      context: this.createContext(flowAttributes)
    };

    // Add meta information
    if (Object.keys(flowAttributes).length > 0) {
      xstateConfig.meta = {
        rclAttributes: flowAttributes
      };
    }

    return xstateConfig;
  }

  /**
   * Process a single flow rule and update states/transitions
   */
  private processFlowRule(rule: FlowRule, states: Record<string, any>, transitions: Record<string, any>): void {
    const sourceState = this.getStateFromOperand(rule.source);

    // Ensure source state exists
    if (!states[sourceState]) {
      states[sourceState] = {
        on: {}
      };
    }

    // Process each transition
    if (rule.destination?.ref) {
      const targetState = this.getStateFromOperand(rule.destination.ref.name);

      // Ensure target state exists
      if (!states[targetState]) {
        states[targetState] = {
          on: {}
        };
      }

      // Create transition
      const transitionEvent = this.createTransitionEvent(rule.source, rule.destination.ref.name);
      
      if (!states[sourceState].on[transitionEvent]) {
        states[sourceState].on[transitionEvent] = {
          target: targetState,
          actions: this.createTransitionActions(rule.source, rule.destination.ref.name)
        };
      }
    }
  }

  /**
   * Extract state name from flow operand (now a string)
   */
  private getStateFromOperand(operand: string): string {
    if (!operand) return 'unknown';
    
    // Handle special prefixes
    if (operand.startsWith(':')) {
      return this.sanitizeStateName(operand.slice(1));
    }
    
    // Remove quotes if present
    let cleaned = operand;
    if ((operand.startsWith('"') && operand.endsWith('"')) || 
        (operand.startsWith("'") && operand.endsWith("'"))) {
      cleaned = operand.slice(1, -1);
    }
    
    return this.sanitizeStateName(cleaned);
  }

  /**
   * Sanitize state names for XState compatibility
   */
  private sanitizeStateName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .toLowerCase();
  }

  /**
   * Create transition event name
   */
  private createTransitionEvent(source: string, target: string): string {
    const targetStr = this.operandToString(target);
    return `TO_${this.sanitizeStateName(targetStr).toUpperCase()}`;
  }

  /**
   * Convert operand to string representation (simplified)
   */
  private operandToString(operand: string): string {
    if (!operand) return 'unknown';
    
    // Remove special prefixes and quotes
    let result = operand;
    if (result.startsWith(':')) {
      result = result.slice(1);
    }
    if ((result.startsWith('"') && result.endsWith('"')) || 
        (result.startsWith("'") && result.endsWith("'"))) {
      result = result.slice(1, -1);
    }
    
    return result || 'unknown';
  }

  /**
   * Create transition actions (simplified)
   */
  private createTransitionActions(source: string, target: string): any[] {
    const actions: any[] = [];

    const sourceStr = this.operandToString(source);
    const targetStr = this.operandToString(target);

    // Add logging action
    actions.push({
      type: 'logTransition',
      params: {
        from: sourceStr,
        to: targetStr,
        __rclPlaceholder: true
      }
    });

    // Add message handling if operands suggest messaging
    if (this.isMessageOperand(source) || this.isMessageOperand(target)) {
      actions.push({
        type: 'handleMessage',
        params: {
          source: sourceStr,
          target: targetStr,
          __rclPlaceholder: true
        }
      });
    }

    return actions;
  }

  /**
   * Check if an operand represents a message (simplified)
   */
  private isMessageOperand(operand: string): boolean {
    const str = this.operandToString(operand).toLowerCase();
    return str.includes('message') || 
           str.includes('reply') || 
           str.includes('response') ||
           str.includes('text') ||
           str.includes('card') ||
           str.includes('suggestion');
  }

  /**
   * Determine the initial state from available states
   */
  private determineInitialState(states: Record<string, any>): string {
    const stateNames = Object.keys(states);
    
    if (stateNames.length === 0) {
      return 'idle';
    }

    // Look for common initial state names
    const commonInitialStates = ['start', 'initial', 'begin', 'entry', 'idle'];
    for (const name of commonInitialStates) {
      if (stateNames.includes(name)) {
        return name;
      }
    }

    // Default to first state
    return stateNames[0];
  }

  /**
   * Create context object from flow attributes
   */
  private createContext(attributes: Record<string, any>): Record<string, any> {
    return {
      rclAttributes: attributes,
      __generatedFromRcl: true
    };
  }
} 