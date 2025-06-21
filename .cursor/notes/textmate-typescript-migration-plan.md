# TextMate Grammar TypeScript Migration Plan

## Overview
Migrate the existing modular JSON-based TextMate grammar system to TypeScript for better maintainability, type safety, and DRY principles while preserving the current build system architecture.

## Phase 1: Foundation Setup

### 1.1 Create TypeScript Interfaces
- [ ] Create `packages/language/src/textmate-types.ts`
- [ ] Define core TextMate grammar interfaces:
  - `TMGrammar` - Root grammar structure
  - `TMRule` - Individual grammar rules
  - `TMPattern` - Pattern definitions
  - `TMCapture` - Capture group definitions
  - `TMRepository` - Repository type alias
- [ ] Add utility types for common patterns

### 1.2 Create Shared Constants
- [ ] Create `packages/language/syntaxes/shared/common-patterns.ts`
- [ ] Define reusable patterns:
  - `COMMENT_PATTERN` - Single comment pattern to eliminate repetition
  - `STRING_ESCAPE_PATTERN` - String escape sequences
  - `WHITESPACE_PATTERNS` - Common whitespace handling
  - `SCOPE_PREFIXES` - Standardized scope name prefixes

### 1.3 Update Build Configuration
- [ ] Modify `tsconfig.json` to include syntaxes directory
- [ ] Update `build-tmlanguage.ts` to handle TypeScript imports
- [ ] Add TypeScript compilation step before JSON generation

## Phase 2: Core Module Conversion

### 2.1 Convert Global Patterns (Priority 1)
Convert these first as they're referenced everywhere:
- [ ] `core/comments.tmLanguage.json` → `core/comments.ts`
- [ ] `data-types/primitives.tmLanguage.json` → `data-types/primitives.ts`
- [ ] `data-types/references.tmLanguage.json` → `data-types/references.ts`
- [ ] `embedded/expressions.tmLanguage.json` → `embedded/expressions.ts`

### 2.2 Convert Context Modules (Priority 2)
- [ ] `contexts/file-context.tmLanguage.json` → `contexts/file-context.ts`
- [ ] `contexts/section-context.tmLanguage.json` → `contexts/section-context.ts`
- [ ] `contexts/property-context.tmLanguage.json` → `contexts/property-context.ts`
- [ ] `contexts/flow-context.tmLanguage.json` → `contexts/flow-context.ts`

### 2.3 Convert Supporting Modules (Priority 3)
- [ ] `data-types/collections.tmLanguage.json` → `data-types/collections.ts`
- [ ] `sections/agent-sections.tmLanguage.json` → `sections/agent-sections.ts`
- [ ] `sections/flow-sections.tmLanguage.json` → `sections/flow-sections.ts`
- [ ] `core/keywords.tmLanguage.json` → `core/keywords.ts`
- [ ] `core/identifiers.tmLanguage.json` → `core/identifiers.ts`
- [ ] `core/punctuation.tmLanguage.json` → `core/punctuation.ts`

## Phase 3: Build System Enhancement

### 3.1 Update Module Loading
- [ ] Modify `CONTEXT_MODULES` array in `build-tmlanguage.ts`
- [ ] Change file extensions from `.tmLanguage.json` to `.ts`
- [ ] Update module loading logic to import TypeScript modules instead of reading JSON

### 3.2 Enhance Grammar Assembly
- [ ] Update `addHierarchicalContexts()` function
- [ ] Implement proper TypeScript module imports
- [ ] Add type checking during build process
- [ ] Ensure proper repository merging with TypeScript objects

### 3.3 Remove Legacy JSON Files
- [ ] Delete converted `.tmLanguage.json` files after successful conversion
- [ ] Update `.gitignore` to exclude generated JSON files
- [ ] Clean up any hardcoded JSON file references

## Phase 4: Pattern Deduplication

### 4.1 Eliminate Comment Pattern Repetition
- [ ] Replace all instances of duplicated comment patterns with `{ include: "#comments" }`
- [ ] Remove redundant pattern definitions:
  - `#file-level-comments`
  - `#section-level-comments`
  - `#property-level-comments`
  - `#flow-level-comments`

### 4.2 Consolidate Common Patterns
- [ ] Identify other repeated patterns in the current 1460-line grammar
- [ ] Extract to shared constants or includes
- [ ] Refactor modules to use shared patterns

## Phase 5: Testing & Validation

### 5.1 Build Process Testing
- [ ] Ensure `bun run langium:generate` still works
- [ ] Verify `build-tmlanguage.ts` generates correct JSON output
- [ ] Compare generated grammar with current version for accuracy

### 5.2 Syntax Highlighting Validation
- [ ] Test syntax highlighting in VS Code with converted grammar
- [ ] Verify all RCL language features still highlight correctly
- [ ] Check embedded JavaScript/TypeScript highlighting still works
- [ ] Test against example files in `examples/` directory

### 5.3 Performance Testing
- [ ] Measure grammar compilation time
- [ ] Verify VS Code extension loading performance
- [ ] Check for any regex performance regressions

## Phase 6: Documentation & Cleanup

### 6.1 Update Documentation
- [ ] Update `packages/language/syntaxes/README.md`
- [ ] Document new TypeScript-based workflow
- [ ] Add examples of how to add new patterns

### 6.2 Developer Experience
- [ ] Add VS Code tasks for building grammar
- [ ] Create npm scripts for common operations
- [ ] Add linting rules for TextMate pattern consistency

## Implementation Notes

### File Structure After Migration
~~~
packages/language/syntaxes/
├── shared/
│   ├── common-patterns.ts
│   └── scope-constants.ts
├── core/
│   ├── comments.ts
│   ├── keywords.ts
│   └── ...
├── contexts/
│   ├── file-context.ts
│   └── ...
├── data-types/
│   ├── primitives.ts
│   └── ...
└── rcl.tmLanguage.json (generated)
~~~

### Example TypeScript Module Structure
~~~typescript
// contexts/file-context.ts
import { TMRule } from '../shared/textmate-types';
import { COMMENT_PATTERN } from '../shared/common-patterns';

export const fileContext: Record<string, TMRule> = {
  "file-level-patterns": {
    patterns: [
      { include: "#comments" },
      { include: "#import-statements" },
      { include: "#agent-sections" }
    ]
  },
  "import-statements": {
    // ... specific patterns
  }
};
~~~

### Benefits After Migration
- **Type Safety**: Catch errors at compile time
- **DRY**: Eliminate pattern repetition
- **Maintainability**: Clear, readable TypeScript modules
- **IDE Support**: Autocompletion, refactoring, go-to-definition
- **Consistency**: Standardized scope naming through constants

## Risk Mitigation
- Keep original JSON files until migration is complete and tested
- Implement gradual migration (convert one module at a time)
- Maintain backward compatibility during transition
- Comprehensive testing at each phase 