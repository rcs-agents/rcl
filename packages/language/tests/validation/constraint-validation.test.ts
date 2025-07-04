import { describe, test, expect, beforeEach } from 'vitest';
import { ConstraintValidator } from '../../src/validation/constraint-validator.js';
import type { AgentDefinition, FlowSection, MessagesSection } from '../../src/parser/ast/index.js';

describe('ConstraintValidator', () => {
  let validator: ConstraintValidator;
  let mockAcceptor: any;
  let errors: any[];

  beforeEach(() => {
    validator = new ConstraintValidator();
    errors = [];
    mockAcceptor = (severity: string, message: string, info: any) => {
      errors.push({ severity, message, info });
    };
  });

  describe('Agent Definition Validation', () => {
    test('should require agent name', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: '',
        flows: [],
        messages: null,
        config: null,
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Agent name is required');
      expect(errors[0].info.code).toBe('missing-agent-name');
    });

    test('should require displayName in configuration', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [],
        messages: null,
        config: {
          type: 'AgentConfig',
          name: 'Config',
          properties: []
        },
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-display-name')).toBe(true);
    });

    test('should validate displayName length', () => {
      const longDisplayName = 'A'.repeat(80); // Exceeds 75 character limit
      
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [],
        messages: null,
        config: {
          type: 'AgentConfig',
          name: 'Config',
          properties: [
            {
              type: 'ConfigProperty',
              key: 'displayName',
              value: longDisplayName
            }
          ]
        },
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'display-name-too-long')).toBe(true);
    });

    test('should require at least one flow', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [],
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: []
        },
        config: {
          type: 'AgentConfig',
          name: 'Config',
          properties: [
            {
              type: 'ConfigProperty',
              key: 'displayName',
              value: 'Test Agent'
            }
          ]
        },
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-flows')).toBe(true);
    });

    test('should require messages section', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [
          {
            type: 'FlowSection',
            name: 'Main Flow',
            rules: []
          }
        ],
        messages: null,
        config: {
          type: 'AgentConfig',
          name: 'Config',
          properties: [
            {
              type: 'ConfigProperty',
              key: 'displayName',
              value: 'Test Agent'
            }
          ]
        },
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-messages')).toBe(true);
    });
  });

  describe('Flow Section Validation', () => {
    test('should require flow name', () => {
      const flow: FlowSection = {
        type: 'FlowSection',
        name: '',
        rules: []
      };

      validator['validateFlowSection'](flow, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-flow-name')).toBe(true);
    });

    test('should warn about empty flows', () => {
      const flow: FlowSection = {
        type: 'FlowSection',
        name: 'Empty Flow',
        rules: []
      };

      validator['validateFlowSection'](flow, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'empty-flow')).toBe(true);
    });

    test('should validate flow rule operands', () => {
      const flow: FlowSection = {
        type: 'FlowSection',
        name: 'Test Flow',
        rules: [
          {
            type: 'FlowRule',
            operands: [
              {
                type: 'FlowOperand',
                operandType: 'atom',
                value: ':start'
              }
              // Missing destination operand
            ]
          }
        ]
      };

      validator['validateFlowSection'](flow, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'insufficient-operands')).toBe(true);
    });
  });

  describe('Messages Section Validation', () => {
    test('should require messages section name', () => {
      const messages: MessagesSection = {
        type: 'MessagesSection',
        name: '',
        messages: []
      };

      validator['validateMessagesSection'](messages, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-messages-name')).toBe(true);
    });

    test('should warn about empty messages', () => {
      const messages: MessagesSection = {
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: []
      };

      validator['validateMessagesSection'](messages, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'empty-messages')).toBe(true);
    });

    test('should validate message names', () => {
      const messages: MessagesSection = {
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: [
          {
            type: 'MessageDefinition',
            name: '',
            content: {
              type: 'TextShortcut',
              text: 'Hello'
            }
          }
        ]
      };

      validator['validateMessagesSection'](messages, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-message-name')).toBe(true);
    });

    test('should validate message naming conventions', () => {
      const messages: MessagesSection = {
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: [
          {
            type: 'MessageDefinition',
            name: 'invalid-name-format',
            content: {
              type: 'TextShortcut',
              text: 'Hello'
            }
          }
        ]
      };

      validator['validateMessagesSection'](messages, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'message-name-convention')).toBe(true);
    });
  });

  describe('String Validation', () => {
    test('should validate string length', () => {
      const longString = 'A'.repeat(100);
      const mockNode = { type: 'test' };

      validator.validateStringLength(longString, 50, 'Test Field', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test Field must not exceed 50 characters');
      expect(errors[0].info.code).toBe('string-too-long');
    });

    test('should validate required fields', () => {
      const mockNode = { type: 'test' };

      validator.validateRequiredField('', 'Test Field', mockAcceptor, mockNode);
      validator.validateRequiredField(null, 'Test Field', mockAcceptor, mockNode);
      validator.validateRequiredField(undefined, 'Test Field', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(3);
      expect(errors.every(e => e.info.code === 'missing-required-field')).toBe(true);
    });
  });

  describe('Format Validation', () => {
    test('should validate URL format', () => {
      const mockNode = { type: 'test' };

      validator.validateUrl('invalid-url', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Invalid URL format');
      expect(errors[0].info.code).toBe('invalid-url');
    });

    test('should accept valid URLs', () => {
      const mockNode = { type: 'test' };

      validator.validateUrl('https://example.com', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(0);
    });

    test('should validate phone number format', () => {
      const mockNode = { type: 'test' };

      validator.validatePhoneNumber('invalid-phone', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].info.code).toBe('phone-format-warning');
    });

    test('should accept valid phone numbers', () => {
      const mockNode = { type: 'test' };

      validator.validatePhoneNumber('+1234567890', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(0);
    });

    test('should validate email format', () => {
      const mockNode = { type: 'test' };

      validator.validateEmail('invalid-email', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Invalid email format');
      expect(errors[0].info.code).toBe('invalid-email');
    });

    test('should accept valid emails', () => {
      const mockNode = { type: 'test' };

      validator.validateEmail('test@example.com', mockAcceptor, mockNode);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Valid Agent Configuration', () => {
    test('should pass validation for complete valid agent', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Customer Support Agent',
        flows: [
          {
            type: 'FlowSection',
            name: 'Main Flow',
            rules: [
              {
                type: 'FlowRule',
                operands: [
                  {
                    type: 'FlowOperand',
                    operandType: 'atom',
                    value: ':start'
                  },
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'Welcome Message'
                  }
                ]
              }
            ]
          }
        ],
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: [
            {
              type: 'MessageDefinition',
              name: 'Welcome Message',
              content: {
                type: 'TextShortcut',
                text: 'Hello! How can I help you?'
              }
            }
          ]
        },
        config: {
          type: 'AgentConfig',
          name: 'Config',
          properties: [
            {
              type: 'ConfigProperty',
              key: 'displayName',
              value: 'Customer Support'
            }
          ]
        },
        defaults: null
      };

      validator.validateAgentDefinition(agent, mockAcceptor);
      
      // Should only have the warning about missing start flow (acceptable)
      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });
  });
});