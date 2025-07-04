import { RclParser } from './src/parser/parser/index.js';

const parser = new RclParser();

// Test just the import part without agent definition
const testCase = 'import My Brand / Samples as Sample One';
console.log(`Testing: ${testCase}`);

const result = parser.parse(testCase);

console.log('Import parsed successfully:', result.ast?.imports.length > 0);
console.log('Import path:', result.ast?.imports[0].importPath);
console.log('Alias:', result.ast?.imports[0].alias);

// Now let's check if the IDENTIFIER terminal is working as expected
console.log('\n=== Testing IDENTIFIER token behavior ===');

// The current IDENTIFIER terminal: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*\b/
// This should match:
// - My Brand (space followed by uppercase)
// - Common Flows (space followed by uppercase)
// - Sample One (space followed by uppercase)

const testStrings = [
  'My Brand',
  'Common Flows', 
  'Sample One',
  'Simple',
  'Utils',
  'My Brand Test',
  'A B C'
];

testStrings.forEach(str => {
  const regex = /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*\b/;
  const match = str.match(regex);
  console.log(`"${str}" -> matches: ${match ? match[0] : 'no match'}`);
});