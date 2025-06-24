import { scopes } from './src/scopes/index.js';

console.log('entity.name.function properties:', Object.getOwnPropertyNames(scopes.entity.name.function));
console.log('entity.name.function.constructor exists:', 'constructor' in scopes.entity.name.function);
console.log('entity.name.function.constructor type:', typeof scopes.entity.name.function.constructor);

try {
  console.log('entity.name.function.constructor.toString():', scopes.entity.name.function.constructor.toString());
} catch (e) {
  console.log('Error calling toString:', e.message);
}
