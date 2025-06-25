# TextMate Toolkit

A modern, type-safe toolkit for creating TextMate grammars with TypeScript. Build syntax highlighting grammars with confidence using comprehensive validation, testing, and development tools.

<div align="center">

[![npm version](https://img.shields.io/npm/v/tmgrammar-toolkit.svg)](https://www.npmjs.com/package/tmgrammar-toolkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Why TextMate Toolkit?

Creating TextMate grammars manually means wrestling with massive JSON files, regex patterns, and scope naming without any safety net. This toolkit transforms that experience:

**❌ Before: Manual Grammar Development**
```json
{
  "patterns": [
    {
      "match": "\\b(if|else|while)\\b",
      "name": "keyword.control.mylang"
    }
  ]
}
```

**✅ After: Type-Safe Grammar Development**
```typescript
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';

const keywordRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while']),
  scope: scopes.keyword.control('mylang')
};

export const grammar = createGrammar('MyLang', 'source.mylang', ['mylang'], [keywordRule]);
```

## ✨ Features

- 🎯 **Type-Safe Development** - Full TypeScript support with comprehensive type definitions
- 🧪 **Integrated Testing** - Programmatic and declarative testing with snapshot support
- ✅ **Built-in Validation** - Catch regex errors and scope naming issues before deployment
- 🔄 **Multiple Output Formats** - Generate JSON, Plist, or YAML grammar files
- 🛠️ **Powerful CLI** - Unified command-line interface for all operations
- 📚 **Rich Ecosystem** - Pre-built patterns, helpers, and comprehensive documentation
- 🚀 **Performance Optimized** - Smart repository management and efficient pattern generation

## 🚀 Quick Start

### Installation

```bash
# Using Bun (recommended)
bun add tmgrammar-toolkit

# Using npm
npm install tmgrammar-toolkit

# Using yarn
yarn add tmgrammar-toolkit
```

### Your First Grammar (5 minutes)

Create a simple grammar for a language called "MyLang":

```typescript
// mylang-grammar.ts
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';
import { COMMENT, NUM } from 'tmgrammar-toolkit/terminals';

const keywordRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while', 'function']),
  scope: scopes.keyword.control('mylang')
};

const commentRule = {
  key: 'comment',
  match: regex.concat('//', '.*$'),
  scope: scopes.comment.line['double-slash']('mylang')
};

const numberRule = {
  key: 'number',
  match: NUM.DEC,
  scope: scopes.constant.numeric('mylang')
};

export const myLangGrammar = createGrammar(
  'MyLang',
  'source.mylang',
  ['mylang'],
  [keywordRule, commentRule, numberRule]
);
```

Generate the grammar file:

```bash
# Using CLI
npx tmt emit mylang-grammar.ts -o mylang.tmLanguage.json

# Or programmatically
```

```typescript
import { emitJSON } from 'tmgrammar-toolkit';
import { myLangGrammar } from './mylang-grammar.js';

const grammarJson = await emitJSON(myLangGrammar);
console.log(grammarJson);
```

## 🏗️ Architecture

The toolkit is organized into focused modules that work together seamlessly:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TypeScript    │───▶│   Validation    │───▶│     Testing     │
│    Grammar      │    │   & Helpers     │    │   & Debugging   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Factory & API  │───▶│  Type-Safe API  │───▶│  TextMate JSON  │
│   Functions     │    │     Scopes      │    │   Grammar       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Core Modules:**
- **🏭 Factory** - Clean APIs for creating grammars and rules (`factory.ts`)
- **🎯 Scopes** - Type-safe scope management with autocomplete (`scopes/`)
- **🧩 Terminals** - Pre-built patterns for common language constructs (`terminals/`)
- **🛠️ Helpers** - Regex construction utilities (`helpers/`)
- **✅ Validation** - Pattern and grammar validation (`validation/`)
- **🧪 Testing** - Comprehensive testing framework (`testing/`)
- **📤 Emission** - Multi-format grammar generation (`emit.ts`)

## 💡 Key Concepts

### Type-Safe Rules

Everything in a TextMate grammar is a **Rule**. We support three types with full TypeScript safety:

```typescript
// Match Rule - for simple patterns
const keywordRule: MatchRule = {
  key: 'keywords',
  match: regex.keywords(['if', 'else']),
  scope: scopes.keyword.control('mylang')
};

// Begin/End Rule - for multi-line constructs
const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double('mylang'),
  patterns: [escapeRule]
};

// Include Rule - for pattern composition
const expressionRule: IncludeRule = {
  key: 'expression',
  patterns: [numberRule, stringRule, identifierRule]
};
```

### Intelligent Repository Management

No more manual repository management! The toolkit automatically:
- ✅ Builds repository from rule keys
- ✅ Detects duplicate keys and circular references
- ✅ Optimizes pattern organization
- ✅ Generates clean, efficient JSON

### Comprehensive Testing

Write tests that actually verify your grammar works:

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(myGrammar, 'source.mylang');
const tokens = await tester.tokenize('if (condition) { /* comment */ }');

// Verify specific token scopes
tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
tester.expectTokenScope(tokens, '/*', 'comment.block.mylang');
```

## 🛠️ CLI Commands

The `tmt` command provides unified access to all toolkit functionality:

### Grammar Generation

```bash
# Generate JSON (default)
tmt emit my-grammar.ts

# Generate different formats
tmt emit my-grammar.ts --plist -o grammar.tmLanguage
tmt emit my-grammar.ts --yaml -o grammar.yaml

# Emit specific export
tmt emit my-grammar.ts myGrammarExport
```

### Testing & Validation

```bash
# Run declarative tests
tmt test 'tests/**/*.test.mylang' -g grammar.json

# Generate/update snapshots
tmt snap 'tests/**/*.mylang' --update

# Validate grammar files
tmt validate grammar.json
tmt validate my-grammar.ts
```

## 📚 Rich Pattern Library

Pre-built patterns for common language constructs:

```typescript
import { COMMENT, NUM, ID, OP, STRING } from 'tmgrammar-toolkit/terminals';

// Comments
COMMENT.SLASHES     // "//"
COMMENT.HASH        // "#"
COMMENT.BLOCK.START // "/*"

// Numbers
NUM.DEC             // Decimal: 123, 123.45
NUM.HEX             // Hex: 0xFF, 0xABCD
NUM.BIN             // Binary: 0b1010
NUM.OCT             // Octal: 0o777

// Identifiers
ID                  // Standard: [a-zA-Z_][a-zA-Z0-9_]*
CAMEL_CASE_ID       // camelCase
SNAKE_CASE_ID       // snake_case
PASCAL_CASE_ID      // PascalCase

// Operators
OP.ASSIGNMENT       // =, +=, -=, *=, /=
OP.COMPARISON       // ==, !=, <, >, <=, >=
OP.ARITHMETIC       // +, -, *, /, %
OP.LOGICAL          // &&, ||, !
```

## 🎯 Real-World Examples

The toolkit includes complete, production-ready grammar implementations:

### Simple Language Example
```typescript
const simpleGrammar = createGrammar('Simple', 'source.simple', ['simple'], [
  { key: 'keywords', match: regex.keywords(['if', 'else']), scope: scopes.keyword.control('simple') },
  { key: 'strings', begin: /"/, end: /"/, scope: scopes.string.quoted.double('simple') },
  { key: 'numbers', match: NUM.DEC, scope: scopes.constant.numeric('simple') }
]);
```

### Advanced: Azure Bicep Grammar
```typescript
// Complex resource definitions with parameter interpolation
const bicepGrammar = createGrammar('Bicep', 'source.bicep', ['bicep'], [
  resourceDefinitionRule,
  parameterRule,
  variableRule,
  outputRule,
  expressionRule
]);
```

Find complete examples in the [`examples/`](examples/) directory.

## 📖 Documentation

Comprehensive documentation covering all aspects of the toolkit:

- **[📋 Getting Started Guide](docs/getting-started.md)** - Build your first grammar in 15 minutes
- **[🏗️ Architecture Overview](docs/modules-overview.md)** - Deep dive into toolkit design
- **[📚 API Reference](docs/api-reference.md)** - Complete function and type reference  
- **[🎯 Scopes Guide](docs/using-scopes.md)** - Master type-safe scope management
- **[🔧 Troubleshooting](docs/troubleshooting.md)** - Solutions for common issues
- **[📝 TextMate Scopes Reference](docs/textmate-scopes.md)** - Complete scope naming guide

**[📁 View All Documentation →](docs/)**

## 🧪 Testing Your Grammars

### Programmatic Testing

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(grammar, 'source.mylang');

// Test tokenization
const tokens = await tester.tokenize('function hello() { return "world"; }');

// Assertions
tester.expectTokenScope(tokens, 'function', 'keyword.declaration.mylang');
tester.expectTokenScope(tokens, 'hello', 'entity.name.function.mylang');
tester.expectTokenScope(tokens, '"world"', 'string.quoted.double.mylang');
```

### Declarative Testing

Create test files with embedded scope assertions:

```
// test.mylang
function hello() {
// <- keyword.declaration.mylang
//       ^ entity.name.function.mylang
  return "world";
  //     ^ string.quoted.double.mylang
}
```

Run tests:
```bash
npx tmt test 'tests/**/*.test.mylang' -g mylang.tmLanguage.json
```

## ⚡ Performance Features

- **Smart Pattern Optimization** - Automatic pattern combining and ordering
- **Efficient Repository Generation** - Minimal JSON output with optimal structure  
- **Regex Validation** - Catch expensive patterns before they cause performance issues
- **Atomic Grouping Support** - Use non-backtracking patterns for better performance
- **Memory-Efficient Processing** - Stream-based grammar generation for large grammars

## 🎨 Editor Integration

Works seamlessly with all editors supporting TextMate grammars:

- **VS Code** - First-class support with extension development tools
- **Sublime Text** - Direct .tmLanguage file support
- **Atom** - Grammar package integration
- **Vim/Neovim** - Via TreeSitter and syntax plugins
- **Emacs** - Multiple TextMate grammar packages
- **Any Editor** - Standard TextMate grammar format

## 🚀 Migration from Manual Grammars

Already have a TextMate grammar? The toolkit makes migration straightforward:

1. **Convert patterns** using our regex helpers
2. **Replace scope strings** with type-safe scope API
3. **Add validation** to catch existing issues
4. **Write tests** to prevent regressions
5. **Optimize patterns** using our performance tools

## 🤝 Contributing

We welcome contributions! Whether you're:

- 🐛 **Reporting bugs** - Help us improve stability
- 💡 **Suggesting features** - Share ideas for new functionality  
- 📝 **Improving docs** - Make the toolkit more accessible
- 🧩 **Adding patterns** - Contribute to the terminal library
- 🔧 **Fixing issues** - Submit pull requests

See our [contributing guidelines](../../CONTRIBUTING.md) for details.

## 📦 Related Projects

This toolkit builds upon and integrates with excellent open-source projects:

- **[vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test)** - Grammar testing framework
- **[vscode-textmate](https://github.com/Microsoft/vscode-textmate)** - TextMate grammar parsing
- **[oniguruma](https://github.com/kkos/oniguruma)** - Regular expression engine
- **[VS Code Language Extensions](https://code.visualstudio.com/api/language-extensions/overview)** - Editor integration

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌟 Why Choose TextMate Toolkit?

**For Individual Developers:**
- ⚡ **Faster Development** - Type safety and helpers accelerate grammar creation
- 🐛 **Fewer Bugs** - Validation catches issues early in development
- 📚 **Better Documentation** - Comprehensive guides and examples
- 🔧 **Easier Debugging** - Testing tools help isolate and fix issues

**For Teams:**
- 🤝 **Consistent Standards** - Shared patterns and conventions
- 👥 **Better Collaboration** - Code review-friendly TypeScript
- 📈 **Scalable Approach** - Reusable components and patterns
- ✅ **Quality Assurance** - Automated testing and validation

**For the Ecosystem:**
- 🌍 **Open Source** - MIT license encourages adoption and contribution
- 🔄 **Interoperable** - Standard TextMate format works everywhere
- 📊 **Well-Tested** - Comprehensive test suite ensures reliability
- 🚀 **Modern Tooling** - Built with current TypeScript and testing best practices

---

<div align="center">

**Ready to build better syntax highlighting?**

[📋 Get Started](docs/getting-started.md) • [📚 Read the Docs](docs/) • [🎨 See Examples](examples/)

</div> 