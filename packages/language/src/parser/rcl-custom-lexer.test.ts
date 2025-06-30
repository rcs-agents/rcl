import { RclCustomLexer } from './rcl-custom-lexer.js';

/**
 * Test suite to demonstrate the RclCustomLexer functionality
 * This is not connected to Langium yet - it's a standalone test
 */

// Test basic tokenization
function testBasicTokenization() {
  console.log('=== Testing Basic Tokenization ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "My Test Agent"
  brandName: "Test Brand"`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Tokens:');
  result.tokens.forEach((token, i) => {
    console.log(`  ${i}: ${token.tokenType.name} = "${token.image}" (${token.startLine}:${token.startColumn}-${token.endLine}:${token.endColumn})`);
  });
  
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(error => console.log(`  ${error.message}`));
  }
  
  console.log('');
}

// Test indentation handling
function testIndentation() {
  console.log('=== Testing Indentation ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "Test"
  flow Welcome Flow
    :start -> "Hello"
    "Hello" -> :end`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Tokens (focusing on INDENT/DEDENT):');
  result.tokens.forEach((token, i) => {
    if (['INDENT', 'DEDENT', 'agent', 'flow', 'IDENTIFIER', 'ATOM', 'STRING'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test embedded expressions
function testEmbeddedExpressions() {
  console.log('=== Testing Embedded Expressions ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: $js> "Hello " + context.user.name
  description: $ts> calculateDescription(context)`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Expression tokens:');
  result.tokens.forEach((token, i) => {
    if (token.tokenType.name === 'SINGLE_LINE_EXPRESSION') {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test type tags
function testTypeTags() {
  console.log('=== Testing Type Tags ===');
  
  const lexer = new RclCustomLexer();
  const input = `contact:
  email: <email user@example.com>
  phone: <phone +1234567890>
  website: <url https://example.com>`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Type-related tokens:');
  result.tokens.forEach((token, i) => {
    if (['LT', 'email', 'phone', 'url', 'IDENTIFIER', 'STRING', 'GT'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test boolean and null keywords
function testKeywords() {
  console.log('=== Testing Keywords ===');
  
  const lexer = new RclCustomLexer();
  const input = `config:
  enabled: True
  debug: False
  cache: Null
  timeout: None`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Keyword tokens:');
  result.tokens.forEach((token, i) => {
    if (['True', 'False', 'Null', 'None', 'ATTRIBUTE_KEY'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test message shortcuts
function testMessageShortcuts() {
  console.log('=== Testing Message Shortcuts ===');
  
  const lexer = new RclCustomLexer();
  const input = `messages Messages
  text "Welcome to our service!"
  richCard "Product Info"
    description: "Our latest product"
  reply "Get Started"
  dial "Call Support" <phone +1234567890>`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Shortcut-related tokens:');
  result.tokens.forEach((token, i) => {
    if (['text', 'richCard', 'reply', 'dial', 'STRING', 'phone'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test space-separated identifiers
function testSpaceSeparatedIdentifiers() {
  console.log('=== Testing Space-Separated Identifiers ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent BMW Customer Service
  flow Contact Support Flow
  agentMessage Welcome Message
    text "Hello from BMW Customer Service"`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Identifier tokens:');
  result.tokens.forEach((token, i) => {
    if (token.tokenType.name === 'IDENTIFIER') {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test error handling
function testErrorHandling() {
  console.log('=== Testing Error Handling ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "Unclosed string
  invalidChar: @#$%`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Errors:');
  result.errors.forEach((error, i) => {
    console.log(`  ${i}: ${error.message} at line ${error.line}, column ${error.column}`);
  });
  
  console.log('');
}

// Run all tests
function runAllTests() {
  console.log('RCL Custom Lexer Test Suite');
  console.log('============================\n');
  
  testBasicTokenization();
  testIndentation();
  testEmbeddedExpressions();
  testTypeTags();
  testKeywords();
  testMessageShortcuts();
  testSpaceSeparatedIdentifiers();
  testErrorHandling();
  
  console.log('Test suite completed!');
}

// Export for potential use in other files
export {
  testBasicTokenization,
  testIndentation,
  testEmbeddedExpressions,
  testTypeTags,
  testKeywords,
  testMessageShortcuts,
  testSpaceSeparatedIdentifiers,
  testErrorHandling,
  runAllTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
} 