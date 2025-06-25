# TextMate Grammar TypeScript Migration Plan

## Overview
Create a TypeScript library for TextMate grammar authoring (`tmGrammar`) and migrate the RCL grammar system to use it, with clear separation between the library and language-specific implementations.

## Library Naming
**`tmGrammar`** - A TypeScript library for authoring TextMate grammars with type safety and reusable patterns.

Alternative names considered:
- `tmBuilder` - Emphasizes construction aspect
- `grammarKit` - More generic toolkit name
- `syntaxForge` - Creative but less clear
- `tmGrammar` - Clear, concise, follows TypeScript naming conventions

## Phase 1: Library Foundation (`tmGrammar`)

### 1.1 Create Core Library Structure
- [ ] Create `packages/language/src/tmGrammar/` directory
- [ ] Create `packages/language/src/tmGrammar/index.ts` - Main exports
- [ ] Create `packages/language/src/tmGrammar/types.ts` - Core interfaces
- [ ] Create `packages/language/src/tmGrammar/terminals.ts` - Reusable regex patterns
- [ ] Create `packages/language/src/tmGrammar/builders.ts` - Pattern builder utilities

### 1.2 Define Core TypeScript Interfaces
```typescript
// types.ts
interface TMGrammar {
  name: string;
  scopeName: string;
  fileTypes: string[];
  foldingStartMarker?: string;
  foldingStopMarker?: string;
  firstLineMatch?: string;
  patterns: TMPattern[];
  repository?: TMRepository;
  variables?: Record<string, string>; // Like DISL's variables section
}

interface TMPattern {
  include?: string;
  name?: string;
  match?: string;
  begin?: string;
  end?: string;
  while?: string;
  contentName?: string;
  patterns?: TMPattern[];
  captures?: Record<string, TMCapture>;
  beginCaptures?: Record<string, TMCapture>;
  endCaptures?: Record<string, TMCapture>;
}

interface TMCapture {
  name: string;
  patterns?: TMPattern[];
}

type TMRepository = Record<string, TMRule>;
interface TMRule extends TMPattern {}
```

### 1.3 Create Reusable Terminal Patterns
Focus on complex regex patterns that are commonly needed:
- [ ] `DECIMAL_NUMBER` - Complex decimal number matching
- [ ] `HEX_NUMBER` - Hexadecimal numbers
- [ ] `STRING_ESCAPE_SEQUENCES` - Common escape patterns
- [ ] `IDENTIFIER_PATTERNS` - Various identifier formats
- [ ] `WHITESPACE_PATTERNS` - Whitespace handling
- [ ] `COMMENT_DELIMITERS` - Common comment patterns

```typescript
// terminals.ts
export const TERMINALS = {
  DECIMAL_NUMBER: /(?<!\$)(?:(?:\b[0-9][0-9_]*(\.))?[0-9][0-9_]*([eE][+-]?[0-9][0-9_]*)?(n)?\b(?!\$))/,
  HEX_NUMBER: /\b(?<!\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\b(?!\$)/,
  STRING_ESCAPE: /\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]+\}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.|$)/,
  // ... other complex patterns
} as const;
```

### 1.4 Create Builder Utilities
Helper functions for common pattern construction:
- [ ] `createComment(prefix: string, scopeBase: string)` - Comment pattern builder
- [ ] `createString(quote: string, scopeBase: string)` - String pattern builder
- [ ] `createKeywords(keywords: string[], scopeName: string)` - Keyword pattern builder
- [ ] `createEmbeddedLanguage(marker: string, language: string)` - Embedded language helper

## Phase 2: RCL Grammar Restructure

### 2.1 Create Language-Specific Structure
```
packages/language/syntaxes/rcl/
├── index.ts                    # Main RCL grammar assembly
├── variables.ts               # RCL-specific variables (like DISL's approach)
├── patterns/
│   ├── comments.ts           # RCL comment patterns
│   ├── primitives.ts         # RCL primitive types
│   ├── expressions.ts        # RCL expressions
│   ├── sections.ts           # RCL sections
│   └── embedded.ts           # Embedded JS/TS support
└── contexts/
    ├── file-context.ts       # File-level patterns
    ├── section-context.ts    # Section-level patterns
    └── property-context.ts   # Property-level patterns
```

### 2.2 Define RCL Variables (Inspired by DISL)
```typescript
// variables.ts
export const RCL_VARIABLES = {
  // RCL-specific patterns
  rcl_section_types: '\\b(agent|agentConfig|agentDefaults|flow|messages|message)\\b',
  rcl_proper_noun: '\\b[A-Z](?:[a-zA-Z0-9]*|(?<=\\w)-(?=\\w))*\\b(?:\\s+[A-Z](?:[a-zA-Z0-9]*|(?<=\\w)-(?=\\w))*\\b)*',
  rcl_common_noun: '[a-z][a-zA-Z0-9_]*',
  rcl_atom: ':[a-zA-Z_][a-zA-Z0-9_]*',
  rcl_flow_arrow: '->',
  // ... other RCL-specific patterns
} as const;
```

### 2.3 Convert Existing Modules Using Library
- [ ] Convert comments using `tmGrammar.createComment('#', 'rcl')`
- [ ] Convert primitives using `tmGrammar.TERMINALS` and builders
- [ ] Convert expressions using library patterns
- [ ] Convert sections using structured approach

## Phase 3: Build System Integration

### 3.1 Update Build Process
- [ ] Modify `build-tmlanguage.ts` to import from TypeScript modules
- [ ] Add compilation step for `tmGrammar` library
- [ ] Update module loading to use TypeScript imports
- [ ] Generate final JSON with proper variable substitution

### 3.2 Variable Substitution System
Implement DISL-style variable substitution:
```typescript
// In build process
function substituteVariables(pattern: string, variables: Record<string, string>): string {
  return pattern.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
}
```

## Phase 4: Pattern Deduplication & Optimization

### 4.1 Eliminate Repetition Using Library
- [ ] Replace all comment duplications with single library-generated pattern
- [ ] Use `include` references instead of pattern repetition
- [ ] Consolidate similar patterns using library builders

### 4.2 Implement Clean Repository Structure
```typescript
// Example clean structure
export const rclGrammar: TMGrammar = {
  name: "rcl",
  scopeName: "source.rcl",
  fileTypes: ["rcl"],
  variables: RCL_VARIABLES,
  patterns: [
    { include: "#file-level-patterns" }
  ],
  repository: {
    // Core patterns
    comments: createComment('#', 'rcl'),
    strings: createString('"', 'rcl'),
    
    // Context patterns  
    "file-level-patterns": fileContext,
    "section-level-patterns": sectionContext,
    
    // Specific patterns
    ...primitivePatterns,
    ...expressionPatterns,
    ...sectionPatterns
  }
};
```

## Phase 5: Testing & Validation

### 5.1 Library Testing
- [ ] Unit tests for `tmGrammar` library functions
- [ ] Validation of generated JSON structure
- [ ] Performance testing of pattern compilation

### 5.2 RCL Grammar Testing
- [ ] Compare generated grammar with current version
- [ ] Test syntax highlighting in VS Code
- [ ] Validate against example RCL files
- [ ] Check embedded language support

## Phase 6: Documentation & Examples

### 6.1 Library Documentation
- [ ] API documentation for `tmGrammar` library
- [ ] Examples of common pattern creation
- [ ] Migration guide for other languages

### 6.2 RCL Grammar Documentation
- [ ] Document new structure and organization
- [ ] Add examples of adding new patterns
- [ ] Update development workflow documentation

## Implementation Benefits

### Library Benefits (`tmGrammar`)
- **Reusability**: Can be used for other language grammars
- **Type Safety**: Compile-time validation of grammar structure
- **DRY**: Eliminate pattern duplication across projects
- **Maintainability**: Centralized pattern logic

### RCL Grammar Benefits
- **Clarity**: Clean separation of concerns
- **Variables**: DISL-style variable substitution for maintainability
- **Modularity**: Clear file organization by purpose
- **Consistency**: Standardized pattern generation

## File Structure After Migration
```
packages/language/src/
├── tmGrammar/                 # Reusable library
│   ├── index.ts
│   ├── types.ts
│   ├── terminals.ts
│   └── builders.ts
└── syntaxes/
    ├── rcl/                   # RCL-specific grammar
    │   ├── index.ts
    │   ├── variables.ts
    │   ├── patterns/
    │   └── contexts/
    └── rcl.tmLanguage.json    # Generated output
```

This approach provides a clean separation between the reusable TextMate grammar library and the RCL language implementation, following the inspiration from the DISL example while maintaining type safety and eliminating duplication. 