import { describe, test, expect, beforeEach } from 'vitest';
import { ReferenceResolver } from '../../src/validation/reference-resolver.js';
import type { RclFile, AgentDefinition, FlowSection } from '../../src/parser/ast/index.js';

describe('ReferenceResolver', () => {
  let resolver: ReferenceResolver;
  let mockAcceptor: any;
  let errors: any[];

  beforeEach(() => {
    resolver = new ReferenceResolver();
    errors = [];
    mockAcceptor = (severity: string, message: string, info: any) => {
      errors.push({ severity, message, info });
    };
  });

  describe('Import Reference Resolution', () => {
    test('should validate import paths', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: [],
            alias: undefined,
            source: undefined
          }
        ],
        agentSection: null
      };

      resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'missing-import-path')).toBe(true);
    });

    test('should validate import identifiers', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['Valid', 'invalid-identifier!', 'Valid'],
            alias: undefined,
            source: undefined
          }
        ],
        agentSection: null
      };

      resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'invalid-import-identifier')).toBe(true);
      expect(errors.some(e => e.message.includes('invalid-identifier!'))).toBe(true);
    });

    test('should validate import aliases', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['Valid', 'Path'],
            alias: 'invalid-alias!',
            source: undefined
          }
        ],
        agentSection: null
      };

      resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'invalid-alias-identifier')).toBe(true);
    });

    test('should resolve valid imports', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['My Company', 'Customer Support'],
            alias: 'Support',
            source: undefined
          }
        ],
        agentSection: null
      };

      const resolution = resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(resolution.resolvedReferences.has('import:Support')).toBe(true);
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
  });

  describe('Flow Reference Resolution', () => {
    test('should build operand map correctly', () => {
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
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: [
            {
              type: 'MessageDefinition',
              name: 'Welcome Message',
              content: {
                type: 'TextShortcut',
                text: 'Hello'
              }
            }
          ]
        },
        config: null,
        defaults: null
      };

      const operands = resolver['buildOperandMap'](agent);
      
      expect(operands.has(':start')).toBe(true);
      expect(operands.has(':end')).toBe(true);
      expect(operands.has('Welcome Message')).toBe(true);
      expect(operands.has('Main Flow')).toBe(true);
    });

    test('should detect unresolved flow operands', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
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
                    value: 'Nonexistent Message'
                  }
                ]
              }
            ]
          }
        ],
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: []
        },
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      const resolution = resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(resolution.unresolvedReferences).toContain('Nonexistent Message');
      expect(errors.some(e => e.info.code === 'unresolved-operand')).toBe(true);
    });

    test('should resolve valid flow operands', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
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
                text: 'Hello'
              }
            }
          ]
        },
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      const resolution = resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(resolution.resolvedReferences.has('operand::start')).toBe(true);
      expect(resolution.resolvedReferences.has('operand:Welcome Message')).toBe(true);
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
  });

  describe('Parameter Validation', () => {
    test('should validate parameter names', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
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
                    value: 'Process Data'
                  }
                ],
                withClause: {
                  type: 'WithClause',
                  parameters: [
                    {
                      type: 'Parameter',
                      name: 'invalid-param!',
                      parameterType: 'string'
                    }
                  ]
                }
              }
            ]
          }
        ],
        messages: null,
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'invalid-parameter-name')).toBe(true);
    });
  });

  describe('Message Reference Resolution', () => {
    test('should detect duplicate message names', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [],
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: [
            {
              type: 'MessageDefinition',
              name: 'Welcome Message',
              content: {
                type: 'TextShortcut',
                text: 'Hello'
              }
            },
            {
              type: 'MessageDefinition',
              name: 'Welcome Message',
              content: {
                type: 'TextShortcut',
                text: 'Hi there'
              }
            }
          ]
        },
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'duplicate-message-name')).toBe(true);
    });

    test('should resolve unique message names', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: [],
        messages: {
          type: 'MessagesSection',
          name: 'Messages',
          messages: [
            {
              type: 'MessageDefinition',
              name: 'Welcome Message',
              content: {
                type: 'TextShortcut',
                text: 'Hello'
              }
            },
            {
              type: 'MessageDefinition',
              name: 'Goodbye Message',
              content: {
                type: 'TextShortcut',
                text: 'Goodbye'
              }
            }
          ]
        },
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      const resolution = resolver.resolveFileReferences(file, mockAcceptor);
      
      expect(resolution.resolvedReferences.has('message:Welcome Message')).toBe(true);
      expect(resolution.resolvedReferences.has('message:Goodbye Message')).toBe(true);
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
  });

  describe('Circular Dependency Detection', () => {
    test('should detect circular flow dependencies', () => {
      const flows: FlowSection[] = [
        {
          type: 'FlowSection',
          name: 'Flow A',
          rules: [
            {
              type: 'FlowRule',
              operands: [
                {
                  type: 'FlowOperand',
                  operandType: 'identifier',
                  value: 'Flow A'
                },
                {
                  type: 'FlowOperand',
                  operandType: 'identifier',
                  value: 'Flow B'
                }
              ]
            }
          ]
        },
        {
          type: 'FlowSection',
          name: 'Flow B',
          rules: [
            {
              type: 'FlowRule',
              operands: [
                {
                  type: 'FlowOperand',
                  operandType: 'identifier',
                  value: 'Flow B'
                },
                {
                  type: 'FlowOperand',
                  operandType: 'identifier',
                  value: 'Flow A'
                }
              ]
            }
          ]
        }
      ];

      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
        flows: flows,
        messages: null,
        config: null,
        defaults: null
      };

      const resolution = {
        resolvedReferences: new Map(),
        unresolvedReferences: [],
        circularDependencies: []
      };

      resolver.checkCircularDependencies(agent, resolution, mockAcceptor);
      
      expect(resolution.circularDependencies.length).toBeGreaterThan(0);
      expect(errors.some(e => e.info.code === 'circular-flow-dependency')).toBe(true);
    });
  });

  describe('Identifier Validation', () => {
    test('should validate identifier format', () => {
      expect(resolver['isValidIdentifier']('ValidIdentifier')).toBe(true);
      expect(resolver['isValidIdentifier']('Valid Identifier')).toBe(true);
      expect(resolver['isValidIdentifier']('Valid-Identifier')).toBe(true);
      expect(resolver['isValidIdentifier']('Valid_Identifier')).toBe(true);
      expect(resolver['isValidIdentifier']('123Invalid')).toBe(false);
      expect(resolver['isValidIdentifier']('invalid@identifier')).toBe(false);
      expect(resolver['isValidIdentifier']('')).toBe(false);
    });
  });

  describe('Cross-file Reference Validation', () => {
    test('should detect unresolved imports', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['Nonexistent', 'Module'],
            alias: undefined,
            source: undefined
          }
        ],
        agentSection: null
      };

      const importedFiles = new Map();

      resolver.validateCrossFileReferences(file, importedFiles, mockAcceptor);
      
      expect(errors.some(e => e.info.code === 'unresolved-import')).toBe(true);
    });

    test('should resolve valid imports', () => {
      const file: RclFile = {
        type: 'RclFile',
        imports: [
          {
            type: 'ImportStatement',
            importPath: ['Existing', 'Module'],
            alias: undefined,
            source: undefined
          }
        ],
        agentSection: null
      };

      const importedFiles = new Map();
      importedFiles.set('Existing/Module', {
        type: 'RclFile',
        imports: [],
        agentSection: null
      });

      resolver.validateCrossFileReferences(file, importedFiles, mockAcceptor);
      
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
  });

  describe('Reference Collection', () => {
    test('should collect all referenced identifiers', () => {
      const agent: AgentDefinition = {
        type: 'AgentDefinition',
        name: 'Test Agent',
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
                  },
                  {
                    type: 'FlowOperand',
                    operandType: 'identifier',
                    value: 'End Flow'
                  }
                ]
              }
            ]
          }
        ],
        messages: null,
        config: null,
        defaults: null
      };

      const file: RclFile = {
        type: 'RclFile',
        imports: [],
        agentSection: agent
      };

      const references = resolver.getAllReferencedIdentifiers(file);
      
      expect(references.has(':start')).toBe(true);
      expect(references.has('Welcome Message')).toBe(true);
      expect(references.has('End Flow')).toBe(true);
      expect(references.size).toBe(3);
    });
  });
});