# Semantic Highlighting & Enhanced LSP Features Plan

## Overview

**NOTE:** Your completion provider and validation are already excellent! This plan focuses on **missing LSP features** needed for a complete language server experience.

Based on [Langium's Keywords as Identifiers guide](https://langium.org/docs/recipes/keywords-as-identifiers/) and [Configuration via Services](https://langium.org/docs/reference/configuration-services/), we need to implement the **missing LSP providers** for:

1. **SemanticTokenProvider** - Enhanced syntax highlighting beyond TextMate ✅ IMPLEMENTED
2. **HoverProvider** - Rich contextual information on hover ✅ IMPLEMENTED (Basic)
3. **DocumentSymbolProvider** - Outline navigation and breadcrumbs
4. **ReferenceProvider** - Go-to-definition and find-references ✅ IMPLEMENTED (Basic Structure - User Fixed)

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

### 🎯 **2. HoverProvider (High Priority)** ✅ IMPLEMENTED (Basic)

**Missing:** Rich hover information with documentation and type info.

**Implementation (Current Basic Version):**
```typescript
// packages/language/src/lsp/rcl-hover-provider.ts
// (Current simplified implementation extending AstNodeHoverProvider)
export class RclHoverProvider extends AstNodeHoverProvider {
    // ... constructor ...
    protected getAstNodeHoverContent(node: AstNode, cancelToken?: CancellationToken): MaybePromise<Hover | undefined> {
        if (isSection(node)) {
            return this.getSectionHoverDetails(node);
        }
        if (isAttribute(node)) {
            return this.getAttributeHoverDetails(node);
        }
        return undefined;
    }
    // ... simplified getSectionHoverDetails and getAttributeHoverDetails ...
}
```

### 🎯 **3. DocumentSymbolProvider (Medium Priority)**

**Missing:** Document outline and navigation.

**Implementation:**
```typescript
// packages/language/src/lsp/rcl-document-symbol-provider.ts
export class RclDocumentSymbolProvider extends AbstractDocumentSymbolProvider {

    protected getSymbol(document: LangiumDocument, astNode: AstNode): DocumentSymbol | undefined {
        if (isSection(astNode)) {
            return this.getSectionSymbol(astNode);
        } else if (isAttribute(astNode)) {
            return this.getAttributeSymbol(astNode);
        }
        return undefined;
    }

    private getSectionSymbol(section: Section): DocumentSymbol {
        const sectionType = section.sectionType || 'section';
        const sectionName = section.sectionName || section.reservedName || 'Unnamed';

        return {
            name: `${sectionName} (${sectionType})`,
            kind: SymbolKind.Module,
            range: section.$cstNode!.range,
            selectionRange: this.getSectionNameRange(section),
            children: [
                ...section.attributes.map(attr => this.getAttributeSymbol(attr)),
                ...section.subSections.map(sub => this.getSectionSymbol(sub))
            ].filter(child => child !== undefined)
        };
    }
}
```

### 🎯 **4. ReferenceProvider (High Priority)** ✅ IMPLEMENTED (Basic Structure - User Fixed)

**Missing:** Go-to-definition and find-references.

**Implementation (Current Basic Structure - User Fixed):**
```typescript
// packages/language/src/lsp/rcl-reference-provider.ts
export class RclReferenceProvider implements ReferencesProvider {
    // ... constructor ...
    findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken?: CancellationToken): MaybePromise<Location[]> {
        const rootAstNode = document.parseResult.value;
        if (!rootAstNode?.$cstNode) { return []; }
        const offset = document.textDocument.offsetAt(params.position);
        const cstLeaf = CstUtils.findLeafNodeAtOffset(rootAstNode.$cstNode, offset);
        if (!cstLeaf?.element) { return []; }
        const astNodeForLeaf = cstLeaf.element;

        if (isIdentifier(astNodeForLeaf)) { /* ... */ }
        if (isFlowOperand(astNodeForLeaf)) { /* ... */ }
        // ... logic for section names ...
        return [];
    }
    // ... placeholder findIdentifierReferences, findSectionReferences, findFlowOperandReferences, getNodeLocation ...
}
```

---

## Service Registration Updates

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
        DocumentSymbolProvider: (services) => new RclDocumentSymbolProvider(services), // ❌ NEW
        SemanticTokenProvider: (services) => new RclSemanticTokenProvider(services), // ✅ IMPLEMENTED
    },
    meta: {
        SectionTypeRegistry: () => new SectionTypeRegistry() // ✅ Implemented
    }
};
```

---

## Keywords-as-Identifiers Support

### Problem: Context-Dependent Token Interpretation

Your existing token conflicts (boolean keywords vs identifiers) need semantic highlighting that understands context:

```rcl
# Context 1: Section name (identifier)
agent True:
    displayName: "True Agent"

# Context 2: Boolean value (keyword)
    enabled: True
```

### Solution: Enhanced SemanticTokenProvider

The `SemanticTokenProvider` should highlight the same token (`True`) differently based on syntactic context:

- **Section name context:** `SemanticTokenTypes.type` (identifier)
- **Boolean value context:** `SemanticTokenTypes.enumMember` (keyword)

---

## Implementation Timeline

### **Week 1: Core LSP Features**
- **Day 1-2:** Implement `SemanticTokenProvider` ✅ COMPLETE
- **Day 3-4:** Implement `HoverProvider` ✅ COMPLETE (Basic Implementation)
- **Day 5:** Test and integrate (HoverProvider testing can include enhancing details)

### **Week 2: Navigation Features**
- **Day 1-2:** Implement `ReferenceProvider` ✅ COMPLETE (Basic Structure - User Fixed; actual reference finding logic TBD)
- **Day 3-4:** Implement `DocumentSymbolProvider`
- **Day 5:** Integration testing and polish

**Total: 10 days**

---

## Success Criteria

### ✅ **Must Have**
1. **Semantic highlighting** distinguishes keywords vs identifiers contextually
2. **Hover information** shows section/attribute documentation
3. **Go-to-definition** works for section references
4. **Document outline** shows section hierarchy

### 🎯 **Should Have**
1. **Find references** locates all usages of sections/attributes
2. **Hover shows validation info** (required attributes, allowed values)
3. **Symbol highlighting** on cursor position

### 🌟 **Nice to Have**
1. **Breadcrumb navigation** in editor
2. **Quick info** in completion items
3. **Signature help** for complex attributes

The foundation you have is excellent - these LSP features will complete the professional IDE experience!