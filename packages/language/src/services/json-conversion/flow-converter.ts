import type { FlowSection } from '../../parser/ast/index.js';
import { isFlowRule } from '../../parser/ast/type-guards.js';
import type { FlowRule, FlowOperand } from '../../parser/ast/index.js';

/**
 * Converts RCL flow sections to XState-compatible configurations
 * Note: Simplified implementation for current grammar structure
 */
export class FlowConverter {
  constructor() {
  }

  /**
   * Convert a flow section to XState configuration
   */
  convert(flowSection: FlowSection): Record<string, any> {
    const states: Record<string, any> = {};
    const transitions: Record<string, any> = {};
    
    // Extract flow attributes for configuration (FlowSection doesn't have attributes)
    const flowAttributes = {};
    
    // Process flow content to find flow rules
    for (const flowContent of flowSection.rules) {
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
    for (let i = 0; i < rule.operands.length - 1; i++) {
      const sourceOperand = rule.operands[i];
      const targetOperand = rule.operands[i+1];

      const sourceState = this.getStateFromOperand(sourceOperand);
      const targetState = this.getStateFromOperand(targetOperand);

      if (!states[sourceState]) {
        states[sourceState] = { on: {} };
      }
      if (!states[targetState]) {
        states[targetState] = { on: {} };
      }

      const transitionEvent = this.createTransitionEvent(sourceState, targetState);
      if (!states[sourceState].on[transitionEvent]) {
        states[sourceState].on[transitionEvent] = {
          target: targetState,
          actions: this.createTransitionActions(sourceState, targetState)
        };
      }
    }
  }

  /**
   * Extract state name from flow operand
   */
  private getStateFromOperand(operand: FlowOperand): string {
    if (!operand || !operand.value) return 'unknown';
    
    let cleaned = operand.value;
    if (operand.operandType === 'atom') {
      cleaned = cleaned.slice(1);
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
    const targetStr = this.sanitizeStateName(target);
    return `TO_${targetStr.toUpperCase()}`;
  }

  /**
   * Create transition actions (simplified)
   */
  private createTransitionActions(source: string, target: string): any[] {
    const actions: any[] = [];

    const sourceStr = this.sanitizeStateName(source);
    const targetStr = this.sanitizeStateName(target);

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
    const sourceOperand = { value: source, $type: 'FlowOperand', type: 'FlowOperand', operandType: 'identifier' } as FlowOperand;
    const targetOperand = { value: target, $type: 'FlowOperand', type: 'FlowOperand', operandType: 'identifier' } as FlowOperand;
    if (this.isMessageOperand(sourceOperand) || this.isMessageOperand(targetOperand)) {
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
  private isMessageOperand(operand: FlowOperand): boolean {
    const str = (operand.value || '').toLowerCase();
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