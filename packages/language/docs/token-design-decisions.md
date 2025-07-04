# Token Design Decisions

## ATTRIBUTE_KEY Token with Lookahead

### Decision
The `ATTRIBUTE_KEY` token uses a positive lookahead pattern: `/[a-z][a-zA-Z0-9_]*(?=\s*:)/`

### Rationale
The lookahead `(?=\s*:)` is a deliberate design choice that provides several benefits:

1. **Context-Sensitive Tokenization**: Ensures that lowercase identifiers are only tokenized as `ATTRIBUTE_KEY` when they appear in attribute contexts (followed by a colon).

2. **Disambiguation**: Prevents conflicts between general identifiers and attribute keys, allowing the same lexical pattern to be used in different contexts.

3. **Grammar Clarity**: Makes the grammar more precise by ensuring attribute keys are recognized only where they're syntactically valid.

4. **Error Prevention**: Reduces parser ambiguity and improves error messages by being more specific about token context.

### Example Usage
```rcl
agent My Agent:
  displayName: "Customer Support"  # displayName is ATTRIBUTE_KEY
  description: "A helpful agent"   # description is ATTRIBUTE_KEY
  
  flow Main Flow:
    start -> Welcome Message       # start, Welcome, Message are IDENTIFIER
```

### Implementation Consistency
This pattern is consistently implemented across:
- Custom lexer (`src/parser/lexer/tokens/token-definitions.ts`)
- Langium grammar (`src/rcl-grammar.langium`) 
- Modular grammar (`src/grammar/core/primitives.langium`)
- TextMate syntax highlighting (`syntaxes/rcl/regex.ts`)

### Conclusion
The lookahead pattern should be **retained** as it represents a well-thought-out design decision that improves the language's parsing precision and user experience. This implementation detail should be documented in the formal specification.

### Status: ✅ APPROVED
The current ATTRIBUTE_KEY token definition with lookahead is correct and should remain unchanged.