# Type Guards Implementation Plan

## Overview

This document outlines a comprehensive plan for implementing complete type guard coverage for the RCL language AST nodes. While the current implementation already has the main type guards, this plan ensures 100% coverage for all AST node types and provides a systematic approach for maintenance and extensibility.

## Current Status Assessment

### ✅ **Already Implemented**
Currently located in `packages/language/src/generated/ast.ts` (will move to `src/ast/bridge/type-guards.ts`):
- `isRclFile(node): node is RclFile`
- `isSection(node): node is Section`
- `isFlowRule(node): node is FlowRule`
- `isMessageDefinition(node): node is MessageDefinition`
- `isImportStatement(node): node is ImportStatement`
- `isFlowTransition(node): node is FlowTransition`
- `isAttribute(node): node is Attribute`
- `isEmbeddedExpression(node): node is EmbeddedExpression`
- `isParameter(node): node is Parameter`
- `isValue(node): node is Value`
- `isBraceObject(node): node is ObjectValue`
- `isIndentedObject(node): node is ObjectValue`

### ❌ **Missing Type Guards**

Based on the consolidated AST types (from merging `src/parser/rcl-simple-ast.ts`, `src/parser/ast/`, and `src/generated/ast.ts`), these type guards are needed:

#### Core Value Types
- `isStringValue(node): node is StringValue`
- `isNumberValue(node): node is NumberValue`
- `isBooleanValue(node): node is BooleanValue`
- `isNullValue(node): node is NullValue`
- `isIdentifierValue(node): node is IdentifierValue`

#### Collection Types
- `isListValue(node): node is ListValue`
- `isObjectValue(node): node is ObjectValue`
- `isObjectPair(node): node is ObjectPair`
- `isTypeTaggedValue(node): node is TypeTaggedValue`

#### Embedded Code Types
- `isEmbeddedCodeBlock(node): node is EmbeddedCodeBlock`

#### Flow System Types
- `isFlowOperand(node): node is FlowOperand`
- `isWithClause(node): node is WithClause`
- `isWhenClause(node): node is WhenClause`

#### Message and Content Types
- `isAgentMessage(node): node is AgentMessage`
- `isContentMessage(node): node is ContentMessage`
- `isRichCard(node): node is RichCard`
- `isCarouselCard(node): node is CarouselCard`
- `isStandaloneCard(node): node is StandaloneCard`

#### Shortcut Types
- `isTextShortcut(node): node is TextShortcut`
- `isRichCardShortcut(node): node is RichCardShortcut`
- `isReplyShortcut(node): node is ReplyShortcut`
- `isDialShortcut(node): node is DialShortcut`
- `isOpenUrlShortcut(node): node is OpenUrlShortcut`
- `isFileShortcut(node): node is FileShortcut`

#### Suggestion Types
- `isSuggestion(node): node is Suggestion`
- `isSuggestedReply(node): node is SuggestedReply`
- `isSuggestedAction(node): node is SuggestedAction`

## Implementation Strategy

### Phase 1: Core Type Guards (Priority: High)

Implement the most frequently used type guards that are essential for LSP services:

```typescript
// Value type guards - used extensively in validation and conversion
export function isStringValue(node: AstNode): node is StringValue {
  return node.$type === 'StringValue';
}

export function isNumberValue(node: AstNode): node is NumberValue {
  return node.$type === 'NumberValue';
}

export function isBooleanValue(node: AstNode): node is BooleanValue {
  return node.$type === 'BooleanValue';
}

export function isNullValue(node: AstNode): node is NullValue {
  return node.$type === 'NullValue';
}

export function isIdentifierValue(node: AstNode): node is IdentifierValue {
  return node.$type === 'IdentifierValue';
}

// Collection type guards - used in semantic analysis
export function isListValue(node: AstNode): node is ListValue {
  return node.$type === 'ListValue';
}

export function isObjectValue(node: AstNode): node is ObjectValue {
  return node.$type === 'ObjectValue';
}

export function isObjectPair(node: AstNode): node is ObjectPair {
  return node.$type === 'ObjectPair';
}

// Flow system type guards - critical for flow analysis
export function isFlowOperand(node: AstNode): node is FlowOperand {
  return node.$type === 'FlowOperand';
}

export function isWithClause(node: AstNode): node is WithClause {
  return node.$type === 'WithClause';
}

export function isWhenClause(node: AstNode): node is WhenClause {
  return node.$type === 'WhenClause';
}
```

### Phase 2: Embedded Code Type Guards (Priority: High)

Essential for embedded code validation and processing:

```typescript
export function isEmbeddedCodeBlock(node: AstNode): node is EmbeddedCodeBlock {
  return node.$type === 'EmbeddedCodeBlock';
}

export function isTypeTaggedValue(node: AstNode): node is TypeTaggedValue {
  return node.$type === 'TypeTaggedValue';
}
```

### Phase 3: Message and Content Type Guards (Priority: Medium)

Important for message processing and RCS compliance:

```typescript
export function isAgentMessage(node: AstNode): node is AgentMessage {
  return node.$type === 'AgentMessage';
}

export function isContentMessage(node: AstNode): node is ContentMessage {
  return node.$type === 'ContentMessage';
}

export function isRichCard(node: AstNode): node is RichCard {
  return node.$type === 'RichCard';
}

export function isCarouselCard(node: AstNode): node is CarouselCard {
  return node.$type === 'CarouselCard';
}

export function isStandaloneCard(node: AstNode): node is StandaloneCard {
  return node.$type === 'StandaloneCard';
}
```

### Phase 4: Shortcut Type Guards (Priority: Medium)

For comprehensive shortcut support:

```typescript
export function isTextShortcut(node: AstNode): node is TextShortcut {
  return node.$type === 'TextShortcut';
}

export function isRichCardShortcut(node: AstNode): node is RichCardShortcut {
  return node.$type === 'RichCardShortcut';
}

export function isReplyShortcut(node: AstNode): node is ReplyShortcut {
  return node.$type === 'ReplyShortcut';
}

export function isDialShortcut(node: AstNode): node is DialShortcut {
  return node.$type === 'DialShortcut';
}

export function isOpenUrlShortcut(node: AstNode): node is OpenUrlShortcut {
  return node.$type === 'OpenUrlShortcut';
}

export function isFileShortcut(node: AstNode): node is FileShortcut {
  return node.$type === 'FileShortcut';
}
```

### Phase 5: Suggestion Type Guards (Priority: Low)

For complete suggestion system support:

```typescript
export function isSuggestion(node: AstNode): node is Suggestion {
  return node.$type === 'Suggestion';
}

export function isSuggestedReply(node: AstNode): node is SuggestedReply {
  return node.$type === 'SuggestedReply';
}

export function isSuggestedAction(node: AstNode): node is SuggestedAction {
  return node.$type === 'SuggestedAction';
}
```

## Implementation Location

### New Primary Location (After AST Consolidation)
**File**: `packages/language/src/ast/bridge/type-guards.ts`
**Section**: Dedicated file for all type guard functions

### Legacy Location (Before AST Consolidation)
**File**: `packages/language/src/generated/ast.ts`
**Section**: Add after existing type guards (around line 260+)

⚠️ **IMPORTANT**: This plan depends on the AST consolidation outlined in `/home/ubuntu/rcl/notes/ast-merge-implementation-plan.md` being completed first.

### New Organization Strategy (After AST Consolidation)

**File**: `src/ast/bridge/type-guards.ts`
```typescript
/**
 * Type Guard Functions for RCL AST
 * 
 * This file contains all type guard functions for RCL AST nodes.
 * Auto-generated from the consolidated AST definitions.
 */

import type { AstNode } from 'langium';
import type * as RclAst from '../index.js';

// === CORE TYPE GUARDS ===
export function isRclFile(node: AstNode): node is RclAst.RclFile { ... }
export function isImportStatement(node: AstNode): node is RclAst.ImportStatement { ... }

// === VALUE TYPE GUARDS ===
export function isStringValue(node: AstNode): node is RclAst.StringValue { ... }
export function isNumberValue(node: AstNode): node is RclAst.NumberValue { ... }
// ... etc

// === COLLECTION TYPE GUARDS ===
export function isListValue(node: AstNode): node is RclAst.ListValue { ... }
// ... etc

// === FLOW SYSTEM TYPE GUARDS ===
export function isFlowOperand(node: AstNode): node is RclAst.FlowOperand { ... }
// ... etc

// === MESSAGE TYPE GUARDS ===
export function isAgentMessage(node: AstNode): node is RclAst.AgentMessage { ... }
// ... etc

// === SHORTCUT TYPE GUARDS ===
export function isTextShortcut(node: AstNode): node is RclAst.TextShortcut { ... }
// ... etc

// === SUGGESTION TYPE GUARDS ===
export function isSuggestion(node: AstNode): node is RclAst.Suggestion { ... }
// ... etc
```

### Interim Organization Strategy (Before AST Consolidation)

Continue using current location in `src/generated/ast.ts` until AST consolidation is complete.

## Automated Generation Strategy

### Type Guard Generator Script
Create a script to automatically generate type guards from AST definitions:

**File**: `packages/language/scripts/generate-type-guards.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates type guard functions for all AST node types from consolidated AST
 */
function generateTypeGuards() {
  // Read all AST files from the consolidated structure
  const astFiles = [
    'src/ast/core/base-types.ts',
    'src/ast/core/file-structure.ts', 
    'src/ast/sections/section-types.ts',
    'src/ast/values/literal-types.ts',
    'src/ast/values/collection-types.ts',
    'src/ast/values/embedded-types.ts',
    'src/ast/flow-system/flow-control-types.ts',
    'src/ast/shortcuts/message-shortcut-types.ts',
    // Add more as needed
  ];
  
  const interfaces: Array<{name: string, type: string}> = [];
  
  // Extract interface names and types from all AST files
  astFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const interfaceRegex = /export interface (\w+) extends AstNode \{[\s\S]*?type: '(\w+)'/g;
      
      let match;
      while ((match = interfaceRegex.exec(content)) !== null) {
        interfaces.push({
          name: match[1],
          type: match[2]
        });
      }
    }
  });
  
  // Generate type guard functions
  const imports = 'import type { AstNode } from \'langium\';\nimport type * as RclAst from \'../index.js\';\n\n';
  
  const typeGuards = interfaces.map(({name, type}) => 
    `export function is${name}(node: AstNode): node is RclAst.${name} {\n  return node.$type === '${type}';\n}`
  ).join('\n\n');
  
  // Write to dedicated type guards file
  const typeGuardsFile = 'src/ast/bridge/type-guards.ts';
  const header = '/**\n * Type Guard Functions for RCL AST\n * \n * Auto-generated from consolidated AST definitions.\n * DO NOT EDIT MANUALLY - run \'bun run generate:type-guards\' instead.\n */\n\n';
  
  const content = header + imports + typeGuards;
  fs.writeFileSync(typeGuardsFile, content);
  console.log(`Generated ${interfaces.length} type guards in ${typeGuardsFile}`);
}

generateTypeGuards();
```

### Build Integration
Add to `package.json` scripts:
```json
{
  "scripts": {
    "generate:type-guards": "bun run scripts/generate-type-guards.ts",
    "build": "nr clean && nr build:lsp && nr build:syntax && nr generate:type-guards"
  }
}
```

## Testing Strategy

### Unit Tests for Type Guards
**File**: `packages/language/tests/ast/type-guards.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  isStringValue, 
  isNumberValue, 
  isFlowOperand,
  // ... import all type guards
} from '../../src/ast/bridge/type-guards.js';

describe('Type Guards', () => {
  describe('Value Type Guards', () => {
    it('should correctly identify StringValue nodes', () => {
      const node = { $type: 'StringValue', value: 'test' };
      expect(isStringValue(node)).toBe(true);
      expect(isNumberValue(node)).toBe(false);
    });

    it('should correctly identify NumberValue nodes', () => {
      const node = { $type: 'NumberValue', value: 42 };
      expect(isNumberValue(node)).toBe(true);
      expect(isStringValue(node)).toBe(false);
    });
  });

  describe('Flow System Type Guards', () => {
    it('should correctly identify FlowOperand nodes', () => {
      const node = { 
        $type: 'FlowOperand', 
        operandType: 'atom', 
        value: ':start' 
      };
      expect(isFlowOperand(node)).toBe(true);
      expect(isStringValue(node)).toBe(false);
    });
  });

  // Add comprehensive tests for all type guards
});
```

### Integration Tests
Verify type guards work correctly with LSP services:

```typescript
describe('Type Guards Integration', () => {
  it('should work with hover provider', () => {
    // Test that hover provider correctly uses type guards
  });

  it('should work with completion provider', () => {
    // Test that completion provider correctly uses type guards
  });
});
```

## Usage in LSP Services

### Example: Enhanced Hover Provider
```typescript
// In src/lsp/rcl-hover-provider.ts
protected override getAstNodeHoverContent(node: AstNode): Hover | undefined {
  if (isSection(node)) {
    return this.getSectionHoverDetails(node);
  }
  if (isAttribute(node)) {
    return this.getAttributeHoverDetails(node);
  }
  if (isFlowOperand(node)) {
    return this.getFlowOperandHoverDetails(node);
  }
  if (isEmbeddedExpression(node)) {
    return this.getEmbeddedExpressionHoverDetails(node);
  }
  if (isStringValue(node)) {
    return this.getStringValueHoverDetails(node);
  }
  // ... handle all node types
}
```

### Example: Enhanced Validation
```typescript
// In src/rcl-validator.ts
validateValue(value: Value, acceptor: ValidationAcceptor): void {
  if (isStringValue(value)) {
    this.validateStringValue(value, acceptor);
  } else if (isNumberValue(value)) {
    this.validateNumberValue(value, acceptor);
  } else if (isEmbeddedExpression(value)) {
    this.validateEmbeddedExpression(value, acceptor);
  }
  // ... handle all value types specifically
}
```

## Maintenance Guidelines

### 1. **Consistency Rules**
- All type guard functions must follow the naming pattern: `is{TypeName}`
- All type guards must check the `$type` property
- All type guards must be exported from `ast/bridge/type-guards.ts`

### 2. **Synchronization**
- When adding new AST node types to the consolidated AST, immediately regenerate type guards
- Use the automated generation script to ensure completeness: `bun run generate:type-guards`
- Update tests whenever new type guards are added
- Type guards are automatically generated from the consolidated AST structure in `src/ast/`

### 3. **Documentation**
- Group type guards by functional area (values, collections, flow, etc.)
- Add JSDoc comments for complex or domain-specific type guards
- Maintain examples in this document for common usage patterns

## Timeline and Dependencies

### ⚠️ **CRITICAL DEPENDENCY**: AST Consolidation Must Be Completed First

**Before implementing type guards**, the AST consolidation outlined in `/home/ubuntu/rcl/notes/ast-merge-implementation-plan.md` must be completed. This will:

1. Create the unified `src/ast/` structure
2. Consolidate all AST types from `src/generated/`, `src/parser/ast/`, and `src/parser/rcl-simple-ast.ts`
3. Provide the target location for type guards: `src/ast/bridge/type-guards.ts`

### Phase 1: Core Type Guards (After AST Consolidation)
- **Dependencies**: AST consolidation completed
- **Effort**: 2-3 hours
- **Impact**: High - enables better validation and LSP services

### Phase 2: Embedded Code Type Guards (After AST Consolidation)
- **Dependencies**: AST consolidation + Phase 1 complete
- **Effort**: 1 hour
- **Impact**: High - essential for embedded code features

### Phase 3: Message Type Guards (After AST Consolidation)
- **Dependencies**: AST consolidation + Phases 1-2 complete
- **Effort**: 2-3 hours
- **Impact**: Medium - improves message processing

### Phase 4: Shortcut Type Guards (After AST Consolidation)
- **Dependencies**: AST consolidation + Phase 3 complete
- **Effort**: 2-3 hours
- **Impact**: Medium - completes shortcut system support

### Phase 5: Suggestion Type Guards (After AST Consolidation)
- **Dependencies**: AST consolidation + All previous phases
- **Effort**: 1-2 hours
- **Impact**: Low - nice to have for completeness

### Automation Script (After Manual Implementation)
- **Dependencies**: AST consolidation + Manual implementation complete
- **Effort**: 3-4 hours
- **Impact**: High - reduces future maintenance burden

### Updated Timeline

**Week 1**: Complete AST consolidation (prerequisite)
**Week 2**: Implement Phases 1-2 (core + embedded code type guards) 
**Week 3**: Implement Phases 3-4 (message + shortcut type guards)
**Week 4**: Implement Phase 5 + automation script

## Success Criteria

### ✅ **Functional Requirements**
- All AST node types have corresponding type guards
- Type guards correctly distinguish between node types
- LSP services can use type guards for enhanced functionality
- All type guards are properly tested

### ✅ **Quality Requirements**
- 100% test coverage for all type guards
- Zero false positives or false negatives in type checking
- Consistent naming and implementation patterns
- Automated generation prevents drift from AST definitions

### ✅ **Performance Requirements**
- Type guard execution time < 1ms per call
- No impact on overall parsing or LSP response times
- Memory usage remains stable with increased type guard usage

---

## Relationship to AST Consolidation

This plan is **tightly coupled** with the AST consolidation outlined in `/home/ubuntu/rcl/notes/ast-merge-implementation-plan.md`. The type guards implementation:

1. **Depends on** the AST consolidation being completed first
2. **Benefits from** having a single, unified AST structure to generate type guards from  
3. **Provides** the type safety layer for the consolidated AST
4. **Replaces** the type guards currently scattered across multiple files

### Implementation Order

1. **First**: Complete AST consolidation (ast-merge-implementation-plan.md)
2. **Then**: Implement type guards (this plan)
3. **Finally**: Complete grammar removal (grammar-removal-implementation-plan.md)

---

This plan provides a systematic approach to implementing comprehensive type guard coverage while maintaining code quality and enabling enhanced LSP functionality. The phased approach allows for incremental implementation based on priority and impact, but **requires AST consolidation as a prerequisite**.