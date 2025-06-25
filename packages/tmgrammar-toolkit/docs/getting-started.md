# Getting Started

Welcome to the TextMate Toolkit! This guide will walk you through creating your first grammar and understanding the core concepts.

## Prerequisites

- Node.js 18+ or Bun (recommended)
- TypeScript knowledge
- Basic understanding of regular expressions
- Familiarity with syntax highlighting concepts

## Installation

```bash
# Using Bun (recommended)
bun add tmgrammar-toolkit

# Using npm
npm install tmgrammar-toolkit

# Using yarn
yarn add tmgrammar-toolkit
```

## Your First Grammar

Let's create a simple grammar for a fictional language called "MyLang". We'll add support for keywords, comments, and strings.

### Step 1: Create the Grammar File

Create a new file `mylang-grammar.ts`:

```typescript
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';
import { COMMENT } from 'tmgrammar-toolkit/terminals';
import type { Grammar, MatchRule, BeginEndRule } from 'tmgrammar-toolkit';

// Define keywords rule
const keywordRule: MatchRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while', 'for', 'function', 'return']),
  scope: scopes.keyword.control('mylang')
};

// Define line comment rule
const lineCommentRule: MatchRule = {
  key: 'line-comment',
  match: regex.concat(COMMENT.SLASHES, '.*$'),
  scope: scopes.comment.line['double-slash']('mylang')
};

// Define string rule with escape sequences
const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double('mylang'),
  patterns: [
    {
      key: 'string-escape',
      match: /\\./,
      scope: scopes.constant.character.escape('mylang')
    }
  ]
};

// Create the complete grammar
export const myLangGrammar: Grammar = createGrammar(
  'MyLang',              // Human-readable name
  'source.mylang',       // Root scope identifier
  ['mylang', 'ml'],      // File extensions
  [                      // Top-level patterns
    keywordRule,
    lineCommentRule,
    stringRule
  ]
);
```

### Step 2: Generate the Grammar File

Now generate the actual TextMate grammar file:

```bash
# Using the CLI
npx tmt emit mylang-grammar.ts -o mylang.tmLanguage.json

# Or programmatically
```

```typescript
import { emitJSON } from 'tmgrammar-toolkit';
import { myLangGrammar } from './mylang-grammar.js';
import { writeFile } from 'node:fs/promises';

const grammarJson = await emitJSON(myLangGrammar);
await writeFile('mylang.tmLanguage.json', grammarJson);
```

### Step 3: Test Your Grammar

Create a test file to verify your grammar works:

```typescript
// mylang-test.ts
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';
import { myLangGrammar } from './mylang-grammar.js';

const tester = createTesterFromContent(myLangGrammar, 'source.mylang');

// Test code sample
const code = `
if (condition) {
  // This is a comment
  return "Hello, world!";
}
`;

const tokens = await tester.tokenize(code);

// Verify token scopes
tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
tester.expectTokenScope(tokens, '//', 'comment.line.double-slash.mylang');
tester.expectTokenScope(tokens, 'Hello, world!', 'string.quoted.double.mylang');

console.log('All tests passed!');
```

## Core Concepts

### Rules Are Everything

In TextMate grammars, everything is a **Rule**. There are three types:

1. **MatchRule** - For simple patterns
2. **BeginEndRule** - For multi-line constructs  
3. **IncludeRule** - For grouping patterns

```typescript
// Simple pattern matching
const numberRule: MatchRule = {
  key: 'numbers',
  match: /\d+(\.\d+)?/,
  scope: 'constant.numeric'
};

// Multi-line constructs
const blockCommentRule: BeginEndRule = {
  key: 'block-comment',
  begin: /\/\*/,
  end: /\*\//,
  scope: 'comment.block'
};

// Grouping patterns
const expressionRule: IncludeRule = {
  key: 'expression',
  patterns: [numberRule, stringRule, identifierRule]
};
```

### Scopes Define Meaning

Scopes tell editors how to highlight and understand your code. Use our type-safe scopes API:

```typescript
// Instead of string literals (error-prone)
scope: 'keyword.control.conditional.mylang'

// Use the scopes API (type-safe, autocomplete)
scope: scopes.keyword.control.conditional('mylang')
```

Common scope patterns:
- `keyword.*` - Language keywords
- `string.*` - String literals
- `comment.*` - Comments
- `constant.*` - Constants and literals
- `entity.name.*` - Names of functions, classes, etc.

### Repository Management

The toolkit automatically manages the grammar repository. Just give each rule a unique `key`:

```typescript
const keywordRule = { key: 'keywords', /* ... */ };
const stringRule = { key: 'strings', /* ... */ };
// No duplicate keys allowed - the emit system catches this
```

## Adding More Features

### Numbers with Multiple Formats

```typescript
import { NUM } from 'tmgrammar-toolkit/terminals';

const numberRule: MatchRule = {
  key: 'numbers',
  match: regex.oneOf([
    NUM.HEX,    // 0xFF, 0xABCD
    NUM.BIN,    // 0b1010
    NUM.OCT,    // 0o777
    NUM.FLOAT,  // 3.14, 1.23e-4
    NUM.INT     // 42, 123
  ]),
  scope: scopes.constant.numeric('mylang')
};
```

### Identifiers and Functions

```typescript
import { ID } from 'tmgrammar-toolkit/terminals';

const identifierRule: MatchRule = {
  key: 'identifier',
  match: ID,  // Standard [a-zA-Z_][a-zA-Z0-9_]* pattern
  scope: scopes.variable.other('mylang')
};

const functionCallRule: MatchRule = {
  key: 'function-call',
  match: regex.concat(ID, regex.before(/\s*\(/)),
  scope: scopes.entity.name.function('mylang')
};
```

### Operators

```typescript
import { OP } from 'tmgrammar-toolkit/terminals';

const operatorRule: MatchRule = {
  key: 'operators',
  match: regex.oneOf([
    OP.ASSIGNMENT,   // =, +=, -=, etc.
    OP.COMPARISON,   // ==, !=, <, >=, etc.
    OP.ARITHMETIC,   // +, -, *, /, %
    OP.LOGICAL       // &&, ||, !
  ]),
  scope: scopes.keyword.operator('mylang')
};
```

### Complex String Handling

```typescript
const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double('mylang'),
  patterns: [
    {
      key: 'string-escape',
      match: /\\[\\"/nrtbf]/,
      scope: scopes.constant.character.escape('mylang')
    },
    {
      key: 'string-unicode',
      match: /\\u[0-9a-fA-F]{4}/,
      scope: scopes.constant.character.escape('mylang')
    },
    {
      key: 'string-interpolation',
      begin: /\${/,
      end: /}/,
      scope: scopes.meta.interpolation('mylang'),
      patterns: [
        // Include expression patterns here
        { include: '#expression' }
      ]
    }
  ]
};
```

## Testing Your Grammar

### Unit Testing Individual Patterns

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(myGrammar, 'source.mylang');

// Test specific scenarios
const keywordTest = await tester.tokenize('if else while');
tester.expectTokenScope(keywordTest, 'if', 'keyword.control.mylang');
tester.expectTokenScope(keywordTest, 'else', 'keyword.control.mylang');

const stringTest = await tester.tokenize('"Hello \\n World"');
tester.expectTokenScope(stringTest, '"', 'string.quoted.double.mylang');
tester.expectTokenScope(stringTest, '\\n', 'constant.character.escape.mylang');
```

### Integration Testing

Create test files with embedded assertions:

```
// test.mylang
if (condition) {
// <- keyword.control.mylang
//   ^ variable.other.mylang
    return "value";
    //     ^ string.quoted.double.mylang
}
```

Then run:
```bash
npx tmt test 'tests/**/*.test.mylang' -g mylang.tmLanguage.json
```

## Validation and Debugging

### Validate Your Patterns

```typescript
import { validateRegex } from 'tmgrammar-toolkit/validation';

const result = await validateRegex(/\b(if|else)\b/);
if (!result.valid) {
  console.error(`Invalid regex: ${result.error}`);
}
```

### Common Issues

1. **Regex Escaping**: JavaScript strings need double escaping
   ```typescript
   // ❌ Wrong
   match: "\b(function)\b"
   
   // ✅ Right
   match: "\\b(function)\\b"
   
   // ✅ Better - use helpers
   match: regex.bounded('function')
   ```

2. **Repository Key Conflicts**: Each rule needs a unique key
   ```typescript
   // ❌ Will throw error
   const rule1 = { key: 'string', /* ... */ };
   const rule2 = { key: 'string', /* ... */ };
   ```

3. **Scope Typos**: Use the scopes API to prevent typos
   ```typescript
   // ❌ Error-prone
   scope: 'keyword.control.conditional'
   
   // ✅ Type-safe
   scope: scopes.keyword.control.conditional
   ```

## Performance Tips

### Order Patterns by Specificity

Put more specific patterns first:

```typescript
patterns: [
  functionDeclarationRule,  // "function foo()" - more specific
  keywordRule,             // "function" - less specific
  identifierRule           // General identifiers
]
```

### Use Atomic Groups

For better performance, use atomic groups when you don't need backtracking:

```typescript
// Instead of: (if|else|while)+
match: /(?>if|else|while)+/
```

### Limit Expensive Operations

Lookahead/lookbehind are expensive - use sparingly:

```typescript
// ❌ Expensive
match: /(?<=\w)\.(?=\w)/

// ✅ Often faster
match: /\w\.\w/
```

## Next Steps

1. **Study the Examples**: Check out `examples/` for complete grammar implementations
2. **Read the Modules Overview**: Understand the full toolkit capabilities
3. **Explore Terminal Patterns**: Learn about pre-built patterns for common constructs
4. **Master Testing**: Set up comprehensive test suites for your grammars
5. **Join the Community**: Contribute patterns and improvements back to the toolkit

## Common Grammar Patterns

### Function Definitions

```typescript
const functionRule: BeginEndRule = {
  key: 'function',
  begin: regex.concat(
    regex.capture('function'),     // function keyword
    /\s+/,
    regex.capture(ID),             // function name
    regex.capture(/\(/)            // opening paren
  ),
  end: /\)/,
  scope: scopes.meta.function('mylang'),
  beginCaptures: {
    '1': { name: scopes.keyword.declaration.function('mylang') },
    '2': { name: scopes.entity.name.function('mylang') },
    '3': { name: scopes.punctuation.section.parens('mylang') }
  },
  patterns: [
    // Parameter patterns here
  ]
};
```

### Class Definitions

```typescript
const classRule: BeginEndRule = {
  key: 'class',
  begin: regex.concat(
    regex.capture('class'),
    /\s+/,
    regex.capture(ID),
    regex.optional(regex.concat(/\s+extends\s+/, regex.capture(ID))),
    regex.capture(/\{/)
  ),
  end: /\}/,
  scope: scopes.meta.class('mylang'),
  beginCaptures: {
    '1': { name: scopes.keyword.declaration.class('mylang') },
    '2': { name: scopes.entity.name.class('mylang') },
    '3': { name: scopes.entity.other.inherited.class('mylang') },
    '4': { name: scopes.punctuation.section.block('mylang') }
  }
};
```

You're now ready to create sophisticated TextMate grammars with the toolkit. Happy coding! 🎉 