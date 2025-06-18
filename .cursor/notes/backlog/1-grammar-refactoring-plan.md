# Grammar Refactoring Plan: Token Conflicts & Multi-Mode Lexing

## Problem Analysis

### 🔥 Critical Token Conflicts Identified

#### 1. **PRIMARY CONFLICT: Boolean Keywords vs PROPER_WORD**
**Location:** `primitives.langium`
```langium
terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;
terminal PROPER_WORD: /\b[A-Z](?:[a-zA-Z0-9]*|(?<=\w)-(?=\w))*\b/;
```

**Conflict:** Words like "True", "False", "On", "Off", "Yes", "No", "Active", "Inactive", "Enabled", "Disabled" match BOTH boolean keywords AND PROPER_WORD.

**Impact:**
- Section names like `agent True` become ambiguous
- ProperNoun identifiers cannot use these reserved words
- Parser errors when these words appear in identifier contexts

#### 2. **SECONDARY CONFLICT: TYPE_TAG_NAME vs COMMON_NOUN**
**Location:** `type-system.langium` + `primitives.langium`
```langium
terminal TYPE_TAG_NAME: /(date|datetime|time|email|phone|msisdn|url|zipcode|zip)/;
terminal COMMON_NOUN: /[a-z][a-zA-Z0-9_]*/;
```

**Conflict:** Type tag names can also be parsed as common nouns in attribute contexts.

#### 3. **TERTIARY CONFLICT: ATOM vs Boolean/Type Keywords**
**Location:** `primitives.langium`
```langium
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
```

**Conflict:** `:True`, `:date`, `:email` etc. can be parsed as ATOM instead of colon + keyword.

#### 4. **RESERVED SECTION NAMES vs PROPER_WORD**
**Location:** `sections.langium`
```langium
ReservedSectionName: 'Config' | 'Defaults' | 'Messages';
```

**Conflict:** These keywords can also match PROPER_WORD in other contexts.

---

## Solution Strategy: Multi-Mode Lexing + Indentation Awareness

### 🎯 Core Approach

**⚠️ IMPORTANT:** Your project already uses `IndentationAwareTokenBuilder` and `IndentationAwareLexer`. We need to **extend** this existing infrastructure, not replace it.

Based on [Langium Multi-Mode Lexing Guide](https://eclipse-langium.github.io/langium-previews/pr-previews/pr-132/guides/multi-mode-lexing/), we'll implement context-aware token recognition that **works with** indentation awareness.

### 📋 Implementation Plan

#### Phase 1: Create Hybrid TokenBuilder

**File:** `packages/language/src/services/rcl-custom-token-builder.ts`

```typescript
import { IndentationAwareTokenBuilder, isTokenTypeArray, GrammarAST } from "langium";
import { IMultiModeLexerDefinition, TokenType, TokenVocabulary } from "chevrotain";

const DEFAULT_MODE = 'default_mode';
const BOOLEAN_CONTEXT_MODE = 'boolean_context_mode';
const TYPE_TAG_MODE = 'type_tag_mode';
const SECTION_NAME_MODE = 'section_name_mode';

/**
 * Custom token builder that combines indentation awareness with multi-mode lexing
 * for resolving RCL token conflicts while preserving indentation-based structure.
 */
export class RclCustomTokenBuilder extends IndentationAwareTokenBuilder {

    override buildTokens(grammar: GrammarAST.Grammar, options?: { caseInsensitive?: boolean }): TokenVocabulary {
        // First, get tokens from the parent IndentationAwareTokenBuilder
        const baseTokens = super.buildTokens(grammar, options);

        if (isTokenTypeArray(baseTokens)) {
            // Apply multi-mode lexing on top of indentation-aware tokens
            return this.applyMultiModeLexing(baseTokens);
        }

        return baseTokens;
    }

    private applyMultiModeLexing(tokens: TokenType[]): IMultiModeLexerDefinition {
        // Filter tokens for different modes while preserving indentation tokens
        const indentationTokens = tokens.filter(token =>
            ['INDENT', 'DEDENT', 'WS', 'NL'].includes(token.name)
        );

        // Regular mode: exclude boolean keywords from PROPER_WORD context
        const regularModeTokens = tokens.filter(token =>
            !['TRUE_KW', 'FALSE_KW'].includes(token.name) ||
            indentationTokens.includes(token)
        );

        // Boolean context mode: prioritize boolean keywords over PROPER_WORD
        const booleanModeTokens = tokens.filter(token =>
            token.name !== 'PROPER_WORD' ||
            indentationTokens.includes(token)
        );

        // Type tag mode: enable TYPE_TAG_NAME, disable COMMON_NOUN conflicts
        const typeTagModeTokens = tokens.filter(token =>
            !this.conflictsWithTypeTag(token) ||
            indentationTokens.includes(token)
        );

        // Section name mode: allow all PROPER_WORD including reserved keywords
        const sectionNameModeTokens = tokens.filter(token =>
            !['TRUE_KW', 'FALSE_KW', 'TYPE_TAG_NAME'].includes(token.name) ||
            indentationTokens.includes(token)
        );

        const multiModeLexerDef: IMultiModeLexerDefinition = {
            modes: {
                [DEFAULT_MODE]: regularModeTokens,
                [BOOLEAN_CONTEXT_MODE]: booleanModeTokens,
                [TYPE_TAG_MODE]: typeTagModeTokens,
                [SECTION_NAME_MODE]: sectionNameModeTokens
            },
            defaultMode: DEFAULT_MODE
        };

        return multiModeLexerDef;
    }

    protected override buildTerminalToken(terminal: GrammarAST.TerminalRule): TokenType {
        let tokenType = super.buildTerminalToken(terminal);

        // Add mode transitions for specific terminals
        if (tokenType.name === 'LT') { // '<' starts type conversion
            tokenType.PUSH_MODE = TYPE_TAG_MODE;
        } else if (tokenType.name === 'GT') { // '>' ends type conversion
            tokenType.POP_MODE = true;
        }

        return tokenType;
    }

    protected override buildKeywordToken(
        keyword: GrammarAST.Keyword,
        terminalTokens: TokenType[],
        caseInsensitive: boolean
    ): TokenType {
        let tokenType = super.buildKeywordToken(keyword, terminalTokens, caseInsensitive);

        // Handle specific keyword conflicts
        if (['Config', 'Defaults', 'Messages'].includes(tokenType.name)) {
            // These should only be active in section name contexts
            delete tokenType.LONGER_ALT;
        }

        return tokenType;
    }

    private conflictsWithTypeTag(token: TokenType): boolean {
        const conflictingTokens = ['COMMON_NOUN'];
        return conflictingTokens.includes(token.name);
    }
}
```

#### Phase 2: Update RclModule to Use Hybrid TokenBuilder

**File:** `packages/language/src/rcl-module.ts`

```typescript
import { RclCustomTokenBuilder } from './services/rcl-custom-token-builder.js';
import { IndentationAwareLexer } from 'langium';

export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    parser: {
        TokenBuilder: () => new RclCustomTokenBuilder(), // Changed from IndentationAwareTokenBuilder
        Lexer: (services) => new IndentationAwareLexer(services), // Keep indentation-aware lexer
    },
    // ... rest of existing module
};
```

---

## What You Already Have vs. What's Needed

### ✅ **Already Excellent (Keep as-is)**
1. **Completion Provider** - Your `RclCompletionProvider` is already sophisticated
2. **Validation System** - `SectionValidator` + `RclValidator` cover most needs
3. **Schema System** - `SECTION_TYPE_CONSTANTS` + JSON schemas are comprehensive
4. **Service Architecture** - Proper Langium DI setup

### 🔧 **Needs Enhancement**
1. **Token Conflicts** - Multi-mode lexing (this plan)
2. **Semantic Highlighting** - Enhanced for keywords-as-identifiers
3. **Embedded Code Support** - JavaScript/TypeScript in `$js>` blocks
4. **Advanced LSP Features** - Go-to-definition, references, hover

### 🆕 **Missing Features**
1. **Formatting** - No formatter implemented yet
2. **Advanced Validation** - Dependency loops, embedded code validation
3. **TextMate Grammar** - Decide on auto-generated vs custom approach

---

## TextMate Grammar Decision

### **Option A: Extend Auto-Generated (Recommended)**
```typescript
// In build process, extend the generated grammar
const generatedGrammar = readGeneratedTmLanguage();
const extendedGrammar = {
    ...generatedGrammar,
    patterns: [
        ...generatedGrammar.patterns,
        // Add embedded code patterns
        { include: "#embedded-javascript" },
        { include: "#embedded-typescript" }
    ],
    repository: {
        ...generatedGrammar.repository,
        "embedded-javascript": {
            begin: "\\$js>",
            end: "$",
            patterns: [{ include: "source.js" }]
        }
    }
};
```

### **Option B: Custom Grammar (More Control)**
Write complete custom grammar with embedded language support.

**Recommendation:** **Option A** - extend auto-generated to preserve Langium integration while adding RCL-specific features.

---

## Revised Timeline

- **Phase 1 (Custom TokenBuilder):** 3 days
- **Phase 2 (Grammar Updates):** 2 days
- **Phase 3 (TextMate Enhancement):** 2 days
- **Phase 4 (Testing & Integration):** 2 days

**Total: 9 days** (down from 12 days since validation/completion already exist)

---

## Next Actions

1. ✅ **COMPLETE:** Update this plan based on existing code
2. **NEXT:** Implement `RclCustomTokenBuilder` extending `IndentationAwareTokenBuilder`
3. **THEN:** Decide on TextMate grammar approach (extend vs custom)
4. **THEN:** Test token conflict resolution
5. **FINALLY:** Enhance existing services rather than rebuilding