# Langium Lexer & Tokenizer Rules: Essential Guidelines

## Overview
The Langium lexer transforms character streams into token streams using Chevrotain's regex-based lexer. Understanding terminal precedence and token matching is crucial for avoiding parsing issues.

## Critical Rules to Follow

### 1. Terminal Order is Everything
**Rule**: The order in which terminal rules are defined is **critical** - the lexer always returns the first match.

- Define more specific terminals **before** general ones
- Keywords should come before general identifier patterns
- Longer patterns should come before shorter ones that could be subsets

**Example Problem**:
```langium
terminal COMMON_NOUN: /[a-z][a-zA-Z0-9_-]*/;  // This comes first
terminal SECTION_TYPE: 'agent' | 'flow';      // This comes later - NEVER MATCHES!
```

**Solution**:
```langium
terminal SECTION_TYPE: 'agent' | 'flow';      // Specific keywords first
terminal COMMON_NOUN: /(?!agent\b|flow\b)[a-z][a-zA-Z0-9_-]*/;  // Exclude keywords
```

### 2. Parser Rules vs Terminal Order Does NOT Matter
**Rule**: The order between parser rules and terminal rules in the grammar file does not affect tokenization or parsing behavior.

- Parser rules can be defined before or after terminal rules
- Only the order **within** terminal rules matters for lexer precedence
- Only the order **within** parser rules matters for parser rule resolution
- Mix parser rules and terminal rules in any order for better organization

### 3. CRITICAL LANGIUM BUG: No Fragments or Sub-Rules in Terminals
**⚠️ BREAKING BUG**: There is currently a bug in Langium where using fragments or sub-rules in terminal definitions will break the parser.

**DO NOT USE**:
```langium
// ❌ BROKEN - fragments in terminals
terminal fragment LETTER: /[a-zA-Z]/;
terminal ID: LETTER (LETTER | DIGIT)*;

// ❌ BROKEN - sub-rules in terminals  
terminal WORD: LETTER+;
terminal IDENTIFIER: WORD ('_' WORD)*;
```

**WORKAROUND - Use only raw regex**:
```langium
// ✅ WORKS - pure regex patterns only
terminal ID: /[a-zA-Z][a-zA-Z0-9]*/;
terminal IDENTIFIER: /[a-zA-Z]+(?:_[a-zA-Z]+)*/;
```

**Impact**: Until this bug is fixed, all terminal rules must use only regex patterns. No composition, no fragments, no references to other terminals.

### 4. Use Negative Lookaheads for General Patterns
**Rule**: When you have general identifier patterns, exclude keywords using negative lookaheads.

```langium
terminal COMMON_NOUN: /(?!import\b|as\b|agent\b|flow\b)[a-z][a-zA-Z0-9_-]*/;
```

- `(?!keyword\b)` prevents matching "keyword" as an identifier
- `\b` ensures word boundaries (prevents partial matches)
- Include **all** keywords that start with lowercase letters

### 5. String Literals Are Safe
**Rule**: Keywords inside string literals are automatically protected - no special handling needed.

```langium
terminal STRING: /\"(\\.|[^\"\\])*\"/;
```

- String terminals are **atomic** - processed as complete units
- Keywords inside strings are never individually tokenized
- `"import something"` becomes one `STRING` token, not separate `import` + text

### 6. Hidden Terminals Are Global
**Rule**: Hidden terminals apply to **all** parser rules in the grammar.

```langium
hidden terminal WS: /\s+/;
hidden terminal SL_COMMENT: /#[^\r\n]*/;
```

- Use for whitespace, comments, and other ignored content
- Cannot be selectively applied to specific rules
- Be careful with whitespace if your language is indentation-sensitive

### 7. Keywords vs Terminals Precedence
**Rule**: Keywords in parser rules take precedence over terminals, but only if terminals don't match first.

**Problematic**:
```langium
terminal ID: /[a-z]+/;          // Matches "import"
ImportStmt: 'import' source=ID; // Keyword "import" never matches!
```

**Correct**:
```langium
terminal ID: /(?!import\b)[a-z]+/;  // Excludes "import"
ImportStmt: 'import' source=ID;     // Now "import" keyword works
```

### 8. Terminal Return Types
**Rule**: Specify return types when needed, default is `string`.

```langium
terminal ID: /[_a-zA-Z][\w_]*/;              // returns string (default)
terminal INT returns number: /[0-9]+/;       // returns number
terminal BOOL returns boolean: /true|false/; // returns boolean
```

### 9. Regex Best Practices
**Rule**: Write robust regex patterns with proper boundaries.

```langium
// Good - uses word boundaries
terminal KEYWORD: /\bkeyword\b/;

// Bad - could match partial words
terminal KEYWORD: /keyword/;

// Good - handles multi-word identifiers
terminal PROPER_NOUN: /\b[A-Z][\w-]*(?:[ \t]+[A-Z][\w-]*)*\b/;
```

### 10. ~~Fragment Terminals for Reusability~~ (CURRENTLY BROKEN)
**⚠️ DISABLED**: Due to the Langium bug mentioned above, fragment terminals cannot be used.

~~**Rule**: Use fragments to avoid duplication and improve readability.~~

```langium
// ❌ BROKEN - do not use until bug is fixed
terminal fragment LETTER: /[a-zA-Z]/;
terminal fragment DIGIT: /[0-9]/;
terminal ID: LETTER (LETTER | DIGIT | '_')*;
```

**Workaround**: Duplicate regex patterns in each terminal that needs them, or use very carefully crafted regex with groups.

### 11. Debugging Terminal Issues
**Rule**: When getting unexpected token errors, debug the lexer output first.

```javascript
// Debug script to check token output
const services = createYourLanguageServices(EmptyFileSystem).YourLanguage;
const lexer = services.parser.Lexer;
const tokens = lexer.tokenize("your input text");
console.log(tokens.tokens.map(t => `${t.tokenType.name}: "${t.image}"`));
```

### 12. Common Pitfalls to Avoid

#### Pitfall: Greedy Terminals
```langium
// Bad - too greedy, might consume keywords
terminal IDENTIFIER: /[a-zA-Z]+/;

// Good - excludes known keywords
terminal IDENTIFIER: /(?!if\b|while\b|for\b)[a-zA-Z]+/;
```

#### Pitfall: Missing Word Boundaries
```langium
// Bad - "forgetful" would match "for"
terminal FOR_KW: /for/;

// Good - only matches whole word "for"
terminal FOR_KW: /\bfor\b/;
```

#### Pitfall: Wrong Terminal Order
```langium
// Bad - IDENTIFIER matches before keywords
terminal IDENTIFIER: /[a-z]+/;
terminal IF: 'if';

// Good - keywords first, then exclude from IDENTIFIER
terminal IF: 'if';
terminal IDENTIFIER: /(?!if\b)[a-z]+/;
```

#### Pitfall: Using Fragments or Sub-Rules (CURRENTLY BROKEN)
```langium
// ❌ BROKEN - will cause parser failures
terminal fragment ALPHA: /[a-zA-Z]/;
terminal WORD: ALPHA+;

// ✅ WORKS - use pure regex instead
terminal WORD: /[a-zA-Z]+/;
```

## Testing Strategy

1. **Test lexer output** before testing parser rules
2. **Start with simple cases** and gradually add complexity
3. **Use debug scripts** to verify token streams
4. **Test edge cases** like keywords in strings, partial matches
5. **Verify precedence** by testing similar-looking patterns

## Memory Aids

- **"Specific before General"** - always define specific patterns first
- **"Exclude what you know"** - use negative lookaheads for known keywords
- **"Strings are safe"** - keywords in strings are automatically protected
- **"Debug tokens first"** - lexer issues often masquerade as parser issues
- **"Order matters"** - the first matching terminal wins
- **"Pure regex only"** - no fragments or sub-rules until Langium bug is fixed

## When Things Go Wrong

1. **"Unexpected character" errors** → Check if a terminal is consuming unexpected input
2. **"Expected X but found Y" errors** → Check if Y is being tokenized as wrong terminal type
3. **Keywords not recognized** → Check if a general terminal is matching them first
4. **Whitespace issues** → Verify hidden terminal configuration
5. **Parser compilation errors** → Check if you're using fragments or sub-rules in terminals (currently broken)

Following these rules will help you avoid the most common Langium lexer/tokenizer pitfalls and create robust grammars.

## FAQ: Advanced Topics

1. Can I write a grammar using only parser rules?
   - No. Lexing always runs before parsing, so you must define at least some `terminal` rules to split the input into tokens. Parser rules alone cannot drive tokenization.

2. Can I use a minimal set of terminals and decide token types during parsing?
   - You can define a few generic terminals (e.g. `WS`, `NL`, `STRING`, `WORD`) and classify keywords vs identifiers lexically by:
     - Placing literal keyword terminals (e.g. `terminal IMPORT: 'import';`) before your generic `WORD` rule, or
     - Excluding keywords in `WORD` via negative lookahead (e.g. `/(?!import\b|as\b)[A-Za-z][A-Za-z0-9]*/`).
   - You cannot defer keyword vs identifier classification to the parser; lexing is context-free.

3. How do I approach context-sensitive parsing in Langium?
   - Langium grammars are context-free. For context-sensitive behavior:
     1. Extend the token builder (e.g. `IndentationAwareTokenBuilder`) or use Chevrotain hooks to mutate token types based on simple state (e.g. indentation).
     2. Enforce complex or semantic rules in a post-parse validation or in scoping/resolution services.
     3. Use DataType rules or parser actions to capture semi-structured content, then refine in custom AST visitors.

4. Which grammar constructs become lexer rules vs parser rules?
   - Definitions with the `terminal` keyword (and `hidden terminal`) are lexer rules.
   - All other productions—including DataType rules (`X returns ...`) and parser rules—become parser rules.
   - String literals and keywords used in parser rules generate implicit anonymous terminals, but still lex before parsing.

5. Isn't multi-mode lexing context-aware?
   - No. Modes are just finite-state contexts triggered by specific tokens (e.g. entering string or comment mode).
   - The lexer cannot peek into parser state or semantic context—mode switches must be explicit.
   - Multi-mode lexing is useful for constructs like string interpolation or nested comments, not arbitrary grammar-sensitive lexing.

## Previous Issues and Solutions from RCL Development

### Issue: Parser Failing with "unexpected character" on Spaces
**Problem**: RCL parser was failing with "unexpected character: -> <- at offset: 5" when parsing `agent Test Agent`.

**Root Cause**: The `RclTokenBuilder` extends `IndentationAwareTokenBuilder`, which automatically makes whitespace tokens hidden. However, RCL grammar explicitly requires `__` (spaces) to be available for matching in rules like `Section: sectionType=SECTION_TYPE __ sectionName=PROPER_NOUN`.

**Solution**: 
- Override `buildTerminalToken()` in `RclTokenBuilder` to ensure the `__` terminal remains non-hidden
- Remove custom `lineBeginningWhitespaceMatcher` that interfered with normal space tokenization

```typescript
buildTerminalToken(terminal: TerminalRule, match: RegExpExecArray): IToken | undefined {
    const token = super.buildTerminalToken(terminal, match);
    if (token && terminal.name === '__') {
        // Ensure __ token is not hidden for explicit space matching
        delete (token as any).group;
    }
    return token;
}
```

### Issue: Import Statement Parsing with Space-Separated Identifiers
**Problem**: Import statements like `import My Company / Agents / Sample Agent as Sample` failed to parse.

**Initial Misdiagnosis**: Thought `PROPER_NOUN` regex was too greedy and matching across `/` separators.

**Actual Issues Found**:
1. **Grammar Structure**: The `entry RclFile` rule had incorrect `|` operator making imports and agent sections alternatives instead of sequence
2. **Terminal Greediness**: `PROPER_NOUN` terminal was indeed too greedy for the import context, but fixing this with negative lookaheads was rejected as too context-specific

**Attempted Solutions**:
- Fixed entry rule structure by removing incorrect `|` operator
- Attempted to create separate `PROPER_NOUN_WORD` terminal for individual words
- Tried restructuring `QualifiedName` rule to handle space-separated words explicitly

**Current Status**: Basic parsing works, but import statements with space-separated proper nouns remain problematic due to terminal greediness vs context-sensitivity trade-offs.

**Key Insight**: In Langium grammars for languages with space-separated identifiers (like "My Brand" or "BMW Agent"), avoid using grammar rules with required spaces between terminals as this creates parsing ambiguity. The lexer cannot distinguish between spaces that are part of identifiers vs spaces that are separators in the containing rule.
