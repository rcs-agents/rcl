import { RclParser } from './src/parser/parser/index.js';

const parser = new RclParser();

const testCases = [
  'import Utils',
  'import Utils as Helpers',
  'import My Brand / Samples as Sample One',
  'import Shared / Common Flows / Support'
];

for (const testCase of testCases) {
  console.log(`\n=== Testing: ${testCase} ===`);
  const result = parser.parse(testCase);
  
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(error => {
      console.log(`  - ${error.message}`);
    });
  } else {
    console.log('✓ Parse successful');
  }
  
  if (result.ast) {
    console.log('AST:', JSON.stringify(result.ast, null, 2));
  }
}