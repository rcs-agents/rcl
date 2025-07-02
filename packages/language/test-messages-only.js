import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Different Messages Syntax ===');

// Test 1: Current syntax (which works in working tests)
const messages1 = `messages:
    welcome_message:
        text: "Hello"`;

let result = parser.parse(messages1);
console.log(`messages: syntax - Errors: ${result.errors.length}`);

// Test 2: Formal spec syntax  
const messages2 = `messages Messages:
    welcome_message:
        text: "Hello"`;

result = parser.parse(messages2);
console.log(`messages Messages: syntax - Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
  });
}
