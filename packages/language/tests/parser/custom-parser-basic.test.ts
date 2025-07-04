/**
 * Basic Custom Parser Tests
 * Tests fundamental parsing functionality
 */

import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';

describe('Custom Parser - Basic Functionality', () => {
  it('should parse a simple agent structure', () => {
    const testInput = `
agent Test Agent:
  displayName: "Test Agent"
  
  flow Main Flow:
    :start -> "Hello!"
    
  messages Messages:
    Hello Message:
      text: "Hello from RCL!"
`;

    const lexer = new RclLexer();
    const parser = new RclParser();

    // Test lexer
    const lexResult = lexer.tokenize(testInput);
    expect(lexResult.tokens.length).toBeGreaterThan(0);
    expect(lexResult.errors.length).toBe(0);

    // Test parser
    const parseResult = parser.parse(testInput);
    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.errors.length).toBe(0);

    // Validate AST structure
    const agent = parseResult.ast!.agentDefinition;
    expect(agent).toBeTruthy();
    expect(agent!.name).toBe('Test Agent');
    expect(agent!.displayName).toBe('Test Agent');
    expect(agent!.flows.length).toBe(1);
    expect(agent!.messages).toBeTruthy();
  });

  it('should handle space-separated identifiers correctly', () => {
    const testInput = `
agent BMW Customer Service:
  displayName: "BMW Customer Service Agent"
  
  flow Order Processing Flow:
    :start -> "Welcome"
    
  messages Messages:
    Welcome Message:
      text: "Hello!"
`;

    const lexer = new RclLexer();
    const parseResult = new RclParser().parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentDefinition!.name).toBe('BMW Customer Service');
    expect(parseResult.ast!.agentDefinition!.flows[0].name).toBe('Order Processing Flow');
  });

  it('should generate proper INDENT/DEDENT tokens', () => {
    const testInput = `
agent Simple:
  displayName: "Test"
  flow Main:
    :start -> "End"
  messages Messages:
    Test:
      text: "Hello"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const indentTokens = lexResult.tokens.filter(t => t.tokenType.name === 'INDENT');
    const dedentTokens = lexResult.tokens.filter(t => t.tokenType.name === 'DEDENT');

    expect(indentTokens.length).toBeGreaterThan(0);
    expect(dedentTokens.length).toBeGreaterThan(0);
    expect(lexResult.errors.length).toBe(0);
  });

  it('should handle reserved words in identifier contexts', () => {
    const testInput = `
agent Reserved Test:
  displayName: "Test"
  
  flow Main:
    :start -> "End"
    
  messages Messages:
    Test:
      text: "Hello"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.errors.length).toBe(0);
    expect(parseResult.ast!.agentDefinition!.messages).toBeTruthy();
  });
});