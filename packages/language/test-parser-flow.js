import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Parser with Flow Syntax ===');

const testCases = [
  'flow WelcomeFlow:',
  'flows:',
  'agent TestAgent:'
];

testCases.forEach(input => {
  console.log(`\nInput: "${input}"`);
  const result = parser.parse(input);
  console.log(`Errors: ${result.errors.length}`);
  if (result.errors.length > 0) {
    result.errors.slice(0, 3).forEach((error, i) => {
      console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
    });
  } else {
    console.log('  Parsed successfully!');
  }
});
