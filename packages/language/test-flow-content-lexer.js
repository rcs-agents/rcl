import { RclCustomLexer } from './lib/parser/rcl-custom-lexer.js';

const lexer = new RclCustomLexer();

console.log('=== Testing Flow Content Lexing ===');

const flowInput = `flow WelcomeFlow:
    start: welcome_message`;

console.log('Input:');
console.log(flowInput);
console.log('\nTokens:');

const result = lexer.tokenize(flowInput);
result.tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.tokenType.name} = "${token.image}" (line ${token.startLine}, col ${token.startColumn})`);
});

if (result.errors.length > 0) {
  console.log('\nLexer Errors:');
  result.errors.forEach(err => console.log(`  ${err.message}`));
}
