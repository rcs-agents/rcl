import { RclCustomLexer } from './lib/parser/rcl-custom-lexer.js';

const lexer = new RclCustomLexer();

console.log('=== Testing Flow Context ===');

const inputs = [
  'flow WelcomeFlow:',
  'flow Welcome Flow:',
  'flows:',
  'WelcomeFlow:'
];

inputs.forEach(input => {
  console.log(`\nInput: "${input}"`);
  const result = lexer.tokenize(input);
  console.log(`Tokens (${result.tokens.length}):`);
  result.tokens.forEach((token, i) => {
    console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
  });
  if (result.errors.length > 0) {
    console.log(`Lexer Errors: ${result.errors.length}`);
    result.errors.forEach(err => console.log(`  ${err.message}`));
  }
});
