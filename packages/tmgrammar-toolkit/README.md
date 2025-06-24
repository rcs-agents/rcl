# TextMate Toolkit

A unified toolkit for authoring, testing, and validating TextMate grammars with TypeScript.

## Overview

TextMate Toolkit provides a modern, type-safe approach to creating TextMate grammars. Instead of manually editing massive JSON files, you can write your grammars in TypeScript with full type safety, testing, and validation.

## Features

- 🎯 **Type-Safe Grammar Authoring** - Build grammars with TypeScript and comprehensive type definitions
- 🧪 **Integrated Testing** - Programmatic and declarative testing with `vscode-tmgrammar-test` integration
- ✅ **Grammar Validation** - Built-in validation for patterns and grammar structure
- 🔄 **Multiple Output Formats** - Export to JSON, Plist, or YAML
- 🛠️ **CLI Tools** - Command-line interface for common operations
- 📚 **Comprehensive Documentation** - Detailed guides and examples

## Installation

```bash
# Using bun (recommended)
bun add tmgrammar-toolkit

# Using npm
npm install tmgrammar-toolkit

# Using yarn
yarn add tmgrammar-toolkit
```

## Quick Start

### 1. Create a Grammar

```typescript
// my-language.ts
import { createGrammar, regex, scopes } from 'tmgrammar-toolkit';
import type { Grammar, MatchRule } from 'tmgrammar-toolkit';

const keywordRule: MatchRule = {
  key: 'keywords',
  scope: scopes.keyword.control('mylang'),
  match: regex.keywords(['if', 'else', 'while', 'for', 'function'])
};

const commentRule: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line['double-slash']('mylang'),
  match: /\/\/.*$/
};

export const grammar: Grammar = createGrammar(
  'My Language',
  'source.mylang',
  ['.mylang'],
  [keywordRule, commentRule]
);
```

### 2. Generate Grammar File

```bash
# Using CLI
tmt emit my-language.ts -o mylang.tmLanguage.json

# Using programmatic API
```

```typescript
import { emitJSON } from 'tmgrammar-toolkit';
import { grammar } from './my-language.js';

const json = await emitJSON(grammar);
console.log(json);
```

### 3. Test Your Grammar

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(grammar, 'source.mylang');
const tokens = await tester.tokenize('if (condition) { // comment }');

tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
tester.expectTokenScope(tokens, '//', 'comment.line.double-slash.mylang');
```

## CLI Usage

The `tmt` command provides unified access to all toolkit functionality:

### Grammar Emission

```bash
# Emit to JSON (default)
tmt emit my-grammar.ts

# Emit specific export
tmt emit my-grammar.ts myGrammarExport

# Emit to different formats
tmt emit my-grammar.ts --plist -o grammar.tmLanguage
tmt emit my-grammar.ts --yaml -o grammar.yaml
tmt emit my-grammar.ts --json -o grammar.json
```

### Testing

```bash
# Run declarative tests
tmt test 'tests/**/*.test.mylang'
tmt test 'tests/**/*.test.mylang' -g grammar.json --compact

# Run snapshot tests
tmt snap 'tests/**/*.mylang'
tmt snap 'tests/**/*.mylang' --update -g grammar.json
```

### Validation

```bash
# Validate JSON grammar file
tmt validate grammar.tmLanguage.json

# Validate TypeScript grammar export
tmt validate my-grammar.ts
tmt validate my-grammar.ts specificExport
```

## Architecture

The toolkit is organized into focused modules:

- **`authoring/`** - Core grammar building blocks (rules, patterns, scopes)
- **`helpers/`** - Regex construction utilities
- **`terminals/`** - Common patterns (keywords, comments, strings, numbers)
- **`testing/`** - Programmatic and declarative testing tools
- **`validation/`** - Grammar and pattern validation
- **`utils/`** - File operations and utilities

## Key Concepts

### Rules and Patterns

Everything in a TextMate grammar is a **Rule**. Our type system supports three main rule types:

```typescript
// Match rule - for simple patterns
const keywordRule: MatchRule = {
  key: 'keywords',
  scope: 'keyword.control',
  match: /\b(if|else|while)\b(?=\\s*\\()"
};

// Begin/End rule - for multi-line constructs
const stringRule: BeginEndRule = {
  key: 'string',
  scope: 'string.quoted.double',
  begin: /"/,
  end: /"/,
  patterns: [escapeSequenceRule]
};

// Include rule - for grouping patterns
const expression: IncludeRule = {
  key: 'expression',
  patterns: [keywordRule, stringRule, numberRule]
};
```

### Type-Safe Scopes

Instead of string literals, use our scopes API for type safety:

```typescript
import { scopes } from 'tmgrammar-toolkit';

// Type-safe and autocomplete-friendly
const keywordScope = scopes.keyword.control.conditional('mylang');
// Result: "keyword.control.conditional.mylang"
```

### Regex Helpers

Build complex patterns with readable helper functions:

```typescript
import { regex } from 'tmgrammar-toolkit/helpers';

// Instead of: "\\b(if|else|while)\\b(?=\\s*\\()"
const pattern = regex.keywords('if', 'else', 'while') + regex.before(/\s*\(/);
```

## Examples

Check out the `examples/` directory for complete grammar implementations:

- **`bicep-example.ts`** - Azure Bicep language grammar
- **`typespec-example.ts`** - TypeSpec API definition language
- **`simple-example.ts`** - Basic language demonstration

## Contributing

We welcome contributions! Please see our [contributing guidelines](../../CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

This toolkit builds upon the excellent work of:

- [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) by PanAeon
- [vscode-textmate](https://github.com/Microsoft/vscode-textmate) by Microsoft
- The TextMate and VS Code communities 