# RCL Auto-Completion Guide

## Overview

RCL provides rich auto-completion capabilities through Langium's Language Server Protocol (LSP) integration. This works seamlessly across:

- **VS Code** (desktop and web)
- **Monaco Editor** (web applications)
- **Any LSP-compatible IDE** (IntelliJ, Eclipse, etc.)

## How It Works

### 1. Simple Grammar + Smart Completion

The grammar stays simple and flexible:

```langium
Property: name=COMMON_NOUN ':' value=Value;
AgentDefinition: 'agent' name=ProperNoun NL INDENT (properties+=Property)* DEDENT;
```

The `RclCompletionProvider` adds intelligence:

```typescript
// Suggests RCS specification properties with rich documentation
completeAgentPropertyNames(context, acceptor) {
    for (const [propName, propInfo] of Object.entries(RCS_AGENT_PROPERTIES)) {
        acceptor(context, {
            label: propName,
            detail: `${propInfo.type}${propInfo.required ? ' (required)' : ' (optional)'}`,
            documentation: propInfo.description + examples,
            sortText: propInfo.required ? `0_${propName}` : `1_${propName}`
        });
    }
}
```

### 2. Context-Aware Suggestions

**Property Names:**
- When typing inside an `agent` block, suggests valid RCS properties
- Shows required properties first (`displayName`, etc.)
- Filters out already-defined properties to avoid duplicates
- Provides rich documentation with examples

**Property Values:**
- For string properties: suggests `""` with cursor positioning
- For complex types: suggests block structure with snippets
- Context-aware based on property type from RCS specification

**Keywords:**
- Suggests `agent` and `import` at file level
- Context-sensitive keyword completion

### 3. Rich Documentation

Each completion item includes:
- **Label**: Property name or keyword
- **Detail**: Type information and requirement status
- **Documentation**: Markdown description with examples
- **Examples**: Code snippets showing proper usage

## Features Provided

### ✅ Property Name Completion
```rcl
agent MyBot
  dis|  // Auto-completes to "displayName" with rich docs
```

### ✅ Smart Sorting
- Required properties appear first
- Optional properties follow
- Prevents duplicate property suggestions

### ✅ Type-Aware Value Completion
```rcl
agent MyBot
  displayName: |  // Suggests "" with cursor inside quotes
  config: |       // Suggests "config { }" snippet
```

### ✅ Rich Documentation
- Hovering over suggestions shows full RCS specification details
- Examples and usage patterns included
- Requirement status clearly indicated

### ✅ Cross-Platform Support
- Works in VS Code desktop
- Works in VS Code for web
- Works in Monaco editor
- Works in any LSP-compatible editor

## Integration Points

### VS Code Extension
The extension automatically provides completion through the language server:

```json
// package.json
{
  "contributes": {
    "languages": [{
      "id": "rcl",
      "extensions": [".rcl"]
    }]
  }
}
```

### Monaco Editor (Web)
For web applications using Monaco:

```typescript
import { createRclServices } from '@rcl/language';

const services = createRclServices(EmptyFileSystem);
// Monaco automatically uses the completion provider via LSP
```

### Langium Registration
The completion provider is registered in the service module:

```typescript
export const RclModule = {
  lsp: {
    CompletionProvider: (services) => new RclCompletionProvider(services)
  }
};
```

## Benefits of This Approach

1. **Specification-Driven**: Completion suggestions come from RCS spec
2. **Maintainable**: Update spec → auto-completion updates automatically  
3. **Rich UX**: Full documentation, examples, and type information
4. **Universal**: Works across all LSP-compatible editors
5. **Context-Aware**: Different suggestions based on current editing context
6. **No Grammar Pollution**: Keeps grammar simple while providing rich editing experience

## Future Enhancements

- **Dynamic Loading**: Load RCS specification from external JSON schema
- **Multi-Object Support**: Different completions for agents, messages, flows
- **Template Snippets**: Full object templates with placeholders
- **Cross-Reference Completion**: Suggest available imports and references
- **Validation Integration**: Show completion items with validation status

This architecture provides the best of both worlds: a simple, maintainable grammar with sophisticated editing support that rivals purpose-built IDEs. 