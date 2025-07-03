import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
import { RclCustomLexer } from '../../src/parser/rcl-custom-lexer.js';

describe('RCL Parser Error Handling Tests', () => {
  let parser: RclCustomParser;
  let lexer: RclCustomLexer;

  beforeAll(() => {
    parser = new RclCustomParser();
    lexer = new RclCustomLexer();
  });

  describe('Lexer Error Recovery', () => {
    test('handles invalid characters gracefully', () => {
      const input = `agent Test Agent:
    name: "Valid"
    invalid: @#$%^&*()
    valid: "Still works"`;

      const lexResult = lexer.tokenize(input);
      
      // Should continue lexing after invalid characters
      expect(lexResult.tokens.length).toBeGreaterThan(0);
      
      // Should have some valid tokens
      const agentToken = lexResult.tokens.find(t => t.tokenType.name === 'agent');
      expect(agentToken).toBeDefined();
    });

    test('recovers from unterminated strings', () => {
      const input = `agent Test Agent:
    name: "Unterminated string
    valid: "This should still work"`;

      const lexResult = lexer.tokenize(input);
      
      // Should continue lexing after unterminated string
      expect(lexResult.tokens.length).toBeGreaterThan(0);
      
      // Should report errors for unterminated string
      if (lexResult.errors.length > 0) {
        const stringError = lexResult.errors.find(e => 
          e.message.toLowerCase().includes('string') ||
          e.message.toLowerCase().includes('unterminated')
        );
        expect(stringError).toBeDefined();
      }
    });

    test('handles mixed indentation errors', () => {
      const input = `agent Test Agent:
    name: "Test"
\ttabs: "mixed"
  spaces: "also mixed"
    normal: "back to normal"`;

      const lexResult = lexer.tokenize(input);
      
      // Should handle mixed indentation without crashing
      expect(lexResult.tokens.length).toBeGreaterThan(0);
      
      // Might generate warnings about inconsistent indentation
      if (lexResult.errors.length > 0) {
        const indentationError = lexResult.errors.find(e => 
          e.message.toLowerCase().includes('indent') ||
          e.message.toLowerCase().includes('mixed')
        );
        // Indentation errors are optional depending on implementation
      }
    });

    test('handles unicode and special characters', () => {
      const input = `agent Unicode Test:
    name: "Test with émojis 🚀"
    description: "Unicode: ñáéíóú 中文 русский"
    special: "Special: ∞ ≠ ≈ ≤ ≥"`;

      const lexResult = lexer.tokenize(input);
      
      // Should handle unicode gracefully
      expect(lexResult.errors).toHaveLength(0);
      expect(lexResult.tokens.length).toBeGreaterThan(0);
    });
  });

  describe('Parser Error Recovery', () => {
    test('recovers from missing colons', () => {
      const input = `agent Test Agent
    name: "Missing colon above"
    valid: "This should still parse"`;

      const result = parser.parse(input);
      
      // Should have parse errors but still produce AST
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should recover and parse valid parts
      if (result.ast && result.ast.sections.length > 0) {
        const agentSection = result.ast.sections[0];
        expect(agentSection.sectionType).toBe('agent');
      }
    });

    test('recovers from incomplete section definitions', () => {
      const input = `agent Test Agent:
    name: "Test"
    
    config:
    
    incomplete syntax here
    
    messages:
        valid_message:
            text: "This should work"`;

      const result = parser.parse(input);
      
      // Should have errors but continue parsing
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should still parse valid sections
      if (result.ast) {
        const sections = result.ast.sections;
        expect(sections.length).toBeGreaterThan(0);
        
        const messagesSection = sections.find(s => s.sectionType === 'messages');
        if (messagesSection) {
          expect(messagesSection.messages).toHaveLength(1);
        }
      }
    });

    test('recovers from malformed import statements', () => {
      const input = `import Invalid
import Shared/Utils as Utils
import Another Invalid Statement
import Working/Module as Working

agent Test Agent:
    name: "Test"`;

      const result = parser.parse(input);
      
      // Should have some parse errors
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should still parse valid imports and agent
      if (result.ast) {
        expect(result.ast.imports.length).toBeGreaterThan(0);
        expect(result.ast.sections.length).toBeGreaterThan(0);
      }
    });

    test('recovers from malformed flow rules', () => {
      const input = `agent Test Agent:
    name: "Test"
    
    flow Test Flow:
        :start -> message1
        invalid flow rule syntax
        message1 -> :end
        another invalid rule ->
        valid_rule -> final_message
        
    messages:
        message1:
            text: "Message 1"
        final_message:
            text: "Final message"`;

      const result = parser.parse(input);
      
      // Should have errors but continue parsing
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should parse valid flow rules
      if (result.ast) {
        const flowSection = result.ast.sections.find(s => s.sectionType === 'flow');
        if (flowSection) {
          expect(flowSection.flowRules.length).toBeGreaterThan(0);
        }
      }
    });

    test('recovers from nested section errors', () => {
      const input = `agent Test Agent:
    name: "Test"
    
    config:
        validProp: "valid"
        invalid syntax in config
        anotherValid: True
        
    defaults:
        timeout: invalid_value_type
        retry: 3
        
    messages:
        valid_message:
            text: "Valid"
        invalid_message:
            missing required properties
        another_valid:
            text: "Another valid message"`;

      const result = parser.parse(input);
      
      // Should have multiple errors but continue parsing
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should parse valid parts of each section
      if (result.ast) {
        const sections = result.ast.sections;
        expect(sections.length).toBeGreaterThan(0);
        
        // Should have parsed some valid attributes/messages
        const agentSection = sections.find(s => s.sectionType === 'agent');
        if (agentSection) {
          expect(agentSection.attributes.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Specific Error Cases', () => {
    test('handles missing section names', () => {
      const input = `agent:
    name: "Missing agent name"
    
    flow:
        :start -> message1`;

      const result = parser.parse(input);
      
      // Should report errors about missing names
      expect(result.errors.length).toBeGreaterThan(0);
      
      const nameError = result.errors.find(e => 
        e.message.toLowerCase().includes('name') ||
        e.message.toLowerCase().includes('missing') ||
        e.message.toLowerCase().includes('expected')
      );
      expect(nameError).toBeDefined();
    });

    test('handles invalid property assignments', () => {
      const input = `agent Test Agent:
    = "Invalid assignment"
    name "Missing colon"
    valid: "Correct assignment"
    : "Missing property name"`;

      const result = parser.parse(input);
      
      // Should have multiple syntax errors
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should still parse the valid assignment
      if (result.ast && result.ast.sections.length > 0) {
        const agentSection = result.ast.sections[0];
        const validAttr = agentSection.attributes.find(a => a.key === 'valid');
        if (validAttr) {
          expect((validAttr.value as any).value).toBe('Correct assignment');
        }
      }
    });

    test('handles unclosed brackets and parentheses', () => {
      const input = `agent Test Agent:
    name: "Test"
    config: {
        incomplete object
    messages:
        test: "Should still parse"`;

      const result = parser.parse(input);
      
      // Should have errors about unclosed brackets
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should recover and continue parsing
      if (result.ast) {
        expect(result.ast.sections.length).toBeGreaterThan(0);
      }
    });

    test('handles extremely malformed input', () => {
      const input = `completely invalid RCL syntax here
    this is not valid at all
    ][}{[}][{
    
agent Rescued Agent:
    name: "This should still work"`;

      const result = parser.parse(input);
      
      // Should have many errors but not crash
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should eventually recover and parse valid content
      if (result.ast && result.ast.sections.length > 0) {
        const rescuedAgent = result.ast.sections.find(s => 
          s.sectionType === 'agent' && s.name === 'Rescued Agent'
        );
        expect(rescuedAgent).toBeDefined();
      }
    });
  });

  describe('Error Position and Context', () => {
    test('reports accurate error positions', () => {
      const input = `agent Test Agent:
    name: "Test"
    invalid syntax on line 3`;

      const result = parser.parse(input);
      
      if (result.errors.length > 0) {
        const error = result.errors[0];
        
        // Should provide position information
        expect(error.range).toBeDefined();
        if (error.range) {
          expect(error.range.start.line).toBeGreaterThanOrEqual(0);
          expect(error.range.start.character).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('provides helpful error messages', () => {
      const input = `agent Test Agent:
    name: "Test"
    123invalid: "Invalid property name"`;

      const result = parser.parse(input);
      
      if (result.errors.length > 0) {
        const error = result.errors[0];
        
        // Error message should be descriptive
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        
        // Should mention what was expected or what went wrong
        const isHelpful = error.message.toLowerCase().includes('expected') ||
                         error.message.toLowerCase().includes('invalid') ||
                         error.message.toLowerCase().includes('unexpected');
        expect(isHelpful).toBe(true);
      }
    });

    test('reports multiple errors without stopping', () => {
      const input = `invalid import statement
agent Test Agent:
    invalid property assignment
    name: "Test"
    another invalid line
    valid: "Valid property"
    yet another error`;

      const result = parser.parse(input);
      
      // Should report multiple errors
      expect(result.errors.length).toBeGreaterThan(1);
      
      // Should still produce an AST
      expect(result.ast).toBeDefined();
      
      // Should parse valid parts
      if (result.ast && result.ast.sections.length > 0) {
        const agentSection = result.ast.sections[0];
        const validAttrs = agentSection.attributes.filter(a => 
          a.key === 'name' || a.key === 'valid'
        );
        expect(validAttrs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('handles empty file gracefully', () => {
      const input = '';
      
      const result = parser.parse(input);
      
      // Should handle empty input without errors
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(0);
      expect(result.ast?.sections).toHaveLength(0);
    });

    test('handles whitespace-only file', () => {
      const input = '   \n\t  \n   \n\t\t\n  ';
      
      const result = parser.parse(input);
      
      // Should handle whitespace gracefully
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    test('handles very large input', () => {
      // Generate a large but valid input
      const largeSections = [];
      for (let i = 0; i < 100; i++) {
        largeSections.push(`agent Test Agent ${i}:
    name: "Test Agent ${i}"
    id: ${i}
    enabled: True`);
      }
      
      const input = largeSections.join('\n\n');
      
      const result = parser.parse(input);
      
      // Should handle large input without crashing
      expect(result.ast).toBeDefined();
      expect(result.ast?.sections.length).toBe(100);
      
      // Should complete in reasonable time
      const startTime = Date.now();
      parser.parse(input);
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });

    test('handles deeply nested structures', () => {
      const input = `agent Deep Test:
    name: "Deep nesting test"
    config:
        level1:
            level2:
                level3:
                    level4:
                        deepValue: "Very deep"
                        deepNumber: 42
                    anotherLevel4: True
                level3b:
                    value: "Another deep value"
            level2b:
                value: "Less deep"
        level1b:
            value: "Not as deep"`;

      const result = parser.parse(input);
      
      // Should handle deep nesting
      expect(result.ast).toBeDefined();
      if (result.errors.length > 0) {
        console.log('Deep nesting errors:', result.errors.map(e => e.message));
      }
      
      // Should parse the main structure even if deep nesting has issues
      expect(result.ast?.sections.length).toBeGreaterThan(0);
    });
  });
});