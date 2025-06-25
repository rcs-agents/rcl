import type { Section, FlowRule, FlowOperand } from '../../generated/ast.js';
import { ValueConverter } from './value-converter.js';

/**
 * Converts RCL flow sections to XState-compatible configurations
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
    
    // Process flow rules to create states and transitions
    for (const flowContent of flowSection.flowContent) {
      if (flowContent.$type === 'FlowRule') {
        const rule = flowContent as FlowRule;
        this.processFlowRule(rule, states, transitions);
      }
    }

    // Create XState configuration
    const xstateConfig: Record<string, any> = {
      id: flowSection.sectionName || 'flow',
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
    const targetState = this.getStateFromOperand(rule.target);

    // Ensure source state exists
    if (!states[sourceState]) {
      states[sourceState] = {
        on: {}
      };
    }

    // Ensure target state exists
    if (!states[targetState]) {
      states[targetState] = {
        on: {}
      };
    }

    // Create transition
    const transitionEvent = this.createTransitionEvent(rule.source, rule.target);
    
    if (!states[sourceState].on[transitionEvent]) {
      states[sourceState].on[transitionEvent] = {
        target: targetState,
        actions: this.createTransitionActions(rule)
      };
    }
  }

  /**
   * Extract state name from flow operand
   */
  private getStateFromOperand(operand: FlowOperand): string {
    if (operand.symbol) {
      return this.sanitizeStateName(operand.symbol);
    } else if (operand.variable) {
      return this.sanitizeStateName(operand.variable);
    } else if (operand.attribute) {
      return this.sanitizeStateName(operand.attribute);
    } else if (operand.string) {
      return this.sanitizeStateName(operand.string.replace(/"/g, ''));
    }
    return 'unknown';
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
  private createTransitionEvent(source: FlowOperand, target: FlowOperand): string {
    // const sourceStr = this.operandToString(source);
    const targetStr = this.operandToString(target);
    return `TO_${this.sanitizeStateName(targetStr).toUpperCase()}`;
  }

  /**
   * Convert operand to string representation
   */
  private operandToString(operand: FlowOperand): string {
    if (operand.symbol) return operand.symbol;
    if (operand.variable) return operand.variable;
    if (operand.attribute) return operand.attribute;
    if (operand.string) return operand.string.replace(/"/g, '');
    return 'unknown';
  }

  /**
   * Create transition actions
   */
  private createTransitionActions(rule: FlowRule): any[] {
    // Create placeholders for actions that will be implemented by the backend
    const actions: any[] = [];

    const sourceStr = this.operandToString(rule.source);
    const targetStr = this.operandToString(rule.target);

    // Add logging action
    actions.push({
      type: 'logTransition',
      params: {
        from: sourceStr,
        to: targetStr,
        __rclPlaceholder: true
      }
    });

    // Add conditional action processing if needed
    if (rule.source.attribute || rule.target.attribute) {
      actions.push({
        type: 'processAttributes',
        params: {
          sourceAttribute: rule.source.attribute,
          targetAttribute: rule.target.attribute,
          __rclPlaceholder: true
        }
      });
    }

    // Add message handling if operands suggest messaging
    if (this.isMessageOperand(rule.source) || this.isMessageOperand(rule.target)) {
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
   * Check if an operand represents a message
   */
  private isMessageOperand(operand: FlowOperand): boolean {
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

    // Return the first state alphabetically
    return stateNames.sort()[0];
  }

  /**
   * Create XState context from flow attributes
   */
  private createContext(attributes: Record<string, any>): Record<string, any> {
    const context: Record<string, any> = {};

    // Add flow attributes to context
    for (const [key, value] of Object.entries(attributes)) {
      context[key] = value;
    }

    // Add default context values
    context.currentMessage = null;
    context.userInput = null;
    context.conversationState = 'active';
    context.__rclGenerated = true;

    return context;
  }
} 