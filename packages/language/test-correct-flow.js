import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

console.log('=== Testing Correct Flow Syntax ===');

const correctFlow = `flow Welcome Flow:
    :start -> Welcome Message`;

console.log('Input:');
console.log(correctFlow);
console.log('\n=== Results ===');

const result = parser.parse(correctFlow);
console.log(`Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.slice(0, 3).forEach((error, i) => {
    console.log(`  Error ${i + 1}: ${error.message || error.toString()}`);
  });
} else {
  console.log('  Parsed successfully! ✅');
}
