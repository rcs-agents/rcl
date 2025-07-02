# TMGrammar Toolkit 🎨

[![npm version](https://badge.fury.io/js/tmgrammar-toolkit.svg)](https://badge.fury.io/js/tmgrammar-toolkit)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Build TextMate grammars with TypeScript. Type-safe, testable, and maintainable.**

TMGrammar Toolkit transforms the complex process of creating TextMate grammars from error-prone JSON editing into a smooth TypeScript development experience. Write your language grammars with full type safety, comprehensive testing, and modern tooling support.

## ✨ Why TMGrammar Toolkit?

Creating TextMate grammars traditionally involves wrestling with massive JSON files, cryptic regex patterns, and zero type safety. TMGrammar Toolkit changes that:

- **🔒 Type Safety**: Full TypeScript support with compile-time validation
- **🎯 Developer Experience**: IntelliSense, autocomplete, and refactoring support
- **🧪 Testing**: Comprehensive testing APIs for grammar validation
- **⚡ Performance**: Optimized scope system with static and callable modes
- **🔧 Tooling**: CLI tools for validation, generation, and testing
- **📚 Documentation**: Extensive guides and real-world examples
- **🏗️ Maintainable**: Clean APIs that scale with your project

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

### Your First Grammar

```typescript
import { createGrammar, scopesFor, regex } from 'tmgrammar-toolkit';
import { COMMENT, NUM } from 'tmgrammar-toolkit/terminals';

// Create type-safe scopes
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });

// Define patterns with helpers
const keywords = {
  key: 'keywords',
  scope: scopes.keyword.control,
  match: regex.keywords(['if', 'else', 'while', 'for'])
};

const numbers = {
  key: 'numbers',
  scope: scopes.constant.numeric,
  match: NUM.DEC
};

const lineComment = {
  key: 'line-comment',
  scope: scopes.comment.line.double_slash,
  match: regex.concat(COMMENT.SLASHES, /.*$/)
};

// Create the complete grammar
export const myLanguageGrammar = createGrammar(
  'My Language',
  'source.mylang',
  ['mylang'],
  [keywords, numbers, lineComment],
  { repositoryItems: [keywords, numbers, lineComment] }
);
```

### Generate TextMate Grammar

```typescript
import { emitJSON } from 'tmgrammar-toolkit';

const grammarJson = await emitJSON(myLanguageGrammar);
// Write to .tmLanguage.json file for VS Code
```

## 🏗️ Architecture Overview

TMGrammar Toolkit is built around modern TypeScript features and developer experience:

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Grammar (TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  Type-Safe Scopes  │  Terminal Patterns  │  Regex Helpers  │
├─────────────────────────────────────────────────────────────┤
│           Factory Functions & Rule System                   │
├─────────────────────────────────────────────────────────────┤
│        Validation & Testing      │      Emission            │
├─────────────────────────────────────────────────────────────┤
│              TextMate Grammar (.tmLanguage.json)           │
└─────────────────────────────────────────────────────────────┘
```

### Core Features

- **🔧 Factory Functions**: Clean APIs for creating grammars and rules
- **🎭 Type-Safe Scopes**: Prevent typos and ensure TextMate compatibility
- **🧱 Terminal Patterns**: Pre-built patterns for common language constructs
- **🔍 Regex Helpers**: Readable pattern construction utilities
- **✅ Validation System**: Catch errors before they become problems
- **🧪 Testing Framework**: Programmatic and declarative testing
- **📤 Multi-Format Emission**: JSON, Plist, and YAML output

## 📚 Documentation

### 🎓 Learning Resources

- **[Getting Started](./packages/tmgrammar-toolkit/docs/getting-started.md)** - Your first grammar in 15 minutes
- **[Architecture Guide](./packages/tmgrammar-toolkit/docs/modules-overview.md)** - Understanding the toolkit design
- **[Using Scopes](./packages/tmgrammar-toolkit/docs/using-scopes.md)** - Type-safe scope management
- **[API Reference](./packages/tmgrammar-toolkit/docs/api-reference.md)** - Complete function documentation

### 🔧 Practical Guides

- **[TextMate Scopes Reference](./packages/tmgrammar-toolkit/docs/textmate-scopes.md)** - Scope naming conventions
- **[Troubleshooting Guide](./packages/tmgrammar-toolkit/docs/troubleshooting.md)** - Common issues and solutions
- **[Examples](./packages/tmgrammar-toolkit/examples/)** - Real-world grammar implementations

## 🌟 Examples

### Simple Language
```typescript
// Clean, readable grammar definition
const grammar = createGrammar('Simple', 'source.simple', ['simple'], [
  comments,    // Line and block comments
  strings,     // Multiple string types with escapes
  keywords,    // Language keywords
  expressions  // Numbers, identifiers, function calls
]);
```

### Complex Language Features
```typescript
// Advanced patterns with type safety
const functionDeclaration = {
  key: 'function',
  scope: scopes.meta.function,
  begin: regex.concat(
    regex.capture('function'),
    /\s+/,
    regex.capture(ID),
    regex.capture(/\(/)
  ),
  beginCaptures: {
    '1': { scope: scopes.keyword.declaration.function },
    '2': { scope: scopes.entity.name.function },
    '3': { scope: scopes.punctuation.section.parens.begin }
  },
  // ... end and patterns
};
```

Check out our [complete examples](./packages/tmgrammar-toolkit/examples/) including:
- **Bicep** - Azure resource definition language
- **TypeSpec** - API specification language  
- **Simple Language** - Educational example with best practices

## 🧪 Testing Your Grammar

TMGrammar Toolkit provides comprehensive testing APIs:

```typescript
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

const tester = createTesterFromContent(myGrammar, 'source.mylang');

// Test tokenization
const tokens = await tester.tokenize('if (condition) { }');

// Verify token scopes
tester.expectTokenScope(tokens, 'if', 'keyword.control.mylang');
tester.expectTokenScope(tokens, '(', 'punctuation.section.parens.mylang');
```

## ⚡ Performance

TMGrammar Toolkit is designed for both development productivity and runtime performance:

- **Static Scopes**: Compile-time optimization for production grammars
- **Terminal Pattern Reuse**: Avoid regex duplication across grammars  
- **Efficient Rule Grouping**: Minimize backtracking in complex patterns
- **Validation**: Catch expensive patterns during development

## 🛠️ CLI Tools

```bash
# Generate grammar files
npx tmt emit my-grammar.ts -o my-grammar.tmLanguage.json

# Run tests
npx tmt test 'tests/**/*.test.mylang' -g my-grammar.json

# Validate patterns
npx tmt validate my-grammar.ts
```

## 🤝 Contributing

We welcome contributions! TMGrammar Toolkit is built by developers who have felt the pain of manual TextMate grammar creation.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/tmgrammar-toolkit.git
cd tmgrammar-toolkit

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build
```

### Areas for Contribution

- **🔧 Terminal Patterns**: Add common patterns for new language constructs
- **📚 Documentation**: Improve guides and add more examples
- **🧪 Testing**: Expand test coverage and add new testing utilities
- **⚡ Performance**: Optimize the scope system and validation
- **🌍 Language Support**: Add grammar examples for new languages

### Project Structure

```
tmgrammar-toolkit/
├── packages/
│   ├── tmgrammar-toolkit/          # Main toolkit package
│   │   ├── src/                    # Source code
│   │   ├── docs/                   # Documentation
│   │   ├── examples/               # Example grammars
│   │   └── tests/                  # Test suites
│   └── cli/                        # CLI package
├── docs/                           # Project documentation
└── examples/                       # Additional examples
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

TMGrammar Toolkit builds upon the excellent work of:

- **TextMate** - The original grammar specification
- **VS Code** - Modern TextMate grammar implementation
- **TypeScript** - Type safety and developer experience
- **Oniguruma** - Regular expression engine

Special thanks to the contributors and the community for feedback and improvements.

---

**Ready to build better TextMate grammars?** [Get started now](./packages/tmgrammar-toolkit/docs/getting-started.md) or explore our [examples](./packages/tmgrammar-toolkit/examples/)! 🚀
