/**
 * Critical Fixes Validation Tests
 * 
 * Tests to validate that the critical discrepancies identified in the analysis
 * have been properly fixed to match the formal specification.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';

describe('Critical Lexer Fixes', () => {
  let lexer: RclLexer;

  beforeEach(() => {
    lexer = new RclLexer();
  });

  describe('Multi-line Expression Syntax Fix', () => {
    test('should properly tokenize multi-line expression start without braces', () => {
      const input = `\$js>>>
  let result = calculate();
  return result;`;

      const result = lexer.tokenize(input);
      
      // Should have MULTI_LINE_EXPRESSION_START token
      const expressionStart = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START');
      expect(expressionStart).toBeDefined();
      expect(expressionStart?.image).toBe('$js>>>');

      // Should have MULTI_LINE_EXPRESSION_CONTENT token for the indented block
      const expressionContent = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_CONTENT');
      expect(expressionContent).toBeDefined();
      expect(expressionContent?.image).toContain('let result = calculate()');
    });

    test('should handle TypeScript multi-line expressions', () => {
      const input = `\$ts>>>
  interface User {
    name: string;
  }
  return user;`;

      const result = lexer.tokenize(input);
      
      const expressionStart = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START');
      expect(expressionStart?.image).toBe('$ts>>>');
    });

    test('should handle language-agnostic multi-line expressions', () => {
      const input = `\$>>>
  some generic code
  return value;`;

      const result = lexer.tokenize(input);
      
      const expressionStart = result.tokens.find(t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START');
      expect(expressionStart?.image).toBe('$>>>');
    });
  });

  describe('Embedded Code Pattern Fix', () => {
    test('should correctly tokenize single-line embedded expressions', () => {
      const input = `value: \$js> context.user.name`;

      const result = lexer.tokenize(input);
      
      const embeddedCode = result.tokens.find(t => t.tokenType.name === 'EMBEDDED_CODE');
      expect(embeddedCode).toBeDefined();
      expect(embeddedCode?.image).toBe('$js> context.user.name');
    });

    test('should handle TypeScript single-line expressions', () => {
      const input = `value: \$ts> (user as User).getName()`;

      const result = lexer.tokenize(input);
      
      const embeddedCode = result.tokens.find(t => t.tokenType.name === 'EMBEDDED_CODE');
      expect(embeddedCode?.image).toBe('$ts> (user as User).getName()');
    });

    test('should handle language-agnostic single-line expressions', () => {
      const input = `value: \$> getValue()`;

      const result = lexer.tokenize(input);
      
      const embeddedCode = result.tokens.find(t => t.tokenType.name === 'EMBEDDED_CODE');
      expect(embeddedCode?.image).toBe('$> getValue()');
    });
  });

  describe('Identifier Pattern Fix', () => {
    test('should handle space-separated identifiers without word boundaries', () => {
      const input = `Customer Support Agent`;

      const result = lexer.tokenize(input);
      
      // Should be tokenized as a single IDENTIFIER token
      const identifierTokens = result.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');
      expect(identifierTokens).toHaveLength(1);
      expect(identifierTokens[0].image).toBe('Customer Support Agent');
    });

    test('should handle identifiers with numbers and hyphens', () => {
      const input = `Order-Processing Flow 2`;

      const result = lexer.tokenize(input);
      
      const identifierTokens = result.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');
      expect(identifierTokens).toHaveLength(1);
      expect(identifierTokens[0].image).toBe('Order-Processing Flow 2');
    });

    test('should require uppercase start per specification', () => {
      const input = `lowercase identifier`;

      const result = lexer.tokenize(input);
      
      // Should not be recognized as IDENTIFIER (must start with uppercase)
      const identifierTokens = result.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');
      expect(identifierTokens).toHaveLength(0);
    });
  });

  describe('Type Tag Token Support', () => {
    test('should tokenize type tag patterns', () => {
      const input = `<email user@domain.com>`;

      const result = lexer.tokenize(input);
      
      expect(result.tokens.some(t => t.tokenType.name === 'LT')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'email')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'GT')).toBe(true);
    });

    test('should handle type tags with modifiers', () => {
      const input = `<time 4pm | UTC>`;

      const result = lexer.tokenize(input);
      
      expect(result.tokens.some(t => t.tokenType.name === 'LT')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'time')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'PIPE')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'GT')).toBe(true);
    });

    test('should support all type tag names from specification', () => {
      const typeTagNames = [
        'email', 'phone', 'msisdn', 'url', 'time', 'datetime', 
        'date', 'zipcode', 'zip', 'duration', 'ttl'
      ];

      for (const typeName of typeTagNames) {
        const input = `<${typeName} value>`;
        const result = lexer.tokenize(input);
        
        expect(result.tokens.some(t => t.tokenType.name === typeName)).toBe(true);
      }
    });
  });

  describe('Multi-line String Chomping Markers', () => {
    test('should tokenize clean marker', () => {
      const input = `description: |
  This is a clean string
  with preserved structure`;

      const result = lexer.tokenize(input);
      
      const cleanMarker = result.tokens.find(t => t.tokenType.name === 'MULTILINE_STR_CLEAN');
      expect(cleanMarker).toBeDefined();
      expect(cleanMarker?.image).toBe('|');
    });

    test('should tokenize trim marker', () => {
      const input = `description: |-
  This string has no trailing newline`;

      const result = lexer.tokenize(input);
      
      const trimMarker = result.tokens.find(t => t.tokenType.name === 'MULTILINE_STR_TRIM');
      expect(trimMarker).toBeDefined();
      expect(trimMarker?.image).toBe('|-');
    });

    test('should tokenize preserve marker', () => {
      const input = `description: +|
  This preserves leading space`;

      const result = lexer.tokenize(input);
      
      const preserveMarker = result.tokens.find(t => t.tokenType.name === 'MULTILINE_STR_PRESERVE');
      expect(preserveMarker).toBeDefined();
      expect(preserveMarker?.image).toBe('+|');
    });

    test('should tokenize preserve all marker', () => {
      const input = `description: +|+
     This preserves all whitespace`;

      const result = lexer.tokenize(input);
      
      const preserveAllMarker = result.tokens.find(t => t.tokenType.name === 'MULTILINE_STR_PRESERVE_ALL');
      expect(preserveAllMarker).toBeDefined();
      expect(preserveAllMarker?.image).toBe('+|+');
    });
  });

  describe('Import Path Tokenization', () => {
    test('should handle slash-separated import paths', () => {
      const input = `import My Brand / Customer Support`;

      const result = lexer.tokenize(input);
      
      // Should have proper separation with slashes
      expect(result.tokens.some(t => t.tokenType.name === 'import')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'IDENTIFIER' && t.image === 'My Brand')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'SLASH')).toBe(true);
      expect(result.tokens.some(t => t.tokenType.name === 'IDENTIFIER' && t.image === 'Customer Support')).toBe(true);
    });
  });
});

describe('Error Handling Improvements', () => {
  let lexer: RclLexer;

  beforeEach(() => {
    lexer = new RclLexer();
  });

  test('should provide clear error messages for malformed expressions', () => {
    const input = `\$js>> incomplete expression`;

    const result = lexer.tokenize(input);
    
    // Should not crash and should report helpful errors
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Malformed embedded expression');
  });

  test('should recover from indentation errors gracefully', () => {
    const input = `agent Test:
  displayName: "Test"
    inconsistent indent`;

    const result = lexer.tokenize(input);
    
    // Should still tokenize what it can
    expect(result.tokens.some(t => t.tokenType.name === 'agent')).toBe(true);
    expect(result.tokens.some(t => t.tokenType.name === 'IDENTIFIER' && t.image === 'Test')).toBe(true);
  });
});