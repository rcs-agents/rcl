# When Clause Design Analysis

## Current Implementation: ✅ CORRECT

### Implementation Structure
The when clause is correctly implemented as part of `FlowRule` rather than as a standalone construct within `FlowSection`.

```typescript
// FlowRule contains optional when clauses
export interface FlowRule extends AstNode {
  type: 'FlowRule';
  operands: FlowOperand[];     // Main flow sequence  
  withClause?: WithClause;     // Parameter passing
  whenClauses?: WhenClause[];  // Conditional branches ← CORRECT
  location?: Location;
}

// When clause contains condition and transitions
export interface WhenClause extends AstNode {
  type: 'WhenClause';
  condition: EmbeddedExpression;
  transitions: FlowTransition[];
  location?: Location;
}
```

### Syntactic Evidence

#### Grammar Definition
```langium
WhenClause returns WhenClause:
    WHEN_KW condition=EmbeddedExpression NL?
    INDENT?
    transitions+=FlowTransition*
    DEDENT?;
```

#### Usage Example
```rcl
Welcome ->
  when @option.text is "premium":
    "Book Premium" -> Premium Service
    "Get Support" -> Premium Support
  when @option.text is "basic":  
    "Book Basic" -> Basic Service
    "Get Help" -> Basic Support
```

### Semantic Justification

1. **Conditional Flow Branching**: When clauses provide runtime-conditional transitions that extend a flow rule's basic sequence.

2. **Rule-Bound Context**: Conditions are evaluated in the context of the flow rule they belong to, accessing its operands and parameters.

3. **Multiple Conditions**: A single flow rule can have multiple when clauses for different conditions.

4. **Nested Structure**: The indented transitions under when clauses create a clear hierarchical relationship.

### Implementation Benefits

1. **Semantic Clarity**: When clauses are clearly subordinate to their parent flow rule.

2. **Parser Simplicity**: The hierarchical structure makes parsing more straightforward.

3. **Type Safety**: Strong typing ensures when clauses can only appear in valid flow rule contexts.

4. **Extensibility**: Additional conditional constructs can be added to flow rules without breaking the structure.

### Comparison to Alternatives

#### ❌ Alternative: Standalone When Clauses in FlowSection
```typescript
// This would be incorrect
export interface FlowSection extends AstNode {
  type: 'FlowSection';
  name: string;
  rules: FlowRule[];
  whenClauses?: WhenClause[];  // ← Would be incorrect
  location?: Location;
}
```

**Why this is wrong:**
- When clauses would lose their relationship to specific flow rules
- Conditions would lack proper context
- Grammar would become more complex and ambiguous
- Semantic meaning would be unclear

### Conclusion
The current implementation of when clauses as optional properties of `FlowRule` is **architecturally sound** and **semantically correct**. This design:

✅ Reflects the actual usage patterns in RCL code  
✅ Maintains clear semantic relationships  
✅ Enables proper type checking and validation  
✅ Follows established language design principles  

**Recommendation**: No changes needed. The when clause implementation should remain as-is.