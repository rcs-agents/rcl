# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a TypeScript monorepo for the **TMGrammar Toolkit** - a comprehensive system for building TextMate grammars with type safety and modern tooling. The project also includes the **RCL (Rich Communication Language)** implementation as a real-world example.

### Core Components

- **`packages/tmgrammar-toolkit/`** - Main toolkit for creating TextMate grammars with TypeScript
- **`packages/language/`** - RCL language implementation using Langium parser framework
- **`packages/extension/`** - VS Code extension for RCL syntax highlighting and language support
- **`packages/cli/`** - Command-line tools for RCL processing and grammar generation

### Key Technologies

- **Langium**: Grammar-first language development framework (used for RCL parser)
- **TextMate**: Syntax highlighting specification (generated from TypeScript definitions)
- **Bun**: Primary runtime and package manager
- **TypeScript**: Type-safe development with project references
- **ESBuild**: Fast bundling for extension builds
- **Vitest**: Test runner for unit tests

## Development Commands

### Workspace-Level Commands

```bash
# Development with hot reload for all packages
bun run dev

# Full build of all packages
bun run build

# Clean build (removes all build artifacts first)
bun run build:clean

# Run tests (primarily in language package)
bun run test

# Clean all packages
bun run clean

# CLI tool access
bun run cli
```

### Package-Specific Commands

#### TMGrammar Toolkit (`packages/tmgrammar-toolkit/`)
```bash
cd packages/tmgrammar-toolkit
bun run build    # Build TypeScript library
bun run dev      # Watch mode development
bun run test     # Run toolkit tests
bun run test:regex # Test regex helpers specifically
```

#### RCL Language (`packages/language/`)
```bash
cd packages/language
bun run build           # Full build (grammar + LSP + syntax)
bun run build:lang      # Generate Langium grammar only
bun run build:lsp       # Build language server
bun run build:syntax    # Build TextMate syntax files
bun run dev             # Watch mode for all components
bun run test            # Run language tests
bun run test:scopes     # Test TextMate scope assignments
```

#### VS Code Extension (`packages/extension/`)
```bash
cd packages/extension
bun run build                    # Build extension
bun run dev                      # Watch mode
bun run reinstall-extension      # Package and install in VS Code
```

#### CLI (`packages/cli/`)
```bash
cd packages/cli
bun run build    # Build CLI tools
bun run dev      # Watch mode
bun run cli      # Run CLI directly
```

## Critical Development Notes

### Grammar Development Workflow

1. **RCL Grammar Changes**: Modify files in `packages/language/src/grammar/` (Langium grammar files)
2. **TextMate Syntax**: Edit `packages/language/syntaxes/rcl/` (TypeScript-based grammar generation)
3. **Grammar Generation**: Run `bun run build:lang` to regenerate from Langium grammar
4. **Syntax Generation**: Run `bun run build:syntax` to generate TextMate JSON from TypeScript

### Package Dependencies

- **Internal Dependencies**: Use `workspace:*` for referencing other packages
- **Build Order**: tmgrammar-toolkit → language → extension → cli
- **TypeScript References**: Configured in root `tsconfig.json` for proper build ordering

### TextMate Grammar System

The project uses a custom TypeScript-based system for generating TextMate grammars:
- **Source**: `packages/language/syntaxes/rcl/` (TypeScript definitions)
- **Output**: `packages/language/src/syntaxes/rcl.tmLanguage.json`
- **Build**: `bun run build:syntax` converts TypeScript to JSON

### Language Server Protocol (LSP)

RCL language features are implemented using Langium's LSP framework:
- **Entry Point**: `packages/language/src/rcl-module.ts`
- **Services**: Custom providers in `packages/language/src/lsp/`
- **Parser**: Custom lexer/parser in `packages/language/src/parser/`

## Testing

### Test Structure
- **Unit Tests**: `packages/language/tests/` - Grammar and language feature tests
- **Integration Tests**: `packages/language/tests/textmate/` - TextMate scope validation
- **Fixtures**: `packages/language/tests/fixtures/` - Test RCL files

### Running Tests
```bash
# All tests
bun run test

# Language-specific tests
cd packages/language && bun run test

# TextMate scope tests
cd packages/language && bun run test:scopes
```

## Code Quality Tools

- **Linting**: Biome (`biome.jsonc`) - formatting and linting
- **TypeScript**: Strict mode enabled with project references
- **Pre-commit**: Husky and lint-staged configured
- **Formatting**: 2-space indentation, single quotes for JS/TS

## Important File Locations

- **Root Package**: `package.json` - workspace configuration and scripts
- **Language Grammar**: `packages/language/src/rcl-grammar.langium` - main RCL grammar
- **TextMate Rules**: `packages/language/syntaxes/rcl/` - syntax highlighting rules
- **Extension Config**: `packages/extension/package.json` - VS Code extension manifest
- **CLI Entry**: `packages/cli/bin/rcl` - command-line interface

## RCL Language Specifics

RCL (Rich Communication Language) is a domain-specific language for RCS Business Messaging:
- **Syntax**: Python-like indentation with special constructs for messaging
- **Sections**: `agent`, `messages`, `flow`, `config`, `defaults`
- **Embedded Code**: JavaScript/TypeScript code blocks with `$js>` and `$ts>` syntax
- **Type System**: Built-in types + RCS message types
- **Import System**: Namespace-based imports with alias support

## Extension Development

When working on the VS Code extension:
1. **Development**: Use `bun run dev` in extension package for watch mode
2. **Testing**: Use `bun run reinstall-extension` to package and install locally
3. **Syntax**: Changes to TextMate grammar require rebuilding language package first
4. **Language Server**: Extension connects to LSP server from language package