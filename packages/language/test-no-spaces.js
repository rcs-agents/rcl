import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Flow with Single Word Name ===');
const flowSingle = `flow WelcomeFlow:
    start: welcome_message`;

let result = parser.parse(flowSingle);
console.log(`Single word flow - Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
  });
}

console.log('\n=== Testing Messages with Single Word Name ===');
const messagesSingle = `messages Messages:
    welcome_message:
        text: "Welcome"`;

result = parser.parse(messagesSingle);
console.log(`Single word messages - Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
  });
}
