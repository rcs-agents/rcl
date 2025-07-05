/**
 * Flow System Tests
 * Tests multi-arrow flow transitions and flow system compliance
 */

import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';

describe('Parser - Flow System with Multi-Arrow Support', () => {
  it('should tokenize multi-arrow flow sequences', () => {
    const testInput = `
agent Flow System Agent:
  displayName: "Flow System Test"
  
  flow Multi Arrow Flow:
    :start -> Check Input -> Validate -> Process -> Complete
    :error -> Error Handler -> Log Error -> :start
    
  messages Messages:
    Welcome:
      text: "Welcome to the flow system!"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Count arrow tokens
    const arrowTokens = lexResult.tokens.filter(t => t.tokenType.name === 'ARROW');
    expect(arrowTokens.length).toBeGreaterThan(5); // Multiple arrows in chains

    // Verify atoms are recognized
    const atomTokens = lexResult.tokens.filter(t => t.tokenType.name === 'ATOM');
    const atoms = atomTokens.map(t => t.image);
    expect(atoms).toContain(':start');
    expect(atoms).toContain(':error');

    expect(lexResult.errors.length).toBe(0);
  });

  it('should parse complex flow transitions', () => {
    const testInput = `
agent Flow Agent:
  displayName: "Flow Test"
  
  flow Complex Flow:
    :start -> Check -> Validate -> Process -> Complete
    :error -> Recovery -> :start
    
  messages Messages:
    Simple:
      text: "Flow test"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentSection).toBeTruthy();
    expect(parseResult.ast!.agentSection!.name).toBe('Flow Agent');
    expect(parseResult.ast!.agentSection!.flows.length).toBe(1);
    expect(parseResult.ast!.agentSection!.flows[0].name).toBe('Complex Flow');
  });

  it('should handle flow operand types correctly', () => {
    const testInput = `
:start -> "String Message" -> Identifier State -> :end
atom1 -> atom2 -> "final message"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Check for different operand types
    const atomTokens = lexResult.tokens.filter(t => t.tokenType.name === 'ATOM');
    const stringTokens = lexResult.tokens.filter(t => t.tokenType.name === 'STRING');
    const identifierTokens = lexResult.tokens.filter(t => t.tokenType.name === 'IDENTIFIER');

    expect(atomTokens.length).toBeGreaterThan(0);
    expect(stringTokens.length).toBeGreaterThan(0);
    expect(identifierTokens.length).toBeGreaterThan(0);
  });

  it('should recognize flow control keywords', () => {
    const testInput = `
agent Control Flow:
  displayName: "Test"
  
  flow Test Flow:
    :start -> Check
    
    when user.type is "premium":
      :start -> Premium Welcome -> Process
      
    Check Input with:
      inputType: "text"
      maxLength: 500
    
  messages Messages:
    Test:
      text: "Test"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const whenTokens = lexResult.tokens.filter(t => t.tokenType.name === 'when');
    const withTokens = lexResult.tokens.filter(t => t.tokenType.name === 'with');

    expect(whenTokens.length).toBeGreaterThan(0);
    expect(withTokens.length).toBeGreaterThan(0);
  });

  it('should parse multiple flow sections', () => {
    const testInput = `
agent Multi Flow Agent:
  displayName: "Multi Flow Test"
  
  flow First Flow:
    :start -> "First End"
    
  flow Second Flow:
    :start -> Check -> "Second End"
    
  messages Messages:
    Test:
      text: "Test message"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentSection).toBeTruthy();
    expect(parseResult.ast!.agentSection!.flows.length).toBe(2);
    expect(parseResult.ast!.agentSection!.flows[0].name).toBe('First Flow');
    expect(parseResult.ast!.agentSection!.flows[1].name).toBe('Second Flow');
  });

  it('should handle space-separated flow identifiers', () => {
    const testInput = `
agent Space Flow:
  displayName: "Test"
  
  flow Order Processing Flow:
    :start -> Check Inventory -> Process Payment -> Ship Order -> Complete Order
    
  messages Messages:
    Test:
      text: "Test"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentSection!.flows[0].name).toBe('Order Processing Flow');
  });

  it('should validate arrow syntax in complex chains', () => {
    const testInput = `
# Test various arrow chain patterns
:start -> A -> B -> C -> D -> E
State1 -> "Message 1" -> State2 -> "Message 2" -> :end
:error -> Recovery1 -> Recovery2 -> :start
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const arrowCount = lexResult.tokens.filter(t => t.image === '->').length;
    expect(arrowCount).toBe(12); // Total arrows in all chains

    // Should tokenize without errors
    expect(lexResult.errors.length).toBe(0);
  });
});