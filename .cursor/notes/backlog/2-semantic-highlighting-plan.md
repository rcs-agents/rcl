# Semantic Highlighting & Enhanced LSP Features Plan ✅ SUBSTANTIALLY COMPLETE

## Overview

**NOTE:** Your completion provider and validation are already excellent! This plan focuses on **missing LSP features** needed for a complete language server experience.

Based on [Langium's Keywords as Identifiers guide](https://langium.org/docs/recipes/keywords-as-identifiers/) and [Configuration via Services](https://langium.org/docs/reference/configuration-services/), we need to implement the **missing LSP providers** for:

1. **SemanticTokenProvider** - Enhanced syntax highlighting beyond TextMate ✅ IMPLEMENTED
2. **HoverProvider** - Rich contextual information on hover ✅ IMPLEMENTED (Enhanced)
3. **DocumentSymbolProvider** - Outline navigation and breadcrumbs ✅ IMPLEMENTED (Basic Structure)
4. **ReferenceProvider** - Go-to-definition and find-references ✅ IMPLEMENTED (Basic Structure - User Fixed & Builds)

---

## Missing LSP Features Analysis

### 🎯 **1. SemanticTokenProvider (High Priority)** ✅ IMPLEMENTED

**Missing:** Enhanced syntax highlighting for keywords-as-identifiers context.

**Implementation:**
```typescript
// packages/language/src/lsp/rcl-semantic-token-provider.ts
export class RclSemanticTokenProvider extends AbstractSemanticTokenProvider {

    protected highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
        if (isSection(node)) {
            this.highlightSection(node, acceptor);
        } else if (isAttribute(node)) {
            this.highlightAttribute(node, acceptor);
        } else if (isBooleanLiteral(node)) {
            this.highlightBoolean(node, acceptor);
        }
    }

    private highlightSection(section: Section, acceptor: SemanticTokenAcceptor): void {
        // Highlight section names differently based on context
        if (section.sectionType) {
            acceptor({
                node: section,
                property: 'sectionType',
                type: SemanticTokenTypes.type
            });
        }

        // Handle reserved section names (Config, Defaults, Messages)
        if (section.reservedName) {
            acceptor({
                node: section,
                property: 'reservedName',
                type: SemanticTokenTypes.keyword,
                modifier: SemanticTokenModifiers.defaultLibrary
            });
        }
    }

    private highlightBoolean(boolean: BooleanLiteral, acceptor: SemanticTokenAcceptor): void {
        // Keywords-as-identifiers: highlight True/False contextually
        acceptor({
            node: boolean,
            property: 'value',
            type: SemanticTokenTypes.enumMember,
            modifier: SemanticTokenModifiers.readonly
        });
    }
}
```

### 🎯 **2. HoverProvider (High Priority)** ✅ IMPLEMENTED (Enhanced)

**Missing:** Rich hover information with documentation and type info.

**Implementation (Current Enhanced Version):**
```typescript
// packages/language/src/lsp/rcl-hover-provider.ts
export class RclHoverProvider extends AstNodeHoverProvider {
    // ... constructor ...
    protected override getAstNodeHoverContent(node: AstNode, cancelToken?: CancellationToken): MaybePromise<Hover | undefined> {
        if (isSection(node)) { /* ... */ }
        if (isAttribute(node)) { /* ... */ }
        if (isBooleanValue(node)) { /* ... */ }
        if (isTypeConversion(node)) { /* ... */ }
        if (isEmbeddedCodeBlock(node)) { /* ... */ }
        if (isIdentifier(node)) { /* ... */ }
        return undefined;
    }
    // ... getSectionHoverDetails, getAttributeHoverDetails, getBooleanValueHover, getTypeConversionHover, getEmbeddedCodeHover, getIdentifierHover ...
}
```

### 🎯 **3. DocumentSymbolProvider (Medium Priority)** ✅ IMPLEMENTED (Basic Structure)

**Missing:** Document outline and navigation.

**Implementation (Current Basic Structure):**
```typescript
// packages/language/src/lsp/rcl-document-symbol-provider.ts
export class RclDocumentSymbolProvider implements DocumentSymbolProvider {
    // ... constructor ...
    getSymbols(document: LangiumDocument, params: DocumentSymbolParams, cancelToken?: CancellationToken): MaybePromise<DocumentSymbol[]> {
        // ... logic to get rootNode ...
        // ... iteration for imports and agentSection ...
        return Promise.resolve(symbols);
    }
    // ... helper methods getImportSymbol, getSectionSymbol, getAttributeSymbol ...
}
```

### 🎯 **4. ReferenceProvider (High Priority)** ✅ IMPLEMENTED (Basic Structure - User Fixed & Builds)

**Missing:** Go-to-definition and find-references.

**Implementation (Current Basic Structure - User Fixed & Builds):**
```typescript
// packages/language/src/lsp/rcl-reference-provider.ts
export class RclReferenceProvider implements ReferencesProvider {
    // ... constructor ...
    findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken?: CancellationToken): MaybePromise<Location[]> {
        // ... logic to find cstLeaf and astNodeForLeaf using CstUtils/AstUtils ...
        // ... delegation to placeholder findXXXReferences methods ...
        return [];
    }
    // ... placeholder findIdentifierReferences, findSectionReferences, findFlowOperandReferences, getNodeLocation ...
}
```

---

## Service Registration Updates ✅ COMPLETE

**File:** `packages/language/src/rcl-module.ts`

```typescript
export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    parser: {
        TokenBuilder: () => new RclCustomTokenBuilder(), // For multi-mode lexing
        Lexer: (services) => new IndentationAwareLexer(services),
    },
    validation: {
        RclValidator: () => new RclValidator() // ✅ Already exists
    },
    lsp: {
        CompletionProvider: (services) => new RclCompletionProvider(services), // ✅ Already exists
        HoverProvider: (services) => new RclHoverProvider(services),           // ✅ IMPLEMENTED
        ReferenceProvider: (services) => new RclReferenceProvider(services),   // ✅ IMPLEMENTED
        DocumentSymbolProvider: (services) => new RclDocumentSymbolProvider(services), // ✅ IMPLEMENTED
        SemanticTokenProvider: (services) => new RclSemanticTokenProvider(services), // ✅ IMPLEMENTED
    },
    meta: {
        SectionTypeRegistry: () => new SectionTypeRegistry() // ✅ Implemented
    }
};
```

---

## Implementation Timeline ✅ All listed providers have at least basic implementations

### **Week 1: Core LSP Features**
- **Day 1-2:** Implement `SemanticTokenProvider` ✅ COMPLETE
- **Day 3-4:** Implement `HoverProvider` ✅ COMPLETE (Enhanced Implementation from Plan #3)
- **Day 5:** Test and integrate (Further hover detail refinement TBD)

### **Week 2: Navigation Features**
- **Day 1-2:** Implement `ReferenceProvider` ✅ COMPLETE (Basic Structure - User Fixed & Builds; actual reference finding logic TBD)
- **Day 3-4:** Implement `DocumentSymbolProvider` ✅ COMPLETE (Basic Structure)
- **Day 5:** Integration testing and polish (Detailed logic for ReferenceProvider and further testing for all providers TBD)

**Total: 10 days** (Initial structures complete, refinement and full reference logic pending)

---

## Success Criteria (Basic structures achieved)

### ✅ **Must Have**
1. **Semantic highlighting** distinguishes keywords vs identifiers contextually ✅ ACHIEVED
2. **Hover information** shows section/attribute documentation ✅ ACHIEVED (Enhanced)
3. **Go-to-definition** works for section references (Basic structure for ReferenceProvider exists, TBD)
4. **Document outline** shows section hierarchy ✅ ACHIEVED (Basic)

### 🎯 **Should Have**
1. **Find references** locates all usages of sections/attributes
2. **Hover shows validation info** (required attributes, allowed values)
3. **Symbol highlighting** on cursor position

### 🌟 **Nice to Have**
1. **Breadcrumb navigation** in editor
2. **Quick info** in completion items
3. **Signature help** for complex attributes

The foundation you have is excellent - these LSP features will complete the professional IDE experience!