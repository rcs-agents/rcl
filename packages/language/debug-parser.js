import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

// Test the actual failing import case
const input = `import utils as u from "shared/utils"
agent Simple Agent:
    name: "Simple"`;

console.log('=== Testing Complex Import Statements ===');
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

console.log('\nAST:');
console.log(JSON.stringify(result.ast, null, 2));
