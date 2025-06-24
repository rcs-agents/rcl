import { scopes } from './dist/scopes/index.js';
import { createScopeNode } from './dist/scopes/lib/internal.js';

console.log('=== Step by Step Debug ===');

// Test creating a scope node with children manually
console.log('\n1. Manual scope node creation:');
const controlScope = createScopeNode('keyword.control', undefined, 'js');
console.log('controlScope:', controlScope.toString());

// Test creating a scope node with children
console.log('\n2. Scope node with children:');
const children = {
  conditional: createScopeNode('keyword.control.conditional', undefined, 'js')
};
const controlWithChildren = createScopeNode('keyword.control', children, 'js');
console.log('controlWithChildren.toString():', controlWithChildren.toString());
console.log('controlWithChildren.conditional:', controlWithChildren.conditional);
console.log('controlWithChildren.conditional.toString():', controlWithChildren.conditional?.toString());

// Test the structure we get from scopes
console.log('\n3. Original scope structure:');
console.log('scopes.keyword.control.toString():', scopes.keyword.control.toString());
console.log('scopes.keyword.control.conditional:', scopes.keyword.control.conditional);
console.log('scopes.keyword.control.conditional.toString():', scopes.keyword.control.conditional.toString());
