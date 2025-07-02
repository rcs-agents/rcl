import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

const input = `agent BMW Customer Service:
    description: "Customer support"
    
flows:
    Welcome Flow:
        start: welcome_message
    
messages:
    welcome_message:
        text: "Welcome to BMW"`;

console.log('=== Testing Multiple Sections ===');
console.log('Input:');
console.log(input);
console.log('\n=== Results ===');

const result = parser.parse(input);

console.log(`Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}: ${error.message}`);
    if (error.location) {
      console.log(`  Location: line ${error.location.start.line}, column ${error.location.start.column}`);
    }
  });
}
