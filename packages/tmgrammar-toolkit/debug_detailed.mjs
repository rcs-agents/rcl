import { scopes } from './dist/scopes/index.js';

console.log('=== Detailed Scope Structure Analysis ===');

console.log('\nScopes.keyword structure:');
console.log('typeof scopes.keyword:', typeof scopes.keyword);
console.log('scopes.keyword.toString():', scopes.keyword.toString());
console.log('Object.keys(scopes.keyword):', Object.keys(scopes.keyword));
console.log('Object.getOwnPropertyNames(scopes.keyword):', Object.getOwnPropertyNames(scopes.keyword));
console.log('Object.getOwnPropertyDescriptors(scopes.keyword):');
const descriptors = Object.getOwnPropertyDescriptors(scopes.keyword);
for (const [key, desc] of Object.entries(descriptors)) {
  console.log(`  ${key}:`, desc);
}

console.log('\nDirect property access:');
console.log('scopes.keyword.control:', scopes.keyword.control);
console.log('scopes.keyword.hasOwnProperty("control"):', scopes.keyword.hasOwnProperty('control'));

console.log('\nTesting for..in loop:');
for (const key in scopes.keyword) {
  console.log(`  ${key}:`, typeof scopes.keyword[key]);
}
