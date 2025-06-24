import { scopes } from './dist/scopes/index.js';

console.log('=== Type Analysis ===');
console.log('typeof scopes.keyword:', typeof scopes.keyword);
console.log('scopes.keyword instanceof Function:', scopes.keyword instanceof Function);
console.log('scopes.keyword instanceof Object:', scopes.keyword instanceof Object);
console.log('Array.isArray(scopes.keyword):', Array.isArray(scopes.keyword));
console.log('scopes.keyword.constructor.name:', scopes.keyword.constructor.name);

console.log('\nTesting scope.keyword.control:');
console.log('typeof scopes.keyword.control:', typeof scopes.keyword.control);
console.log('scopes.keyword.control instanceof Function:', scopes.keyword.control instanceof Function);
console.log('scopes.keyword.control.constructor.name:', scopes.keyword.control.constructor.name);
