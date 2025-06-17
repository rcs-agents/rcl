# RCL Architecture: Grammar vs Semantic Validation

## Problem Statement
RCL is a language designed to make it easier to build objects that conform to the external RCS (Rich Communication Services) specification. The challenge is determining what constraints should be enforced in the grammar vs semantic validation.

## Recommended Approach: Minimal Grammar + Rich Semantic Validation

### Principles

1. **Grammar focuses on syntax structure** - not semantic constraints
2. **Validation layer enforces specification compliance** - where domain knowledge lives
3. **Separation of concerns** - parsing vs validation vs code generation

### What Goes in Grammar

```langium
// ✅ DO: Simple, flexible structure
Property: name=IDENTIFIER ':' value=Value;

AgentDefinition:
    'agent' name=ProperNoun NL
    INDENT (properties+=Property)* DEDENT;
```

**Grammar should handle:**
- Basic syntax structure (indentation, keywords, operators)
- Token definitions (identifiers, strings, numbers)
- General AST shape (what contains what)
- Cross-references between AST nodes

### What Goes in Semantic Validation

```typescript
// ✅ DO: Rich domain-specific validation
const RCS_AGENT_SPEC = {
    requiredProperties: ['displayName'],
    optionalProperties: ['brandName', 'config', 'defaults'],
    propertyTypes: { displayName: 'string', brandName: 'string' },
    propertyConstraints: { displayName: { maxLength: 100 } }
};
```

**Validation should handle:**
- Required vs optional properties (per RCS spec)
- Property type checking
- Value constraints (length, format, ranges)
- Cross-property dependencies
- Specification compliance
- Business rules

### Benefits of This Approach

1. **Flexibility**: Grammar can evolve independently of RCS spec changes
2. **Maintainability**: Spec changes only require validator updates
3. **Better Error Messages**: Validators can provide domain-specific error messages
4. **Separation of Concerns**: Parser does parsing, validator does domain logic
5. **Extensibility**: Easy to add new object types without grammar changes
6. **Testing**: Can unit test validation logic separately

### Implementation Pattern

1. **Keep grammar simple and permissive**
2. **Load external specifications** (JSON schema, etc.)
3. **Implement rich validators** that understand domain semantics
4. **Provide helpful error messages** with suggestions for fixes
5. **Generate target objects** from validated AST

### Anti-Patterns to Avoid

❌ **Don't encode specification details in grammar:**
```langium
// BAD: Hard-codes RCS spec in grammar
AgentDefinition:
    'agent' name=ProperNoun NL
    INDENT
        'displayName' ':' displayName=STRING  // Required property hard-coded
        ('brandName' ':' brandName=STRING)?   // Optional property hard-coded
    DEDENT;
```

❌ **Don't create overly specific AST interfaces:**
```langium
// BAD: Too specific, breaks when spec changes
interface AgentDefinition {
    displayName: string;
    brandName?: string;
    config?: ConfigDefinition;
}
```

### Example Workflow

1. **Parse**: `agent MyBot displayName: "My Bot" unknownProp: "value"`
2. **Validate**: Check against RCS spec, warn about `unknownProp`
3. **Generate**: Create valid RCS agent object, ignoring unknown properties

This approach makes RCL resilient to specification changes while providing excellent developer experience through rich validation and error reporting. 