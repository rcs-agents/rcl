# TextMate Scopes - Type-Safe Scope Management

The scopes module provides a comprehensive, type-safe API for working with TextMate scope names. Instead of typing error-prone strings like `"keyword.control.conditional"`, you get full autocomplete, validation, and documentation for every standard TextMate scope.

## What Are TextMate Scopes?

TextMate scopes are hierarchical, dot-separated strings that identify different parts of your code. They enable syntax highlighting, intelligent code completion, and context-aware editor features.

```
keyword.control.conditional.javascript
│       │       │           │
│       │       │           └── Language suffix
│       │       └─────────────── Specific scope type
│       └─────────────────────── Category
└─────────────────────────────── Root scope
```

## Why Use Our Scopes API?

**Before (error-prone):**
```typescript
const rule = {
  scope: 'keyword.controll.conditional', // Typo! Should be "control"
  match: /if|else/
};
```

**After (type-safe):**
```typescript
import { scopes } from 'tmgrammar-toolkit';

const rule = {
  scope: scopes.keyword.control.conditional, // ✅ Autocomplete + validation
  match: /if|else/
};
```

## Basic Usage

### String Conversion

Scopes automatically convert to strings when needed:

```typescript
import { scopes } from 'tmgrammar-toolkit';

// Template literals (most common)
const rule = `${scopes.keyword.control.conditional}`; // "keyword.control.conditional"

// Explicit conversion
const scopeString = scopes.entity.name.function.toString(); // "entity.name.function"

// String coercion
const fullScope = "" + scopes.storage.type; // "storage.type"
```

### Language Suffixes

Add language-specific suffixes to scopes:

```typescript
// Add language suffix
const jsConditional = scopes.keyword.control.conditional('javascript');
// Result: "keyword.control.conditional.javascript"

const pythonFunction = scopes.entity.name.function('python');
// Result: "entity.name.function.python"
```

### Language-Specific Scopes

For entire grammars, create language-bound scopes:

```typescript
import { scopesFor } from 'tmgrammar-toolkit';

const jsScopes = scopesFor('javascript');

// These are equivalent:
jsScopes.keyword.control.conditional;           // "keyword.control.conditional.javascript"
scopes.keyword.control.conditional('javascript'); // "keyword.control.conditional.javascript"

// You can still add additional suffixes:
jsScopes.keyword.control.conditional('async');  // "keyword.control.conditional.javascript.async"
```

## Available Scope Categories

### `comment` - Comments and Documentation
```typescript
scopes.comment.line.double_slash      // "comment.line.double-slash"
scopes.comment.block.documentation    // "comment.block.documentation"
```

### `constant` - Fixed Values and Literals
```typescript
scopes.constant.numeric.integer.decimal    // "constant.numeric.integer.decimal"
scopes.constant.character.escape           // "constant.character.escape"
scopes.constant.language                   // "constant.language"
```

### `entity` - Names and Identifiers
```typescript
scopes.entity.name.class                   // "entity.name.class"
scopes.entity.name.function.constructor    // "entity.name.function.constructor"
scopes.entity.other.inherited_class        // "entity.other.inherited-class"
```

### `invalid` - Invalid or Deprecated Code
```typescript
scopes.invalid.illegal                     // "invalid.illegal"
scopes.invalid.deprecated                  // "invalid.deprecated"
```

### `keyword` - Reserved Words and Operators
```typescript
scopes.keyword.control.conditional         // "keyword.control.conditional"
scopes.keyword.operator.assignment         // "keyword.operator.assignment"
scopes.keyword.declaration.function        // "keyword.declaration.function"
```

### `markup` - Content Formatting
```typescript
scopes.markup.heading                      // "markup.heading"
scopes.markup.list.numbered                // "markup.list.numbered"
scopes.markup.raw.inline                   // "markup.raw.inline"
```

### `meta` - Structural Sections
```typescript
scopes.meta.function                       // "meta.function"
scopes.meta.class                          // "meta.class"
scopes.meta.function.parameters            // "meta.function.parameters"
```

### `punctuation` - Structural Punctuation
```typescript
scopes.punctuation.definition.string.begin     // "punctuation.definition.string.begin"
scopes.punctuation.section.block.begin         // "punctuation.section.block.begin"
scopes.punctuation.separator.comma             // "punctuation.separator.comma"
```

### `storage` - Storage Modifiers and Types
```typescript
scopes.storage.type.function               // "storage.type.function"
scopes.storage.modifier                    // "storage.modifier"
```

### `string` - String Literals
```typescript
scopes.string.quoted.double                // "string.quoted.double"
scopes.string.quoted.single                // "string.quoted.single"
scopes.string.regexp                       // "string.regexp"
```

### `support` - Library Elements
```typescript
scopes.support.function                    // "support.function"
scopes.support.class                       // "support.class"
scopes.support.constant                    // "support.constant"
```

### `variable` - Variable Names
```typescript
scopes.variable.other.readwrite            // "variable.other.readwrite"
scopes.variable.parameter                  // "variable.parameter"
scopes.variable.language                   // "variable.language"
```

## Multiple Naming Conventions

For kebab-case scopes, we support multiple access patterns:

```typescript
// All of these are equivalent:
scopes.comment.line['double-slash']    // Bracket notation (exact)
scopes.comment.line.doubleSlash        // camelCase conversion
scopes.comment.line.double_slash       // snake_case conversion

// All produce: "comment.line.double-slash"
```

## Real-World Grammar Example

```typescript
import { createGrammar, scopes } from 'tmgrammar-toolkit';

const myGrammar = createGrammar(
  'MyLanguage',
  'source.mylang',
  ['mylang'],
  [
    {
      key: 'keywords',
      scope: scopes.keyword.control.conditional('mylang'),
      match: /\b(if|else|while|for)\b/
    },
    {
      key: 'strings',
      scope: scopes.string.quoted.double('mylang'),
      begin: /"/,
      end: /"/,
      patterns: [
        {
          key: 'string-escape',
          scope: scopes.constant.character.escape('mylang'),
          match: /\\./
        }
      ]
    },
    {
      key: 'functions',
      scope: scopes.entity.name.function('mylang'),
      match: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/
    }
  ]
);
```

## Editor Support

Thanks to TypeScript and comprehensive JSDoc comments, you get:

- **Autocomplete**: Type `scopes.` and see all available categories
- **Documentation**: Hover over any scope to see its purpose and usage
- **Type Safety**: Catch typos and invalid scope names at compile time
- **Navigate to Definition**: Jump to scope definitions and documentation

## Architecture

The scope system is built using:

- **Type-safe builders**: Generate scope objects with proper TypeScript types
- **Proxy objects**: Enable flexible property access (dot notation, brackets, etc.)
- **Symbol.toPrimitive**: Automatic string conversion in any context
- **Hierarchical structure**: Mirror TextMate's dot-separated scope hierarchy

## Best Practices

### Use Specific Scopes
```typescript
// ❌ Too general
scopes.keyword

// ✅ Specific and meaningful
scopes.keyword.control.conditional
```

### Consistent Language Suffixes
```typescript
// Create language-specific scopes for entire grammars
const jsScopes = scopesFor('javascript');

// Use consistently throughout your grammar
jsScopes.keyword.control.conditional
jsScopes.entity.name.function
jsScopes.string.quoted.double
```

### Follow TextMate Conventions
```typescript
// ✅ Standard scope for function definitions
scopes.entity.name.function

// ✅ Standard scope for function calls
scopes.variable.function

// ✅ Standard scope for built-in functions
scopes.support.function
```

## Related Documentation

- [TextMate Scope Naming Conventions](../docs/textmate-scopes.md) - Complete reference
- [Using Scopes Guide](../docs/using-scopes.md) - Practical usage examples
- [Modules Overview](../docs/modules-overview.md) - How scopes fit into the larger toolkit 