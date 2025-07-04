import { describe, test, expect, beforeEach } from 'vitest';
import { RclValidator } from '../../src/rcl-validator.js';
import { ConstraintValidator } from '../../src/validation/constraint-validator.js';
import { ReferenceResolver } from '../../src/validation/reference-resolver.js';
import type { RclFile, AgentDefinition } from '../../src/parser/ast/index.js';

describe('Enhanced Specification Compliance', () => {
  let validator: RclValidator;
  let constraintValidator: ConstraintValidator;
  let referenceResolver: ReferenceResolver;
  
  beforeEach(() => {
    // Mock services
    const mockServices = {} as any;
    validator = new RclValidator(mockServices);
    constraintValidator = new ConstraintValidator();
    referenceResolver = new ReferenceResolver();
  });

  describe('Complete Agent Examples', () => {
    test('should validate minimal valid agent', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const minimalAgent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Minimal Agent',
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
                    value: 'Welcome'
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
              name: 'Welcome',
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
              value: 'Minimal Bot'
            }
          ]
        },
        defaults: null
      };

      constraintValidator.validateAgentDefinition(minimalAgent, mockAcceptor);
      
      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });

    test('should validate complex agent with multiple flows', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const complexAgent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Customer Support Agent',
        flows: [
          {
            type: 'FlowSection',
            name: 'Welcome Flow',
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
                  },
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'Support Flow'
                  }
                ]
              }
            ]
          },
          {
            type: 'FlowSection',
            name: 'Support Flow',
            rules: [
              {
                type: 'FlowRule',
                operands: [
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'Support Flow'
                  },
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'Help Options'
                  }
                ]
              },
              {
                type: 'FlowRule',
                operands: [
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'Help Options'
                  },
                  {
                    type: 'FlowOperand',
                    operandType: 'atom',
                    value: ':end'
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
                text: 'Welcome to our customer support!'
              }
            },
            {
              type: 'MessageDefinition',
              name: 'Help Options',
              content: {
                type: 'RichCardShortcut',
                title: 'How can we help?',
                description: 'Choose an option below',
                suggestions: [
                  {
                    type: 'ReplyShortcut',
                    text: 'Technical Support'
                  },
                  {
                    type: 'ReplyShortcut',
                    text: 'Billing Questions'
                  }
                ]
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
            },
            {
              type: 'ConfigProperty',
              key: 'brandName',
              value: 'ACME Corp'
            }
          ]
        },
        defaults: {
          type: 'AgentDefaults',
          name: 'Defaults',
          properties: [
            {
              type: 'DefaultProperty',
              key: 'messageTrafficType',
              value: 'promotional'
            }
          ]
        }
      };

      constraintValidator.validateAgentDefinition(complexAgent, mockAcceptor);
      
      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });
  });

  describe('Import Statement Examples', () => {
    test('should validate various import formats', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const importExamples = [
        {
          type: 'ImportStatement',
          importPath: ['Simple', 'Flow'],
          alias: undefined,
          source: undefined
        },
        {
          type: 'ImportStatement',
          importPath: ['My', 'Brand', 'Customer', 'Support'],
          alias: 'Support',
          source: undefined
        },
        {
          type: 'ImportStatement',
          importPath: ['Shared', 'Common', 'Utils'],
          alias: 'Utilities',
          source: undefined
        },
        {
          type: 'ImportStatement',
          importPath: ['External', 'Service'],
          alias: undefined,
          source: 'external-service'
        }
      ];

      for (const importStmt of importExamples) {
        referenceResolver['validateImportStatement'](importStmt, {
          resolvedReferences: new Map(),
          unresolvedReferences: [],
          circularDependencies: []
        }, mockAcceptor);
      }

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });
  });

  describe('Message Shortcut Examples', () => {
    test('should validate text shortcuts', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const textMessage = {
        type: 'MessageDefinition',
        name: 'Welcome Text',
        content: {
          type: 'TextShortcut',
          text: 'Welcome to our service!',
          suggestions: [
            {
              type: 'ReplyShortcut',
              text: 'Get started'
            },
            {
              type: 'OpenUrlShortcut',
              text: 'Learn more',
              url: 'https://example.com'
            },
            {
              type: 'DialShortcut',
              text: 'Call support',
              phoneNumber: '+1-555-0123'
            }
          ]
        }
      };

      // Test message name validation
      constraintValidator['validateMessagesSection']({
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: [textMessage]
      }, mockAcceptor);

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });

    test('should validate rich card shortcuts', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const richCardMessage = {
        type: 'MessageDefinition',
        name: 'Product Showcase',
        content: {
          type: 'RichCardShortcut',
          title: 'Product Showcase',
          description: 'Our latest product',
          orientation: 'horizontal',
          alignment: 'left',
          thumbnailImageAlignment: 'medium',
          imageUrl: 'https://example.com/image.jpg',
          suggestions: [
            {
              type: 'ReplyShortcut',
              text: 'Buy now'
            }
          ]
        }
      };

      constraintValidator['validateMessagesSection']({
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: [richCardMessage]
      }, mockAcceptor);

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });

    test('should validate carousel shortcuts', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const carouselMessage = {
        type: 'MessageDefinition',
        name: 'Product Carousel',
        content: {
          type: 'CarouselShortcut',
          cardWidth: 'small',
          cards: [
            {
              type: 'RichCardShortcut',
              title: 'Item 1',
              description: 'First item'
            },
            {
              type: 'RichCardShortcut',
              title: 'Item 2',
              description: 'Second item'
            }
          ]
        }
      };

      constraintValidator['validateMessagesSection']({
        type: 'MessagesSection',
        name: 'Test Messages',
        messages: [carouselMessage]
      }, mockAcceptor);

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });
  });

  describe('Flow System Examples', () => {
    test('should validate complex flow transitions', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const orderProcessingFlow = {
        type: 'FlowSection',
        name: 'Order Processing',
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
                value: 'Check Inventory'
              },
              {
                type: 'FlowOperand',
                operandType: 'identifier',
                value: 'Process Payment'
              },
              {
                type: 'FlowOperand',
                operandType: 'identifier',
                value: 'Ship Order'
              }
            ]
          },
          {
            type: 'FlowRule',
            operands: [
              {
                type: 'FlowOperand',
                operandType: 'identifier',
                value: 'Check Inventory'
              }
            ],
            withClause: {
              type: 'WithClause',
              parameters: [
                {
                  type: 'Parameter',
                  name: 'productId',
                  parameterType: 'string'
                },
                {
                  type: 'Parameter',
                  name: 'quantity',
                  parameterType: 'number'
                }
              ]
            }
          }
        ]
      };

      constraintValidator['validateFlowSection'](orderProcessingFlow, mockAcceptor);

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });

    test('should validate when clauses', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const conditionalFlow = {
        type: 'FlowSection',
        name: 'Conditional Flow',
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
                value: 'Check User Type'
              }
            ],
            whenClauses: [
              {
                type: 'WhenClause',
                condition: {
                  type: 'EmbeddedExpression',
                  language: 'javascript',
                  code: 'user.type === "premium"'
                },
                transitions: [
                  {
                    type: 'FlowTransition',
                    source: {
                      type: 'FlowOperand',
                      operandType: 'atom',
                      value: ':start'
                    },
                    destination: {
                      type: 'FlowOperand',
                      operandType: 'identifier',
                      value: 'Premium Welcome'
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      constraintValidator['validateFlowSection'](conditionalFlow, mockAcceptor);

      const realErrors = errors.filter(e => e.severity === 'error');
      expect(realErrors).toHaveLength(0);
    });
  });

  describe('RCS Specification Constraints', () => {
    test('should enforce displayName length limit', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const longDisplayName = 'A'.repeat(80); // Exceeds 75 character limit
      
      constraintValidator.validateStringLength(
        longDisplayName, 
        75, 
        'Display Name', 
        mockAcceptor, 
        { type: 'test' }
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].info.code).toBe('string-too-long');
    });

    test('should validate phone number format', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const validPhones = ['+1234567890', '+12345678901234'];
      const invalidPhones = ['1234567890', 'invalid-phone', ''];

      for (const phone of validPhones) {
        constraintValidator.validatePhoneNumber(phone, mockAcceptor, { type: 'test' });
      }

      const validErrors = errors.length;

      for (const phone of invalidPhones) {
        constraintValidator.validatePhoneNumber(phone, mockAcceptor, { type: 'test' });
      }

      expect(errors.length).toBeGreaterThan(validErrors);
    });

    test('should validate email format', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
      const invalidEmails = ['invalid-email', 'missing@', '@missing-domain'];

      for (const email of validEmails) {
        constraintValidator.validateEmail(email, mockAcceptor, { type: 'test' });
      }

      const validErrors = errors.length;

      for (const email of invalidEmails) {
        constraintValidator.validateEmail(email, mockAcceptor, { type: 'test' });
      }

      expect(errors.length).toBeGreaterThan(validErrors);
    });

    test('should validate URL format', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const validUrls = [
        'https://example.com',
        'http://example.com/path?param=value',
        'https://sub.domain.com/path#anchor'
      ];
      const invalidUrls = ['invalid-url', 'not-a-url', ''];

      for (const url of validUrls) {
        constraintValidator.validateUrl(url, mockAcceptor, { type: 'test' });
      }

      const validErrors = errors.length;

      for (const url of invalidUrls) {
        constraintValidator.validateUrl(url, mockAcceptor, { type: 'test' });
      }

      expect(errors.length).toBeGreaterThan(validErrors);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    test('should handle empty agent gracefully', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const emptyAgent: AgentDefinition = {
        type: 'AgentDefinition',
        name: '',
        flows: [],
        messages: null,
        config: null,
        defaults: null
      };

      constraintValidator.validateAgentDefinition(emptyAgent, mockAcceptor);
      
      const errorCodes = errors.map(e => e.info.code);
      expect(errorCodes).toContain('missing-agent-name');
      expect(errorCodes).toContain('missing-display-name');
      expect(errorCodes).toContain('missing-flows');
      expect(errorCodes).toContain('missing-messages');
    });

    test('should handle malformed references', () => {
      const errors: any[] = [];
      const mockAcceptor = (severity: string, message: string, info: any) => {
        errors.push({ severity, message, info });
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['123Invalid', 'Path!'],
            alias: 'bad-alias!',
            source: undefined
          }
        ],
        agentSection: null
      };

      referenceResolver.resolveFileReferences(file, mockAcceptor);
      
      const errorCodes = errors.map(e => e.info.code);
      expect(errorCodes).toContain('invalid-import-identifier');
      expect(errorCodes).toContain('invalid-alias-identifier');
    });
  });
});