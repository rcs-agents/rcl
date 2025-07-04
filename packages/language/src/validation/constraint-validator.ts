import type { ValidationAcceptor } from 'langium';
import type { 
  AgentDefinition, 
  FlowSection, 
  MessagesSection,
  ConfigProperty
} from '../parser/ast/index.js';

/**
 * Validation error result
 */
export interface ValidationError {
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * RCS Specification Constraint Validator
 * 
 * Implements validation rules according to the RCS Business Messaging specification
 * to ensure agent definitions comply with platform requirements.
 */
export class ConstraintValidator {
  
  /**
   * Validate an agent definition against RCS specification constraints
   */
  validateAgentDefinition(agent: AgentDefinition, accept: ValidationAcceptor): void {
    this.validateRequiredAgentProperties(agent, accept);
    this.validateAgentConstraints(agent, accept);
    this.validateFlowRequirements(agent, accept);
    this.validateMessageRequirements(agent, accept);
  }

  /**
   * Validate required agent properties
   */
  private validateRequiredAgentProperties(agent: AgentDefinition, accept: ValidationAcceptor): void {
    // Agent must have a name
    if (!agent.name || agent.name.trim().length === 0) {
      accept('error', 'Agent name is required', {
        node: agent,
        property: 'name',
        code: 'missing-agent-name'
      });
    }

    // Check for displayName in agent config
    const displayName = this.findConfigProperty(agent, 'displayName');
    if (!displayName) {
      accept('error', 'Agent displayName is required in configuration', {
        node: agent,
        property: 'config',
        code: 'missing-display-name'
      });
    }
  }

  /**
   * Validate agent-level constraints
   */
  private validateAgentConstraints(agent: AgentDefinition, accept: ValidationAcceptor): void {
    // Validate displayName length (RCS limit: 75 characters)
    const displayName = this.findConfigProperty(agent, 'displayName');
    if (displayName && displayName.value) {
      const nameValue = String(displayName.value);
      if (nameValue.length > 75) {
        accept('error', 'Agent displayName must not exceed 75 characters', {
          node: agent,
          property: 'config',
          code: 'display-name-too-long'
        });
      }
    }

    // Validate brandName if present
    const brandName = this.findConfigProperty(agent, 'brandName');
    if (brandName && brandName.value) {
      const brandValue = String(brandName.value);
      if (brandValue.length > 50) {
        accept('warning', 'Brand name should not exceed 50 characters for optimal display', {
          node: agent,
          property: 'config',
          code: 'brand-name-long'
        });
      }
    }
  }

  /**
   * Validate flow requirements
   */
  private validateFlowRequirements(agent: AgentDefinition, accept: ValidationAcceptor): void {
    if (!agent.flows || agent.flows.length === 0) {
      accept('error', 'Agent must have at least one flow', {
        node: agent,
        property: 'flows',
        code: 'missing-flows'
      });
      return;
    }

    // Validate each flow
    for (const flow of agent.flows) {
      this.validateFlowSection(flow, accept);
    }

    // Check for required start flow
    const hasStartFlow = agent.flows.some(flow => 
      flow.rules.some(rule => 
        rule.operands.some(operand => operand.value === ':start')
      )
    );

    if (!hasStartFlow) {
      accept('warning', 'Agent should have a flow with :start operand for proper initialization', {
        node: agent,
        property: 'flows',
        code: 'missing-start-flow'
      });
    }
  }

  /**
   * Validate message requirements
   */
  private validateMessageRequirements(agent: AgentDefinition, accept: ValidationAcceptor): void {
    if (!agent.messages) {
      accept('error', 'Agent must have a messages section', {
        node: agent,
        property: 'messages',
        code: 'missing-messages'
      });
      return;
    }

    this.validateMessagesSection(agent.messages, accept);
  }

  /**
   * Validate a flow section
   */
  private validateFlowSection(flow: FlowSection, accept: ValidationAcceptor): void {
    if (!flow.name || flow.name.trim().length === 0) {
      accept('error', 'Flow must have a name', {
        node: flow,
        property: 'name',
        code: 'missing-flow-name'
      });
    }

    if (!flow.rules || flow.rules.length === 0) {
      accept('warning', 'Flow should have at least one rule', {
        node: flow,
        property: 'rules',
        code: 'empty-flow'
      });
    }

    // Validate flow rules
    for (const rule of flow.rules) {
      if (!rule.operands || rule.operands.length < 2) {
        accept('error', 'Flow rule must have at least source and destination operands', {
          node: rule,
          property: 'operands',
          code: 'insufficient-operands'
        });
      }
    }
  }

  /**
   * Validate a messages section
   */
  private validateMessagesSection(messages: MessagesSection, accept: ValidationAcceptor): void {
    if (!messages.name || messages.name.trim().length === 0) {
      accept('error', 'Messages section must have a name', {
        node: messages,
        property: 'name',
        code: 'missing-messages-name'
      });
    }

    if (!messages.messages || messages.messages.length === 0) {
      accept('warning', 'Messages section should contain at least one message', {
        node: messages,
        property: 'messages',
        code: 'empty-messages'
      });
    }

    // Validate message definitions
    for (const message of messages.messages) {
      if (!message.name || message.name.trim().length === 0) {
        accept('error', 'Message must have a name', {
          node: message,
          property: 'name',
          code: 'missing-message-name'
        });
      }

      // Message names should follow naming conventions
      if (message.name && !this.isValidMessageName(message.name)) {
        accept('warning', 'Message name should use camelCase or PascalCase', {
          node: message,
          property: 'name',
          code: 'message-name-convention'
        });
      }
    }
  }

  /**
   * Find a configuration property by key
   */
  private findConfigProperty(agent: AgentDefinition, key: string): ConfigProperty | undefined {
    if (!agent.config || !agent.config.properties) {
      return undefined;
    }

    return agent.config.properties.find(prop => prop.key === key);
  }

  /**
   * Validate message name format
   */
  private isValidMessageName(name: string): boolean {
    // Allow camelCase, PascalCase, and space-separated words
    const validPattern = /^[A-Z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*$|^[A-Z][a-zA-Z0-9\s]*$/;
    return validPattern.test(name);
  }

  /**
   * Validate string length constraints
   */
  validateStringLength(value: string, maxLength: number, fieldName: string, accept: ValidationAcceptor, node: any): void {
    if (value.length > maxLength) {
      accept('error', `${fieldName} must not exceed ${maxLength} characters`, {
        node: node,
        code: 'string-too-long'
      });
    }
  }

  /**
   * Validate required fields
   */
  validateRequiredField(value: any, fieldName: string, accept: ValidationAcceptor, node: any): void {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      accept('error', `${fieldName} is required`, {
        node: node,
        code: 'missing-required-field'
      });
    }
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string, accept: ValidationAcceptor, node: any): void {
    try {
      new URL(url);
    } catch {
      accept('error', 'Invalid URL format', {
        node: node,
        code: 'invalid-url'
      });
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string, accept: ValidationAcceptor, node: any): void {
    // Basic international phone number format validation
    const phonePattern = /^\+[1-9]\d{1,14}$/;
    if (!phonePattern.test(phone)) {
      accept('warning', 'Phone number should follow international format (+1234567890)', {
        node: node,
        code: 'phone-format-warning'
      });
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string, accept: ValidationAcceptor, node: any): void {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      accept('error', 'Invalid email format', {
        node: node,
        code: 'invalid-email'
      });
    }
  }
}