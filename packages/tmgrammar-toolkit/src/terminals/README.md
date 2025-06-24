# TextMate Toolkit Terminals

Think of terminals as the vocabulary of programming languages. Every language has numbers, strings, comments, identifiers - the basic building blocks that show up everywhere. Instead of writing these patterns from scratch for each grammar, we've collected the most common ones here.

## Philosophy: Don't Reinvent the Wheel

After building grammars for multiple languages, we noticed the same patterns appearing over and over:
- Numbers (decimal, hex, binary, scientific notation)
- String delimiters and escape sequences  
- Comment markers (`//`, `/* */`)
- Identifier patterns (camelCase, snake_case, etc.)
- Common operators (`=`, `==`, `=>`, etc.)

Sure, each language has its quirks, but 80% of the patterns are identical. These terminals capture that 80%, giving you a solid foundation to build on.

## Available Terminal Sets

### Comments (`comments.ts`)

Because every language needs to ignore some text:

```typescript
import { COMMENT } from 'tmgrammar-toolkit/terminals';

COMMENT.SLASHES       // /\/\//  - Line comments
COMMENT.BLOCK.START   // /\/\*/  - Block comment start
COMMENT.BLOCK.END     // /\*\//  - Block comment end
```

**Real usage:**
```typescript
const lineComment: MatchRule = {
  key: 'line-comment',
  match: COMMENT.SLASHES,
  scope: scopes.comment.line.double_slash,
  patterns: [
    // ... handle comment content
  ]
};
```

### Numbers (`numbers.ts`)

Numeric literals are surprisingly complex across languages. Our number patterns handle the edge cases you'd forget:

```typescript
import { NUM } from 'tmgrammar-toolkit/terminals';

NUM.DEC    // Decimal with optional scientific notation and BigInt suffix
NUM.HEX    // Hexadecimal (0x, 0X) with underscores and BigInt
NUM.BIN    // Binary (0b, 0B) with underscores and BigInt  
NUM.OCT    // Octal (0o, 0O) with underscores and BigInt
NUM.INT    // Simple integers
NUM.FLOAT  // Simple floats with scientific notation
```

**What makes these special:**
- Handle underscore separators (`1_000_000`)
- Support BigInt suffix (`123n`)
- Proper negative lookbehind to avoid matching inside identifiers
- Scientific notation (`1.23e-4`)

**Example:**
```typescript
const numberRule: MatchRule = {
  key: 'numbers',
  match: NUM.DEC,
  scope: scopes.constant.numeric.decimal
};
```

The `NUM.DEC` pattern alone covers:
- `123`
- `123.45`
- `1.23e-4`
- `123_456`
- `123n` (BigInt)
- `.5` (decimal starting with dot)

### Identifiers (`identifiers.ts`)

Different languages, different naming conventions. We've got you covered:

```typescript
import { ID, CAMEL_CASE_ID, PASCAL_CASE_ID /* ... */ } from 'tmgrammar-toolkit/terminals';

ID              // [a-zA-Z_][a-zA-Z0-9_]*     - Standard programming
CAMEL_CASE_ID   // [a-z][a-zA-Z0-9]*          - camelCase
PASCAL_CASE_ID  // [A-Z][a-zA-Z0-9]*          - PascalCase
SNAKE_CASE_ID   // [a-z][a-z0-9_]*            - snake_case
CONSTANT_ID     // [A-Z][A-Z0-9_]*            - ALL_CAPS
KEBAB_CASE_ID   // [a-z][a-z0-9-]*            - kebab-case
```

**Usage example:**
```typescript
// Match function names (camelCase)
const functionName: MatchRule = {
  key: 'function-name',
  match: CAMEL_CASE_ID,
  scope: scopes.entity.name.function
};

// Match constants (ALL_CAPS)
const constant: MatchRule = {
  key: 'constant',
  match: CONSTANT_ID,
  scope: scopes.constant.other
};
```

### Operators (`operators.ts`)

Common operator patterns across languages:

```typescript
import { OP } from 'tmgrammar-toolkit/terminals';

OP.ANY_ASSIGNMENT    // =|\+=|-=|\*=|\/=|%=
OP.ANY_COMPARISON    // ==|!=|<=|>=|<|>
OP.ANY_LOGICAL       // &&|\|\||!
OP.ARITHMETIC        // \+|-|\*|\/|%
OP.ARROW             // ->
OP.FAT_ARROW         // =>
```

**Smart ordering:** These patterns are designed to work together without conflicts. `===` would be caught before `==`, etc.

### Strings (`strings.ts`)

String handling is where things get tricky. Our patterns handle the common escape sequences:

```typescript
import { COMMON_ESCAPE, SIMPLE_ESCAPE, UNICODE_ESCAPE, HEX_ESCAPE, QUOTES } from 'tmgrammar-toolkit/terminals';

COMMON_ESCAPE    // Full escape sequences (\n, \t, \u1234, \x41, etc.)
SIMPLE_ESCAPE    // Any escaped character (\\.)
UNICODE_ESCAPE   // Unicode only (\u1234, \u{1F600})
HEX_ESCAPE       // Hex only (\x41)

QUOTES.ANY           // ['"]/
QUOTES.ANY_TRIPLET   // '''|"""/
```

**Example string rule:**
```typescript
const stringRule: BeginEndRule = {
  key: 'string-double',
  scope: scopes.string.quoted.double,
  begin: /"/,
  end: /"/,
  patterns: [
    {
      key: 'string-escape',
      match: COMMON_ESCAPE,
      scope: scopes.constant.character.escape
    }
  ]
};
```

### Whitespace (`whitespace.ts`)

Sometimes you need to be explicit about whitespace:

```typescript
import { REQ_SPACES, OPT_SPACES, TABS_AND_SPACES, NEWLINES, ANY_WHITESPACE } from 'tmgrammar-toolkit/terminals';

REQ_SPACES        // [ ]+     - One or more spaces
OPT_SPACES        // [ ]*     - Zero or more spaces  
TABS_AND_SPACES   // [ \t]+   - Tabs and spaces
NEWLINES          // [\r\n]+  - Line endings
ANY_WHITESPACE    // \s+      - Any whitespace
```

### Markers (`markers.ts`)

Basic anchors and boundaries:

```typescript
import { WB, EOL, BOL } from 'tmgrammar-toolkit/terminals';

WB   // \b  - Word boundary
EOL  // $   - End of line
BOL  // ^   - Beginning of line
```

## Design Principles

### 1. **Edge Case Handling**
Every pattern handles the weird cases you'd forget. Like BigInt suffixes, underscore separators in numbers, or negative lookbehind to prevent matching inside other tokens.

### 2. **Cross-Language Compatibility**
These patterns work across multiple languages. The JavaScript number pattern works for TypeScript, the comment patterns work for C-style languages, etc.

### 3. **Performance Optimized**
All patterns are designed to fail fast and avoid catastrophic backtracking. No exponential time complexity here.

### 4. **Composable**
Terminals are designed to work together. You can combine them with the `helpers/` utilities without conflicts.

## Real-World Grammar Example

Here's how you'd use terminals to build a basic language grammar:

```typescript
import { createGrammar, scopes } from 'tmgrammar-toolkit';
import { NUM, COMMENT, ID, OP } from 'tmgrammar-toolkit/terminals';

const myGrammar = createGrammar(
  'MyLanguage',
  'source.mylang', 
  ['mylang'],
  [
    // Numbers
    {
      key: 'numbers',
      match: NUM.DEC,
      scope: scopes.constant.numeric
    },
    
    // Line comments
    {
      key: 'line-comments',
      match: COMMENT.SLASHES + '.*$',
      scope: scopes.comment.line.double_slash
    },
    
    // Identifiers  
    {
      key: 'identifiers',
      match: ID,
      scope: scopes.variable.other
    },
    
    // Assignment operators
    {
      key: 'assignment',
      match: OP.ANY_ASSIGNMENT,
      scope: scopes.keyword.operator.assignment
    }
  ]
);
```

## When to Use vs. Build Custom

**Use terminals when:**
- You need standard number formats
- You're implementing common language constructs
- You want battle-tested patterns
- You're prototyping a new grammar quickly

**Build custom patterns when:**
- Your language has unique syntax (like Perl's sigils)
- You need language-specific escape sequences
- The standard patterns don't fit your semantics
- You're optimizing for a specific use case

## Performance Notes

All terminal patterns are pre-compiled RegExp objects, so there's no runtime compilation cost. They're designed to be fast and fail quickly on non-matches.

The number patterns in particular use negative lookbehind to avoid expensive backtracking when they don't match.

## Contributing New Terminals

Found yourself writing the same pattern across multiple grammars? It probably belongs here. When adding new terminals:

1. **Handle edge cases** - Don't just cover the happy path
2. **Use negative lookbehind/lookahead** - Prevent matches inside other tokens
3. **Test across languages** - Make sure it works for more than one use case
4. **Document the pattern** - Explain what edge cases it handles

The goal is to save future developers (including yourself) from reinventing these wheels. 