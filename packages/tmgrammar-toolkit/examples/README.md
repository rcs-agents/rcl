# tmgrammar-toolkit Examples

This directory contains examples demonstrating how to use the `tmgrammar-toolkit` package to create TextMate grammars.

## Examples

### 📁 Converted Examples

These examples were converted from the original `tmlanguage-generator` format to use our unified `tmgrammar-toolkit` API:

#### 🔧 `bicep-example.ts`
- **Original**: `to-convert/bycep.tm.ts` (from tmlanguage-generator)
- **Language**: Bicep (Azure Resource Manager DSL)
- **Features Demonstrated**:
  - Keywords and identifiers
  - String literals with interpolation
  - Comments (line and block)
  - Numeric literals
  - Function calls and decorators
  - Object and array literals
  - Lambda expressions

#### 🔧 `typespec-example.ts`  
- **Original**: `to-convert/typespec.tm.ts` (from tmlanguage-generator)
- **Language**: TypeSpec (API definition language)
- **Features Demonstrated**:
  - Complex recursive patterns
  - Doc comments with tags
  - Type annotations and generics
  - Template expressions
  - Multiple punctuation types
  - Namespace and import statements
  - Model definitions and interfaces

### 📁 Basic Examples

#### 🔧 `simple-example.ts`
- **Purpose**: Demonstrates the basic unified API
- **Features**: Simple language with comments, strings, keywords, and numbers

### 📁 Testing

#### 🧪 `test-converted-examples.ts`
- **Purpose**: Validates that converted examples produce valid TextMate grammars
- **Usage**: `bun run examples/test-converted-examples.ts`

## Key Conversion Changes

### From `tmlanguage-generator` to `tmgrammar-toolkit`

1. **Import Changes**:
   ```typescript
   // Before
   import * as tm from "tmlanguage-generator";
   
   // After  
   import { tmToolkit, authoring } from '../src/index.js';
   ```

2. **Pattern Creation**:
   ```typescript
   // Before
   const rule: MatchRule = {
     key: "keyword",
     scope: "keyword.control.declaration.bicep",
     match: bounded(`(${keywords.join("|")})`),
   };
   
   // After
   const keywordPattern = tmToolkit.keywords({
     keywords,
     scopeName: 'keyword.control.declaration.bicep'
   });
   ```

3. **Grammar Creation**:
   ```typescript
   // Before
   const grammar: Grammar = {
     $schema: tm.schema,
     name: "Bicep",
     scopeName: "source.bicep",
     fileTypes: [".bicep", ".bicepparam"],
     patterns: withComments([expression]),
   };
   
   // After
   export const bicepGrammar = tmToolkit.grammar(
     'Bicep',
     'source.bicep',
     ['.bicep', '.bicepparam'],
     [comments, expression]
   );
   ```

## Running Examples

### Build Examples
```bash
bun run build
```

### Test Examples
```bash
bun run examples/test-converted-examples.ts
```

### Generate Grammar Files
```bash
# Generate Bicep grammar
bun run examples/bicep-example.ts

# Generate TypeSpec grammar  
bun run examples/typespec-example.ts
```

## Benefits of Conversion

✅ **Unified API**: Single import for all TextMate functionality  
✅ **Type Safety**: Full TypeScript support with comprehensive types  
✅ **Simplified Syntax**: Less boilerplate, more readable patterns  
✅ **Consistent Interface**: Same API patterns across all grammar types  
✅ **Better Testing**: Built-in validation and testing utilities  
✅ **Modular**: Use unified API or import specific modules as needed  

## Next Steps

- Add more complex examples demonstrating advanced features
- Create examples for embedded languages and injections
- Add performance benchmarks comparing different approaches
- Create templates for common language patterns 