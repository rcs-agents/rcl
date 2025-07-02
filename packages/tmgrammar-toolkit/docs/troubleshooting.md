# Troubleshooting Guide

Common issues and solutions when working with the TextMate Toolkit.

## Build and Compilation Issues

### TypeScript Compilation Errors

**Problem**: TypeScript compilation fails when importing the toolkit

**Solution**: Ensure you have compatible TypeScript settings

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true
  }
}
```

**Problem**: Cannot find module declarations

**Solution**: Install type dependencies
```bash
npm install --save-dev @types/node
```

### Import/Export Issues

**Problem**: `Cannot find module 'tmgrammar-toolkit/testing'`

**Solution**: Check your import paths and ensure submodule exports are correct
```typescript
// ✅ Correct
import { createTesterFromFile } from 'tmgrammar-toolkit/testing';
import { scopes } from 'tmgrammar-toolkit';

// ❌ Incorrect  
import { createTesterFromFile } from 'tmgrammar-toolkit/src/testing';
```

## Grammar Definition Issues

### Regex Pattern Problems

**Problem**: Regex patterns not matching expected text

**Common Causes & Solutions**:

1. **Escaping Issues**
   ```typescript
   // ❌ Wrong - not enough escaping
   match: "\b(function)\b"
   
   // ✅ Right - proper escaping
   match: "\\b(function)\\b"
   
   // ✅ Best - use helpers
   match: regex.bounded('function')
   ```

2. **Case Sensitivity**
   ```typescript
   // ❌ Won't match "Function" or "FUNCTION"
   match: /function/
   
   // ✅ Case insensitive
   match: /function/i
   
   // ✅ Using helpers
   match: regex.caseInsensitive('function')
   ```

3. **Anchoring Issues**
   ```typescript
   // ❌ Matches anywhere in string
   match: /if/
   
   // ✅ Word boundaries
   match: /\bif\b/
   
   // ✅ Using helpers
   match: regex.keywords(['if'])
   ```

**Problem**: Oniguruma regex validation fails

**Solution**: Use the validation API to debug patterns
```typescript
import { validateRegex } from 'tmgrammar-toolkit/validation';

const result = await validateRegex('\\b(if|else)\\b');
if (!result.valid) {
  console.error(`Invalid regex: ${result.error}`);
  // Common fixes:
  // - Check escape sequences
  // - Verify character classes
  // - Test lookbehind/lookahead syntax
}
```

### Repository Key Conflicts

**Problem**: `Error: Duplicate repository key 'string'`

**Solution**: Ensure all rule keys are unique across your grammar
```typescript
// ❌ Duplicate keys
const singleQuotedString = { key: 'string', /* ... */ };
const doubleQuotedString = { key: 'string', /* ... */ };

// ✅ Unique keys
const singleQuotedString = { key: 'string-single', /* ... */ };
const doubleQuotedString = { key: 'string-double', /* ... */ };
```

### Scope Naming Issues

**Problem**: Editor not applying correct highlighting

**Common Causes**:

1. **Typos in scope names**
   ```typescript
   // ❌ Typo in scope name
   scope: 'keyword.controll.conditional'
   
   // ✅ Use scopes API to prevent typos
   scope: scopes.keyword.control.conditional
   ```

2. **Non-standard scope names**
   ```typescript
   // ❌ Non-standard scope
   scope: 'my.custom.scope'
   
   // ✅ Standard TextMate scope
   scope: scopes.keyword.control
   ```

3. **Missing language suffix**
   ```typescript
   // ❌ Generic scope (might conflict)
   scope: 'keyword.control'
   
   // ✅ Language-specific scope with scopesFor
   const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });
   scope: scopes.keyword.control
   ```

### Scope Issues

If your scopes aren't being highlighted correctly:

```typescript
// ❌ Typo in scope name
scope: scopes.keyword.control

// ✅ Use proper scope hierarchy
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });
scope: scopes.keyword.control
```

## Pattern Matching Issues

### Patterns Not Matching

**Problem**: Your patterns aren't matching the expected code

**Debugging Steps**:

1. **Test patterns in isolation**
   ```typescript
   import { validateRegex } from 'tmgrammar-toolkit/validation';
   
   const pattern = /\b(if|else|while)\b/;
   const testString = 'if (condition)';
   
   console.log(pattern.test(testString)); // Should be true
   ```

2. **Use the testing API to debug**
   ```typescript
   import { createTesterFromContent } from 'tmgrammar-toolkit/testing';
   
   const tester = createTesterFromContent(myGrammar, 'source.mylang');
   const tokens = await tester.tokenize('if (condition)');
   
   // Print all tokens to see what's being matched
   tokens.forEach((token, i) => {
     console.log(`Token ${i}: "${token.content}" -> ${token.scope.join('.')}`);
   });
   ```

### Pattern Order Issues

**Problem**: Wrong patterns are matching first

**Solution**: Order patterns from most specific to most general
```typescript
// ❌ General pattern matches before specific one
patterns: [
  { key: 'keyword', match: /\w+/, scope: 'keyword' },
  { key: 'function-keyword', match: /function/, scope: 'keyword.declaration' }
]

// ✅ Specific pattern first
patterns: [
  { key: 'function-keyword', match: /function/, scope: 'keyword.declaration' },
  { key: 'keyword', match: /\w+/, scope: 'keyword' }
]
```

### Performance Issues

**Problem**: Grammar causes slow syntax highlighting

**Common Causes & Solutions**:

1. **Expensive regex patterns**
   ```typescript
   // ❌ Catastrophic backtracking
   match: /(a+)+b/
   
   // ✅ Atomic grouping
   match: /(?>a+)+b/
   ```

2. **Excessive lookahead/lookbehind**
   ```typescript
   // ❌ Expensive
   match: /(?<=\w)\.(?=\w)/
   
   // ✅ Simpler alternative
   match: /\w\.\w/
   ```

3. **Too many patterns**
   ```typescript
   // ❌ Many individual rules
   patterns: [
     { key: 'if', match: /if/, scope: 'keyword' },
     { key: 'else', match: /else/, scope: 'keyword' },
     // ... 50 more
   ]
   
   // ✅ Combined rule
   patterns: [
     { 
       key: 'keywords', 
       match: regex.keywords(['if', 'else', /* ... */]), 
       scope: 'keyword' 
     }
   ]
   ```

## Testing Issues

### Test Failures

**Problem**: `expectTokenScope` assertions fail

**Debugging Steps**:

1. **Check actual token scopes**
   ```typescript
   const tokens = await tester.tokenize('if (condition)');
   const ifToken = tokens.find(t => t.content === 'if');
   console.log('Actual scopes:', ifToken?.scope);
   console.log('Expected:', 'keyword.control.mylang');
   ```

2. **Verify token content**
   ```typescript
   // Make sure you're checking the right token content
   tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
   // Not: tester.expectTokenScope(tokens, 'IF', '...');
   ```

3. **Check scope hierarchy**
   ```typescript
   // Token might have multiple scopes
   // ['source.mylang', 'keyword.control.mylang']
   // Test for the most specific one
   ```

### Snapshot Test Issues

**Problem**: Snapshot tests always failing

**Solution**: Update snapshots when grammar changes are intentional
```bash
# Update all snapshots
npx tmt snap 'tests/**/*.mylang' --update

# Update specific test
npx tmt snap 'tests/keywords.test.mylang' --update
```

## CLI Issues

### Command Not Found

**Problem**: `tmt: command not found`

**Solutions**:

1. **Local installation**
   ```bash
   npx tmt emit grammar.ts
   ```

2. **Global installation**
   ```bash
   npm install -g tmgrammar-toolkit
   tmt emit grammar.ts
   ```

3. **Use package.json scripts**
   ```json
   {
     "scripts": {
       "build-grammar": "tmt emit src/grammar.ts -o grammar.json"
     }
   }
   ```

### File Path Issues

**Problem**: `Cannot find file 'grammar.ts'`

**Solutions**:

1. **Check working directory**
   ```bash
   pwd
   ls -la grammar.ts
   ```

2. **Use absolute paths**
   ```bash
   tmt emit /full/path/to/grammar.ts
   ```

3. **Check file extensions**
   ```bash
   # Include .ts extension
   tmt emit grammar.ts
   # Not: tmt emit grammar
   ```

## Editor Integration Issues

### VS Code Not Recognizing Grammar

**Problem**: VS Code doesn't use your grammar for syntax highlighting

**Solutions**:

1. **Check file association**
   ```json
   // In your extension's package.json
   {
     "contributes": {
       "languages": [{
         "id": "mylang",
         "extensions": [".mylang", ".ml"],
         "configuration": "./language-configuration.json"
       }],
       "grammars": [{
         "language": "mylang",
         "scopeName": "source.mylang",
         "path": "./syntaxes/mylang.tmLanguage.json"
       }]
     }
   }
   ```

2. **Verify scope name matches**
   ```typescript
   // In your grammar
   const grammar = createGrammar('MyLang', 'source.mylang', ['mylang']);
   
   // Must match the scopeName in package.json
   ```

3. **Reload VS Code**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
   - Type "Developer: Reload Window"

### Incorrect Highlighting

**Problem**: Some tokens have wrong colors

**Debugging Steps**:

1. **Check scope inspector**
   - Press `Ctrl+Shift+P`
   - Type "Developer: Inspect Editor Tokens and Scopes"
   - Click on problematic tokens

2. **Verify theme support**
   ```typescript
   // Some themes might not support all scopes
   // Use common scopes for better compatibility
   scope: scopes.keyword.control  // Well-supported
   // vs
   scope: scopes.keyword.control.loop.for  // Might not be themed
   ```

## Common Error Messages

### "Invalid regular expression"

**Cause**: Regex syntax error
**Solution**: Use regex validation
```typescript
import { validateRegex } from 'tmgrammar-toolkit/validation';
const result = await validateRegex(yourPattern);
```

### "Cannot resolve include"

**Cause**: Including non-existent repository key
**Solution**: Check repository key names
```typescript
// ❌ Key doesn't exist
{ include: '#non-existent-key' }

// ✅ Valid repository key
{ include: '#existing-pattern' }
```

### "Circular reference detected"

**Cause**: Patterns referencing each other in a loop
**Solution**: Restructure pattern hierarchy
```typescript
// ❌ Circular reference
const patternA = { key: 'a', patterns: [{ include: '#b' }] };
const patternB = { key: 'b', patterns: [{ include: '#a' }] };

// ✅ Hierarchical structure
const patternA = { key: 'a', patterns: [patternB] };
const patternB = { key: 'b', match: /some-pattern/ };
```

## Getting Help

If you're still experiencing issues:

1. **Check the Examples**: Look at complete grammar implementations in `examples/`
2. **Read the API Reference**: Detailed documentation in `docs/api-reference.md`
3. **Use Validation Tools**: Run validation on your patterns and grammar
4. **Create Minimal Reproduction**: Isolate the problem to the smallest possible case
5. **Check GitHub Issues**: Search for similar issues in the repository

## Performance Optimization

### Profiling Your Grammar

```typescript
// Time tokenization performance
const start = performance.now();
const tokens = await tester.tokenize(largeCodeSample);
const time = performance.now() - start;
console.log(`Tokenized ${largeCodeSample.length} chars in ${time}ms`);
```

### Optimization Strategies

1. **Combine similar patterns**
2. **Use atomic groups for non-backtracking patterns**
3. **Avoid deep nesting of begin/end rules**
4. **Profile with realistic code samples**
5. **Use character classes instead of alternation when possible**

Remember: Most issues stem from regex patterns, scope naming, or pattern ordering. The validation and testing APIs are your best tools for debugging! 🔧 