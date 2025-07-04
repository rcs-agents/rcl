/**
 * Multi-line Expressions Tests
 * Tests the critical fix for indentation-based multi-line expressions
 */

import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';

describe('Lexer - Multi-line Expressions (Critical Fix)', () => {
  it('should tokenize multi-line expressions with indentation syntax', () => {
    const testInput = `
agent Dynamic Agent:
  displayName: "Dynamic Agent"
  
  flow Dynamic Flow:
    :start -> calculated
    calculated: $js>>>
      let result = "Hello";
      if (context.user.name) {
        result += " " + context.user.name;
      }
      return result;
    
  messages Messages:
    Dynamic Message:
      text: $js> "Hello " + context.user.firstName
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Find multi-line expression tokens
    const multiLineStartTokens = lexResult.tokens.filter(
      t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START'
    );
    const multiLineContentTokens = lexResult.tokens.filter(
      t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_CONTENT'
    );
    const embeddedCodeTokens = lexResult.tokens.filter(
      t => t.tokenType.name === 'EMBEDDED_CODE'
    );

    // Verify multi-line expression tokens are generated
    expect(multiLineStartTokens.length).toBe(1);
    expect(multiLineContentTokens.length).toBe(1);
    expect(embeddedCodeTokens.length).toBe(1);

    // Verify the multi-line expression start token
    expect(multiLineStartTokens[0].image).toBe('$js>>>');

    // Verify the content contains the JavaScript code
    const content = multiLineContentTokens[0].image;
    expect(content).toContain('let result = "Hello"');
    expect(content).toContain('context.user.name');
    expect(content).toContain('return result');
  });

  it('should support both $js>>> and $ts>>> syntax', () => {
    const testInput = `
agent Test:
  displayName: "Test"
  
  flow Test:
    jsCode: $js>>>
      console.log("JavaScript");
    
    tsCode: $ts>>>
      const message: string = "TypeScript";
      console.log(message);
    
  messages Messages:
    Test:
      text: "Test"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const multiLineStarts = lexResult.tokens.filter(
      t => t.tokenType.name === 'MULTI_LINE_EXPRESSION_START'
    );

    expect(multiLineStarts.length).toBe(2);
    expect(multiLineStarts[0].image).toBe('$js>>>');
    expect(multiLineStarts[1].image).toBe('$ts>>>');
  });

  it('should handle single-line embedded expressions', () => {
    const testInput = `
agent Test:
  displayName: "Test"
  
  flow Test:
    :start -> "End"
    
  messages Messages:
    Test:
      text: $js> "Hello " + context.user.name
      value: $ts> context.getValue()
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const embeddedTokens = lexResult.tokens.filter(
      t => t.tokenType.name === 'EMBEDDED_CODE'
    );

    expect(embeddedTokens.length).toBe(2);
    expect(embeddedTokens[0].image).toContain('$js>');
    expect(embeddedTokens[1].image).toContain('$ts>');
  });

  it('should parse agents with multi-line expressions successfully', () => {
    const testInput = `
agent Expression Agent:
  displayName: "Expression Test"
  
  flow Dynamic Flow:
    :start -> calculated
    calculated: $js>>>
      let result = "Hello";
      return result;
    
  messages Messages:
    Dynamic:
      text: $js> "Hello " + context.user.name
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentDefinition).toBeTruthy();
    expect(parseResult.ast!.agentDefinition!.name).toBe('Expression Agent');
    expect(parseResult.ast!.agentDefinition!.flows.length).toBe(1);
  });
});