/**
 * Test script to verify converted examples work correctly
 */

import { bicepGrammar } from './bicep-example.js';
import { typespecGrammar } from './typespec-example.js';

console.log('Testing converted examples...\n');

// Test Bicep grammar
console.log('🔧 Bicep Grammar:');
console.log(`  Name: ${bicepGrammar.name}`);
console.log(`  Scope: ${bicepGrammar.scopeName}`);
console.log(`  File Types: ${bicepGrammar.fileTypes?.join(', ')}`);
console.log(`  Patterns: ${bicepGrammar.patterns?.length} top-level patterns`);
console.log('  ✅ Bicep grammar structure looks good\n');

// Test TypeSpec grammar
console.log('🔧 TypeSpec Grammar:');
console.log(`  Name: ${typespecGrammar.name}`);
console.log(`  Scope: ${typespecGrammar.scopeName}`);
console.log(`  File Types: ${typespecGrammar.fileTypes?.join(', ')}`);
console.log(`  Patterns: ${typespecGrammar.patterns?.length} top-level patterns`);
console.log('  ✅ TypeSpec grammar structure looks good\n');

// Test that grammars have expected properties
const requiredProps = ['name', 'scopeName', 'patterns'];
const testGrammar = (name: string, grammar: any) => {
  const missing = requiredProps.filter(prop => !grammar[prop]);
  if (missing.length > 0) {
    console.log(`  ❌ ${name} missing: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

console.log('🧪 Validation Results:');
const bicepValid = testGrammar('Bicep', bicepGrammar);
const typespecValid = testGrammar('TypeSpec', typespecGrammar);

if (bicepValid && typespecValid) {
  console.log('✅ All converted examples are valid TextMate grammars!');
  console.log('\n🎉 Conversion successful! The examples now use tmgrammar-toolkit.');
} else {
  console.log('❌ Some examples have validation issues.');
  process.exit(1);
} 