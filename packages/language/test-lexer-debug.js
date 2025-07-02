import { RclCustomLexer } from './lib/parser/rcl-custom-lexer.js';

const lexer = new RclCustomLexer();

console.log('=== Testing Individual Tokens ===');

// Test individual tokens
const testCases = [
  'messages',
  'Messages', 
  'messages Messages:',
  'flow',
  'WelcomeFlow'
];

testCases.forEach(test => {
  console.log(`\nInput: "${test}"`);
  const result = lexer.tokenize(test);
  console.log(`Tokens (${result.tokens.length}):`);
  result.tokens.forEach((token, i) => {
    console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
  });
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
  }
});
