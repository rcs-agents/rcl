import { describe, it, expect, beforeEach } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
import { EmbeddedExpression, EmbeddedCodeBlock } from '../../src/parser/rcl-simple-ast.js';

/**
 * Test suite for Phase 5: Embedded Code Storage
 * 
 * Tests the ability to parse and store embedded code as literal strings
 * without executing or parsing the embedded language content.
 */
describe('RCL Embedded Code Storage', () => {
  let parser: RclCustomParser;

  beforeEach(() => {
    parser = new RclCustomParser();
  });

  describe('Single-line Embedded Expressions', () => {
    it('should parse $js> single-line expressions', () => {
      const input = `agent Test Agent:
    description: "Test agent"
    calculation: $js> RclUtil.format('dash_case', context.selectedOption.text)`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.sections).toHaveLength(1);
      
      const agent = result.ast!.sections[0];
      expect(agent.attributes).toHaveLength(2);
      
      const calculation = agent.attributes.find(a => a.key === 'calculation');
      expect(calculation).toBeDefined();
      expect(calculation!.value.type).toBe('EmbeddedExpression');
      
      const embeddedCode = calculation!.value as EmbeddedExpression;
      expect(embeddedCode.language).toBe('js');
      expect(embeddedCode.content).toBe("RclUtil.format('dash_case', context.selectedOption.text)");
      expect(embeddedCode.isMultiline).toBe(false);
    });

    it('should parse $ts> single-line expressions', () => {
      const input = `agent Config Agent:
    typeCalculation: $ts> calculateUserType(user.preferences)`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedExpression');
      const embeddedCode = attr.value as EmbeddedExpression;
      expect(embeddedCode.language).toBe('ts');
      expect(embeddedCode.content).toBe('calculateUserType(user.preferences)');
    });

    it('should parse $template> single-line expressions', () => {
      const input = `messages Greetings:
    greeting: $template> "Hello, @{user.name}!"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedExpression');
      const embeddedCode = attr.value as EmbeddedExpression;
      expect(embeddedCode.language).toBe('template');
      expect(embeddedCode.content).toBe('"Hello, @{user.name}!"');
    });

    it('should parse $rcl> single-line expressions', () => {
      const input = `agent Format Agent:
    format: $rcl> format @user.name as : title_case`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedExpression');
      const embeddedCode = attr.value as EmbeddedExpression;
      expect(embeddedCode.language).toBe('rcl');
      expect(embeddedCode.content).toBe('format @user.name as : title_case');
    });

    it('should parse ${...} style expressions as JavaScript', () => {
      const input = `agent Test Agent:
    dynamicValue: \${user.name + " - " + timestamp}`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedExpression');
      const embeddedCode = attr.value as EmbeddedExpression;
      expect(embeddedCode.language).toBe('js');
      expect(embeddedCode.content).toBe('user.name + " - " + timestamp');
    });
  });

  describe('Multi-line Embedded Code Blocks', () => {
    it('should parse $js> multi-line code blocks', () => {
      const input = `agent Calculator Agent:
    complexCalculation: $js>>> {
      const basePrice = @product.price;
      const discount = calculateDiscount(user.membership);
      return basePrice * (1 - discount);
    }`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedCodeBlock');
      const codeBlock = attr.value as EmbeddedCodeBlock;
      expect(codeBlock.language).toBe('js');
      expect(codeBlock.content).toEqual([
        'const basePrice = @product.price;',
        'const discount = calculateDiscount(user.membership);',
        'return basePrice * (1 - discount);'
      ]);
    });

    it('should parse $template> multi-line code blocks', () => {
      const input = `messages Email Templates:
    emailTemplate: $template>>> {
      Subject: Welcome @{user.name}
      Body: Thank you for joining @{company.name}
      Footer: Best regards, @{agent.name}
    }`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedCodeBlock');
      const codeBlock = attr.value as EmbeddedCodeBlock;
      expect(codeBlock.language).toBe('template');
      expect(codeBlock.content.length).toBeGreaterThan(0);
    });

    it('should parse $rcl> multi-line code blocks', () => {
      const input = `agent Data Agent:
    dataTransformation: $rcl>>> {
      transform @data.users as users_list:
        filter by: active = true
        sort by: name ascending
        limit: 10
    }`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      const attr = section.attributes[0];
      
      expect(attr.value.type).toBe('EmbeddedCodeBlock');
      const codeBlock = attr.value as EmbeddedCodeBlock;
      expect(codeBlock.language).toBe('rcl');
      expect(codeBlock.content.length).toBeGreaterThan(0);
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
  flow Booking:
    :start -> Book Appointment with id: $js> generateId(), timestamp: $template> @{now.iso}`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const agent = result.ast!.sections[0];
      expect(agent.subSections).toHaveLength(1);
      
      const flowSubSection = agent.subSections[0];
      expect(flowSubSection.flowRules).toHaveLength(1);
      
      const bookingFlow = flowSubSection.flowRules[0];
      expect(bookingFlow.transitions).toHaveLength(1);
      
      const transition = bookingFlow.transitions[0];
      expect(transition.withClause).toBeDefined();
      expect(transition.withClause!.parameters).toHaveLength(2);
      
      const idParam = transition.withClause!.parameters[0];
      expect(idParam.value.type).toBe('EmbeddedExpression');
      const idExpression = idParam.value as EmbeddedExpression;
      expect(idExpression.language).toBe('js');
      expect(idExpression.content).toBe('generateId()');
      
      const timestampParam = transition.withClause!.parameters[1];
      expect(timestampParam.value.type).toBe('EmbeddedExpression');
      const timestampExpression = timestampParam.value as EmbeddedExpression;
      expect(timestampExpression.language).toBe('template');
      expect(timestampExpression.content).toBe('@{now.iso}');
    });
  });

  describe('Mixed Embedded Code and Regular Values', () => {
    it('should handle sections with both embedded code and regular values', () => {
      const input = `agent Mixed Agent:
    name: "Static Agent Name"
    calculation: $js> computeValue(context.data)
    description: "Agent with mixed values"
    template: $template> "Hello @{user.name}"
    enabled: True
    priority: 5
    script: $rcl> format @data as: json`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const section = result.ast!.sections[0];
      expect(section.attributes).toHaveLength(7);
      
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
      
      const template = section.attributes.find(a => a.key === 'template');
      expect(template!.value.type).toBe('EmbeddedExpression');
      expect((template!.value as EmbeddedExpression).language).toBe('template');
      
      const script = section.attributes.find(a => a.key === 'script');
      expect(script!.value.type).toBe('EmbeddedExpression');
      expect((script!.value as EmbeddedExpression).language).toBe('rcl');
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