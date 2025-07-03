# RCL Implementation Fix Plan

## Overview

This document outlines a comprehensive plan to fix the discrepancies between the current RCL custom lexer/parser implementation and the formal specification. The plan addresses critical issues from multi-line expression syntax to missing core features like message shortcuts.

## Executive Summary

**Current Status**: The implementation has significant gaps and incompatibilities with the formal specification.
**Priority**: High - Many core features are missing or incorrectly implemented.
**Estimated Effort**: ~3-4 weeks for full compliance with comprehensive testing.

---

## Phase 1: File Structure Refactoring

### 1.1 Lexer Modularization

Break down the monolithic `rcl-custom-lexer.ts` into focused modules:

```
src/parser/lexer/
├── index.ts                           # Main lexer export and coordination
├── core/
│   ├── lexer-base.ts                 # Base lexer class with common functionality
│   ├── indentation-handler.ts       # INDENT/DEDENT token generation
│   ├── position-tracker.ts          # Line/column/offset tracking
│   └── error-handler.ts             # Lexical error collection and reporting
├── tokens/
│   ├── token-definitions.ts         # All token type definitions
│   ├── keywords.ts                  # Keyword tokens (import, agent, flow, etc.)
│   ├── literals.ts                  # STRING, NUMBER, ATOM, BOOLEAN tokens
│   ├── identifiers.ts               # IDENTIFIER, ATTRIBUTE_KEY, SECTION_TYPE
│   ├── punctuation.ts               # Operators, brackets, arrows
│   └── embedded-code.ts             # Embedded expression tokens
├── modes/
│   ├── mode-manager.ts              # Multi-mode lexing coordination
│   ├── default-mode.ts              # Standard RCL tokenization
│   ├── type-tag-mode.ts             # Type tag content extraction
│   └── string-content-mode.ts       # Multi-line string content handling
└── patterns/
    ├── identifier-patterns.ts       # Space-separated identifier matching
    ├── string-patterns.ts           # Multi-line string marker patterns
    └── expression-patterns.ts       # Embedded code pattern matching
```

### 1.2 Parser Modularization

Break down the monolithic `rcl-custom-parser.ts` into domain-specific modules:

```
src/parser/parser/
├── index.ts                         # Main parser export and coordination
├── core/
│   ├── parser-base.ts              # Base recursive descent parser
│   ├── token-stream.ts             # Token consumption and lookahead
│   ├── error-recovery.ts           # Synchronization and error handling
│   └── ast-factory.ts              # AST node creation utilities
├── sections/
│   ├── rcl-file-parser.ts          # Top-level RclFile parsing
│   ├── import-parser.ts            # Import statement parsing
│   ├── agent-parser.ts             # Agent definition parsing
│   ├── flow-parser.ts              # Flow section and rule parsing
│   ├── message-parser.ts           # Message section parsing
│   ├── config-parser.ts            # Agent configuration parsing
│   └── defaults-parser.ts          # Agent defaults parsing
├── expressions/
│   ├── value-parser.ts             # General value parsing
│   ├── embedded-code-parser.ts     # Embedded expression parsing
│   ├── type-tag-parser.ts          # Type tag parsing (<type value>)
│   └── collection-parser.ts        # Lists, dictionaries, mapped types
├── shortcuts/
│   ├── message-shortcuts-parser.ts  # All RCS message shortcuts
│   ├── text-shortcut-parser.ts     # text shortcut expansion
│   ├── card-shortcuts-parser.ts    # richCard, carousel shortcuts
│   ├── action-shortcuts-parser.ts  # reply, dial, openUrl, etc.
│   └── suggestion-parser.ts        # Suggestion parsing
├── flow-system/
│   ├── flow-transitions-parser.ts  # Flow transition parsing
│   ├── flow-operands-parser.ts     # Flow operand parsing
│   ├── with-clause-parser.ts       # Parameter passing parsing
│   └── when-clause-parser.ts       # Conditional flow parsing
└── validation/
    ├── structure-validator.ts      # Grammar structure validation
    ├── constraint-validator.ts     # RCS specification constraints
    └── reference-resolver.ts       # Cross-reference resolution
```

### 1.3 AST Types Refactoring

Reorganize AST interfaces to match specification hierarchy:

```
src/parser/ast/
├── index.ts                        # All AST type exports
├── core/
│   ├── base-types.ts              # Position, Location, common interfaces
│   └── file-structure.ts          # RclFile, ImportStatement
├── sections/
│   ├── agent-types.ts             # AgentDefinition, AgentConfig, AgentDefaults
│   ├── flow-types.ts              # FlowSection, FlowRule, FlowTransition
│   ├── message-types.ts           # MessagesSection, MessageDefinition
│   └── section-base.ts            # Generic section interfaces
├── values/
│   ├── literal-types.ts           # StringValue, NumberValue, BooleanValue, etc.
│   ├── collection-types.ts        # ListValue, DictionaryValue, MappedType
│   ├── embedded-types.ts          # EmbeddedExpression, EmbeddedCodeBlock
│   └── type-tag-types.ts          # TypeTag, TypedValue
├── shortcuts/
│   ├── message-shortcut-types.ts  # All message shortcut AST nodes
│   └── suggestion-types.ts        # Suggestion and action AST nodes
└── flow-system/
    ├── flow-control-types.ts      # FlowOperand, WithClause, WhenClause
    └── parameter-types.ts         # Parameter, ParameterList
```

---

## Phase 2: Critical Issue Fixes

### 2.1 Multi-line Expression Syntax Fix (Priority: Critical)

**Current Issue**: Lexer expects braces `{}` but specification requires indentation-based blocks.

**Solution**:
```typescript
// Fix in lexer/tokens/embedded-code.ts
static readonly MULTI_LINE_EXPRESSION_START = createToken({
  name: 'MULTI_LINE_EXPRESSION_START',
  pattern: /\$((js|ts)?)>>>/  // Remove brace pattern
});

// Add proper indented content handling in modes/string-content-mode.ts
handleMultiLineExpression(): void {
  // Track indentation level after >>>
  // Extract indented block content
  // Generate STRING_CONTENT token with proper content
}
```

### 2.2 Message Shortcuts Implementation (Priority: Critical)

**Current Issue**: No message shortcut parsing implemented.

**Solution**: Implement complete shortcut system:
```typescript
// In shortcuts/message-shortcuts-parser.ts
parseMessageShortcut(): MessageShortcut {
  // Handle: text, richCard, carousel, rbmFile, file
  // Handle: transactional/promotional prefixes
  // Expand to full agentMessage structures
}

// In shortcuts/action-shortcuts-parser.ts  
parseActionShortcut(): ActionShortcut {
  // Handle: reply, dial, openUrl, shareLocation, viewLocation, saveEvent
  // Generate appropriate suggestion structures
}
```

### 2.3 Parser Structure Alignment (Priority: Critical)

**Current Issue**: Flat section parsing vs. required AgentDefinition hierarchy.

**Solution**:
```typescript
// In sections/rcl-file-parser.ts
parseRclFile(): RclFile {
  const imports = this.parseImports();
  const agentDef = this.parseAgentDefinition(); // Required
  return { type: 'RclFile', imports, agentDefinition: agentDef };
}

// In sections/agent-parser.ts
parseAgentDefinition(): AgentDefinition {
  // Enforce required displayName
  // Validate section cardinality (one messages, at least one flow)
  // Handle optional brandName, config, defaults
}
```

### 2.4 Type Tag Implementation (Priority: High)

**Current Issue**: Type tags defined but not parsed.

**Solution**:
```typescript
// In expressions/type-tag-parser.ts
parseTypeTag(): TypeTag {
  this.consume(LT);
  this.pushMode('type_tag');
  const typeName = this.parseTypeName();
  const value = this.parseTypeTagValue();
  const modifier = this.parseOptionalModifier(); // After |
  this.consume(GT);
  this.popMode();
  return { type: 'TypeTag', typeName, value, modifier };
}
```

### 2.5 Flow System Compliance (Priority: High)

**Current Issue**: Incorrect flow rule structure and missing multi-arrow support.

**Solution**:
```typescript
// In flow-system/flow-transitions-parser.ts
parseFlowRule(): FlowRule {
  const operands = [];
  operands.push(this.parseFlowOperand());
  
  // Support multiple arrows: A -> B -> C
  while (this.check(ARROW)) {
    this.consume(ARROW);
    operands.push(this.parseFlowOperand());
  }
  
  const withClause = this.parseOptionalWithClause();
  return { type: 'FlowRule', operands, withClause };
}
```

---

## Phase 3: Advanced Features Implementation

### 3.1 Multi-line String Chomping (Priority: Medium)

Implement proper chomping marker behavior:
```typescript
// In modes/string-content-mode.ts
handleStringContent(marker: ChompingMarker): StringContent {
  switch (marker) {
    case 'clean':     // | - single newline at end
    case 'trim':      // |- - no trailing newline  
    case 'preserve':  // +| - preserve leading space, single newline
    case 'preserve_all': // +|+ - preserve all whitespace
  }
}
```

### 3.2 Import Path Resolution (Priority: Medium)

Fix import path parsing to match specification:
```typescript
// In sections/import-parser.ts
parseImportPath(): string[] {
  const segments: string[] = [];
  do {
    segments.push(this.parseIdentifier()); // Single IDENTIFIER only
    if (this.check(SLASH)) {
      this.advance();
    } else break;
  } while (!this.isAtEnd());
  return segments;
}
```

### 3.3 Identifier Pattern Fixes (Priority: Medium)

Remove word boundary from identifier pattern:
```typescript
// In lexer/tokens/identifiers.ts
static readonly IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/  // Remove \b
});
```

---

## Phase 4: Validation and Constraints

### 4.1 RCS Specification Validation

Implement constraint validation:
```typescript
// In validation/constraint-validator.ts
validateAgentDefinition(agent: AgentDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Required displayName
  if (!agent.displayName) {
    errors.push(new ValidationError('Agent displayName is required'));
  }
  
  // At least one flow
  if (agent.flows.length === 0) {
    errors.push(new ValidationError('Agent must have at least one flow'));
  }
  
  // Exactly one messages section
  if (!agent.messages) {
    errors.push(new ValidationError('Agent must have a messages section'));
  }
  
  return errors;
}
```

### 4.2 Reference Resolution

Implement cross-reference validation:
```typescript
// In validation/reference-resolver.ts
resolveFlowReferences(file: RclFile): ReferenceResolution {
  // Resolve flow references (start FlowName)
  // Resolve message references
  // Validate import references
  // Check for circular dependencies
}
```

---

## Phase 5: Testing Strategy

### 5.1 Unit Test Suites

#### 5.1.1 Lexer Tests
```
tests/lexer/
├── core/
│   ├── indentation.test.ts          # INDENT/DEDENT generation
│   ├── position-tracking.test.ts    # Line/column tracking
│   └── error-handling.test.ts       # Lexical error cases
├── tokens/
│   ├── keywords.test.ts             # All keyword recognition
│   ├── identifiers.test.ts          # Space-separated identifiers
│   ├── literals.test.ts             # STRING, NUMBER, ATOM parsing
│   ├── embedded-code.test.ts        # $js>, $ts>, $>>> patterns
│   └── type-tags.test.ts            # <type value> patterns
├── modes/
│   ├── multi-mode.test.ts           # Mode switching behavior
│   ├── type-tag-mode.test.ts        # Type tag content extraction
│   └── string-content.test.ts       # Multi-line string handling
└── integration/
    ├── complex-expressions.test.ts  # Complex embedded expressions
    ├── nested-structures.test.ts    # Deeply nested content
    └── error-recovery.test.ts       # Lexer error recovery
```

**Test Cases for Lexer:**
1. **Indentation Tests**:
   - Mixed spaces/tabs handling
   - Invalid dedent detection
   - Deep nesting scenarios
   - Edge cases (empty lines, comments)

2. **Identifier Tests**:
   - Single word identifiers: `Agent`, `Flow`
   - Multi-word identifiers: `Customer Support Agent`, `Order Processing Flow`
   - Edge cases: `Agent 123`, `Flow-With-Hyphens`
   - Reserved word conflicts

3. **Embedded Code Tests**:
   - Single-line: `$js> expression`, `$ts> expression`, `$> expression`
   - Multi-line with proper indentation:
     ```
     $js>>>
       let result = calculate();
       return result;
     ```
   - Error cases: malformed syntax, missing closing

4. **Type Tag Tests**:
   - Basic: `<email user@domain.com>`, `<phone +1234567890>`
   - With modifiers: `<time 4pm | UTC>`, `<zip 12345 | US>`
   - Complex content: `<url https://example.com/path?param=value>`

#### 5.1.2 Parser Tests
```
tests/parser/
├── core/
│   ├── token-consumption.test.ts    # Token stream handling
│   ├── error-recovery.test.ts       # Parser error recovery
│   └── ast-generation.test.ts       # AST node creation
├── sections/
│   ├── rcl-file.test.ts            # Complete file parsing
│   ├── imports.test.ts             # Import statement parsing
│   ├── agent-definition.test.ts    # Agent section parsing
│   ├── flow-sections.test.ts       # Flow parsing
│   ├── message-sections.test.ts    # Message parsing
│   ├── config-sections.test.ts     # Configuration parsing
│   └── defaults-sections.test.ts   # Defaults parsing
├── expressions/
│   ├── values.test.ts              # Value parsing
│   ├── embedded-code.test.ts       # Embedded expression parsing
│   ├── type-tags.test.ts           # Type tag parsing
│   └── collections.test.ts         # Lists, dictionaries, mapped types
├── shortcuts/
│   ├── text-shortcuts.test.ts      # text shortcut parsing
│   ├── card-shortcuts.test.ts      # richCard, carousel shortcuts
│   ├── action-shortcuts.test.ts    # Action suggestion shortcuts
│   └── message-shortcuts.test.ts   # Complete message shortcut suite
├── flow-system/
│   ├── transitions.test.ts         # Flow transition parsing
│   ├── operands.test.ts            # Flow operand parsing
│   ├── with-clauses.test.ts        # Parameter passing
│   └── when-clauses.test.ts        # Conditional flows
└── validation/
    ├── structure.test.ts           # Grammar structure validation
    ├── constraints.test.ts         # RCS constraint validation
    └── references.test.ts          # Reference resolution
```

**Test Cases for Parser:**

1. **Import Statement Tests**:
   ```rcl
   import Simple Flow
   import My Brand / Customer Support
   import Shared / Common / Utils as Utilities
   import External / Service from "external-service"
   ```

2. **Agent Definition Tests**:
   ```rcl
   agent Customer Support Bot:
     displayName: "Customer Support"
     brandName: "ACME Corp"
     
     agentConfig Config:
       description: "24/7 customer support"
       
     agentDefaults Defaults:
       messageTrafficType: :transactional
       
     flow Welcome Flow:
       :start -> Welcome Message
       
     messages Messages:
       Welcome Message:
         text: "Hello! How can I help you?"
   ```

3. **Message Shortcut Tests**:
   ```rcl
   text "Welcome to our service!"
     suggestions:
       reply "Get started"
       openUrl "Learn more" <url https://example.com>
       dial "Call support" <phone +1-555-0123>
   
   richCard "Product Showcase" :horizontal :left :medium <url image.jpg>:
     description: "Our latest product"
     suggestions:
       reply "Buy now"
   
   carousel :small:
     richCard "Item 1": description: "First item"
     richCard "Item 2": description: "Second item"
   ```

4. **Flow System Tests**:
   ```rcl
   flow Order Processing:
     :start -> Check Inventory -> Process Payment -> Ship Order
     
     when user.type is "premium":
       :start -> Premium Welcome -> Check Inventory
       
     Check Inventory with:
       productId: $js> context.selectedProduct.id
       quantity: $js> context.orderQuantity
   ```

5. **Type Tag Tests**:
   ```rcl
   contactInfo:
     email: <email support@company.com>
     phone: <phone +1-555-0123>
     website: <url https://company.com>
     
   eventDetails:
     startTime: <time 2:30pm | EST>
     eventDate: <date March 15th, 2024>
     location: <zip 10001>
   ```

6. **Embedded Expression Tests**:
   ```rcl
   dynamicMessage: $js> "Hello " + context.user.firstName
   
   complexLogic: $ts>>>
     let discount = 0;
     if (context.user.isPremium) {
       discount = 0.15;
     } else if (context.order.total > 100) {
       discount = 0.10;
     }
     return discount;
   ```

7. **Multi-line String Tests**:
   ```rcl
   cleanText: |
     This is a clean multi-line string
     with proper indentation handling
     
   trimmedText: |-
     This text has no trailing newline
     
   preservedText: +|+
     This preserves    all whitespace
        including leading spaces
   ```

8. **Collection Tests**:
   ```rcl
   simpleList: ("item1", "item2", "item3")
   
   blockList:
     - "first item"
     - "second item"
     - "third item"
     
   inlineDict: {name: "John", age: 30, active: true}
   
   blockDict:
     name: "John Doe"
     email: <email john@example.com>
     preferences:
       notifications: true
       
   mappedPhones list of (label, <phone number>):
     - "Home", "+1-555-0001"
     - "Work", "+1-555-0002"
   ```

#### 5.1.3 Integration Tests
```
tests/integration/
├── specification-compliance/
│   ├── formal-spec-examples.test.ts # All examples from formal spec
│   ├── complete-agent.test.ts       # Full agent definitions
│   └── cross-section-refs.test.ts   # Cross-section references
├── real-world-scenarios/
│   ├── customer-support.test.ts     # Real customer support agent
│   ├── ecommerce-bot.test.ts        # E-commerce scenarios
│   └── complex-flows.test.ts        # Complex multi-flow scenarios
├── error-scenarios/
│   ├── syntax-errors.test.ts        # Various syntax error cases
│   ├── semantic-errors.test.ts      # Semantic validation errors
│   └── recovery-scenarios.test.ts   # Error recovery testing
└── performance/
    ├── large-files.test.ts          # Large file parsing performance
    ├── deeply-nested.test.ts        # Deep nesting performance
    └── memory-usage.test.ts         # Memory usage validation
```

#### 5.1.4 Compliance Tests
```
tests/compliance/
├── formal-specification/
│   ├── section-2-lexical.test.ts    # All Section 2 examples
│   ├── section-3-syntactic.test.ts  # All Section 3 examples
│   ├── section-4-identifiers.test.ts # All Section 4 examples
│   ├── section-5-types.test.ts      # All Section 5 examples
│   ├── section-6-collections.test.ts # All Section 6 examples
│   └── section-7-sections.test.ts   # All Section 7 examples
├── data-types-spec/
│   ├── basic-types.test.ts          # All basic type examples
│   ├── collections.test.ts          # All collection examples
│   ├── shortcuts.test.ts            # All shortcut examples
│   └── type-tags.test.ts            # All type tag examples
└── overview-spec/
    ├── structure.test.ts            # All structure examples
    ├── syntax.test.ts               # All syntax examples
    ├── properties.test.ts           # All property examples
    └── flow-system.test.ts          # All flow system examples
```

**Compliance Test Cases:**

1. **Every EBNF Rule Validation**: Test each grammar rule from the formal specification
2. **Every Example Verification**: Parse every example from all three documentation files
3. **Constraint Compliance**: Validate all RCS specification constraints
4. **Edge Case Coverage**: Test boundary conditions and error cases
5. **Cross-Reference Validation**: Test import resolution and flow references

### 5.2 Test Coverage Requirements

- **Lexer**: 100% line coverage, 95% branch coverage
- **Parser**: 100% line coverage, 95% branch coverage  
- **AST Generation**: 100% node type coverage
- **Error Handling**: 100% error scenario coverage
- **Specification Compliance**: 100% formal spec example coverage

### 5.3 Test Data Sets

#### 5.3.1 Valid RCL Files
```
tests/fixtures/valid/
├── minimal-agent.rcl               # Simplest valid agent
├── complete-agent.rcl              # Agent with all features
├── multiple-flows.rcl              # Complex flow scenarios
├── all-shortcuts.rcl               # Every message shortcut
├── all-data-types.rcl              # Every data type example
├── embedded-expressions.rcl        # Complex embedded code
├── imports-example.rcl             # Import scenarios
└── real-world/
    ├── customer-support.rcl        # Realistic customer support
    ├── ecommerce.rcl               # E-commerce bot
    └── booking-system.rcl          # Appointment booking
```

#### 5.3.2 Invalid RCL Files
```
tests/fixtures/invalid/
├── syntax-errors/
│   ├── missing-required-sections.rcl
│   ├── invalid-identifiers.rcl
│   ├── malformed-expressions.rcl
│   └── incorrect-indentation.rcl
├── semantic-errors/
│   ├── undefined-references.rcl
│   ├── invalid-type-tags.rcl
│   ├── constraint-violations.rcl
│   └── circular-imports.rcl
└── edge-cases/
    ├── deeply-nested.rcl
    ├── large-file.rcl
    └── unicode-content.rcl
```

---

## Phase 6: Implementation Timeline

### Week 1: Foundation
- **Days 1-2**: File structure refactoring and modularization
- **Days 3-4**: Core lexer fixes (indentation, patterns, tokens)
- **Days 5**: Core parser base and token stream handling

### Week 2: Critical Fixes
- **Days 1-2**: Multi-line expression syntax fix
- **Days 3-4**: Message shortcuts implementation
- **Day 5**: Parser structure alignment (AgentDefinition hierarchy)

### Week 3: Advanced Features
- **Days 1-2**: Type tag implementation
- **Days 3-4**: Flow system compliance fixes
- **Day 5**: Multi-line string chomping and import fixes

### Week 4: Validation and Testing
- **Days 1-2**: Constraint validation and reference resolution
- **Days 3-4**: Comprehensive test suite implementation
- **Day 5**: Performance testing and optimization

---

## Success Criteria

### Functional Requirements
✅ **Parser correctly handles all formal specification examples**
✅ **All message shortcuts work as documented**
✅ **Multi-line expressions use indentation, not braces**
✅ **Type tags parse correctly with proper content extraction**
✅ **Flow system supports multi-arrow transitions**
✅ **Import resolution matches specification exactly**
✅ **All RCS constraints are validated**

### Quality Requirements
✅ **100% formal specification compliance**
✅ **95%+ test coverage across all modules**
✅ **Zero breaking changes to existing valid RCL files**
✅ **Performance: Parse 1000-line files in <100ms**
✅ **Memory: <50MB for typical agent definitions**

### Documentation Requirements
✅ **Updated API documentation**
✅ **Migration guide from old to new implementation**
✅ **Comprehensive examples and tutorials**
✅ **Performance benchmarks and optimization guide**

---

## Risk Mitigation

### High-Risk Items
1. **Breaking Changes**: Maintain backward compatibility where possible
2. **Performance Regression**: Benchmark throughout development
3. **Specification Drift**: Lock specification version during implementation
4. **Test Coverage Gaps**: Automate coverage reporting

### Contingency Plans
1. **Phased Rollout**: Implement behind feature flags
2. **Rollback Strategy**: Maintain old implementation as fallback
3. **Progressive Migration**: Support both old and new syntax temporarily
4. **Community Feedback**: Early preview releases for validation

---

This plan provides a comprehensive roadmap to bring the RCL implementation into full compliance with the formal specification while maintaining code quality and backward compatibility.