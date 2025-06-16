# Indentation-Aware Langium Configuration

## Overview
Configured the RCL Langium project to support indentation-sensitive parsing, similar to Python, YAML, and other indentation-based languages.

## Important: Hidden WS Terminal Compatibility

**Yes, hidden WS terminals are compatible and REQUIRED for indentation-aware parsing.**

The `IndentationAwareTokenBuilder` expects:
- `hidden terminal WS: /[\t ]+/;` (tabs and spaces only)
- `hidden terminal NL: /[\r\n]+/;` (newlines only) 
- `terminal INDENT: 'synthetic:indent';`
- `terminal DEDENT: 'synthetic:dedent';`

The key is that the `IndentationAwareTokenBuilder` modifies the behavior of these tokens internally, but they must be defined as hidden terminals in the grammar.

## Changes Made

### 1. Grammar Changes (`packages/language/src/grammar/data-types/primitives.langium`)
- Added `INDENT` and `DEDENT` terminals for indentation detection
- These terminals use synthetic content that will be replaced by the IndentationAwareTokenBuilder

```langium
terminal INDENT: 'synthetic:indent';     // Indentation increase
terminal DEDENT: 'synthetic:dedent';     // Indentation decrease
```

### 2. Terminal Updates (`packages/language/src/grammar/terminals.langium`)
- Modified `WS` terminal to only match tabs and spaces (not newlines)
- Made it hidden since whitespace shouldn't appear in the AST
- This separation is required for proper indentation detection

```langium
hidden terminal WS: /[\t ]+/;  // Whitespace (tabs and spaces only)
```

### 3. Module Configuration (`packages/language/src/rcl-module.ts`)
- Added imports for `IndentationAwareTokenBuilder` and `IndentationAwareLexer`
- Configured the parser services to use indentation-aware components

```typescript
import { IndentationAwareTokenBuilder, IndentationAwareLexer } from 'langium';

export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    parser: {
        TokenBuilder: () => new IndentationAwareTokenBuilder(),
        Lexer: (services) => new IndentationAwareLexer(services),
    },
    // ... other services
};
```

### 4. VSCode Extension Configuration (`packages/extension/language-configuration.json`)
- Updated comment syntax to use `#` instead of `//` (matching the SL_COMMENT terminal)
- Added indentation rules for better editing experience

```json
{
    "comments": {
        "lineComment": "#"
    },
    "indentationRules": {
        "increaseIndentPattern": ":[ \t]*$",
        "decreaseIndentPattern": "^[ \t]*$"
    }
}
```

## How to Use in Grammar

To create indentation-based blocks in your grammar rules, use the `INDENT` and `DEDENT` tokens:

```langium
BlockStatement:
    header=StatementHeader ':'
        INDENT statements+=Statement+
        DEDENT;
```

## Configuration Options

The `IndentationAwareTokenBuilder` supports several configuration options:

- `indentTokenName`: Name of indent token (default: 'INDENT')
- `dedentTokenName`: Name of dedent token (default: 'DEDENT')  
- `whitespaceTokenName`: Name of whitespace token (default: 'WS')
- `ignoreIndentationDelimiters`: Token pairs where indentation is ignored

Example with custom configuration:
```typescript
new IndentationAwareTokenBuilder({
    ignoreIndentationDelimiters: [
        ['[', ']'],  // Ignore indentation between brackets
        ['(', ')'],  // Ignore indentation between parentheses
    ],
})
```

## Notes
- The existing `NL` terminal for newlines was already properly configured
- Regenerated Langium files using `bun run langium:generate`
- Built the project using `bun run build`

## Troubleshooting

### Error: "Some indentation/whitespace tokens not found!"

This error occurred when first implementing indentation-awareness. The issues were:

**CRITICAL: Terminal Inclusion Issue** - The most important fix was discovering that indentation terminals must be used in actual grammar rules to be included in the token vocabulary.

**Problem**: Even though `INDENT` and `DEDENT` terminals were defined, they weren't being included in the generated `RclTerminals` object because they weren't used in any grammar rules. The `IndentationAwareTokenBuilder` looks for these tokens by name but couldn't find them.

**Solution**: Use the indentation terminals in an actual grammar rule where indentation makes semantic sense:
```langium
// In flow-schema.langium
FlowSchema infers FlowSchema:
    'flow' name=PROPER_NOUN
        INDENT rules+=FlowRule+
        DEDENT;
```

**Discovery**: By analyzing the Langium source code provided by the user, we found that the error occurs in the `buildTokens` method when it can't find the required tokens:
```typescript
if (!dedent || !indent || !ws) {
    throw new Error('Some indentation/whitespace tokens not found!');
}
```

Other issues were:

1. **Hidden Terminal Usage in Rules**: The main grammar file had explicit `WS?` usage in rules:
   ```langium
   ImportStatement: 'import' WS? source=QualifiedName WS? ('as' WS? alias=PROPER_NOUN)?;
   ```
   
   **Solution**: Remove explicit WS references since hidden terminals are handled automatically:
   ```langium
   ImportStatement: 'import' source=QualifiedName ('as' alias=PROPER_NOUN)?;
   ```

2. **Outdated Type References**: Test and CLI files were importing `Model` and `isModel` which were renamed to `RclFile` and `isRclFile` after grammar changes.
   
   **Solution**: Updated all imports and type references:
   ```typescript
   // Before
   import type { Model } from 'rcl-language';
   import { isModel } from 'rcl-language';
   
   // After  
   import type { RclFile } from 'rcl-language';
   import { isRclFile } from 'rcl-language';
   ```

3. **Grammar Structure Changes**: Tests were trying to access `greetings` and `persons` properties that don't exist in the RclFile structure.
   
   **Solution**: Updated tests to use actual RclFile structure with `agentDefinition`, `flows`, etc.

After these fixes, the Langium generation completed successfully and the indentation-aware tokens (INDENT, DEDENT, WS) were properly generated.

### Error: "rcl client: couldn't create connection to server"

If you still see this error after making the configuration changes, it means the VSCode extension needs to be rebuilt and reinstalled:

**Solution**: Rebuild and reinstall the extension:
```bash
# From packages/extension directory:
bun run build:clean
bun run reinstall-extension
```

This ensures the VSCode extension uses the updated language server with indentation-aware configuration. 