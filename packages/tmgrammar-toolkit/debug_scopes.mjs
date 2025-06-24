import { scopes, scopesFor } from './dist/scopes/index.js';
import { buildLanguageScopes } from './dist/scopes/lib/internal.js';

console.log('=== Debugging Scope Functions ===');

// Check basic scopes structure
console.log('\nBasic scopes structure:');
console.log('scopes.keyword:', typeof scopes.keyword);
console.log('scopes.keyword.control:', typeof scopes.keyword.control);
console.log('scopes.keyword.control.conditional:', typeof scopes.keyword.control.conditional);

// Test scopesFor
console.log('\nTesting scopesFor:');
const jsScopes = scopesFor('js');
console.log('jsScopes type:', typeof jsScopes);
console.log('jsScopes keys:', Object.keys(jsScopes));
console.log('jsScopes.keyword type:', typeof jsScopes.keyword);

if (jsScopes.keyword) {
  console.log('jsScopes.keyword keys:', Object.keys(jsScopes.keyword));
  console.log('jsScopes.keyword.control type:', typeof jsScopes.keyword.control);
}

// Test buildLanguageScopes with simple object
console.log('\nTesting buildLanguageScopes with simple object:');
const testScopes = buildLanguageScopes({
  keyword: {
    control: {
      conditional: { toString: () => 'keyword.control.conditional' }
    }
  }
}, 'js');
console.log('testScopes:', JSON.stringify(testScopes, null, 2));
