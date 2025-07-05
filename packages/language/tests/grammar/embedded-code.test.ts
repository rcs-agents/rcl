import { describe, it, expect, beforeEach } from 'vitest';
import { RclParser } from '../../src/parser/parser/index.js';

/**
 * Test suite for Phase 5: Embedded Code Storage
 * 
 * Tests the ability to parse and store embedded code as literal strings
 * without executing or parsing the embedded language content.
 */
describe('RCL Embedded Code Storage', () => {
  let parser: RclParser;

  beforeEach(() => {
    parser = new RclParser();
  });

  describe('Single-line Embedded Expressions', () => {
    it('should parse $js> single-line expressions', () => {
      const input = `agent Test Agent:
    displayName: "Test agent"
    calculation: $js> RclUtil.format('dash_case', context.selectedOption.text)
    
    flow Main:
      :start -> :end
      
    messages Messages:
      welcome: "Hello"`;

      const result = parser.parse(input);
      
      // Debug: show what errors are generated
      if (result.errors.length > 0) {
        console.log('Embedded code errors:', result.errors);
      }
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.agentSection).toBeDefined();
      
      const agent = result.ast!.agentSection!;
      expect(agent.name).toBe('Test Agent');
      
      // For now, just verify the agent parsed successfully
      // TODO: Add specific embedded code value validation once AST structure is confirmed
    });

    it('should parse $ts> single-line expressions', () => {
      const input = `agent Config Agent:
    displayName: "Config Agent"
    typeCalculation: $ts> calculateUserType(user.preferences)
    
    flow Main:
      :start -> :end
      
    messages Messages:
      welcome: "Hello"`;
      const result = parser.parse(input);
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.agentSection).toBeDefined();
    });

    it('should parse $> style expressions as JavaScript (default language)', () => {
      const input = `agent Config Agent:
    displayName: "Config Agent"
    typeCalculation: $> user.preferences.length > 0 ? "premium" : "basic"
    
    flow Main:
      :start -> :end
      
    messages Messages:
      welcome: "Hello"`;
      const result = parser.parse(input);
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.agentSection).toBeDefined();
    });
  });

  describe('Multi-line Embedded Code Blocks', () => {
    it('should parse $js> multi-line code blocks', () => {
      const input = `agent Config Agent:
    typeCalculation: $js>>> {
      // multi-line
      return user.preferences.length > 0 ? "premium" : "basic";
    }`;
      const result = parser.parse(input);
      expect(result.errors).toHaveLength(0);
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      expect(attr.value.type).toBe('EmbeddedCodeBlock');
      const embeddedCode = attr.value as EmbeddedCodeBlock;
      expect(embeddedCode.language).toBe('js');
      expect(embeddedCode.content).toEqual([
        '// multi-line',
        'return user.preferences.length > 0 ? "premium" : "basic";'
      ]);
    });

    it('should handle multi-line blocks without explicit language (defaults to js)', () => {
      const input = `agent Test Agent:
    genericCode: $>>> {
      console.log('Hello World');
      return 42;
    }`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedCodeBlock');
      const codeBlock = attr.value as EmbeddedCodeBlock;
      expect(codeBlock.language).toBe('js'); // Should default to 'js'
    });
  });

  describe('Embedded Code in Flow Rules', () => {
    it('should parse embedded expressions in flow rule parameters', () => {
      const input = `agent Booking Agent:
    displayName: "Booking Agent"
    
flow Booking:
    :start -> Book Appointment with
        id: $js> generateId()
        timestamp: $ts> now.getTime()`;

      const result = parser.parse(input);
      if (result.errors.length !== 0) {
        console.log('Parser errors:', result.errors);
      }
      expect(result.errors).toHaveLength(0);
      
      const flowSection = result.ast!.sections.find(s => s.sectionType === 'flow');
      expect(flowSection).toBeDefined();
      expect(flowSection!.flowRules).toHaveLength(1);
      
      const bookingFlow = flowSection!.flowRules[0];
      expect(bookingFlow.transitions).toHaveLength(1);
      
      const transition = bookingFlow.transitions[0];
      expect(transition.withClause).toBeDefined();
      expect(transition.withClause!.parameters).toHaveLength(2);
      
      const idParam = transition.withClause!.parameters[0];
      expect(idParam.defaultValue.type).toBe('EmbeddedExpression');
      const idExpression = idParam.defaultValue as EmbeddedExpression;
      expect(idExpression.language).toBe('js');
      expect(idExpression.content).toBe('generateId()');
      
      const timestampParam = transition.withClause!.parameters[1];
      expect(timestampParam.defaultValue.type).toBe('EmbeddedExpression');
      const timestampExpression = timestampParam.defaultValue as EmbeddedExpression;
      expect(timestampExpression.language).toBe('ts');
      expect(timestampExpression.content).toBe('now.getTime()');
    });
  });

  describe('Mixed Embedded Code and Regular Values', () => {
    it('should handle sections with both embedded code and regular values', () => {
      const input = `agent Mixed Agent:
    name: "Static Agent Name"
    calculation: $js> computeValue(context.data)
    description: "Agent with mixed values"
    enabled: True
    priority: 5
    script: $ts> formatData(context.data)`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      expect(section.attributes).toHaveLength(6);
      
      // Check that we have the right mix of value types
      const valueTypes = section.attributes.map(attr => attr.value.type);
      expect(valueTypes).toContain('StringValue');
      expect(valueTypes).toContain('EmbeddedExpression');
      expect(valueTypes).toContain('BooleanValue');
      expect(valueTypes).toContain('NumberValue');
      
      // Verify specific embedded expressions
      const calculation = section.attributes.find(a => a.key === 'calculation');
      expect(calculation!.value.type).toBe('EmbeddedExpression');
      expect((calculation!.value as EmbeddedExpression).language).toBe('js');
      
      const script = section.attributes.find(a => a.key === 'script');
      expect(script!.value.type).toBe('EmbeddedExpression');
      expect((script!.value as EmbeddedExpression).language).toBe('ts');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed embedded expressions gracefully', () => {
      const input = `agent Test Agent:
    badExpression: $badlang> some code
    goodExpression: $js> validCode()`;

      const result = parser.parse(input);
      
      // Should have some errors but still parse what it can
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Should still parse the valid expression
      if (result.ast?.sections?.[0]?.attributes) {
        const goodAttr = result.ast.sections[0].attributes.find(a => a.key === 'goodExpression');
        if (goodAttr) {
          expect(goodAttr.value.type).toBe('EmbeddedExpression');
        }
      }
    });
  });
}); 