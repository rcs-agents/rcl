# TextMate Toolkit: Complete Guide

You know that feeling when you're staring at a 500-line JSON file full of regex patterns, wondering if there's a better way to build TextMate grammars? We've been there too. After building several language grammars and watching our team struggle with the same repetitive patterns, we created this toolkit to make the whole process more... human.

## What This Toolkit Actually Solves

TextMate grammars are powerful, but writing them by hand is like performing surgery with oven mitts. You're dealing with:

- **Regex soup**: Hundreds of patterns scattered across a massive JSON file
- **Scope name typos**: One wrong character and your highlighting breaks
- **Repository chaos**: Managing references between patterns without going insane  
- **Testing nightmares**: "Did my change break something? Let me manually check 47 test cases..."
- **Copy-paste hell**: The same patterns showing up in every grammar you write

We built this toolkit because we got tired of reinventing the wheel every time we needed to tokenize a new language.

## The Mental Model

Think of building a TextMate grammar like constructing a building:

1. **Foundation** (`types.ts`): The architectural blueprints - strict TypeScript definitions that map exactly to the tmlanguage spec
2. **Building Blocks** (`terminals/`, `helpers/`): Pre-fabricated components - common patterns you'll use everywhere
3. **Assembly Tools** (`factory.ts`, `scopes.ts`): The construction equipment - clean APIs for putting pieces together
4. **Quality Control** (`validation/`): The inspectors - making sure your regex actually works
5. **Final Output** (`emit.ts`): The general contractor - converts your readable code into the JSON that VS Code expects
6. **Testing Suite** (`testing/`): The stress tests - make sure everything works before you ship

## Core Architecture: How It All Fits Together

### The Rule System

Everything in a TextMate grammar is a **Rule**. We've designed our type system around this concept:

```typescript
// Every rule needs a unique key for the repository
interface RuleKey {
  key: string;
}

// Three main rule types:
type Rule = MatchRule | BeginEndRule | IncludeRule;
```

The beauty here is that you define rules using clean TypeScript objects, and our emit system handles all the gnarly repository management behind the scenes.

### Scope Management 

Instead of typing `"keyword.control.conditional"` everywhere and inevitably fat-fingering it, we built a type-safe scopes API:

```typescript
import { scopes } from 'tmgrammar-toolkit';

// This gives you autocomplete and catches typos at compile time
const conditionalScope = scopes.keyword.control.conditional;
const withLanguage = scopes.keyword.control.conditional('myLang');
```

### The Repository Problem

Here's something that took us way too long to figure out: TextMate grammars use a "repository" to organize patterns, but managing it manually is a nightmare. You end up with duplicate keys, circular references, and patterns that reference things that don't exist.

Our emit system solves this by:
- Automatically building the repository from your rule keys
- Detecting duplicate keys and throwing clear errors
- Converting your clean rule objects into the messy JSON format VS Code expects

## Module Deep Dive

### `/helpers` - Regex Construction Kit

When you're building regex patterns, you end up writing the same utility functions over and over. We collected all the common ones:

```typescript
import { regex } from 'tmgrammar-toolkit/helpers';

// Instead of: "\\b(if|else|while)\\b"
const keywords = regex.keywords(['if', 'else', 'while']);

// Instead of: "(?=\\()"  
const beforeParen = regex.before('\\(');

// Instead of manually escaping: "test\\.file\\.name"
const escaped = regex.escape('test.file.name');
```

**Why we built this**: After the fourth time someone wrote a buggy `oneOf` function, we realized this should just be a library.

The helpers include:
- `bounded()` - Word boundaries around text
- `before()`, `notBefore()` - Positive/negative lookahead
- `after()`, `notAfter()` - Positive/negative lookbehind  
- `oneOf()` - Alternation from arrays
- `keywords()` - Word-bounded alternation
- `escape()` - Proper regex escaping
- `optional()`, `zeroOrMore()`, `oneOrMore()` - Quantifiers
- `capture()`, `group()` - Grouping utilities

### `/terminals` - The Pattern Library

Every programming language has the same basic building blocks. Instead of reinventing these patterns for each grammar, we've collected the most common ones:

#### Comments (`/terminals/comments.ts`)
```typescript
import { COMMENT } from 'tmgrammar-toolkit/terminals';

// Line comments: //
COMMENT.SLASHES

// Block comments: /* */
COMMENT.BLOCK.START
COMMENT.BLOCK.END
```

#### Numbers (`/terminals/numbers.ts`)
```typescript
import { NUM } from 'tmgrammar-toolkit/terminals';

// Covers decimal, hex, binary, octal with proper edge cases
NUM.DEC   // 123, 123.45, 1.23e-4, 123n
NUM.HEX   // 0xFF, 0xABCD_1234
NUM.BIN   // 0b1010_1111
NUM.OCT   // 0o777
NUM.INT   // Simple integers
NUM.FLOAT // Simple floats with scientific notation
```

#### Identifiers (`/terminals/identifiers.ts`)
Different languages have different identifier conventions:
```typescript
ID                // Standard: [a-zA-Z_][a-zA-Z0-9_]*
CAMEL_CASE_ID     // camelCase
PASCAL_CASE_ID    // PascalCase  
SNAKE_CASE_ID     // snake_case
CONSTANT_ID       // ALL_CAPS
KEBAB_CASE_ID     // kebab-case
```

#### And More...
- **Operators**: Assignment, comparison, logical, arithmetic operators
- **Strings**: Escape sequences, quote patterns
- **Whitespace**: Required/optional spaces, tabs, newlines
- **Markers**: Word boundaries, line start/end

**The philosophy**: If you find yourself writing the same regex pattern in multiple grammars, it probably belongs in terminals.

### `/validation` - Catching Problems Early

Nothing's worse than spending an hour debugging a grammar only to find out you had a typo in a regex pattern. Our validation system catches these issues before they become problems.

#### Regex Validation (`/validation/regex.ts`)
```typescript
import { validateRegex, validateRegexPatterns } from 'tmgrammar-toolkit/validation';

// Test a single pattern
const result = await validateRegex('\\b(if|else)\\b');
if (!result.valid) {
  console.log(`Bad regex: ${result.error}`);
}

// Test multiple patterns at once
const results = await validateRegexPatterns([
  '\\b(if|else)\\b',
  '[invalid[regex',
  '(?<=start)content(?=end)'
]);
```

This uses the actual Oniguruma engine that VS Code uses, so you're testing against the real thing.

#### Scope Validation (`/validation/scope.ts`)
```typescript
import { validateScopeName } from 'tmgrammar-toolkit/validation';

const result = validateScopeName('keyword.control.conditional');
// Checks for:
// - Valid characters (letters, numbers, dots, hyphens)
// - Proper structure (no empty parts, no consecutive dots)
// - Common root scopes
// - TextMate conventions
```

#### Grammar Validation (`/validation/grammar.ts`)
Basic structural validation for your complete grammar:
```typescript
import { validateGrammar } from 'tmgrammar-toolkit/validation';

const result = validateGrammar(myGrammar);
// Checks for required fields, proper types, common issues
```

### `/testing` - Making Sure It Actually Works

We learned the hard way that a grammar that "looks right" and a grammar that "works right" are different things. The testing module gives you tools to actually verify your patterns work.

#### Programmatic Testing (`/testing/programmatic.ts`)

This is your bread and butter for unit testing individual patterns:

```typescript
import { createTesterFromFile } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromFile('./my-grammar.json', 'source.mylang');

// Test tokenization
const tokens = await tester.tokenize('if (condition) { }');

// Verify specific tokens have expected scopes
tester.expectTokenScope(tokens, 'if', 'keyword.control.conditional');
tester.expectTokenScope(tokens, '(', 'punctuation.section.parens');
```

**Why this matters**: We once spent three days debugging why function calls weren't highlighting properly, only to discover our `(` pattern was being matched by the wrong rule. Programmatic testing catches this stuff immediately.

#### Declarative Testing (`/testing/helpers.ts`)

For integration testing, we support the vscode-tmgrammar-test format:

```typescript
import { declarativeTest, snapshot } from 'tmgrammar-toolkit/testing';

// Run tests with embedded scope assertions
declarativeTest('./tests/**/*.test.mylang', {
  grammar: './grammars/mylang.json',
  compact: true
});

// Generate/compare snapshots
snapshot('./tests/**/*.test.mylang', {
  updateSnapshots: true
});
```

This lets you write test files like:
```
if (true) {
// <- keyword.control.conditional
//   ^ constant.language.boolean
}
```

## The Complete Workflow

Here's how we typically build a grammar with this toolkit:

### 1. Start with Types and Structure

```typescript
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';

const myGrammar = createGrammar(
  'MyLanguage',           // Display name
  'source.mylang',        // Scope name  
  ['mylang', 'ml'],       // File extensions
  [                       // Top-level patterns
    keywordRule,
    commentRule,
    stringRule
  ]
);
```

### 2. Build Rules with Helpers and Terminals

```typescript
import { COMMENT, NUM, ID } from 'tmgrammar-toolkit/terminals';
import { regex } from 'tmgrammar-toolkit/helpers';

const keywordRule: MatchRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while', 'for']),
  scope: scopes.keyword.control
};

const numberRule: MatchRule = {
  key: 'numbers', 
  match: NUM.DEC,
  scope: scopes.constant.numeric
};
```

### 3. Validate as You Go

```typescript
import { validateRegex } from 'tmgrammar-toolkit/validation';

// Check your patterns before using them
const regexResult = await validateRegex(regex.keywords(['if', 'else']));
if (!regexResult.valid) {
  throw new Error(`Invalid regex: ${regexResult.error}`);
}
```

### 4. Test Your Patterns

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(myGrammar, 'source.mylang');
const tokens = await tester.tokenize('if (true) { return 42; }');

// Verify each token gets the right scope
tester.expectTokenScope(tokens, 'if', 'keyword.control');
tester.expectTokenScope(tokens, 'true', 'constant.language.boolean');
tester.expectTokenScope(tokens, '42', 'constant.numeric');
```

### 5. Generate the Final Grammar

```typescript
import { emitJSON } from 'tmgrammar-toolkit';

const grammarJSON = await emitJSON(myGrammar, {
  errorSourceFilePath: './my-grammar.ts' // For better error messages
});

// Write to .tmLanguage.json file
await writeFile('./grammars/mylang.tmLanguage.json', grammarJSON);
```

## Real-World Patterns

### Complex Begin/End Rules

For multi-line constructs like strings or comments:

```typescript
const multiLineStringRule: BeginEndRule = {
  key: 'multiline-string',
  scope: scopes.string.quoted.triple,
  begin: /"""/,
  end: /"""/,
  patterns: [
    {
      key: 'string-escape',
      match: COMMON_ESCAPE,
      scope: scopes.constant.character.escape
    }
  ]
};
```

### Embedded Languages

For things like SQL in Python strings or CSS in HTML:

```typescript
const sqlStringRule: BeginEndRule = {
  key: 'sql-string',
  scope: scopes.string.quoted.double,
  begin: regex.after('sql\\s*=\\s*')/"/,
  end: /"/,
  patterns: [
    {
      key: 'embedded-sql',
      include: 'source.sql' // Reference external grammar
    }
  ]
};
```

## Common Gotchas We've Learned

### Repository Key Conflicts
Every rule needs a unique key. We've seen this pattern too many times:
```typescript
// ❌ Both rules have the same key
const stringRule1 = { key: 'string', match: /"[^"]*"/, scope: 'string.quoted.double' };
const stringRule2 = { key: 'string', match: /'[^']*'/, scope: 'string.quoted.single' };
```

The emit system will catch this and throw a clear error.

### Regex Escaping
JavaScript strings and regex have different escaping rules:
```typescript
// ❌ Wrong - not enough escaping
match: "\b(function)\b"

// ✅ Right - proper escaping  
match: "\\b(function)\\b"

// ✅ Even better - use our helpers
match: regex.bounded('function')
```

### Scope Ordering
More specific scopes should come before general ones:
```typescript
patterns: [
  functionDeclarationRule,  // matches "function foo()"
  keywordRule              // matches "function" 
]
```

## Performance Tips

### Use Atomic Groups
For performance, use atomic groups when you don't need backtracking:
```typescript
// Instead of: (if|else|while)+
// Use: (?>if|else|while)+
```

### Limit Lookahead/Lookbehind
These are expensive operations. Use sparingly:
```typescript
// ❌ Expensive
match: /(?<=\w)\.(?=\w)/

// ✅ Often faster
match: /\w\.\w/
```

### Profile Your Grammar
Use the testing tools to identify slow patterns:
```typescript
const start = performance.now();
const tokens = await tester.tokenize(largeCodeSample);
const time = performance.now() - start;
console.log(`Tokenized ${largeCodeSample.length} chars in ${time}ms`);
```

## What's Next?

This toolkit is designed to grow with your needs. We're constantly adding new terminals and helpers based on patterns we see across different grammars. 

If you find yourself writing the same pattern multiple times, consider contributing it back to the terminals library. And if you run into edge cases our validation doesn't catch, let us know - we want this toolkit to save you from the same mistakes we made.

The goal isn't just to make TextMate grammars easier to write - it's to make them easier to maintain, test, and understand. Because at the end of the day, code that other people (including future you) can actually work with is code that ships. 