# TMGrammar Toolkit Examples

This directory contains comprehensive examples demonstrating how to use the `tmgrammar-toolkit` to create TextMate grammars with best practices.

## 📁 Core Examples

### 🎯 `simple-example.ts` (60 lines)
**Purpose**: Quick introduction to tmgrammar-toolkit fundamentals  
**Features Demonstrated**:
- Type-safe scopes with `scopesFor`
- Pre-built terminal patterns (`COMMENT`, `NUM`, `ID`)
- Regex helpers (`regex.keywords`, `regex.concat`)
- Basic rule types (`MatchRule`, `BeginEndRule`)
- Clean grammar creation with `createGrammar`

**Best for**: First-time users who want to understand the core concepts quickly

### 🏗️ `comprehensive-example.ts` (320+ lines)
**Purpose**: Advanced patterns and production best practices  
**Features Demonstrated**:
- Complex begin/end rules with captures
- Function and class declarations with parameters
- Template literals with interpolation
- Pattern grouping and organization
- Complete grammar with repository management
- Testing and generation utilities
- Multiple string types and escape sequences

**Best for**: Learning advanced patterns and understanding how to structure complex grammars

### 🏭 `tmgrammar-toolkit/`

#### `bicep.ts`
**Purpose**: Real-world language implementation  
**Language**: Bicep (Azure Resource Manager DSL)  
**Features Demonstrated**:
- Complex language with multiple constructs
- Custom scope definitions
- String interpolation with `${}` syntax
- Object and array literals
- Lambda expressions and decorators
- Directive handling
- Advanced regex patterns with helpers

#### `typespec.ts`  
**Purpose**: Complete language grammar definition  
**Language**: TypeSpec (API definition language)  
**Features Demonstrated**:
- Complex recursive patterns
- Doc comments with TSDoc tags
- Type annotations and generics
- Template expressions in strings
- Multiple punctuation types
- Namespace and import statements
- Model definitions and interfaces
- Operation declarations
- Comprehensive TypeScript integration

**Best for**: Understanding how to implement complete, production-ready language grammars

## 🧪 Demo and Test Files

### `_demo-scope-features.ts`
**Purpose**: Comprehensive demonstration of the scope system features  
**Features Demonstrated**:
- Static vs callable scopes
- Custom scope definitions
- Extension modes (`on-leafs`)
- Performance comparisons
- Type safety examples

**Best for**: Understanding the scope system internals and different usage patterns

## 📖 Learning Path

### For Beginners
1. **Start with `simple-example.ts`** (15 min) - Learn the fundamentals
   - Type-safe scopes
   - Terminal patterns
   - Basic rule structure
   - Grammar creation
2. **Study the code comments** - Understand the "why" behind each pattern
3. **Run the example** - See the generated grammar JSON
4. **Experiment** - Modify keywords, add new patterns

### For Practical Implementation
1. **Study `comprehensive-example.ts`** (30 min) - See advanced patterns
   - Complex rules with captures
   - Function declarations
   - Pattern organization
   - Repository management
2. **Compare with real-world examples**:
   - `bicep.ts` - String interpolation, directives
   - `typespec.ts` - Complex language features
3. **Use as templates** - Copy patterns for your own language

### For Production Grammars
1. **Master the real-world examples**:
   - `bicep.ts` - See how a real DSL is structured
   - `typespec.ts` - Complex language with extensive features
2. **Study performance patterns** - Static scopes, terminal reuse
3. **Explore `_demo-scope-features.ts`** - Understand scope system internals

## 🚀 Quick Start

### Try the Simple Example

```bash
# Run the simple example to see basic features
bun run examples/simple-example.ts

# Expected output:
# Keywords: keyword.control.simple
# Strings: string.quoted.double.simple
# Numbers: constant.numeric.simple
# etc.
```

### Explore Advanced Features

```bash
# Run the comprehensive example
bun run examples/comprehensive-example.ts

# See real-world implementations
bun run examples/tmgrammar-toolkit/bicep.ts
bun run examples/tmgrammar-toolkit/typespec.ts
```

## 🔄 Migration from Other Libraries

The examples show how to use modern TextMate grammar patterns:

### Key Patterns in tmgrammar-toolkit

1. **Static Scopes** (Recommended):
   ```typescript
   // Modern tmgrammar-toolkit approach
   const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });
   scope: scopes.keyword.control.declaration  // "keyword.control.declaration.mylang"
   ```

2. **Grammar Creation**:
   ```typescript
   // Unified API
   export const grammar = createGrammar(
     'MyLanguage',
     'source.mylang', 
     ['.mylang'],
     [expression],
     { repositoryItems: allRules }
   );
   ```

3. **Type-Safe Rules**:
   ```typescript
   // Full TypeScript support
   const keywordRule: MatchRule = {
     key: 'keywords',
     match: regex.keywords(['if', 'else', 'while']),
     scope: scopes.keyword.control
   };
   ```

## 🚀 Running Examples

### Build and Test
```bash
# Build all examples
bun run build

# Run a specific example
bun run examples/simple-example.ts
bun run examples/comprehensive-example.ts

# Generate grammar from an example
bun run examples/tmgrammar-toolkit/bicep.ts
```

### Testing Your Changes
```bash
# Run tests on examples
bun test examples/

# Validate generated grammars
bun run validate examples/output/*.json
```

## ✨ Best Practices Demonstrated

### Performance Optimizations
- ✅ **Static scopes** for production grammars
- ✅ **Terminal pattern reuse** to avoid regex duplication
- ✅ **Proper pattern ordering** (specific to general)
- ✅ **Efficient rule grouping** to minimize backtracking

### Code Organization
- ✅ **Logical rule grouping** (comments, literals, expressions)
- ✅ **Clear naming conventions** for keys and scopes
- ✅ **Comprehensive exports** for testing and reuse
- ✅ **Proper TypeScript typing** throughout

### Grammar Structure
- ✅ **Repository management** via `repositoryItems`
- ✅ **Circular reference handling** with forward declarations
- ✅ **Custom scope definitions** for language-specific needs
- ✅ **Error handling** with source file paths for debugging

## 📚 Additional Resources

- **[Getting Started Guide](../docs/getting-started.md)** - Step-by-step tutorial
- **[API Reference](../docs/api-reference.md)** - Complete function documentation
- **[Using Scopes](../docs/using-scopes.md)** - Scope system deep dive
- **[Troubleshooting](../docs/troubleshooting.md)** - Common issues and solutions

## 🤝 Contributing Examples

Found a pattern that should be included? Want to add an example for your language?

1. **Follow the established structure** - Use the `simple-example.ts` as a template for basics
2. **Include comprehensive comments** - Explain the "why" not just the "what"
3. **Add proper exports** - Make testing and reuse easy
4. **Update this README** - Document your example's purpose and features

The goal is to make TextMate grammar creation accessible and maintainable for everyone! 🎉 