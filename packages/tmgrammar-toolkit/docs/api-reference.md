# API Reference

Complete reference for all public APIs in the TextMate Toolkit.

## Core Factory Functions

### `createGrammar(name, scopeName, fileTypes, patterns, repository?)`

Creates a new TextMate grammar.

**Parameters:**
- `name: string` - Human-readable name for the grammar
- `scopeName: string` - Root scope name (e.g., 'source.typescript')
- `fileTypes: string[]` - File extensions this grammar applies to
- `patterns: Rule[]` - Top-level patterns/rules
- `repository?: Record<string, Rule>` - Optional additional repository rules

**Returns:** `Grammar`

**Example:**
```typescript
const grammar = createGrammar(
  'My Language',
  'source.mylang',
  ['mylang', 'ml'],
  [keywordRule, commentRule]
);
```

### `createRule(key, definition)`

Creates a rule with automatic type inference.

**Parameters:**
- `key: string` - Unique identifier for the rule
- `definition: RuleDefinition` - Rule pattern definition

**Returns:** `Rule`

## Emission Functions

### `emitJSON(grammar, options?)`

Converts a grammar to JSON format.

**Parameters:**
- `grammar: Grammar` - The grammar to emit
- `options?: EmitOptions` - Optional emission configuration

**Returns:** `Promise<string>`

**Options:**
```typescript
interface EmitOptions {
  errorSourceFilePath?: string;  // For better error messages
  validate?: boolean;            // Validate patterns (default: true)
  formatOutput?: boolean;        // Pretty-print JSON (default: true)
}
```

### `emitPlist(grammar, options?)`

Converts a grammar to Plist format.

**Parameters:**
- `grammar: Grammar` - The grammar to emit
- `options?: EmitOptions` - Optional emission configuration

**Returns:** `Promise<string>`

### `emitYAML(grammar, options?)`

Converts a grammar to YAML format.

**Parameters:**
- `grammar: Grammar` - The grammar to emit
- `options?: EmitOptions` - Optional emission configuration

**Returns:** `Promise<string>`

## Rule Types

### `MatchRule`

For simple pattern matching.

```typescript
interface MatchRule {
  key: string;
  match: RegExp | string;
  scope?: string;
  captures?: CaptureMap;
}
```

**Example:**
```typescript
const keywordRule: MatchRule = {
  key: 'keywords',
  match: /\b(if|else|while)\b/,
  scope: 'keyword.control'
};
```

### `BeginEndRule`

For multi-line constructs.

```typescript
interface BeginEndRule {
  key: string;
  begin: RegExp | string;
  end: RegExp | string;
  scope?: string;
  contentScope?: string;
  beginCaptures?: CaptureMap;
  endCaptures?: CaptureMap;
  patterns?: Rule[];
}
```

**Example:**
```typescript
const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: 'string.quoted.double',
  patterns: [escapeRule]
};
```

### `IncludeRule`

For grouping patterns or including other grammars.

```typescript
interface IncludeRule {
  key: string;
  patterns?: Rule[];
  include?: string;
}
```

**Example:**
```typescript
const expressionRule: IncludeRule = {
  key: 'expression',
  patterns: [numberRule, stringRule, identifierRule]
};
```

## Scopes API

### Accessing Scopes

```typescript
import { scopes, scopesFor } from 'tmgrammar-toolkit';

// Recommended: Use scopesFor for language-specific grammars
const langScopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });
const keywordScope = langScopes.keyword;          // "keyword.mylang"
const controlScope = langScopes.keyword.control;  // "keyword.control.mylang"

// Alternative: Global scopes (for dynamic or extensible grammars)
const jsKeyword = scopes.keyword('javascript');   // "keyword.javascript"
const pyControl = scopes.keyword.control('python'); // "keyword.control.python"
```

### Common Scope Categories

#### Keywords
```typescript
scopes.keyword                    // "keyword"
scopes.keyword.control           // "keyword.control"
scopes.keyword.control.conditional // "keyword.control.conditional"
scopes.keyword.operator          // "keyword.operator"
scopes.keyword.operator.assignment // "keyword.operator.assignment"
```

#### Constants
```typescript
scopes.constant                  // "constant"
scopes.constant.numeric         // "constant.numeric"
scopes.constant.numeric.integer // "constant.numeric.integer"
scopes.constant.language        // "constant.language"
scopes.constant.character.escape // "constant.character.escape"
```

#### Entities
```typescript
scopes.entity.name.function     // "entity.name.function"
scopes.entity.name.class        // "entity.name.class"
scopes.entity.name.type         // "entity.name.type"
scopes.entity.other.attribute   // "entity.other.attribute-name"
```

#### Comments
```typescript
scopes.comment.line             // "comment.line"
scopes.comment.line['double-slash'] // "comment.line.double-slash"
scopes.comment.block            // "comment.block"
```

#### Strings
```typescript
scopes.string.quoted.single     // "string.quoted.single"
scopes.string.quoted.double     // "string.quoted.double"
scopes.string.quoted.triple     // "string.quoted.triple"
```

## Regex Helpers

### Basic Helpers

```typescript
import { regex } from 'tmgrammar-toolkit/helpers';

// Word boundaries
regex.bounded('text')            // "\\btext\\b"
regex.wordBoundary               // "\\b"

// Quantifiers
regex.optional('text')           // "(?:text)?"
regex.zeroOrMore('text')         // "(?:text)*"
regex.oneOrMore('text')          // "(?:text)+"

// Grouping
regex.capture('text')            // "(text)"
regex.group('text')              // "(?:text)"
regex.nonCapture('text')         // "(?:text)"

// Escaping
regex.escape('text.with.dots')   // "text\\.with\\.dots"
```

### Pattern Construction

```typescript
// Alternation
regex.oneOf(['if', 'else'])      // "(?:if|else)"
regex.keywords(['if', 'else'])   // "\\b(?:if|else)\\b"

// Lookahead/Lookbehind
regex.before('pattern')          // "(?=pattern)"
regex.notBefore('pattern')       // "(?!pattern)"
regex.after('pattern')           // "(?<=pattern)"
regex.notAfter('pattern')        // "(?<!pattern)"

// Character classes
regex.anyOf('abc')               // "[abc]"
regex.range('a', 'z')            // "[a-z]"
regex.notAnyOf('abc')            // "[^abc]"
```

## Terminal Patterns

### Comments

```typescript
import { COMMENT } from 'tmgrammar-toolkit/terminals';

COMMENT.SLASHES                  // "//"
COMMENT.HASH                     // "#"
COMMENT.DASHES                   // "--"
COMMENT.PERCENT                  // "%"
COMMENT.BLOCK.START              // "/*"
COMMENT.BLOCK.END                // "*/"
```

### Numbers

```typescript
import { NUM } from 'tmgrammar-toolkit/terminals';

NUM.INT                          // Integer patterns
NUM.FLOAT                        // Float patterns
NUM.DEC                          // Decimal numbers
NUM.HEX                          // Hexadecimal (0xFF)
NUM.BIN                          // Binary (0b1010)
NUM.OCT                          // Octal (0o777)
```

### Identifiers

```typescript
import { ID } from 'tmgrammar-toolkit/terminals';

ID                               // Standard identifier
CAMEL_CASE_ID                    // camelCase
PASCAL_CASE_ID                   // PascalCase
SNAKE_CASE_ID                    // snake_case
CONSTANT_ID                      // ALL_CAPS
KEBAB_CASE_ID                    // kebab-case
```

### Operators

```typescript
import { OP } from 'tmgrammar-toolkit/terminals';

OP.ASSIGNMENT                    // =, +=, -=, etc.
OP.COMPARISON                    // ==, !=, <, >, etc.
OP.ARITHMETIC                    // +, -, *, /, %
OP.LOGICAL                       // &&, ||, !
OP.BITWISE                       // &, |, ^, ~, <<, >>
```

### Character and Marker Patterns

```typescript
import { DOT, WB, EOL, BOL } from 'tmgrammar-toolkit/terminals';

// From terminals/chars.ts
DOT                              // /\./

// From terminals/markers.ts  
WB                               // /\b/ (word boundary)
EOL                              // /$/ (end of line)
BOL                              // /^/ (beginning of line)
```

## Testing API

### Programmatic Testing

```typescript
import { createTesterFromFile, createTesterFromContent } from 'tmgrammar-toolkit/testing';

// From grammar file
const tester = createTesterFromFile('./grammar.json', 'source.mylang');

// From grammar object
const tester = createTesterFromContent(grammarObject, 'source.mylang');

// Tokenize code
const tokens = await tester.tokenize('if (true) { }');

// Expectations
tester.expectTokenScope(tokens, 'if', 'keyword.control');
tester.expectTokenContent(tokens, 1, '(');
tester.expectTokenLength(tokens, 5);
```

### Declarative Testing

**Note:** The correct function names are `declarativeTest` and `snapshot`, not `runDeclarativeTests` and `runSnapshotTests`.

```typescript
import { declarativeTest, snapshot } from 'tmgrammar-toolkit/testing';

// Run tests with embedded scope assertions
await declarativeTest('./tests/**/*.test.mylang', {
  grammar: './grammar.json',
  compact: true
});

// Snapshot testing
await snapshot('./tests/**/*.mylang', {
  grammar: './grammar.json',
  updateSnapshots: false
});
```

## Validation API

### Pattern Validation

```typescript
import { validateRegex, validateRegexPatterns } from 'tmgrammar-toolkit/validation';

// Single pattern
const result = await validateRegex('\\b(if|else)\\b');
if (!result.valid) {
  console.error(result.error);
}

// Multiple patterns
const results = await validateRegexPatterns([
  '\\b(if|else)\\b',
  '[a-zA-Z_]\\w*'
]);
```

### Grammar Validation

```typescript
import { validateGrammar, validateScopeName } from 'tmgrammar-toolkit/validation';

// Grammar structure
const grammarResult = validateGrammar(myGrammar);

// Scope names
const scopeResult = validateScopeName('keyword.control.conditional');
```

## CLI Commands

### Grammar Emission

```bash
# Basic emission
tmt emit grammar.ts

# Specific export
tmt emit grammar.ts myGrammarExport

# Different formats
tmt emit grammar.ts --json -o output.json
tmt emit grammar.ts --plist -o output.tmLanguage
tmt emit grammar.ts --yaml -o output.yaml
```

### Testing

```bash
# Declarative tests
tmt test 'tests/**/*.test.mylang'
tmt test 'tests/**/*.test.mylang' -g grammar.json --compact

# Snapshot tests  
tmt snap 'tests/**/*.mylang'
tmt snap 'tests/**/*.mylang' --update
```

### Validation

```bash
# Validate grammar files
tmt validate grammar.json
tmt validate grammar.ts
tmt validate grammar.ts specificExport
```

## Type Definitions

### Core Types

```typescript
interface Grammar {
  name: string;
  scopeName: string;
  fileTypes: string[];
  patterns: Rule[];
  repository?: Record<string, Rule>;
  foldingStartMarker?: string;
  foldingStopMarker?: string;
  firstLineMatch?: string;
  injections?: Record<string, Rule>;
}

type Rule = MatchRule | BeginEndRule | IncludeRule;

interface CaptureMap {
  [key: string]: {
    name?: string;
    patterns?: Rule[];
  };
}
```

### Emission Types

```typescript
interface EmitOptions {
  errorSourceFilePath?: string;
  validate?: boolean;
  formatOutput?: boolean;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}
```

### Testing Types

```typescript
interface Token {
  content: string;
  scope: string[];
  startIndex: number;
  endIndex: number;
}

interface TestOptions {
  grammar?: string;
  compact?: boolean;
  updateSnapshots?: boolean;
}
``` 