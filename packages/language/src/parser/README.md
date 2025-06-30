# RCL Custom Lexer

This directory contains a custom lexer implementation for the RCL language, built from scratch to handle the specific requirements that the generated Langium/Chevrotain lexer struggles with.

## Files

- `rcl-custom-lexer.ts` - The main custom lexer implementation
- `rcl-custom-lexer.test.ts` - Test suite to demonstrate functionality
- `rcl-token-builder.ts` - The existing extended Langium token builder (for comparison)

## Why a Custom Lexer?

The RCL language has several features that are difficult to handle with standard grammar-generated lexers:

1. **Indentation-aware syntax** - Requires INDENT/DEDENT tokens
2. **Space-separated identifiers** - Like "BMW Customer Service" or "Contact Support Flow"
3. **Multi-mode lexing** - Different token priorities in different contexts
4. **Embedded expressions** - `$js>` and `$ts>` with complex content
5. **Multi-line strings** - With chomping markers (`|`, `|-`, `+|`, `+|+`)
6. **Type tags** - `<email user@example.com>` syntax
7. **Keyword vs identifier conflicts** - Context-sensitive tokenization

## Key Features of the Custom Lexer

### 1. Indentation Handling
- Maintains an indentation stack to generate INDENT/DEDENT tokens
- Handles mixed spaces and tabs (tabs = 8 spaces)
- Properly handles empty lines and comments

### 2. Multi-Mode Lexing
- **Default mode**: Standard RCL tokenization
- **Type tag mode**: Prioritizes type keywords over general identifiers
- Mode transitions based on context (entering `<` brackets)

### 3. Space-Separated Identifiers
- Uses regex pattern: `/[A-Z]([A-Za-z0-9-]|(\s(?=[A-Z0-9]))*/`
- Captures identifiers like "BMW Customer Service" as single tokens
- Avoids parsing ambiguity between spaces in identifiers vs. separators

### 4. Embedded Expressions
- **Single-line**: `$js> expression` or `$ts> expression`
- **Multi-line**: `$js>>>` followed by indented block
- Captures the entire expression content as a single token

### 5. Multi-line Strings
- Detects chomping markers (`|`, `|-`, `+|`, `+|+`)
- Extracts indented content blocks
- Preserves or trims whitespace based on marker type

## Token Types

The lexer defines comprehensive token types including:

- **Keywords**: `agent`, `flow`, `messages`, `import`, etc.
- **Identifiers**: Space-separated proper nouns
- **Literals**: Strings, numbers, atoms (`:symbol`)
- **Type tags**: `email`, `phone`, `url`, etc.
- **Boolean/Null**: `True`, `False`, `Null`, `None`, etc.
- **Punctuation**: `->`, `:`, `,`, `<`, `>`, etc.
- **Special**: `INDENT`, `DEDENT`, expressions, multi-line strings

## Usage

### Standalone Testing

```typescript
import { RclCustomLexer } from './rcl-custom-lexer.js';

const lexer = new RclCustomLexer();
const result = lexer.tokenize(`
agent BMW Customer Service
  displayName: "BMW Support Agent"
  flow Welcome Flow
    :start -> "Hello from BMW!"
`);

console.log('Tokens:', result.tokens);
console.log('Errors:', result.errors);
```

### Integration with Langium (Future)

The lexer provides static methods for Langium integration:

```typescript
// Get all token types for Langium
const allTokens = RclCustomLexer.getAllTokens();

// Create multi-mode lexer definition
const lexerDefinition = RclCustomLexer.createMultiModeLexerDefinition();
```

## Testing

Run the test suite to see how the lexer handles various RCL constructs:

```bash
cd packages/language/src/parser
bun run rcl-custom-lexer.test.ts
```

The test suite covers:
- Basic tokenization
- Indentation handling
- Embedded expressions
- Type tags
- Keywords vs identifiers
- Message shortcuts
- Space-separated identifiers
- Error handling

## Implementation Details

### Token Matching Algorithm

1. **Skip whitespace and comments** (unless at start of line for indentation)
2. **Handle indentation** at start of line (generate INDENT/DEDENT)
3. **Try pattern matching** against all token types in priority order
4. **Handle mode transitions** (entering/exiting type tags)
5. **Special handling** for multi-line constructs (expressions, strings)
6. **Error recovery** for unrecognized characters

### Indentation Algorithm

1. Calculate indentation level of current line
2. Compare with top of indentation stack
3. If greater: push new level, emit INDENT
4. If equal: continue normally
5. If less: pop stack levels, emit DEDENT for each pop
6. At end of file: emit DEDENT for all remaining levels

### Multi-line Content Extraction

For expressions (`$js>>>`) and strings (`|`):
1. Find the marker line
2. Determine minimum indentation level for the block
3. Extract all subsequent lines with >= indentation
4. Create single token with the extracted content
5. Update lexer position to end of block

## Future Integration

To integrate with Langium:

1. **Replace the token builder** in the Langium service configuration
2. **Provide custom tokens** via `getAllTokens()`
3. **Configure multi-mode lexing** if needed
4. **Update grammar rules** to use the new token names
5. **Test thoroughly** with existing RCL files

The custom lexer is designed to be a drop-in replacement that produces the correct tokens for the existing Langium parser, fixing the tokenization issues without requiring major grammar changes. 