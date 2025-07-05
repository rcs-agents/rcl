/**
 * Message Shortcuts Tests
 * Tests the critical message shortcuts functionality
 */

import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';

describe('Parser - Message Shortcuts (Critical Feature)', () => {
  it('should tokenize message shortcut keywords correctly', () => {
    const testInput = `
agent Message Shortcuts Agent:
  displayName: "Message Shortcuts Test"
  
  flow Message Flow:
    :start -> "Hello with shortcuts!"
    
  messages Messages:
    Simple Text:
      text: "Hello from RCL shortcuts!"
      
    Rich Card Example:
      richCard: "Product Card" :horizontal :left :medium
        description: "Amazing product"
        
    File Example:
      file: <url https://example.com/file.pdf>
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    // Check for shortcut keywords
    const textTokens = lexResult.tokens.filter(t => t.tokenType.name === 'text');
    const richCardTokens = lexResult.tokens.filter(t => t.tokenType.name === 'richCard');
    const fileTokens = lexResult.tokens.filter(t => t.tokenType.name === 'file');
    const urlTokens = lexResult.tokens.filter(t => t.tokenType.name === 'url');

    expect(textTokens.length).toBeGreaterThan(0);
    expect(richCardTokens.length).toBeGreaterThan(0);
    expect(fileTokens.length).toBeGreaterThan(0);
    expect(urlTokens.length).toBeGreaterThan(0);
    expect(lexResult.errors.length).toBe(0);
  });

  it('should parse agents with message shortcuts', () => {
    const testInput = `
agent Shortcuts Agent:
  displayName: "Shortcuts Test"
  
  flow Simple Flow:
    :start -> "Welcome"
    
  messages Messages:
    Welcome:
      text: "Welcome to our service!"
      
    Card Example:
      richCard: "Product" :horizontal :medium
        description: "Our product"
`;

    const parser = new RclParser();
    const parseResult = parser.parse(testInput);

    expect(parseResult.ast).toBeTruthy();
    expect(parseResult.ast!.agentSection).toBeTruthy();
    expect(parseResult.ast!.agentSection!.name).toBe('Shortcuts Agent');
    expect(parseResult.ast!.agentSection!.flows.length).toBe(1);
    expect(parseResult.ast!.agentSection!.messages).toBeTruthy();
  });

  it('should recognize all main shortcut types', () => {
    const testInput = `
text: "Simple text message"
richCard: "Card title" :horizontal
carousel: :medium
file: <url https://example.com/file.pdf>
rbmFile: <url https://example.com/rbm.pdf>
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const shortcutTokens = lexResult.tokens.filter(t => 
      ['text', 'richCard', 'carousel', 'file', 'rbmFile'].includes(t.tokenType.name)
    );

    expect(shortcutTokens.length).toBeGreaterThanOrEqual(5);
  });

  it('should handle message traffic type prefixes', () => {
    const testInput = `
transactional text: "Important message"
promotional richCard: "Sale announcement"
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const transactionalTokens = lexResult.tokens.filter(t => 
      t.tokenType.name === 'transactional'
    );
    const promotionalTokens = lexResult.tokens.filter(t => 
      t.tokenType.name === 'promotional'
    );

    expect(transactionalTokens.length).toBeGreaterThan(0);
    expect(promotionalTokens.length).toBeGreaterThan(0);
  });

  it('should parse shortcut modifiers and atoms', () => {
    const testInput = `
richCard: "Title" :horizontal :left :medium :vertical
carousel: :small :large
`;

    const lexer = new RclLexer();
    const lexResult = lexer.tokenize(testInput);

    const atomTokens = lexResult.tokens.filter(t => t.tokenType.name === 'ATOM');
    const atoms = atomTokens.map(t => t.image);

    expect(atoms).toContain(':horizontal');
    expect(atoms).toContain(':left'); 
    expect(atoms).toContain(':medium');
    expect(atoms).toContain(':small');
  });
});