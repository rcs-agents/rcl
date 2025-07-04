/**
 * Type Tags Tests
 * Tests type tag parsing and content extraction
 */

import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';

describe('Lexer - Type Tags Implementation', () => {
  it('should tokenize type tag components correctly', () => {
    const testInput = `
agent Type Tag Agent:
  displayName: "Type Tag Test"
  
  flow Contact Flow:
    :start -> Contact Message
    
  messages Messages:
    Contact Message:
      text: "Please contact us at <email support@company.com> or <phone +1-555-0123>"
      
    Event Reminder:
      text: "Event starts at <time 4pm | EST> on <date March 15th, 2024>"
      
    File Share:
      file: <url https://example.com/document.pdf>
      
    Location Info:
      text: "We're located at <zip 10001> in the US"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Check for type tag brackets
    const ltTokens = lexResult.tokens.filter(t => t.tokenType.name === 'LT');
    const gtTokens = lexResult.tokens.filter(t => t.tokenType.name === 'GT');

    expect(ltTokens.length).toBeGreaterThan(0);
    expect(gtTokens.length).toBeGreaterThan(0);
    expect(lexResult.errors.length).toBe(0);
  });

  it('should recognize all type tag names', () => {
    const testInput = `
<email test@example.com>
<phone +1-555-0123>
<url https://example.com>
<time 4pm>
<date March 15th>
<zip 10001>
<duration 5s>
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const typeTokens = lexResult.tokens.filter(t => 
      t.tokenType.name.includes('TYPE') || 
      ['email', 'phone', 'url', 'time', 'date', 'zip', 'duration'].includes(t.tokenType.name)
    );

    expect(typeTokens.length).toBeGreaterThan(0);
  });

  it('should handle type tag modifiers with pipe', () => {
    const testInput = `
<time 4pm | EST>
<date March 15th | 2024>
<zip 10001 | US>
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const pipeTokens = lexResult.tokens.filter(t => t.tokenType.name === 'PIPE');
    expect(pipeTokens.length).toBe(3);
  });

  it('should parse agents with type tags successfully', () => {
    const testInput = `
agent Contact Agent:
  displayName: "Contact Test"
  
  flow Contact Flow:
    :start -> "Contact info"
    
  messages Messages:
    Contact:
      text: "Reach us at <email support@company.com> or <phone +1-555-0123>"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentDefinition).toBeTruthy();
    expect(parseResult.ast!.agentDefinition!.name).toBe('Contact Agent');
    expect(parseResult.ast!.agentDefinition!.flows.length).toBe(1);
    expect(parseResult.ast!.agentDefinition!.messages).toBeTruthy();
  });

  it('should handle various type tag formats', () => {
    const testInput = `
<email user@domain.com>
<phone +1-555-0123>
<msisdn +1234567890>
<url https://example.com/path?param=value>
<time 14:30>
<t 2:30pm>
<datetime 2024-03-15T14:30:00Z>
<date March 15th, 2024>
<dt 2024-03-15>
<zipcode 10001>
<zip 90210>
<duration 5m30s>
<ttl 3600>
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Should successfully tokenize without errors
    expect(lexResult.errors.length).toBe(0);
    
    // Should have proper bracket pairs
    const ltCount = lexResult.tokens.filter(t => t.tokenType.name === 'LT').length;
    const gtCount = lexResult.tokens.filter(t => t.tokenType.name === 'GT').length;
    expect(ltCount).toBe(gtCount);
    expect(ltCount).toBe(13); // 13 type tags
  });

  it('should handle type tags in different contexts', () => {
    const testInput = `
agent Multi Context:
  displayName: "Test"
  
  flow Test:
    :start -> "End"
    
  messages Messages:
    InText:
      text: "Email: <email test@example.com>"
    
    AsFile:
      file: <url https://example.com/file.pdf>
      
    WithModifier:
      text: "Time: <time 4pm | UTC>"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.errors.length).toBe(0);
  });
});