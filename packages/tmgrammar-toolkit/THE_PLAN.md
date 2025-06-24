# tmlanguage-toolkit Development Plan

## Vision

Create a **unified facade** that repackages and harmonizes existing TextMate grammar functionality from our codebase and OSS tools into a single, cohesive developer experience. This initial version focuses on integration and API unification rather than building new features.

## Core Objectives

1. **Facade Pattern**: Wrap existing functionality with a unified API
2. **Repackaging**: Integrate `@/tmGrammar`, `vscode-textmate`, and `vscode-tmgrammar-test` capabilities
3. **API Harmonization**: Create consistent interfaces across different tools
4. **Zero New Logic**: Minimize new implementation, maximize reuse
5. **Migration Path**: Provide clear upgrade path from existing tools

## Package Structure (Facade-Focused)

```
packages/tmlanguage-toolkit/
├── src/
│   ├── authoring/           # Facade over existing @/tmGrammar
│   │   ├── index.ts         # Re-export tmGrammar builders with unified API
│   │   └── adapters.ts      # Adapt existing builders to new interface
│   ├── testing/             # Facade over vscode-tmgrammar-test + our scope.test.ts
│   │   ├── index.ts         # Unified testing API
│   │   ├── programmatic.ts  # Wrap our existing scope.test.ts utilities
│   │   └── declarative.ts   # Integrate vscode-tmgrammar-test functionality
│   ├── validation/          # Minimal wrapper over existing validation
│   │   └── index.ts         # Basic regex validation using vscode-oniguruma
│   ├── utils/               # Facade over vscode-textmate
│   │   ├── textmate.ts      # Wrap vscode-textmate with convenience methods
│   │   └── common.ts        # Common utilities from existing packages
│   └── index.ts             # Main unified export
├── examples/                # Copy existing examples with new API
└── docs/                    # Documentation for unified API
```

## Phase 1: Repackaging Existing Functionality (Week 1)

### Extract and Repackage @/tmGrammar
- [ ] **Copy** existing types from `packages/language/src/tmGrammar/types.ts`
- [ ] **Wrap** builders from `packages/language/src/tmGrammar/builders.ts`
- [ ] **Reexport** pattern utilities from `packages/language/src/tmGrammar/terminals.ts`
- [ ] **Adapt** variable system from `packages/language/syntaxes/rcl/variables.ts`

**Implementation:**
```typescript
// src/authoring/index.ts - Just re-export with cleaner API
export { 
  createComment as comment,
  createString as string,
  createKeywords as keywords,
  // ... other existing builders
} from '../../language/src/tmGrammar/builders.js';

export type {
  TMGrammar,
  TMPattern,
  TMRule
} from '../../language/src/tmGrammar/types.js';
```

### Integrate Testing Utilities
- [ ] **Wrap** existing `scope.test.ts` tokenization utilities
- [ ] **Install** and **facade** `vscode-tmgrammar-test` as dependency
- [ ] **Create** unified testing interface that supports both approaches

**Implementation:**
```typescript
// src/testing/index.ts - Facade over existing tools
import { tokenizeCode } from '../../language/test/scope.test.js';
import { execSync } from 'node:child_process';

export class TestRunner {
  // Wrap our existing programmatic testing
  static programmatic(grammar: TMGrammar) {
    return new ProgrammaticTester(grammar);
  }
  
  // Facade over vscode-tmgrammar-test CLI
  static declarative(testFiles: string) {
    return execSync(`vscode-tmgrammar-test ${testFiles}`);
  }
}
```

### Wrap vscode-textmate
- [ ] **Install** `vscode-textmate` and `vscode-oniguruma` as dependencies
- [ ] **Copy** existing initialization logic from `scope.test.ts`
- [ ] **Create** convenience methods for common operations

**Implementation:**
```typescript
// src/utils/textmate.ts - Facade over vscode-textmate
import { Registry } from 'vscode-textmate';
// Copy existing initialization from scope.test.ts
export { initializeGrammar, tokenizeCode } from '../../language/test/scope.test.js';
```

## Phase 2: API Unification (Week 2)

### Create Unified Entry Point
- [ ] **Design** single import that provides all functionality
- [ ] **Create** fluent API that chains existing functions
- [ ] **Maintain** backward compatibility with existing APIs

**Unified API:**
```typescript
// src/index.ts - The main facade
import * as authoring from './authoring/index.js';
import * as testing from './testing/index.js';
import * as utils from './utils/index.js';

// Fluent API facade over existing functionality
export const tmToolkit = {
  // Grammar authoring (wraps existing @/tmGrammar)
  grammar: authoring.createGrammar,
  comment: authoring.comment,
  string: authoring.string,
  keywords: authoring.keywords,
  
  // Testing (wraps existing + vscode-tmgrammar-test)
  test: testing.TestRunner.programmatic,
  testFiles: testing.TestRunner.declarative,
  
  // Utilities (wraps vscode-textmate)
  tokenize: utils.tokenizeCode,
  validate: utils.validateGrammar,
};

// Also export individual modules for granular access
export { authoring, testing, utils };
```

### Documentation and Examples
- [ ] **Copy** existing RCL grammar examples
- [ ] **Adapt** examples to use new unified API
- [ ] **Create** migration guide from existing packages

## Implementation Strategy

### Dependencies (Reuse Existing)
```json
{
  "dependencies": {
    "vscode-textmate": "^9.0.0",
    "vscode-oniguruma": "^2.0.1",
    "vscode-tmgrammar-test": "^0.1.3"
  },
  "peerDependencies": {
    "@workspace/language": "*"  // Access to existing tmGrammar code
  }
}
```

### File Structure (Minimal New Code)
- **90% reexports/facades** over existing functionality
- **10% adapter code** to unify APIs
- **0% new grammar logic** - just repackaging

### Migration Benefits
1. **Immediate Value**: Users get unified API without waiting for new features
2. **Low Risk**: Minimal new code means fewer bugs
3. **Fast Delivery**: Can ship in 2 weeks vs 8 weeks
4. **Validation**: Proves the facade approach before adding new features

## Success Criteria (Revised)

1. **API Unification**: Single import provides all TextMate functionality
2. **Zero Regression**: All existing functionality works through new API
3. **Clear Migration**: Existing users can easily switch to unified API
4. **Fast Delivery**: Working package in 2 weeks

## Future Phases (Post-Facade)

Once the facade is proven and adopted:
- **Phase 3**: Add new convenience methods
- **Phase 4**: Implement CLI tools
- **Phase 5**: Add advanced validation features

## Immediate Next Steps

1. **Week 1**: Set up package structure and reexport existing functionality
2. **Week 2**: Create unified API facade and documentation
3. **Ship**: Release v0.1.0 as pure facade package

This approach gives us immediate value while validating the unified API concept before investing in new features.
