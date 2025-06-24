# TextMate Grammar Testing

This module provides comprehensive testing utilities for TextMate grammars, offering both programmatic and declarative testing approaches. It acts as a unified wrapper around the excellent [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) package while adding additional programmatic testing capabilities.

## Quick Start

```typescript
import { test, declarativeTest, snapshot } from 'tmgrammar-toolkit/testing';

// Programmatic testing
const tester = test('./my-grammar.json', 'source.mylang');
const tokens = await tester.tokenize('const x = 42;');
tester.expectTokenScope(tokens, 'const', 'keyword.control');

// Declarative testing (using vscode-tmgrammar-test format)
declarativeTest('tests/**/*.test.mylang');

// Snapshot testing  
snapshot('tests/snap/**/*.mylang');
```

## Testing Approaches

### 1. Programmatic Testing

For when you need fine-grained control over tokenization testing or want to integrate grammar testing into larger test suites:

```typescript
import { createTesterFromFile, ProgrammaticTester } from 'tmgrammar-toolkit/testing';

// Create a tester instance
const tester = createTesterFromFile('./syntaxes/mylang.tmLanguage.json', 'source.mylang');

// Test specific tokens
const tokens = await tester.tokenize(`
function hello(name: string) {
  console.log(\`Hello, \${name}!\`);
}
`);

// Find and verify specific tokens
const functionToken = tester.findToken(tokens, 'function');
expect(functionToken?.scopes).toContain('keyword.control.function');

// Assert token scopes programmatically
tester.expectTokenScope(tokens, 'function', 'keyword.control.function');
tester.expectTokenScope(tokens, 'string', 'entity.name.type');

// Test with embedded grammars
const testerWithEmbedded = new ProgrammaticTester({
  grammarPath: './syntaxes/mylang.tmLanguage.json',
  scopeName: 'source.mylang',
  embeddedGrammars: {
    'source.js': loadJavaScriptGrammar()
  }
});
```

### 2. Declarative Testing

Uses the standard [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) format for readable, maintainable tests with inline scope assertions:

#### Test File Format

Create test files with `.test.mylang` extension using the established syntax:

```mylang
// SYNTAX TEST "source.mylang" "Function declarations"

function greet(name: string): void {
// ^^^^^ keyword.control.function
//       ^^^^^ entity.name.function
//            ^^^^ variable.parameter
//                  ^^^^^^ entity.name.type

  const message = `Hello, ${name}!`;
  //^^ keyword.control.const
  //    ^^^^^^^ variable.other

  console.log(message);
  //^^^^^ support.type.object
  //     ^^^ support.function
}
```

#### Running Declarative Tests

```typescript
import { declarativeTest } from 'tmgrammar-toolkit/testing';

// Run tests with default configuration
const result = declarativeTest('tests/**/*.test.mylang');

if (!result.success) {
  console.error('Tests failed:', result.error);
}

// Run with specific grammar file
declarativeTest('tests/**/*.test.mylang', {
  grammar: './syntaxes/mylang.tmLanguage.json',
  compact: true
});
```

### 3. Snapshot Testing

Perfect for regression testing using [vscode-tmgrammar-test's snapshot functionality](https://github.com/PanAeon/vscode-tmgrammar-test#snapshot-tests):

```typescript
import { snapshot } from 'tmgrammar-toolkit/testing';

// Generate snapshots on first run
snapshot('tests/snapshots/**/*.mylang');

// Update snapshots after grammar changes
snapshot('tests/snapshots/**/*.mylang', {
  updateSnapshots: true,
  expandDiff: true
});
```

## Integration with Test Frameworks

### With Vitest/Jest

```typescript
import { describe, it, expect } from 'vitest';
import { createTesterFromFile } from 'tmgrammar-toolkit/testing';

describe('MyLang Grammar', () => {
  const tester = createTesterFromFile('./syntaxes/mylang.tmLanguage.json', 'source.mylang');

  it('should tokenize function declarations correctly', async () => {
    const tokens = await tester.tokenize('function test() {}');
    
    expect(tester.hasExpectedScope(
      tester.findToken(tokens, 'function')!, 
      'keyword.control.function'
    )).toBe(true);
  });
});
```

### With CLI

The `tmt` CLI tool provides unified access to grammar operations:

```bash
# Emit grammar from TypeScript file (JSON by default)
tmt emit examples/my-grammar.ts
tmt emit examples/my-grammar.ts myGrammar  # specific export
tmt emit examples/my-grammar.ts --plist -o grammar.tmLanguage
tmt emit examples/my-grammar.ts --yaml -o grammar.yaml

# Run declarative tests
tmt test 'tests/**/*.test.mylang'
tmt test 'tests/**/*.test.mylang' -g grammar.json --compact

# Run snapshot tests  
tmt snap 'tests/**/*.mylang' --update
tmt snap 'tests/**/*.mylang' -g grammar.json --expand-diff

# Validate grammar
tmt validate grammar.tmLanguage.json
tmt validate examples/my-grammar.ts myGrammar
```

## API Reference

### Core Functions

- **`test(grammarPath, scopeName)`** - Create a programmatic tester
- **`declarativeTest(testFiles, options?)`** - Run declarative tests using vscode-tmgrammar-test
- **`snapshot(testFiles, options?)`** - Run snapshot tests using vscode-tmgrammar-snap

### Classes

- **`ProgrammaticTester`** - Main class for programmatic testing
- **`createTesterFromFile(path, scope)`** - Factory for file-based grammars
- **`createTesterFromContent(grammar, scope)`** - Factory for in-memory grammars

### Types

- **`TokenInfo`** - Information about a tokenized piece of text
- **`GrammarInitOptions`** - Options for initializing a grammar tester
- **`TestResult`** - Result of running declarative/snapshot tests

## How This Relates to vscode-tmgrammar-test

[vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) is an excellent TypeScript-based testing tool that provides:

- **CLI Tools**: `vscode-tmgrammar-test` and `vscode-tmgrammar-snap` commands
- **Declarative Testing**: Inline scope assertions using `^` and `<-` syntax  
- **Snapshot Testing**: Automatic generation and comparison of `.snap` files
- **VSCode Integration**: Problem matchers and task configurations
- **Package.json Configuration**: Auto-discovery of grammar files

### What Our Wrapper Adds

| Capability | vscode-tmgrammar-test | Our Testing Module |
|------------|----------------------|-------------------|
| **CLI Usage** | ✅ Direct CLI tools | ⏳ Coming soon with `tmt` CLI |
| **Programmatic API** | ❌ CLI-only | ✅ Full programmatic access |
| **TypeScript Integration** | ✅ Written in TypeScript | ✅ Full TypeScript support with types |
| **Test Framework Integration** | ✅ Via external scripts | ✅ Native integration |
| **Custom Grammar Objects** | ❌ File-based only | ✅ In-memory grammar objects |
| **Token Analysis** | ❌ Limited to assertions | ✅ Rich token inspection |
| **Unified Package** | ❌ Separate install | ✅ Part of complete toolkit |

### When to Use What

**Use vscode-tmgrammar-test directly when:**
- You prefer CLI-first workflows
- You only need declarative/snapshot testing
- You want the lightest possible dependency

**Use our testing module when:**
- You want programmatic control over tests
- You're already using the tmgrammar-toolkit for grammar authoring
- You need to integrate testing into larger applications
- You want a unified API across all grammar operations

### Compatibility

Our module wraps vscode-tmgrammar-test, so:
- **Test file formats** remain exactly the same
- **Assertion syntax** is unchanged  
- **Existing `.test` files** work without modification
- **CLI behavior** will be preserved in the upcoming `tmt` tool

```typescript
// This works exactly like the original CLI
import { declarativeTest } from 'tmgrammar-toolkit/testing';
declarativeTest('tests/**/*.test.mylang');

// Plus you get programmatic access
const tester = test('./grammar.json', 'source.mylang');
const tokens = await tester.tokenize('code');
```

## Contributing

This testing module builds upon [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) by PanAeon. For issues specifically with declarative or snapshot testing, please check the upstream project first.

For issues with our programmatic API or integration, please see our main [contributing guidelines](./../../CONTRIBUTING.md). 