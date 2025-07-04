# AST Merge Implementation Plan

## Overview

This document outlines the plan to merge `src/parser/rcl-simple-ast.ts` into the existing `src/parser/ast/` directory structure and replace the `src/generated/` folder content with manually written code.

## Conflict Analysis

### ✅ **Compatible Interfaces (No Merge Issues)**
- `Position` - Identical in both
- Most value types (`StringValue`, `NumberValue`, `BooleanValue`, `NullValue`) - Very similar
- Flow control types (`FlowOperand`, `WithClause`, `WhenClause`, `FlowTransition`) - Compatible

### ⚠️ **Major Conflicts That Need Resolution**

#### 1. **Naming Inconsistencies**
- `SourceLocation` (simple-ast) vs `Location` (ast/)
- `BaseAstNode` (simple-ast) vs `AstNode` (ast/)

#### 2. **Structure Differences**
- **RclFile**: 
  - simple-ast: `{ imports, sections }`
  - ast/: `{ imports, agentDefinition }`
- **Section**: 
  - simple-ast: Complex with attributes, flowRules, messages
  - ast/: Simple base interface with just name
- **ImportStatement**:
  - simple-ast: `importedNames: string[]`
  - ast/: `importPath: string[]`

#### 3. **Missing Types in ast/ Directory**
- `Attribute`, `MessageDefinition`, `FlowRule`
- Collection types (`ListValue`, `ObjectValue`, `ObjectPair`)
- `TypeTaggedValue`, `EmbeddedExpression`, `EmbeddedCodeBlock`
- `AstUtils` utility class

## Merge Strategy

### Phase 1: Create New Consolidated AST Structure

**Target Structure**:
```
src/ast/                           # New location (replacing both parser/ast/ and generated/)
├── core/
│   ├── base-types.ts             # Consolidated base types
│   ├── file-structure.ts         # Root RCL file structure
│   └── utilities.ts              # AST utilities and type guards
├── sections/
│   ├── section-types.ts          # All section interfaces
│   ├── agent-types.ts            # Agent definition
│   ├── flow-types.ts             # Flow sections and rules
│   └── message-types.ts          # Message definitions
├── values/
│   ├── literal-types.ts          # String, Number, Boolean, Null, Identifier, Atom
│   ├── collection-types.ts       # List, Object, ObjectPair
│   ├── embedded-types.ts         # EmbeddedExpression, EmbeddedCodeBlock
│   └── type-tag-types.ts         # TypeTaggedValue
├── flow-system/
│   ├── flow-control-types.ts     # FlowOperand, WithClause, WhenClause, FlowTransition
│   └── parameter-types.ts        # Parameter
├── shortcuts/
│   ├── message-shortcut-types.ts # Message shortcuts
│   └── suggestion-types.ts       # Suggestion types
├── bridge/
│   ├── langium-ast.ts            # Langium-compatible interfaces
│   ├── type-guards.ts            # Type guard functions
│   └── reflection.ts             # AST reflection utilities
└── index.ts                      # Central export
```

### Phase 2: Implementation Steps

#### Step 1: Create Base Types with Unified Naming
**File**: `src/ast/core/base-types.ts`

```typescript
/**
 * Base AST Types for RCL
 * 
 * Unified base types used throughout the RCL AST.
 */

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

// Keep both names for compatibility during transition
export type Location = SourceLocation;

export interface AstNode {
  type: string;
  location?: SourceLocation;
}

// Keep both names for compatibility during transition  
export type BaseAstNode = AstNode;
```

#### Step 2: Consolidate File Structure
**File**: `src/ast/core/file-structure.ts`

```typescript
import type { AstNode } from './base-types.js';
import type { AgentDefinition } from '../sections/agent-types.js';

/**
 * Root RCL file structure supporting both legacy and formal spec
 */
export interface RclFile extends AstNode {
  type: 'RclFile';
  imports: ImportStatement[];
  
  // Formal specification structure (preferred)
  agentDefinition?: AgentDefinition;
  
  // Legacy structure (for backward compatibility)
  sections?: Section[];
}

export interface ImportStatement extends AstNode {
  type: 'ImportStatement';
  // Support both naming conventions
  importedNames?: string[];  // Legacy from simple-ast
  importPath?: string[];     // Formal spec
  alias?: string;
  source?: string;
}
```

#### Step 3: Create Comprehensive Value Types
**File**: `src/ast/values/literal-types.ts`

```typescript
// Merge the best of both implementations
export type Value = 
  | StringValue 
  | NumberValue 
  | BooleanValue 
  | NullValue 
  | IdentifierValue
  | AtomValue
  | ListValue
  | ObjectValue
  | TypeTaggedValue
  | EmbeddedExpression
  | EmbeddedCodeBlock;

// All the individual value type interfaces...
```

#### Step 4: Create Langium Bridge
**File**: `src/ast/bridge/langium-ast.ts`

```typescript
/**
 * Langium-compatible AST interfaces
 * 
 * These interfaces bridge our custom AST to Langium's expected format
 */

import type { AstNode as LangiumAstNode } from 'langium';
import type * as CustomAst from '../index.js';

export interface RclAstNode extends LangiumAstNode {
  $type: string;
}

// Bridge conversion function
export function bridgeCustomAst(customNode: CustomAst.AstNode): RclAstNode {
  // Implementation from current generated/ast.ts
}

// All the bridge interfaces...
```

#### Step 5: Move Type Guards and Reflection
**File**: `src/ast/bridge/type-guards.ts`
- Move all type guard functions from current `generated/ast.ts`

**File**: `src/ast/bridge/reflection.ts`
- Move `RclAstReflection` class

#### Step 6: Update All Imports

Update all files that import from:
- `./generated/ast.js` → `./ast/index.js`
- `./parser/rcl-simple-ast.js` → `./ast/index.js`
- `./parser/ast/` → `./ast/`

## Implementation Timeline

### Phase 1: Structure Creation (Day 1)
1. Create new `src/ast/` directory structure
2. Migrate and consolidate base types
3. Create unified value type hierarchy
4. Move utilities and type guards

### Phase 2: Bridge Implementation (Day 1)
1. Create Langium bridge interfaces
2. Move and update type guards
3. Move AST reflection utilities
4. Test bridge functionality

### Phase 3: Import Updates (Day 2)
1. Update all import statements across codebase
2. Update module exports
3. Update build configuration
4. Test all functionality

### Phase 4: Cleanup (Day 2)
1. Remove `src/parser/rcl-simple-ast.ts`
2. Remove `src/parser/ast/` directory
3. Remove `src/generated/` directory
4. Update documentation

## Updated Grammar Removal Plan

### What Gets Removed
```
src/generated/                    # ENTIRE directory
├── ast.ts                       # → src/ast/bridge/langium-ast.ts + type-guards.ts
├── grammar.ts                   # → src/ast/bridge/reflection.ts (RclAstReflection)
└── module.ts                    # Not needed

src/parser/rcl-simple-ast.ts     # → merged into src/ast/
src/parser/ast/                  # → consolidated into src/ast/
```

### What Gets Created
```
src/ast/                         # NEW consolidated AST structure
├── core/
├── sections/
├── values/
├── flow-system/
├── shortcuts/
├── bridge/                      # Langium compatibility layer
└── index.ts
```

## Benefits of This Approach

### ✅ **Immediate Benefits**
- **Single source of truth**: One AST definition instead of three
- **Better organization**: Logical grouping by functionality
- **Unified naming**: Consistent interface names
- **Cleaner imports**: Single import point for all AST types

### 🎯 **Long-term Benefits**
- **Maintainability**: Easier to update and extend AST
- **Type safety**: Better TypeScript integration
- **Performance**: Fewer bridge conversions needed
- **Documentation**: Self-documenting structure

## Migration Safety

### 🛡️ **Compatibility Measures**
1. **Alias types**: Keep both old and new names during transition
2. **Gradual migration**: Update imports file by file
3. **Property compatibility**: Support both property names where needed
4. **Type guards**: Maintain all existing type guard functions

### 🔧 **Validation Steps**
1. **Build verification**: Ensure all imports resolve
2. **Type checking**: No TypeScript errors
3. **LSP testing**: All language server features work
4. **Runtime testing**: Parser and services function correctly

## Implementation Commands

### Step 1: Create New Structure
```bash
mkdir -p src/ast/{core,sections,values,flow-system,shortcuts,bridge}
```

### Step 2: Move and Consolidate Files
```bash
# Create consolidated files (manually merge content)
# Update imports across codebase
```

### Step 3: Remove Old Structure
```bash
rm -rf src/generated/
rm -rf src/parser/ast/
rm src/parser/rcl-simple-ast.ts
```

### Step 4: Verify
```bash
bun run build
bun run test
```

---

This plan provides a clean migration path that consolidates all AST definitions into a single, well-organized structure while maintaining backward compatibility during the transition.