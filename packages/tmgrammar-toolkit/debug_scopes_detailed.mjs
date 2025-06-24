import { scopes } from './dist/scopes/index.js';
import { buildLanguageScopes } from './dist/scopes/lib/internal.js';

console.log('=== Testing buildLanguageScopes with keyword only ===');

const keywordOnly = { keyword: scopes.keyword };
console.log('Input keyword structure:');
console.log('keywordOnly.keyword:', typeof keywordOnly.keyword);
console.log('keywordOnly.keyword keys:', Object.keys(keywordOnly.keyword));
console.log('keywordOnly.keyword.control:', typeof keywordOnly.keyword.control);

const result = buildLanguageScopes(keywordOnly, 'js');
console.log('\nResult:');
console.log('result.keyword:', typeof result.keyword);
console.log('result.keyword keys:', Object.keys(result.keyword || {}));
console.log('result.keyword.control:', result.keyword?.control);

console.log('\n=== Testing with just scopes.keyword directly ===');
const directResult = buildLanguageScopes({ keyword: scopes.keyword }, 'js');
console.log('Direct result:');
console.log('directResult:', directResult);
console.log('directResult.keyword:', directResult.keyword);
