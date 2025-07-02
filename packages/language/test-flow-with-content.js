import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Flow with Content ===');

const testCases = [
  // Test 1: Flow with simple content  
  `flow WelcomeFlow:
    start: welcome_message`,
  
  // Test 2: Messages with content (for comparison)
  `messages Messages:
    welcome_message:
        text: "Hello"`,
  
  // Test 3: Agent with content (for comparison)
  `agent TestAgent:
    name: "Test"`
];

testCases.forEach((input, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log(input);
  console.log('---');
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
