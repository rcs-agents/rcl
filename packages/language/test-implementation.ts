/**
 * Test Implementation
 * 
 * Quick test to verify that our refactored lexer and parser are working
 * with the critical fixes applied.
 */

import { RclLexer } from './src/parser/lexer/index.js';
import { RclParser } from './src/parser/parser/index.js';

// Test input with critical features
const testInput = `
import Common / Utils as Helpers

agent Customer Support:
  displayName: "Customer Support Bot"
  brandName: "ACME Corp"
  
  flow Welcome Flow:
    :start -> Welcome Message
    Welcome Message -> Get Help
    
  messages Messages:
    Welcome Message:
      text "Hello! How can I help you?"
        suggestions:
          reply "Get started"
          openUrl "Learn more" <url https://example.com>
          dial "Call support" <phone +1-555-0123>
    
    Rich Card Example:
      richCard "Product Showcase" :horizontal :medium <url https://example.com/image.jpg>:
        description: "Check out our latest product"
        suggestions:
          reply "Buy now"
`;

console.log('Testing RCL Lexer and Parser Implementation');
console.log('==========================================');

// Test lexer
console.log('\n1. Testing Lexer...');
try {
  const lexer = new RclLexer();
  const lexResult = lexer.tokenize(testInput);
  
  console.log(`✓ Lexer completed successfully`);
  console.log(`  - Tokens generated: ${lexResult.tokens.length}`);
  console.log(`  - Lexical errors: ${lexResult.errors.length}`);
  
  if (lexResult.errors.length > 0) {
    console.log('  Lexical errors:');
    lexResult.errors.forEach(error => {
      console.log(`    - ${error.message} at line ${error.line}`);
    });
  }
  
  // Show some key tokens
  const keyTokens = lexResult.tokens.filter(token => 
    ['agent', 'import', 'text', 'richCard', 'reply', 'openUrl', 'dial'].includes(token.image)
  );
  console.log(`  - Key tokens found: ${keyTokens.map(t => t.image).join(', ')}`);
  
} catch (error) {
  console.log(`✗ Lexer failed: ${error}`);
}

// Test parser
console.log('\n2. Testing Parser...');
try {
  const parser = new RclParser();
  const parseResult = parser.parse(testInput);
  
  console.log(`✓ Parser completed successfully`);
  console.log(`  - AST generated: ${parseResult.ast ? 'Yes' : 'No'}`);
  console.log(`  - Parse errors: ${parseResult.errors.length}`);
  
  if (parseResult.errors.length > 0) {
    console.log('  Parse errors:');
    parseResult.errors.forEach(error => {
      console.log(`    - ${error.message} at line ${error.line}`);
    });
  }
  
  if (parseResult.ast) {
    console.log('  AST structure:');
    console.log(`    - File type: ${parseResult.ast.type}`);
    console.log(`    - Imports: ${parseResult.ast.imports?.length || 0}`);
    console.log(`    - Agent definition: ${parseResult.ast.agentDefinition ? 'Yes' : 'No'}`);
    
    if (parseResult.ast.agentDefinition) {
      const agent = parseResult.ast.agentDefinition;
      console.log(`    - Agent name: ${agent.name}`);
      console.log(`    - Display name: ${agent.displayName}`);
      console.log(`    - Flows: ${agent.flows?.length || 0}`);
      console.log(`    - Messages: ${agent.messages ? 'Yes' : 'No'}`);
    }
  }
  
} catch (error) {
  console.log(`✗ Parser failed: ${error}`);
}

console.log('\n3. Critical Fixes Verification');
console.log('==============================');

// Test multi-line expression (should use indentation, not braces)
const multiLineTest = `
agent Test:
  displayName: "Test"
  
  flow Main:
    :start -> Check User
    
  messages Messages:
    Dynamic Message:
      text $js>>> 
        let greeting = "Hello";
        let user = context.userName;
        return greeting + " " + user;
`;

console.log('Testing multi-line expression parsing...');
try {
  const lexer = new RclLexer();
  const lexResult = lexer.tokenize(multiLineTest);
  
  const multiLineTokens = lexResult.tokens.filter(token => 
    token.tokenType.name === 'MULTI_LINE_EXPRESSION_START' ||
    token.tokenType.name === 'MULTI_LINE_EXPRESSION_CONTENT'
  );
  
  console.log(`✓ Multi-line expression tokens: ${multiLineTokens.length}`);
  if (multiLineTokens.length > 0) {
    console.log(`  - Pattern: ${multiLineTokens[0].image.substring(0, 20)}...`);
  }
  
} catch (error) {
  console.log(`✗ Multi-line expression test failed: ${error}`);
}

console.log('\n4. Message Shortcuts Test');
console.log('==========================');

const shortcutsTest = `
agent Test:
  displayName: "Test"
  
  messages Messages:
    Text Example:
      text "Welcome to our service!"
    
    Rich Card Example:
      richCard "Product" :horizontal :medium <url https://example.com/image.jpg>
    
    File Example:
      file <url https://example.com/document.pdf>
`;

console.log('Testing message shortcuts parsing...');
try {
  const lexer = new RclLexer();
  const lexResult = lexer.tokenize(shortcutsTest);
  
  const shortcutTokens = lexResult.tokens.filter(token => 
    ['text', 'richCard', 'file'].includes(token.image)
  );
  
  console.log(`✓ Message shortcut keywords found: ${shortcutTokens.length}`);
  console.log(`  - Shortcuts: ${shortcutTokens.map(t => t.image).join(', ')}`);
  
} catch (error) {
  console.log(`✗ Message shortcuts test failed: ${error}`);
}

console.log('\nImplementation test completed!');
console.log('\nNext steps:');
console.log('- Run comprehensive test suites');
console.log('- Implement remaining parser sections');
console.log('- Add validation and error recovery');
console.log('- Performance optimization');