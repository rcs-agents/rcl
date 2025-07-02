# TextMate Toolkit - Source Code Architecture

This directory contains the core implementation of the TextMate Toolkit. The toolkit is designed as a modular, type-safe system for creating, testing, and validating TextMate grammars.

## Architecture Overview

The toolkit follows a layered architecture where each module has a specific responsibility:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI Interface                        │
│                         cli.ts                             │
├─────────────────────────────────────────────────────────────┤
│                     Grammar Authoring                      │
│              factory.ts │ types.ts │ emit.ts                │
├─────────────────────────────────────────────────────────────┤
│                     High-Level APIs                        │
│          scopes/ │ helpers/ │ terminals/                   │
├─────────────────────────────────────────────────────────────┤
│                   Supporting Services                      │
│        testing/ │ validation/ │ utils/                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Files

### `types.ts` - Type Definitions
The foundation of the entire system. Defines TypeScript interfaces that map directly to the TextMate grammar specification:

```typescript
// Core rule types
export interface MatchRule extends RuleScope, RuleKey {
  match: RegexValue;
  captures?: Captures;
}

export interface BeginEndRule extends RuleKey, RuleScope, Partial<RulePatterns> {
  begin: RegexValue;
  end: RegexValue;
  // ... more properties
}

// Complete grammar structure
export interface Grammar extends RulePatterns {
  $schema: typeof schema;
  name: string;
  scopeName: string;
  fileTypes: string[];
  // ... more properties
}
```

**Key Features:**
- Direct mapping to TextMate schema
- Type-safe RegExp support (`RegexValue = string | RegExp`)
- Flexible scope system (`ScopeValue` accepts strings, scope objects, or meta symbol)
- Repository management through rule keys

### `factory.ts` - Grammar Construction
Provides clean factory functions for creating grammar objects:

```typescript
export function createGrammar(
  name: string,
  scopeName: string,
  fileTypes: string[],
  patterns: Rule[],
  options?: {
    variables?: Record<string, string>;
    firstLineMatch?: RegexValue;
    foldingStartMarker?: RegexValue;
    foldingStopMarker?: RegexValue;
    repositoryItems?: Rule[];
  }
): Grammar
```

**Why Factory Functions:**
- Ensures required fields are provided
- Provides sensible defaults
- Type-safe construction
- Clear API surface

### `emit.ts` - Grammar Processing and Output
The most complex module, responsible for transforming our TypeScript grammar definitions into valid TextMate JSON:

**Core Functions:**
- `emitJSON(grammar, options)` - Convert to JSON format
- `emitPList(grammar, options)` - Convert to XML PList format

**Key Responsibilities:**
1. **Repository Management**: Automatically builds the repository from keyed rules
2. **Scope Processing**: Handles our scope objects and meta symbol expansion
3. **RegExp Validation**: Uses Oniguruma WASM to validate patterns against VS Code's actual engine
4. **Conflict Detection**: Prevents duplicate keys and circular references

**Processing Pipeline:**
```
TypeScript Grammar → Rule Processing → Repository Building → Validation → JSON Output
```

### `cli.ts` - Command Line Interface
Unified CLI that wraps all toolkit functionality:

**Commands:**
- `tmt emit` - Grammar emission (supports TypeScript and JavaScript)
- `tmt test` - Declarative testing via vscode-tmgrammar-test
- `tmt snap` - Snapshot testing via vscode-tmgrammar-snap
- `tmt validate` - Grammar validation

**TypeScript Support:**
- Uses Bun for TypeScript execution when available
- Falls back to Node.js for JavaScript files
- Automatic export detection (default, grammar, or named exports)

## Module Directories

### `/scopes` - Type-Safe Scope Management
A revolutionary, type-safe API for TextMate scopes that eliminates string-based errors and provides full autocompletion and validation within TypeScript.

```typescript
import { scopesFor } from './scopes';

const jsScopes = scopesFor({ suffix: 'js', allowScopeExtension: false });

// Produces "keyword.control.conditional.js" with full type safety
const conditionalScope = jsScopes.keyword.control.conditional;
```
For more details, see the [full scope documentation](./docs/using-scopes.md).

### `/helpers` - Regex Construction Utilities
Clean APIs for building complex regex patterns:

```typescript
import { regex } from './helpers';

// Instead of: "\\b(if|else|while)\\b(?=\\s*\\()"
const pattern = regex.keywords('if', 'else', 'while') + regex.before(/\s*\(/);
```

**Available Helpers:**
- `bounded()`, `before()`, `after()` - Boundaries and lookarounds
- `oneOf()`, `keywords()` - Alternation patterns
- `optional()`, `zeroOrMore()`, `oneOrMore()` - Quantifiers
- `escape()` - Proper regex escaping
- `capture()`, `group()` - Grouping utilities

### `/terminals` - Common Language Patterns
Pre-built regex patterns for language elements that appear everywhere:

```typescript
import { NUM, COMMENT, ID, OP } from './terminals';

NUM.DEC      // Decimal numbers with scientific notation, BigInt, etc.
COMMENT.SLASHES  // Line comments (//)
ID           // Standard identifiers
OP.ANY_ASSIGNMENT  // Assignment operators
```

**Pattern Categories:**
- **Numbers**: Decimal, hex, binary, octal with all edge cases
- **Comments**: Line and block comment patterns
- **Identifiers**: Various naming conventions (camelCase, snake_case, etc.)
- **Operators**: Assignment, comparison, logical, arithmetic
- **Strings**: Escape sequences and quotes
- **Whitespace**: Space, tab, newline patterns

### `/testing` - Testing Framework Integration
Comprehensive testing support with both programmatic and declarative approaches:

**Programmatic Testing:**
```typescript
import { createTesterFromFile } from './testing';

const tester = createTesterFromFile('./grammar.json', 'source.mylang');
const tokens = await tester.tokenize('if (condition) {}');
tester.expectTokenScope(tokens, 'if', 'keyword.control.conditional');
```

**Declarative Testing:**
```typescript
import { declarativeTest } from './testing';

// Runs vscode-tmgrammar-test on files with inline assertions
declarativeTest('tests/**/*.test.mylang');
```

### `/validation` - Grammar and Pattern Validation
Catch errors before they become runtime problems:

**Regex Validation:**
- Uses actual Oniguruma engine (same as VS Code)
- Validates syntax and compatibility
- Prevents catastrophic backtracking

**Scope Validation:**
- Checks naming conventions
- Validates structure (no consecutive dots, etc.)
- Warns about non-standard scope names

**Grammar Validation:**
- Ensures required fields are present
- Validates structure and types
- Checks for common mistakes

### `/utils` - Utility Functions
Supporting functionality for file operations and other common tasks.

## Data Flow

### Grammar Creation Flow
```
1. Define rules using types.ts interfaces
2. Use factory.ts to create complete grammar
3. emit.ts processes and validates
4. Output JSON/PList for VS Code
```

### Testing Flow
```
1. Load grammar via testing module
2. Tokenize test content
3. Validate token scopes
4. Report results
```

### CLI Flow
```
1. Parse command and arguments
2. Load grammar from TypeScript/JavaScript
3. Execute requested operation (emit/test/validate)
4. Output results or errors
```

## Key Design Principles

### Type Safety First
Every aspect of the system is designed with TypeScript in mind:
- Interfaces map directly to TextMate spec
- Scope objects provide compile-time validation
- RegExp patterns accept both strings and RegExp objects

### Modularity
Each module has a single responsibility:
- Core types are separate from implementations
- Testing is isolated from authoring
- Validation can be used independently

### Developer Experience
The toolkit prioritizes developer productivity:
- Comprehensive autocomplete support
- Clear error messages with source locations
- Extensive documentation and examples
- Familiar APIs that mirror established patterns

### Performance
Critical paths are optimized:
- Lazy loading of heavy dependencies (Oniguruma WASM)
- Efficient repository building algorithms
- Minimal regex compilation overhead

## Extension Points

The architecture supports extension in several ways:

### Custom Terminals
Add new common patterns to the terminals directory:
```typescript
export const MY_PATTERN = /complex-regex-here/;
```

### Custom Validation
Extend validation with domain-specific checks:
```typescript
export function validateMyLanguage(grammar: Grammar): ValidationResult {
  // Custom validation logic
}
```

### Custom Scopes
Add language-specific scope extensions:
```typescript
export const myLanguageScopes = {
  ...scopes,
  custom: {
    mySpecialScope: createScope('custom.my-special-scope')
  }
};
```

## Build Process

The source code is built using TypeScript with the following steps:

1. **Type Checking**: Ensures all interfaces are properly implemented
2. **Compilation**: Converts TypeScript to JavaScript with source maps
3. **Testing**: Runs comprehensive test suite
4. **Validation**: Validates all example grammars
5. **Documentation**: Generates API documentation from JSDoc comments

This architecture enables the toolkit to provide a modern, type-safe development experience while maintaining compatibility with the established TextMate grammar ecosystem. 