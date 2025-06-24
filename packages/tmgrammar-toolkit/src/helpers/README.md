# TextMate Toolkit Helpers

Ever tried to build complex regex patterns for a TextMate grammar and ended up with something that looks like line noise? We've been there. After writing the same regex helpers for the fifth time across different projects, we decided to just package them up.

## What This Module Solves

Building regex patterns by hand is like performing surgery with mittens. You spend more time debugging escaping issues and typos than actually implementing your language grammar. These helpers give you a clean, readable API for the most common regex construction patterns.

Instead of this nightmare:
```typescript
const pattern = "\\b(if|else|while|for)\\b(?=\\s*\\()";
```

You can write this:
```typescript
import { regex } from 'tmgrammar-toolkit/helpers';
const pattern = regex.keywords('if', 'else', 'while', 'for') + regex.before('\\s*\\(');
```

## Core Functions

**All functions accept both strings and RegExp objects** (except `escape` which only accepts strings, and `concat` which returns RegExp objects). When you pass a RegExp, we extract its `.source` property automatically.

### Word Boundaries
```typescript
// Wrap any text with word boundaries
bounded('function')   // "\\bfunction\\b"
bounded(/function/)   // "\\bfunction\\b"
```
Perfect for keywords that shouldn't match inside other words.

### Lookahead/Lookbehind
```typescript
// Positive lookahead - match if followed by pattern
before('\\(')         // "(?=\\()"
before(/\(/)          // "(?=\\()"

// Negative lookahead - match if NOT followed by pattern  
notBefore('\\(')      // "(?!\\()"
notBefore(/\(/)       // "(?!\\()"

// Positive lookbehind - match if preceded by pattern
after('=')            // "(?<=\\=)"
after(/=/)            // "(?<=\\=)"

// Negative lookbehind - match if NOT preceded by pattern
notAfter('\\\\')      // "(?<!\\\\)"
notAfter(/\\/)        // "(?<!\\\\)"
```

These are essential for context-sensitive matching. Like when you want to match a `{` only if it's not escaped, or match a keyword only when it's not part of an identifier.

### Pattern Combination
```typescript
// Create alternation from multiple arguments (accepts arrays too)
oneOf('if', 'else', 'while')       // "(if|else|while)"
oneOf(['if', 'else'], 'while')     // "(if|else|while)"
oneOf(/if/, /else/, /while/)       // "(if|else|while)"

// Keywords with automatic word boundaries
keywords('if', 'else')             // "\\b(if|else)\\b"
keywords(['if', 'else'])           // "\\b(if|else)\\b"
keywords(/if/, /else/)             // "\\b(if|else)\\b"
```

The `keywords()` function is probably our most-used helper. Every language has reserved words, and this makes matching them trivial. Both `oneOf` and `keywords` accept rest parameters and flatten arrays automatically.

### String Safety
```typescript
// Properly escape special regex characters (strings only)
escape('test.file')  // "test\\.file"
```

How many times have you forgotten to escape a `.` and spent an hour debugging why your pattern matches everything? This helper saves you from that pain.

### Quantifiers
```typescript
// Standard quantifiers with readable names
optional('s')         // "s?"
optional(/s/)         // "s?"
zeroOrMore('\\w')     // "\\w*"
zeroOrMore(/\w/)      // "\\w*"
oneOrMore('\\d')      // "\\d+"
oneOrMore(/\d/)       // "\\d+"
```

### Grouping
```typescript
// Capturing groups
capture('\\w+')       // "(\\w+)"
capture(/\w+/)        // "(\\w+)"

// Non-capturing groups (for alternation without capture)
group('\\w+')         // "(?:\\w+)"
group(/\w+/)          // "(?:\\w+)"
```

### Advanced Combining
```typescript
// Concatenate multiple RegExp/string values into a single RegExp
concat(/start/, '-', /middle/, '-', /end/)  // RegExp: /(start-middle-end)/
concat('begin', /\w+/, 'end')               // RegExp: /(begin\w+end)/
```

This is useful when you need to combine patterns and get a RegExp object back instead of a string pattern.

## Real-World Examples

### Building a Function Pattern
```typescript
import { regex } from 'tmgrammar-toolkit/helpers';

// Match function declarations (mixing strings and RegExp for clarity)
const functionPattern = 
  regex.keywords('function') +
  regex.oneOrMore(/\s/) +           // Using RegExp for common patterns
  regex.capture(regex.bounded(/[a-zA-Z_][a-zA-Z0-9_]*/)) +
  regex.before(/\s*\(/);            // RegExp avoids double escaping

// Much more readable than:
// "\\b(function)\\b\\s+(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)(?=\\s*\\()"
```

### Context-Sensitive String Matching
```typescript
// Match quotes that aren't escaped (mixing approaches)
const stringStart = 
  regex.notAfter(/\\/) +     // RegExp: cleaner than "\\\\\\\\""
  '"' +                      // String: simple literal
  regex.notBefore(/"/);      // RegExp: avoids escaping

// For matching the start of a string literal
```

### Complex Keyword Patterns
```typescript
// Match control flow keywords, but only at statement boundaries
const controlKeywords = 
  regex.after(/(^|[\s{};])/) +      // RegExp: cleaner grouping
  regex.keywords('if', 'else', 'while', 'for') +  // Multiple arguments
  regex.before(/\s*(\(|{)/);        // RegExp: cleaner alternation
```

### Working with Existing Patterns
```typescript
import { NUM, ID } from 'tmgrammar-toolkit/terminals';

// Combine terminal patterns with helpers
const assignment = 
  regex.capture(ID) +               // Terminal RegExp pattern
  regex.zeroOrMore(/\s/) +          // Whitespace
  '=' +                             // Literal string
  regex.zeroOrMore(/\s/) +          // More whitespace
  regex.oneOf(NUM.DEC, NUM.HEX);    // Multiple terminal patterns
```

## Why We Built This

We kept seeing the same pattern in every grammar we built:
1. Write a complex regex by hand
2. Spend 20 minutes debugging why it doesn't work
3. Realize you forgot to escape something
4. Write a helper function to make it readable
5. Copy that helper function to the next grammar

These helpers are the result of that experience. They're battle-tested patterns that cover 90% of the regex construction you'll need for TextMate grammars.

## Performance Notes

All helpers return strings, not RegExp objects (except `concat()` which returns a RegExp). This is intentional - TextMate grammars expect string patterns, and it keeps things simple. The conversion to RegExp happens during grammar compilation.

The helpers are designed to be chainable and readable. Don't worry about the extra concatenation - V8 optimizes string building very well, and grammar compilation is a one-time cost anyway.

## String vs RegExp: When to Use What

**Use strings when:**
- You have simple literals (`'function'`, `'='`, `'"'`)
- You're building keyword lists (`'if', 'else', 'while'`)
- You need custom escaping or want explicit control

**Use RegExp when:**
- You have complex patterns with character classes (`/[a-zA-Z_][a-zA-Z0-9_]*/`)
- You want cleaner syntax without double escaping (`/\s/` vs `'\\s'`)
- You're working with existing RegExp objects from terminals
- You have groups or quantifiers in the pattern (`/\w+/` vs `'\\w+'`)

**Pro tip:** You can mix and match freely. Use whatever's most readable for each part of your pattern.

## Common Patterns

### Safe Identifier Matching
```typescript
// Match identifiers that aren't part of other identifiers
const identifier = regex.bounded('[a-zA-Z_][a-zA-Z0-9_]*');
```

### Balanced Delimiters Setup
```typescript
// Start pattern for balanced pairs
const openParen = 
  regex.notAfter('\\\\') +  // Not escaped
  '\\(' +
  regex.notBefore('\\)');   // Not immediately closed
```

### Language-Specific Keywords
```typescript
// Different keyword categories
const controlFlow = regex.keywords('if', 'else', 'while', 'for', 'return');
const declarations = regex.keywords('let', 'const', 'var', 'function');
const operators = regex.oneOf('===', '==', '!=', '!==');
```

The goal is to make regex construction feel like building with Lego blocks instead of carving hieroglyphics. Whether you prefer string literals or RegExp objects, these helpers work with whatever feels most natural to you.

If you find yourself writing the same regex pattern multiple times, it probably belongs here. 