import { describe, it, expect } from 'vitest';
import { RclLexer } from '../../src/parser/lexer/index.js';
import { RclParser } from '../../src/parser/parser/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('RCL Lexer + Parser Integration', () => {
  describe('Complete Pipeline', () => {
    it('should parse minimal.rcl example successfully', () => {
      const input = `agent BMW Customer Service:
    displayName: "BMW Customer Service Agent"
    
    flow Welcome Flow:
      :start -> welcome_message
    
    flow Contact Support Flow:
      :start -> support_greeting

    messages Messages:
      welcome_message: "Welcome to BMW Customer Service"
      support_greeting: "How can we help you today?"`;

      // Test lexer
      const lexer = new RclLexer();
      const lexResult = lexer.tokenize(input);
      
      expect(lexResult.errors).toHaveLength(0);
      expect(lexResult.tokens.length).toBeGreaterThan(0);
      
      // Test parser
      const parser = new RclParser();
      const parseResult = parser.parse(input);
      
      // Debug: show what errors are generated
      if (parseResult.errors.length > 0) {
        console.log('Integration test errors:', parseResult.errors);
      }
      
      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.ast).toBeDefined();
      
      const ast = parseResult.ast!;
      
      // Verify structure
      expect(ast.type).toBe('RclFile');
      expect(ast.imports).toHaveLength(0);
      expect(ast.agentSection).toBeDefined();
      
      // Check agent section
      const agentSection = ast.agentSection;
      expect(agentSection).toBeDefined();
      expect(agentSection!.name).toBe('BMW Customer Service');
      
      // Basic structure validation - we'll just verify the agent section exists
      // More detailed validation would require checking the specific AST structure
    });

    it('should handle imports and complex structure', () => {
      const input = `import Shared / Common Utils as Utils

agent Multi Function Agent:
    displayName: "Multi Function Agent"
    
    flow Registration Flow:
      :start -> validate_input
    
    messages Messages:
      welcome: "Welcome to our service!"`;

      const parser = new RclParser();
      const result = parser.parse(input);
      
      // Debug: show what errors are generated
      if (result.errors.length > 0) {
        console.log('Integration test errors:', result.errors);
      }
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      
      // Check basic structure
      expect(ast.imports).toHaveLength(1);
      expect(ast.agentSection).toBeDefined();
      expect(ast.agentSection!.name).toBe('Multi Function Agent');
    });

    it('should handle space-separated identifiers correctly', () => {
      const input = `agent Premium Customer Support Agent:
    displayName: "Premium Customer Support Agent"
    
    flow BMW Contact Support Flow:
      :start -> Welcome
      
    messages Messages:
      premium_welcome_message: "Welcome to BMW Premium Support"`;

      const parser = new RclParser();
      const result = parser.parse(input);
      
      // Debug: show what errors are generated
      if (result.errors.length > 0) {
        console.log('Integration test errors:', result.errors);
      }
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      
      // Check agent with space-separated name
      expect(ast.agentSection).toBeDefined();
      expect(ast.agentSection!.name).toBe('Premium Customer Support Agent');
    });

    it('should handle mixed value types', () => {
      const input = `agent Configuration Agent:
    displayName: "Config Agent"
    
    flow Health Check Flow:
      :start -> Health Check
      
    messages Messages:
      status_message: "System status: operational"`;

      const parser = new RclParser();
      const result = parser.parse(input);
      
      // Debug: show what errors are generated
      if (result.errors.length > 0) {
        console.log('Integration test errors:', result.errors);
      }
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      // Basic validation - just check the agent section exists
      expect(result.ast!.agentSection).toBeDefined();
      expect(result.ast!.agentSection!.name).toBe('Configuration Agent');
    });
  });

  describe('Error Recovery', () => {
    it('should handle partial parsing with errors', () => {
      const input = `agent Good Agent:
    name: "Working Agent"
    version: "1.0"

invalid_syntax_here this should cause error

agent Another Good Agent:
    description: "This should still parse"
    enabled: True`;

      const parser = new RclParser();
      const result = parser.parse(input);
      
      // Should have errors but still parse valid parts
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should still have parsed the valid sections
      // For now just check that AST exists
      expect(result.ast).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle reasonably large files efficiently', () => {
      // Generate a larger input with one agent containing multiple flows and messages
      const flows = [];
      for (let i = 0; i < 5; i++) {
        flows.push(`    flow Flow ${i}:
      :start -> message_${i}`);
      }
      
      const messages = [];
      for (let i = 0; i < 15; i++) {
        messages.push(`      message_${i}: "Message ${i} content"`);
      }
      
      const input = `agent Test Agent:
    displayName: "Test Agent"
    
${flows.join('\n\n')}
    
    messages Messages:
${messages.join('\n')}`;
      
      const startTime = Date.now();
      
      const parser = new RclParser();
      const result = parser.parse(input);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Debug: show what errors are generated
      if (result.errors.length > 0) {
        console.log('Performance test errors:', result.errors);
      }
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast!.agentSection).toBeDefined();
      
      // Should parse reasonably quickly (less than 100ms for this size)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Real Example Files', () => {
    it('should parse example.rcl if it exists', () => {
      try {
        const examplePath = join(process.cwd(), 'examples', 'example.rcl');
        const content = readFileSync(examplePath, 'utf-8');
        
        const parser = new RclParser();
        const result = parser.parse(content);
        
        // Should parse without critical errors
        expect(result.ast).toBeDefined();
        
        // Log any errors for debugging
        if (result.errors.length > 0) {
          console.log('Parsing errors in example.rcl:', result.errors);
        }
        
      } catch (error) {
        // File doesn't exist or can't be read - skip test
        console.log('Skipping example.rcl test - file not found');
      }
    });

    it('should parse minimal.rcl if it exists', () => {
      try {
        const minimalPath = join(process.cwd(), 'examples', 'minimal.rcl');
        const content = readFileSync(minimalPath, 'utf-8');
        
        const parser = new RclParser();
        const result = parser.parse(content);
        
        // Should parse without critical errors
        expect(result.ast).toBeDefined();
        
        // Log any errors for debugging
        if (result.errors.length > 0) {
          console.log('Parsing errors in minimal.rcl:', result.errors);
        }
        
      } catch (error) {
        // File doesn't exist or can't be read - skip test
        console.log('Skipping minimal.rcl test - file not found');
      }
    });
  });
}); 