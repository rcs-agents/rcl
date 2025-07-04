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
import { RclLexer } from './rcl-custom-lexer.js';

const lexer = new RclLexer();
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
const allTokens = RclLexer.getAllTokens();

// Create multi-mode lexer definition
const lexerDefinition = RclLexer.createMultiModeLexerDefinition();
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

## Import Resolution Logic (Phase 6)

The custom parser supports advanced import statements with multi-level namespace paths and space-separated aliases. Import resolution is performed by the static method `RclParser.resolveImportPath`.

### Import Resolution Rules
- **Case-insensitive**: Import paths are matched case-insensitively.
- **Ambiguity**: If two or more possible resolutions exist, an error is thrown.
- **Project-rooted**: The import path is resolved relative to the project root, defined as the closest folder up the hierarchy containing either an `rclconfig.yml` or a `config/rcl.yml` file; if none, the current file's folder is used.

### Examples
- `import Shared / Common Flows / Retail` resolves to:
  - `shared/common flows/retail.rcl` (exact match)
  - `shared/common-flows/retail.rcl` (dash variant)
  - `shared/common_flows/retail.rcl` (underscore variant)

- `import Shared / Common Flows / Retail / Catalog` resolves to:
  - Section `Catalog` in `shared/common flows/retail.rcl`
  - Section `Catalog` in `shared/common-flows/retail.rcl`
  - Section `Catalog` in `shared/common_flows/retail.rcl`

## Web Compatibility

The RCL parser is designed to work in both Node.js and web environments. The filesystem utilities have been moved to a dedicated `utils/filesystem.js` module for better separation of concerns.

### Node.js Environment (Automatic Detection)

In Node.js, the filesystem utilities automatically detect and use the real filesystem APIs:

```typescript
import { RclParser } from './rcl-custom-parser.js';
import { resolveImportPath } from '../utils/filesystem.js';

const parser = new RclParser();
const result = parser.parse(rclSource);

// Import resolution works automatically with real filesystem
const resolved = resolveImportPath(['Utils'], { 
  currentFilePath: '/project/src/main.rcl' 
});
```

### Web Environment (Custom Filesystem)

In web environments (browser, web workers), filesystem operations use a web-compatible mock:

```typescript
import { RclParser } from './rcl-custom-parser.js';
import { resolveImportPath, webFileSystemMock } from '../utils/filesystem.js';

const parser = new RclParser();
const result = parser.parse(rclSource); // Basic parsing works without filesystem

// For import resolution, use the built-in web mock or provide custom implementation
const webFileSystem = {
  existsSync: (path: string) => {
    // Your logic to check if files exist (e.g., from a virtual filesystem)
    return virtualFileSystem.has(path);
  },
  join: (...paths: string[]) => paths.join('/').replace(/\/+/g, '/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
  resolve: (path: string) => path.startsWith('/') ? path : '/' + path
};

const resolved = resolveImportPath(['Utils'], {
  currentFilePath: '/project/src/main.rcl',
  fileSystem: webFileSystem
});

// Or use the built-in web mock for testing
const resolvedWithMock = resolveImportPath(['Utils'], {
  currentFilePath: '/project/src/main.rcl',
  fileSystem: webFileSystemMock
});
```

### Custom Filesystem Interface

The filesystem utilities provide a clean interface that you can implement for specialized environments:

```typescript
import { type FileSystemInterface, resolveImportPath } from '../utils/filesystem.js';

// Example: Virtual filesystem for testing
const testFileSystem: FileSystemInterface = {
  existsSync: (path: string) => testFiles.includes(path),
  join: (...paths: string[]) => paths.join('/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
  resolve: (path: string) => path
};

// Use with import resolution
const resolved = resolveImportPath(['MyModule'], {
  currentFilePath: '/test/main.rcl',
  fileSystem: testFileSystem
});
```

### Backward Compatibility

For backward compatibility, the parser still provides static access to the utilities:

```typescript
import { RclParser } from './rcl-custom-parser.js';

// Still works, but deprecated - prefer importing from utils/filesystem.js
const resolved = RclParser.resolveImportPath(['Utils'], {
  currentFilePath: '/project/src/main.rcl'
});
```

This design ensures the parser works seamlessly across different JavaScript environments while maintaining full functionality where filesystem access is available. 