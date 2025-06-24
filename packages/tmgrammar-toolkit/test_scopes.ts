import { scopes, scopesFor } from './src/scopes/index.js';

// Test basic scopes
console.log('Basic scope test:');
console.log(scopes.keyword.control.conditional.toString()); // "keyword.control.conditional"
console.log(scopes.comment.line.double_slash('js')); // "comment.line.double-slash.js"

// Test language-specific scopes
console.log('\nLanguage-specific scope test:');
const jsScopes = scopesFor('js');
console.log(jsScopes.keyword.control.conditional.toString()); // "keyword.control.conditional.js"
console.log(jsScopes.comment.line.double_slash('async')); // "comment.line.double-slash.js.async"
