# Grammar and Generated Files Removal Plan

## Overview

This document outlines the implementation plan for removing Langium grammar dependencies and generated files while maintaining full LSP functionality using the custom lexer/parser approach.

## Analysis Summary

### ✅ **Current Status - What Works**
- **Custom Lexer/Parser**: Fully implemented and functional (`src/parser/`)
- **Bridge AST**: Complete with type guards (`src/generated/ast.ts`)
- **LSP Services**: All working with custom AST via bridge pattern
- **Module System**: Updated to remove grammar dependencies

### ❌ **Issues Identified and Fixed**

#### 1. **Broken Generated Module Dependencies**
**Problem**: `src/rcl-module.ts` imported non-existent generated modules:
```typescript
// BROKEN - these don't exist:
import { RclLanguageGeneratedModule, RclTestLanguageGeneratedModule, RclGeneratedSharedModule } from './generated/module.js';
```

**Solution**: ✅ **FIXED** - Removed imports and module injections

#### 2. **Redundant RclCustomTokenBuilder**
**Problem**: `src/services/rcl-custom-token-builder.ts` was designed for Langium grammar-based tokens but you have a complete custom lexer.

**Status**: ⚠️ **Should be removed** - conflicts with custom lexer approach

#### 3. **Missing RclAstReflection**
**Problem**: Langium typically generates an `AstReflection` class for type metadata.

**Solution**: ✅ **IMPLEMENTED** - Added `RclAstReflection` utility class

## Files Ready for Removal

### Grammar Files (Safe to Remove)
```
src/grammar/                    # Entire directory
├── README.md
├── core/
│   ├── ast-nodes.langium
│   ├── embedded-code.langium
│   ├── import.langium
│   ├── primitives.langium
│   └── sections.langium
├── data-types/
│   ├── collections.langium
│   ├── parameters.langium
│   └── type-tag.langium
├── rcl-tests.langium
├── rcl.langium
└── specialized/
    ├── configuration.langium
    ├── flow-rules.langium
    ├── messages.langium
    ├── rich-cards.langium
    ├── shortcuts.langium
    └── suggestions.langium

src/rcl-grammar.langium         # Generated grammar file
src/rcl-test-grammar.langium    # Test grammar file
```

### Generated Files (ENTIRE DIRECTORY to be removed)
```
src/generated/                  # ⚠️ ENTIRE directory will be removed
├── ast.ts                     # → moved to src/ast/bridge/langium-ast.ts + type-guards.ts
├── grammar.ts                 # → moved to src/ast/bridge/reflection.ts
└── module.ts                  # → not needed anymore
```

### AST Files (To be Consolidated)
```
src/parser/rcl-simple-ast.ts   # → merged into src/ast/
src/parser/ast/                # → consolidated into src/ast/
├── core/
├── flow-system/
├── sections/
├── shortcuts/
└── values/
```

### Legacy Service Files (Should be Removed)
```
src/services/rcl-custom-token-builder.ts  # ⚠️ Conflicts with custom lexer
```

### Build Scripts (Can be Removed)
```
scripts/bundle-grammar.ts       # No longer needed
```

## Implementation Steps

### Phase 1: Remove Conflicting Services ✅ **COMPLETED**

**Status**: ✅ **DONE**
- ✅ Updated `src/rcl-module.ts` to remove grammar dependencies
- ✅ Added `RclAstReflection` utility class
- ✅ Added custom lexer/parser to service registry

### Phase 2: AST Consolidation ⚠️ **CRITICAL STEP**

**IMPORTANT**: We discovered that your `src/parser/ast/` directory has a different structure than `src/parser/rcl-simple-ast.ts` and conflicts with `src/generated/`. This must be resolved first.

See detailed plan: `/home/ubuntu/rcl/notes/ast-merge-implementation-plan.md`

**Summary**:
```bash
# Create new consolidated AST structure
mkdir -p src/ast/{core,sections,values,flow-system,shortcuts,bridge}

# Merge and consolidate AST types (manual process - see detailed plan)
# - Resolve naming conflicts (BaseAstNode vs AstNode, SourceLocation vs Location)
# - Merge RclFile interfaces (sections vs agentDefinition)
# - Consolidate all value types
# - Move type guards and reflection utilities

# Update all imports from:
# - './generated/ast.js' → './ast/index.js' 
# - './parser/rcl-simple-ast.js' → './ast/index.js'
# - './parser/ast/' → './ast/'
```

### Phase 3: Remove RclCustomTokenBuilder

```bash
# Remove the conflicting token builder
rm src/services/rcl-custom-token-builder.ts

# Check for any remaining references
grep -r "RclCustomTokenBuilder" src/
```

### Phase 4: Remove Grammar and Generated Files

```bash
# Remove grammar directory
rm -rf src/grammar/

# Remove generated grammar files
rm src/rcl-grammar.langium
rm src/rcl-test-grammar.langium

# Remove ENTIRE generated directory (after AST merge)
rm -rf src/generated/

# Remove old AST files (after consolidation)
rm src/parser/rcl-simple-ast.ts
rm -rf src/parser/ast/

# Remove bundling script
rm scripts/bundle-grammar.ts
```

### Phase 4: Update Package Scripts

Remove grammar-related scripts from `package.json`:

```json
{
  "scripts": {
    // REMOVE these:
    "bundle:grammar": "bun run scripts/bundle-grammar.ts",
    "bundle:grammar-test": "bun run scripts/bundle-grammar.ts --test", 
    "build:lang": "nr bundle:grammar && langium generate",
    "build:lang-test": "nr bundle:grammar-test && langium generate",
    "dev:lang": "chokidar 'src/grammar/**/*' -c 'nr bundle:grammar && langium generate'",
    "dev:lang-test": "chokidar 'src/grammar/**/*' -c 'nr bundle:grammar-test && langium generate'",
    
    // UPDATE these:
    "build": "nr clean && nr build:lsp && nr build:syntax", // Remove && nr build:lang
    "dev": "concurrently -k -n lsp,syntax -c yellow,green 'nr dev:lsp' 'nr dev:syntax'" // Remove lang watcher
  }
}
```

### Phase 5: Update Documentation

Update files that reference grammar development:

**File**: `src/parser/README.md`
- Remove references to Langium grammar integration
- Focus on custom parser architecture

**File**: `README.md` 
- Update build instructions
- Remove grammar generation steps

**File**: `CLAUDE.md`
- Update development commands
- Remove grammar workflow sections

## Testing After Removal

### 1. **Build Verification**
```bash
bun run clean
bun run build
# Should complete without errors
```

### 2. **LSP Functionality Test**
```bash
bun run test
# All LSP services should work
```

### 3. **Syntax Generation Test**
```bash
bun run build:syntax
# TextMate syntax should still generate
```

### 4. **Service Integration Test**
- Hover provider should work
- Completion should work  
- Validation should work
- All using custom AST via bridge

## Dependencies After Removal

### ✅ **What Stays**
- **Custom Parser System**: `src/parser/` (lexer, parser, token-builder - but NOT ast/)
- **Consolidated AST**: `src/ast/` (NEW - replaces generated/, parser/ast/, rcl-simple-ast.ts)
- **LSP Services**: `src/lsp/` (all files)
- **Service Registry**: `src/services/` (except token builder)
- **Validation System**: `src/validation/` (all files)
- **JSON Conversion**: `src/services/json-conversion/` (all files)

### ❌ **What Goes**
- **Grammar System**: All `.langium` files
- **Grammar Bundling**: Scripts and build steps
- **Generated Directory**: ENTIRE `src/generated/` directory
- **Fragmented AST**: `src/parser/rcl-simple-ast.ts` and `src/parser/ast/`
- **Conflicting Services**: RclCustomTokenBuilder

## Benefits After Removal

### 🚀 **Immediate Benefits**
- **Faster builds**: No grammar generation step
- **Simpler development**: No grammar/code synchronization
- **Reduced complexity**: 50% fewer files to maintain
- **Better error messages**: Direct from custom parser

### 🎯 **Long-term Benefits**
- **Full parsing control**: Can implement any RCL feature
- **Performance optimization**: Custom parser can be optimized
- **Easier debugging**: Direct access to parsing logic
- **Language evolution**: Can extend RCL without grammar constraints

## Risk Mitigation

### 🛡️ **Safety Measures**
1. **Incremental Removal**: Remove files in phases with testing
2. **Git Backup**: Tag current state before removal
3. **Rollback Plan**: Keep grammar files in separate branch initially
4. **Test Coverage**: Verify all functionality before each removal step

### ⚠️ **Potential Issues**
1. **Missing Dependencies**: Some LSP services might expect grammar metadata
2. **Type Mismatches**: Bridge AST might need adjustments
3. **Performance Changes**: Custom parser might have different characteristics

### 🔧 **Monitoring Points**
- Build time changes
- Memory usage in language server
- Response time for LSP features
- Error reporting quality

## Success Criteria

### ✅ **Functional Requirements**
- All LSP services continue working
- Custom parser handles all RCL syntax
- Bridge AST provides complete type safety
- Validation and error reporting unchanged
- TextMate syntax generation works

### ✅ **Quality Requirements**
- Build time reduced by >30%
- No functionality regressions
- Maintained code coverage
- Documentation updated
- Clean codebase with no dead files

### ✅ **Performance Requirements**
- LSP response time unchanged or improved
- Memory usage stable or reduced
- Parser performance maintained or improved

## Current Implementation Status

### ✅ **Completed**
- Updated `rcl-module.ts` to remove grammar dependencies
- Added `RclAstReflection` utility class  
- Integrated custom lexer/parser into service registry
- Identified files ready for removal

### 🔄 **Next Steps**
1. Remove `RclCustomTokenBuilder`
2. Remove grammar files and directories
3. Update package.json scripts
4. Update documentation
5. Comprehensive testing

---

**The foundation is ready.** Your custom parser approach is fully functional and the grammar system can be safely removed. This will simplify your codebase and give you complete control over RCL language parsing.