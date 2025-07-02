import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Simple Flow Only ===');
const flowOnly = `flow Welcome Flow:
    start: welcome_message`;

let result = parser.parse(flowOnly);
console.log(`Flow only - Errors: ${result.errors.length}`);

console.log('\n=== Testing Simple Messages Only ===');
const messagesOnly = `messages Messages:
    welcome_message:
        text: "Welcome"`;

result = parser.parse(messagesOnly);
console.log(`Messages only - Errors: ${result.errors.length}`);

console.log('\n=== Testing Agent + Flow ===');
const agentFlow = `agent Simple Agent:
    name: "Test"
    
flow Welcome Flow:
    start: welcome_message`;

result = parser.parse(agentFlow);
console.log(`Agent + Flow - Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
  });
}
