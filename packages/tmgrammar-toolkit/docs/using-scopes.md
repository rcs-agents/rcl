# Using Scopes in TMGrammar Toolkit

The TMGrammar Toolkit provides a powerful, type-safe scope system for creating TextMate grammars. This guide covers all the ways you can use scopes in your projects.

## Quick Start

The most common pattern is to create static scopes with a language suffix:

```typescript
import { scopesFor } from 'tmgrammar-toolkit';

// Create static scopes for your language (recommended)
const myScopes = scopesFor({ 
  suffix: 'mylang', 
  allowScopeExtension: false 
});

// Use in your grammar rules
const keywordRule = {
  name: myScopes.keyword.control.conditional,  // "keyword.control.conditional.mylang"
  match: /\b(if|else|for|while)\b/
};
```

## Scope Patterns

### 1. Static Scopes (Recommended)

Static scopes provide the best performance and are recommended for production grammars:

```typescript
const staticScopes = scopesFor({ 
  suffix: 'typescript', 
  allowScopeExtension: false 
});

// These return string values directly
console.log(staticScopes.keyword.control.conditional); // "keyword.control.conditional.typescript"
console.log(staticScopes.string.quoted.double); // "string.quoted.double.typescript"

// Perfect for template literals
const rule = `${staticScopes.comment.line.double_slash}`; // "comment.line.double-slash.typescript"

// Not callable (optimized for performance)
// staticScopes.keyword.control.conditional('extra'); // ❌ TypeError
```

**Benefits:**
- Best performance (no function call overhead)
- Smaller bundle size
- Easier for bundlers to optimize
- Clear, predictable behavior

### 2. Callable Scopes

Callable scopes allow dynamic extension with additional suffixes:

```typescript
const callableScopes = scopesFor({ 
  suffix: 'javascript', 
  allowScopeExtension: true 
});

// Base usage
console.log(callableScopes.keyword.control.conditional); // "keyword.control.conditional.javascript"

// Dynamic extension
console.log(callableScopes.keyword.control.conditional('async')); // "keyword.control.conditional.javascript.async"
console.log(callableScopes.string.quoted.double('template')); // "string.quoted.double.javascript.template"
```

**Use cases:**
- Grammar extensions or plugins
- Development and testing
- When you need runtime flexibility

### 3. On-Leafs Extension Mode

Only leaf nodes (terminal scopes) are callable, branch nodes are static:

```typescript
const leafScopes = scopesFor({ 
  suffix: 'python', 
  allowScopeExtension: 'on-leafs' 
});

// Leaf nodes are callable
console.log(leafScopes.keyword.control.conditional('comprehension')); // "keyword.control.conditional.python.comprehension"

// Branch nodes are not callable
console.log(leafScopes.keyword.control); // "keyword.control.python" (not callable)
// leafScopes.keyword.control('extra'); // ❌ TypeError
```

**Benefits:**
- Balance between performance and flexibility
- Prevents accidental extension of intermediate scopes
- Clear distinction between terminal and intermediate scopes

## Custom Scope Definitions

You can extend the base TextMate scopes with your own custom definitions:

```typescript
const customScopes = scopesFor({ 
  suffix: 'rcl', 
  allowScopeExtension: false 
}, {
  // Custom meta scopes for your language
  meta: {
    section: {
      agent: null,
      messages: null,
      flows: null
    },
    embedded: {
      expression: null,
      code: null
    }
  },
  // Custom source scopes
  source: {
    rcl: {
      import: null,
      section_header: null
    }
  }
});

// Use custom scopes
console.log(customScopes.meta.section.agent); // "meta.section.agent.rcl"
console.log(customScopes.source.rcl.import); // "source.rcl.import.rcl"

// Base scopes are still available
console.log(customScopes.keyword.control.conditional); // "keyword.control.conditional.rcl"
```

## Advanced Configuration

### Prefix for Embedded Languages

Use prefixes when creating scopes for embedded languages:

```typescript
const embeddedScopes = scopesFor({ 
  prefix: 'source.html.embedded',
  suffix: 'javascript',
  allowScopeExtension: false 
});

console.log(embeddedScopes.keyword.control.conditional); 
// "source.html.embedded.keyword.control.conditional.javascript"
```

### No Suffix (Base Scopes)

Create scopes without language suffixes:

```typescript
const baseScopes = scopesFor({ 
  allowScopeExtension: false 
});

console.log(baseScopes.keyword.control.conditional); // "keyword.control.conditional"
```

## Predefined Scopes

The toolkit provides predefined scopes that are always callable:

```typescript
import { scopes } from 'tmgrammar-toolkit';

// Global scopes (always callable)
console.log(scopes.keyword.control.conditional); // "keyword.control.conditional"
console.log(scopes.keyword.control.conditional('js')); // "keyword.control.conditional.js"

// Snake_case to kebab-case conversion
console.log(scopes.comment.line.double_slash); // "comment.line.double-slash"
console.log(scopes.entity.name.class.forward_decl); // "entity.name.class.forward-decl"
```

## Type Safety Features

The scope system provides full TypeScript support:

### Compile-time Type Checking

```typescript
const myScopes = scopesFor({ suffix: 'lang', allowScopeExtension: false });

// ✅ Valid scope paths
myScopes.keyword.control.conditional;
myScopes.string.quoted.double;
myScopes.comment.line.double_slash;

// ❌ Invalid scope paths (TypeScript errors)
// myScopes.invalid.path.here;
// myScopes.keyword.invalid.property;
```

### Autocomplete and IntelliSense

Your editor will provide full autocomplete for all scope properties:

- `myScopes.keyword.` → shows `control`, `operator`, `other`
- `myScopes.keyword.control.` → shows `conditional`, `exception`, `flow`, etc.
- `myScopes.string.quoted.` → shows `single`, `double`, `triple`

### Hover Documentation

Hover over any scope to see its full path and type information.

## Best Practices

### 1. Prefer Static Scopes

Use static scopes unless you specifically need dynamic extension:

```typescript
// ✅ Recommended for production
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });

// ⚠️ Only when needed
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: true });
```

### 2. Use Descriptive Suffixes

Choose clear, standard language identifiers:

```typescript
// ✅ Good
scopesFor({ suffix: 'typescript' })
scopesFor({ suffix: 'python' })
scopesFor({ suffix: 'rust' })

// ❌ Avoid
scopesFor({ suffix: 'ts' })
scopesFor({ suffix: 'py' })
scopesFor({ suffix: 'rs' })
```

### 3. Organize Custom Scopes Logically

Group related custom scopes under appropriate categories:

```typescript
const scopes = scopesFor({ suffix: 'mylang' }, {
  meta: {
    // Language structure scopes
    section: { header: null, body: null },
    block: { begin: null, end: null }
  },
  entity: {
    // Custom entity types
    name: { 
      custom_type: null,
      special_identifier: null 
    }
  }
});
```

### 4. Follow TextMate Naming Conventions

Stick to established TextMate scope naming patterns:

- `keyword.control.*` for control flow keywords
- `string.quoted.*` for string literals
- `comment.line.*` for line comments
- `entity.name.*` for identifiers and names
- `constant.numeric.*` for numeric literals

See the [TextMate scope naming conventions](https://macromates.com/manual/en/language_grammars#naming_conventions) for complete guidelines.

## Performance Considerations

### Static vs Callable Scopes

| Pattern | Performance | Flexibility | Use Case |
|---------|-------------|-------------|----------|
| Static (`false`) | ⭐⭐⭐⭐⭐ | ⭐⭐ | Production grammars |
| On-leafs (`"on-leafs"`) | ⭐⭐⭐⭐ | ⭐⭐⭐ | Balanced approach |
| Callable (`true`) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Development/extensible |

### Bundle Size Impact

Static scopes result in smaller bundles because:
- No function objects are created
- Better tree-shaking opportunities
- Simpler object structures

## Migration Guide

If you're updating from an older version:

### Old Pattern
```typescript
// Old complex API
const scopes = scopesFor('mylang');
const customScopes = scopesFor({ suffix: 'mylang' }, { custom: { token: null } });
```

### New Pattern
```typescript
// New simplified API
const scopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false });
const customScopes = scopesFor({ suffix: 'mylang', allowScopeExtension: false }, { 
  custom: { token: null } 
});
```

The new API is more explicit about extension behavior and provides better performance defaults.

## Examples

Check out these complete examples:

- [Simple Example](../examples/simple-example.ts) - Basic static scopes usage
- [Features Demo](../examples/scope-features-demo.ts) - Comprehensive feature showcase
- [Bicep Language](../examples/tmgrammar-toolkit/bicep.ts) - Real-world language example
- [TypeSpec Language](../examples/tmgrammar-toolkit/typespec.ts) - Another real-world example

## Further Reading

- [TMGrammar Toolkit API Reference](./api-reference.md)
- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [VSCode Syntax Highlighting Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide) 