# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is the **RCL (Rich Communication Language)** implementation - a TypeScript-based language package built with the Langium framework for RCS Business Messaging. The project uses a modular architecture combining Langium grammar-first development with custom TextMate syntax generation.

### Core Components

- **Grammar System**: Modular Langium grammar files in `src/grammar/` that get bundled into `src/rcl-grammar.langium`
- **Custom Parser**: Enhanced lexer/parser system in `src/parser/` with custom tokenization and AST building
- **Language Server**: LSP implementation with semantic features (hover, completion, validation, etc.)
- **TextMate Syntax**: TypeScript-based grammar generation system in `syntaxes/rcl/`
- **JSON Conversion**: Service layer for converting RCL AST to JSON representations

### Key Technologies

- **Langium 3.5.0**: Grammar-first language development framework with LSP support
- **TextMate**: Syntax highlighting via TypeScript-generated JSON grammar
- **Bun**: Runtime and package manager
- **Vitest**: Test runner
- **TMGrammar Toolkit**: Custom TypeScript-to-TextMate conversion system

## Development Commands

### Core Build Commands

```bash
# Full build (grammar + LSP + syntax)
bun run build

# Clean and rebuild everything
bun run clean && bun run build

# Development with hot reload
bun run dev
```

### Grammar Development

```bash
# Generate Langium grammar from modular sources
bun run build:lang

# Bundle grammar for testing
bun run bundle:grammar-test

# Watch grammar files and regenerate
bun run dev:lang
```

### Language Server Development

```bash
# Build LSP server
bun run build:lsp

# Watch mode for LSP
bun run dev:lsp
```

### TextMate Syntax Development

```bash
# Generate TextMate JSON from TypeScript grammar
bun run build:syntax

# Watch syntax files and regenerate
bun run dev:syntax

# Validate syntax definitions
bun run check:syntaxes
```

### Testing

```bash
# Run all tests
bun run test

# Test TextMate scope assignments
bun run test:scopes

# Comprehensive scope testing
bun run test:comprehensive

# Test single file scopes
bun run inspect:file
```

## Critical Grammar Development Notes

### Langium 3.5.0 Limitations

Due to current Langium bugs, follow these strict rules:

1. **No Fragment Rules**: Terminal and parser rules cannot reference fragments or other rules
2. **Pure Regex Only**: All terminal rules must use direct regex patterns
3. **Parser Rules**: Can only reference terminals, not other parser rules
4. **Terminal Order**: Critical for lexer precedence - specific patterns before general ones

### Grammar Workflow

1. **Edit Modular Grammar**: Modify files in `src/grammar/` (never edit `src/rcl-grammar.langium` directly)
2. **Bundle Grammar**: Run `bun run bundle:grammar` to combine modular files
3. **Generate Langium**: Run `langium generate` to create AST and parser
4. **Build Syntax**: Run `bun run build:syntax` for TextMate highlighting

### Custom Parser Integration

The project uses both Langium's generated parser and a custom parser:
- **Custom Lexer**: `src/parser/lexer/` - handles indentation, multi-mode tokenization
- **Custom Parser**: `src/parser/parser/` - enhanced AST building and error recovery
- **Integration**: Custom components are used via `RclModule` services

## Language Server Features

### Implemented LSP Services

- **Semantic Highlighting**: Token-based syntax highlighting
- **Hover Provider**: Type information and documentation on hover
- **Completion**: Context-aware auto-completion
- **References**: Find all references to symbols
- **Definition**: Go-to-definition navigation
- **Document Symbols**: Outline view support
- **Folding Ranges**: Code folding support
- **Validation**: Real-time error checking and diagnostics

### Custom Services

- **Section Registry**: Manages RCL section types and validation
- **JSON Conversion**: Converts RCL AST to structured JSON
- **Value Conversion**: Handles RCL data type transformations

## TextMate Grammar System

### TypeScript-Based Generation

The project generates TextMate JSON from TypeScript definitions:
- **Source**: `syntaxes/rcl/` - TypeScript grammar rules
- **Output**: `src/syntaxes/rcl.tmLanguage.json`
- **Tool**: Uses `tmgrammar-toolkit` for conversion
- **Contexts**: Modular rule organization in `syntaxes/rcl/contexts/`

### Scope Testing

```bash
# Test specific RCL file scopes
bun run inspect:file path/to/file.rcl

# Run scope validation tests
bun run test:scopes
```

## RCL Language Specifics

### Syntax Features

- **Indentation-Based**: Python-like block structure
- **Sections**: `agent`, `messages`, `flow`, `config`, `defaults`
- **Embedded Code**: JavaScript/TypeScript blocks with `$js>` and `$ts>` syntax
- **Type System**: Built-in primitives + RCS message types
- **Imports**: Namespace-based with space-separated identifiers
- **Message Shortcuts**: Simplified syntax for common message patterns

### File Structure

```rcl
import My Company / Agents / BMW Agent as BMW

agent Sample Agent
    description: "An example agent"
    
messages
    hello: "Welcome to our service"
    
flow
    start -> greet
    greet: send hello -> end
```

## Testing Strategy

### Test Organization

- **Grammar Tests**: `tests/grammar/` - parser and lexer functionality
- **LSP Tests**: `tests/lsp/` - language server features
- **Integration Tests**: `tests/integration/` - end-to-end functionality
- **TextMate Tests**: `tests/textmate/` - syntax highlighting validation
- **Fixtures**: `tests/fixtures/` - sample RCL files for testing

### Running Specific Tests

```bash
# Single test file
bun test tests/grammar/integration.test.ts

# Test category
bun test tests/lsp/

# Watch mode
bun test --watch
```

## Common Development Tasks

### Adding New Grammar Rules

1. Edit modular grammar files in `src/grammar/`
2. Run `bun run build:lang` to regenerate bundled grammar
3. Update custom parser if needed
4. Add corresponding TextMate rules in `syntaxes/rcl/`
5. Run `bun run build:syntax` to regenerate syntax highlighting
6. Add tests in appropriate `tests/` subdirectory

### Debugging Parser Issues

1. Use `debug-parser.js` to inspect token streams
2. Check terminal rule order in bundled grammar
3. Verify custom lexer mode handling
4. Test with minimal examples first

### Adding LSP Features

1. Implement service in `src/lsp/`
2. Register in `src/rcl-module.ts`
3. Add tests in `tests/lsp/`
4. Update validation if needed

## Important File Locations

- **Main Grammar**: `src/rcl-grammar.langium` (auto-generated, do not edit)
- **Grammar Sources**: `src/grammar/` (edit these files)
- **Language Module**: `src/rcl-module.ts` (service registration)
- **Custom Parser**: `src/parser/` (enhanced parsing logic)
- **TextMate Grammar**: `syntaxes/rcl/rcl.grammar.ts` (main syntax definition)
- **Config**: `langium-config.json` (Langium build configuration)
- **Generated AST**: `src/generated/ast.ts` (auto-generated from grammar)