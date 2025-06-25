# TextMate Toolkit Documentation

Complete documentation for building, testing, and shipping TextMate grammars with TypeScript.

## 📚 Documentation Overview

This documentation suite covers everything you need to know about the TextMate Toolkit, from basic concepts to advanced techniques.

### Getting Started
- **[Getting Started Guide](getting-started.md)** - Your first grammar in 15 minutes
- **[Core Concepts](modules-overview.md)** - Understanding the toolkit architecture
- **[API Reference](api-reference.md)** - Complete function and type reference

### Deep Dives
- **[TextMate Scopes Reference](textmate-scopes.md)** - Complete scope naming conventions
- **[Using Scopes](using-scopes.md)** - Type-safe scope management
- **[Troubleshooting Guide](troubleshooting.md)** - Common issues and solutions

## 🎯 Quick Navigation

### By Experience Level

**New to TextMate Grammars?**
1. Start with [Getting Started Guide](getting-started.md)
2. Read [Core Concepts](modules-overview.md) 
3. Try the examples in the toolkit

**Experienced with TextMate?**
1. Check out [API Reference](api-reference.md)
2. Explore [TextMate Scopes Reference](textmate-scopes.md)
3. Use [Troubleshooting Guide](troubleshooting.md) when needed

**Building Production Grammars?**
1. Master [Testing patterns](modules-overview.md#testing---making-sure-it-actually-works)
2. Follow [Performance tips](troubleshooting.md#performance-optimization)
3. Set up comprehensive validation workflows

### By Task

| I want to... | Read this |
|--------------|-----------|
| Create my first grammar | [Getting Started Guide](getting-started.md) |
| Understand the architecture | [Modules Overview](modules-overview.md) |
| Look up API functions | [API Reference](api-reference.md) |
| Use type-safe scopes | [Using Scopes](using-scopes.md) |
| Fix highlighting issues | [Troubleshooting Guide](troubleshooting.md) |
| Learn scope conventions | [TextMate Scopes Reference](textmate-scopes.md) |

## 🏗️ Architecture Overview

The toolkit is built around these core concepts:

```
Grammar Definition (TypeScript)
         ↓
    Factory Functions
         ↓
    Rule System (Match/BeginEnd/Include)
         ↓
    Validation & Testing
         ↓
    Emission (JSON/Plist/YAML)
         ↓
    TextMate Grammar File
```

**Key Components:**
- **Factory Functions** - Clean APIs for creating grammars and rules
- **Type-Safe Scopes** - Prevent typos and ensure consistency
- **Regex Helpers** - Readable pattern construction
- **Terminal Patterns** - Pre-built patterns for common constructs
- **Validation System** - Catch errors before they become problems
- **Testing Framework** - Programmatic and declarative testing
- **Emission System** - Convert TypeScript to TextMate JSON

## 📖 Documentation Categories

### Core Documentation

**[Modules Overview](modules-overview.md)** *(15 min read)*
- Complete architectural guide
- Module-by-module breakdown
- Real-world workflow examples
- Performance optimization tips

**[API Reference](api-reference.md)** *(Reference)*
- All public functions and types
- Complete parameter documentation
- Usage examples for every API
- TypeScript interface definitions

### Scope Management

**[TextMate Scopes Reference](textmate-scopes.md)** *(20 min read)*
- Complete scope naming conventions
- TextMate specification compliance
- Best practices for editor compatibility
- Scope hierarchy explanations

**[Using Scopes](using-scopes.md)** *(5 min read)*
- Type-safe scope API usage
- Language-specific scope patterns
- Editor integration tips
- Common scope patterns

### Practical Guides

**[Getting Started Guide](getting-started.md)** *(10 min read)*
- Step-by-step first grammar
- Core concept explanations
- Testing your grammar
- Common patterns and examples

**[Troubleshooting Guide](troubleshooting.md)** *(Reference)*
- Common issues and solutions
- Debugging techniques
- Performance optimization
- Error message explanations

## 🎨 Examples and Patterns

The toolkit includes complete example implementations:

- **Simple Language** - Basic keywords, comments, strings
- **Bicep** - Azure resource definitions with complex patterns
- **TypeSpec** - API definition language with advanced features

Find these in the `examples/` directory.

## 🚀 Quick Reference

### Essential APIs

```typescript
// Grammar creation
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';

// Terminal patterns
import { COMMENT, NUM, ID, OP } from 'tmgrammar-toolkit/terminals';

// Testing
import { createTesterFromContent } from 'tmgrammar-toolkit/testing';

// Validation
import { validateRegex, validateGrammar } from 'tmgrammar-toolkit/validation';

// Emission
import { emitJSON, emitPlist, emitYAML } from 'tmgrammar-toolkit';
```

### Common Patterns

```typescript
// Keywords
const keywords = { 
  key: 'keywords',
  match: regex.keywords(['if', 'else', 'while']),
  scope: scopes.keyword.control('mylang')
};

// Strings with escapes
const strings = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double('mylang'),
  patterns: [
    { key: 'escape', match: /\\./, scope: scopes.constant.character.escape('mylang') }
  ]
};

// Numbers
const numbers = {
  key: 'numbers',
  match: NUM.DEC,
  scope: scopes.constant.numeric('mylang')
};
```

## 🔗 External Resources

- **[TextMate Grammar Manual](https://macromates.com/manual/en/language_grammars)** - Official specification
- **[VS Code Syntax Highlighting Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)** - VS Code specifics
- **[Oniguruma Regular Expressions](https://github.com/kkos/oniguruma/blob/master/doc/RE)** - Regex engine reference
- **[TextMate Scope Naming](https://www.sublimetext.com/docs/scope_naming.html)** - Naming conventions

## 📝 Contributing to Documentation

Found an error or want to improve the docs?

1. **Small fixes**: Edit the Markdown files directly
2. **New sections**: Follow the existing structure and style
3. **Examples**: Include working code samples
4. **Cross-references**: Link to related sections

The documentation is written in Markdown and should be:
- **Clear and concise** - Get to the point quickly
- **Example-driven** - Show, don't just tell
- **Comprehensive** - Cover edge cases and gotchas
- **Up-to-date** - Reflect the current API

## 📋 Document Status

| Document | Status | Last Updated | Covers Version |
|----------|--------|--------------|----------------|
| Getting Started | ✅ Complete | Latest | v2.x |
| Modules Overview | ✅ Complete | Latest | v2.x |
| API Reference | ✅ Complete | Latest | v2.x |
| Scopes Reference | ✅ Complete | Latest | v2.x |
| Using Scopes | ✅ Complete | Latest | v2.x |
| Troubleshooting | ✅ Complete | Latest | v2.x |

---

**Need help?** Start with the [Getting Started Guide](getting-started.md) or jump to the [Troubleshooting Guide](troubleshooting.md) if you're facing specific issues. 