import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

const input = `agent BMW Customer Service:
    description: "Customer support"
    
flow Welcome Flow:
        start: welcome_message
    
messages Messages:
    welcome_message:
        text: "Welcome to BMW"`;

console.log('=== Testing Multiple Sections (Fixed) ===');
const result = parser.parse(input);

console.log(`Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 5).forEach((error, i) => {
    console.log(`Error ${i + 1}: ${error.message || 'undefined'}`);
    if (error.location) {
      console.log(`  Location: line ${error.location.start.line}, column ${error.location.start.column}`);
    }
  });
  if (result.errors.length > 5) {
    console.log(`... and ${result.errors.length - 5} more errors`);
  }
}
