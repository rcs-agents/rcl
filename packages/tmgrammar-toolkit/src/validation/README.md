# TextMate Toolkit Validation

Nothing quite ruins your day like spending three hours debugging a TextMate grammar only to discover you had a typo in a regex pattern. We've been there - staring at VS Code with broken syntax highlighting, wondering where it all went wrong.

This validation module catches those problems before they become headaches.

## What This Module Prevents

### The Regex Nightmare
You write a perfectly reasonable regex like `[a-z]+(0-9)*` and everything seems fine until you test it and realize you forgot to escape something. Or worse, it causes catastrophic backtracking and freezes the editor.

### The Scope Typo Trap  
One wrong character in a scope name and your entire theme breaks. `keyword.controll.conditional` instead of `keyword.control.conditional`? Good luck finding that without tooling.

### The Structure Confusion
TextMate grammars have required fields and specific formats. Miss one and you get cryptic errors or silent failures.

We built these validators to catch all of that before you even attempt to load the grammar.

## Three Types of Validation

### 1. Regex Validation (`regex.ts`)

**The Problem:** Regex patterns that work in JavaScript might not work in Oniguruma (the engine VS Code uses). Different regex engines, different rules.

**Our Solution:** Validate against the actual Oniguruma engine that VS Code uses.

```typescript
import { validateRegex, validateRegexPatterns } from 'tmgrammar-toolkit/validation';

// Validate a single pattern
const result = await validateRegex('\\b(if|else|while)\\b');
if (!result.valid) {
  console.error(`Invalid regex: ${result.error}`);
}

// Validate multiple patterns at once
const results = await validateRegexPatterns([
  '\\b(function)\\b',     // Valid
  '[invalid[pattern',     // Invalid - unclosed bracket
  '(?<=start)content'     // Valid in Oniguruma
]);

console.log(`${results.validPatterns}/${results.totalPatterns} patterns are valid`);
results.errors.forEach(err => {
  console.error(`❌ ${err.pattern}: ${err.error}`);
});
```

**Why this matters:** We've seen regex patterns that work perfectly in browser dev tools but crash VS Code's grammar engine. This validator uses the exact same engine as VS Code, so if it passes here, it'll work there.

**What it catches:**
- Syntax errors in regex patterns
- Oniguruma-specific incompatibilities
- Patterns that would cause infinite loops
- Invalid escape sequences

### 2. Scope Validation (`scope.ts`)

**The Problem:** TextMate scope names follow specific conventions. Get them wrong and themes won't color your tokens properly.

**Our Solution:** Validate scope names against TextMate naming conventions.

```typescript
import { validateScopeName, validateScopeNames } from 'tmgrammar-toolkit/validation';

// Validate a single scope
const result = validateScopeName('keyword.control.conditional');
if (!result.valid) {
  console.error('Issues found:');
  result.errors.forEach(err => console.error(`  ❌ ${err}`));
  result.warnings.forEach(warn => console.error(`  ⚠️  ${warn}`));
}

// Validate multiple scopes
const results = validateScopeNames([
  'keyword.control.conditional',  // ✅ Valid
  'invalid..scope',               // ❌ Consecutive dots
  'myCustomScope',                // ⚠️  Should start with standard root
  'keyword.control.'              // ❌ Ends with dot
]);
```

**What it validates:**

**Structural Rules:**
- No consecutive dots (`invalid..scope`)
- No leading/trailing dots (`.scope` or `scope.`)
- No empty parts
- Valid characters only (letters, numbers, dots, hyphens)

**Convention Warnings:**
- Should start with standard roots (`source`, `text`, `meta`, `keyword`, etc.)
- Should have at least two parts (`keyword` vs `keyword.control`)

**Example output:**
```
✅ keyword.control.conditional - Valid
❌ invalid..scope - Scope name cannot contain consecutive dots
⚠️  myCustomScope - Scope name should start with a common root scope like: source, text, meta, keyword...
```

### 3. Grammar Validation (`grammar.ts`)

**The Problem:** TextMate grammars have required fields and expected structure. Miss something and you get unhelpful errors.

**Our Solution:** Basic structural validation to catch common mistakes early.

```typescript
import { validateGrammar } from 'tmgrammar-toolkit/validation';

const myGrammar = {
  scopeName: 'source.mylang',
  patterns: [
    // ... your patterns
  ]
  // Missing 'name' field
};

const result = validateGrammar(myGrammar);
if (!result.valid) {
  console.error('Grammar issues:');
  result.errors.forEach(err => console.error(`  ❌ ${err}`));
}

result.warnings.forEach(warn => console.error(`  ⚠️  ${warn}`));
```

**What it checks:**

**Required Fields:**
- `scopeName` must exist and be a string
- Must have either `patterns` or `repository`
- If present, `patterns` must be an array
- If present, `repository` must be an object

**Common Issues:**
- Warns if `scopeName` doesn't start with `source.`
- Type mismatches (string vs array, etc.)

**Note:** This is basic validation. In v2.0, we plan to add:
- Deep pattern validation
- Repository reference checking
- Circular dependency detection
- Performance analysis

## Real-World Validation Workflow

Here's how we typically use validation during grammar development:

### 1. Validate While Building
```typescript
import { validateRegex } from 'tmgrammar-toolkit/validation';
import { regex } from 'tmgrammar-toolkit/helpers';

// Check patterns as you build them
const keywordPattern = regex.keywords(['if', 'else', 'while']);
const validation = await validateRegex(keywordPattern);

if (!validation.valid) {
  throw new Error(`Invalid keyword pattern: ${validation.error}`);
}
```

### 2. Batch Validate During Tests
```typescript
import { validateGrammar, validateRegexPatterns } from 'tmgrammar-toolkit/validation';

// Extract all regex patterns from your grammar
function extractPatterns(grammar: any): string[] {
  const patterns: string[] = [];
  // ... walk through grammar and collect all regex patterns
  return patterns;
}

// Validate everything
const grammarResult = validateGrammar(myGrammar);
const regexResult = await validateRegexPatterns(extractPatterns(myGrammar));

if (!grammarResult.valid || !regexResult.valid) {
  // Report all issues before failing
}
```

### 3. CI/CD Integration
```typescript
// In your build script
const validationResults = await Promise.all([
  validateGrammar(grammar),
  validateRegexPatterns(allPatterns),
  validateScopeNames(allScopes)
]);

const hasErrors = validationResults.some(r => !r.valid);
if (hasErrors) {
  process.exit(1);
}
```

## Why We Built This

### The Debugging Story
We once spent an entire afternoon debugging why a grammar wasn't working. The issue? A single typo in a scope name (`keyword.controll` instead of `keyword.control`). VS Code didn't give us any useful error - it just silently failed to apply syntax highlighting.

That's when we realized we needed better tooling.

### The Engine Mismatch Problem
JavaScript's RegExp engine and Oniguruma have subtle differences. A pattern that works in Chrome's dev tools might fail in VS Code. We needed a way to test against the actual engine.

### The Scale Problem
As grammars get larger, manual validation becomes impossible. You need automated tools to catch issues across hundreds of patterns and scopes.

## Performance Characteristics

### Regex Validation
- Uses actual Oniguruma WASM for validation
- Initializes engine once, reuses for multiple validations
- Fast fail on invalid patterns
- ~1-5ms per pattern

### Scope Validation  
- Pure JavaScript validation
- Regex-based format checking
- ~0.1ms per scope name
- No external dependencies

### Grammar Validation
- Lightweight structural checks
- No deep pattern analysis (yet)
- ~1ms for typical grammars

## Limitations and Future Plans

### Current Limitations

**Regex Validation:**
- Only validates syntax, not semantics
- Doesn't catch performance issues (yet)
- No context-aware validation

**Scope Validation:**
- Only checks naming conventions
- Doesn't validate against actual theme compatibility
- No semantic validation

**Grammar Validation:**
- Basic structural checks only
- No deep pattern analysis
- No repository reference validation

### V2.0 Plans

**Enhanced Regex Validation:**
- Performance analysis and warnings
- Context-aware validation (begin/end pattern compatibility)
- Suggestion engine for common mistakes

**Advanced Grammar Validation:**
- Repository reference checking
- Circular dependency detection
- Pattern ordering analysis
- Performance profiling

**Theme Compatibility:**
- Validate scopes against popular themes
- Suggest scope alternatives for better compatibility
- Color coverage analysis

## Common Validation Errors

### Regex Errors You'll See
```
❌ Invalid regex: Unclosed character class
❌ Invalid regex: Invalid escape sequence  
❌ Invalid regex: Lookbehind not supported
```

### Scope Errors You'll See
```
❌ Scope name cannot contain consecutive dots
❌ Scope name cannot start or end with a dot
❌ Scope name contains invalid characters
⚠️  Scope name should start with a common root scope
```

### Grammar Errors You'll See
```
❌ Grammar must have a scopeName
❌ Grammar must have either patterns or repository
❌ scopeName must be a string
⚠️  scopeName should typically start with "source."
```

The goal is to catch these issues in development, not in production. A grammar that passes all validations should work reliably across different editors and themes. 