# Getting Started

Welcome to the TextMate Toolkit! This guide will walk you through creating your first grammar and understanding the core concepts.

## Prerequisites

- **Bun (highly recommended)** or Node.js 18+
- TypeScript knowledge
- Basic understanding of regular expressions
- Familiarity with syntax highlighting concepts

**Why Bun?** The toolkit leverages Bun's seamless TypeScript integration to let you work directly with `.ts` grammar files without a separate build step. This dramatically improves the development experience.

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
import { createGrammar, scopesFor, regex } from 'tmgrammar-toolkit';
import { COMMENT } from 'tmgrammar-toolkit/terminals';
import type { Grammar, MatchRule, BeginEndRule } from 'tmgrammar-toolkit';

// Create static scopes for performance (recommended)
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });

// Define keywords rule
const keywordRule: MatchRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while', 'for', 'function', 'return']),
  scope: scopes.keyword.control
};

// Define line comment rule
const lineCommentRule: MatchRule = {
  key: 'line-comment',
  match: regex.concat(COMMENT.SLASHES, /.*$/),
  scope: scopes.comment.line.double_slash
};

// Define string rule with escape sequences
const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double,
  patterns: [
    {
      key: 'string-escape',
      match: /\\./,
      scope: scopes.constant.character.escape
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

Now generate the actual TextMate grammar file. With Bun, you can work directly with TypeScript:

```bash
# Using the CLI with Bun (works directly with .ts files!)
bunx tmt emit mylang-grammar.ts -o mylang.tmLanguage.json

# Or with npx
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
  scope: scopes.constant.numeric
};

// Multi-line constructs
const blockCommentRule: BeginEndRule = {
  key: 'block-comment',
  begin: /\/\*/,
  end: /\*\//,
  scope: scopes.comment.block
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
// Create scopes for your language
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });

// Use the type-safe scope properties
scope: scopes.keyword.control.conditional  // "keyword.control.conditional.mylang"
```

Common scope patterns:
- `keyword.*` - Language keywords
- `string.*` - String literals
- `comment.*` - Comments
- `constant.*` - Constants and literals
- `entity.name.*` - Names of functions, classes, etc.

### Automatic Repository Management

**This is a major convenience feature**: The toolkit automatically collects rules with a `key` property and places them into the grammar's repository during emission. You don't need to manually manage the repository structure!

```typescript
const keywordRule = { key: 'keywords', /* ... */ };
const stringRule = { key: 'strings', /* ... */ };
// No duplicate keys allowed - the emit system catches this

// For explicit control, use repositoryItems:
export const myLangGrammar = createGrammar(
  'My Language',
  'source.mylang',
  ['mylang'],
  [keywordRule, stringRule],
  { repositoryItems: [keywordRule, stringRule] }  // Explicitly declare all rules
);
```

**Why this matters**: Traditional TextMate grammar development requires manually managing a complex repository structure. Our system eliminates this source of errors and makes grammars much more maintainable.

## Adding More Features

### Numbers with Multiple Formats

```typescript
import { NUM } from 'tmgrammar-toolkit/terminals';

const numberRule: MatchRule = {
  key: 'numbers',
  match: regex.oneOf([
    NUM.DEC,    // Decimal: 123, 123.45, 1.23e-4
    NUM.HEX,    // Hexadecimal: 0xFF, 0xABCD  
    NUM.BIN,    // Binary: 0b1010
    NUM.OCT     // Octal: 0o777
  ]),
  scope: scopes.constant.numeric
};
```

### Function Declarations with Parameters

```typescript
const functionDeclaration: BeginEndRule = {
  key: 'function-declaration',
  scope: scopes.meta.function,
  begin: regex.concat(
    /(function)\s+/,     // function keyword
    regex.capture(ID),   // function name
    /\s*(\()/           // opening parenthesis
  ),
  beginCaptures: {
    '1': { scope: scopes.keyword.declaration.function },
    '2': { scope: scopes.entity.name.function },
    '3': { scope: scopes.punctuation.section.parens.begin }
  },
  end: /\)/,
  endCaptures: {
    '0': { scope: scopes.punctuation.section.parens.end }
  },
  patterns: [
    {
      key: 'parameter',
      scope: scopes.variable.parameter,
      match: ID
    },
    {
      key: 'parameter-separator',
      scope: scopes.punctuation.separator.comma,
      match: /,/
    }
  ]
};
```

### Block Comments with Nesting

```typescript
const blockComment: BeginEndRule = {
  key: 'block-comment',
  scope: scopes.comment.block,
  begin: /\/\*/,
  end: /\*\//,
  patterns: [
    // Nested block comments
    { include: '#block-comment' }
  ]
};
```

## Scope System Deep Dive

### Static vs Callable Scopes

```typescript
// Static scopes (recommended for production)
const staticScopes = scopesFor({ suffix: 'lang', allowScopeExtension: false });
console.log(staticScopes.keyword.control.conditional);  // "keyword.control.conditional.lang"

// Callable scopes (for extensible grammars)
const callableScopes = scopesFor({ suffix: 'lang', allowScopeExtension: true });
console.log(callableScopes.keyword.control.conditional('async'));  // "keyword.control.conditional.lang.async"
```

### Custom Scope Definitions

```typescript
const customScopes = scopesFor({ 
  suffix: 'mylang', 
  allowScopeExtension: false 
}, {
  // Add language-specific custom scopes
  meta: {
    section: {
      header: null,
      body: null
    }
  }
});

// Use your custom scopes
scope: customScopes.meta.section.header  // "meta.section.header.mylang"
```

## Testing Your Grammar

### Basic Testing

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(myGrammar, 'source.mylang');
const tokens = await tester.tokenize('if (true) { }');

// Check individual tokens
tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
tester.expectTokenScope(tokens, 'true', 'constant.language.mylang');
```

### Advanced Testing

```typescript
// Test multi-line constructs
const multiLineCode = `
function hello() {
  /* block comment */
  return "world";
}
`;

const tokens = await tester.tokenize(multiLineCode);

// Test scope hierarchy
tester.expectScopeAtPosition(tokens, { line: 1, character: 0 }, [
  'source.mylang',
  'meta.function.mylang',
  'keyword.declaration.function.mylang'
]);

// Test that comments don't interfere with function scope
tester.expectTokenScope(tokens, 'return', 'keyword.control.mylang');
```

## Common Patterns

### Keywords with Boundaries

```typescript
// Always use word boundaries for keywords
const keywords: MatchRule = {
  key: 'keywords',
  match: regex.keywords(['class', 'interface', 'extends']),  // Automatically adds \b boundaries
  scope: scopes.keyword.declaration
};
```

### Identifiers vs Function Calls

```typescript
// Regular identifiers
const identifier: MatchRule = {
  key: 'identifier',
  match: regex.concat(ID, regex.notBefore(/\s*\(/)),  // Not followed by opening paren
  scope: scopes.variable.other.readwrite
};

// Function calls
const functionCall: MatchRule = {
  key: 'function-call',
  match: regex.concat(ID, regex.before(/\s*\(/)),    // Followed by opening paren
  scope: scopes.entity.name.function
};
```

### String Interpolation

```typescript
const templateLiteral: BeginEndRule = {
  key: 'template-literal',
  scope: scopes.string.template,
  begin: /`/,
  end: /`/,
  patterns: [
    {
      key: 'template-expression',
      scope: scopes.meta.interpolation,
      begin: /\$\{/,
      end: /\}/,
      patterns: [
        // Include all expressions here
        { include: '#expression' }
      ]
    }
  ]
};
```

## Development Workflow with Bun

The toolkit is designed for rapid iteration. Here's the recommended workflow:

```bash
# 1. Create your grammar in TypeScript
code my-grammar.ts

# 2. Generate and validate in one step
bunx tmt emit my-grammar.ts --validate -o grammar.json

# 3. Test with real code samples
bunx tmt test 'tests/**/*.test' -g grammar.json

# 4. Iterate quickly - no build step needed!
```

**Key Benefits:**
- **No Build Step**: Work directly with TypeScript files
- **Instant Feedback**: CLI commands work immediately
- **Type Safety**: Catch errors at development time
- **Rich Testing**: Comprehensive testing APIs

## Key Concepts Recap

1. **Automatic Repository**: Rules with `key` properties are automatically managed
2. **Type-Safe Scopes**: Use `scopesFor()` to avoid scope name typos
3. **Rich Terminals**: Pre-built patterns for common language constructs
4. **Validation**: Built-in regex and grammar validation using VS Code's engine
5. **Testing First**: Comprehensive testing APIs for reliable grammars

## Next Steps

1. **Study the Examples**: Check out the complete examples in the toolkit:
   - [Simple Example](../examples/simple-example.ts) - Educational with best practices
   - [Bicep Example](../examples/tmgrammar-toolkit/bicep.ts) - Real-world language
   - [TypeSpec Example](../examples/tmgrammar-toolkit/typespec.ts) - Complex features

2. **Read the Guides**:
   - [Modules Overview](modules-overview.md) - Understand the architecture
   - [Using Scopes](using-scopes.md) - Master the scope system
   - [API Reference](api-reference.md) - Complete function reference
   - [Troubleshooting](troubleshooting.md) - Common issues and solutions

3. **Test Everything**: Use the testing framework to ensure your grammar works correctly

4. **Performance**: Use static scopes for production grammars for better performance

Happy grammar building! 🎉 