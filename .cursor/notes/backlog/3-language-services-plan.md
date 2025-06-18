# Language Server Protocol Services Plan

## Overview

Based on [Langium Configuration via Services](https://langium.org/docs/reference/configuration-services/), we need to implement comprehensive LSP services for RCL that provide a rich editing experience including:

1. **Context-aware completion** with section types, attributes, and values
2. **Hover information** with documentation and type information
3. **Go-to-definition and references** for identifiers and sections
4. **Document symbols** for navigation and outline
5. **Diagnostics and validation** with helpful error messages
6. **Rename support** for refactoring

---

## LSP Services Architecture

### 🎯 **Core LSP Services to Implement**

#### 1. **CompletionProvider** - Smart autocompletion
#### 2. **HoverProvider** - Contextual information on hover
#### 3. **ReferenceProvider** - Find all references to symbols
#### 4. **DocumentSymbolProvider** - Document outline and navigation
#### 5. **RenameHandler** - Symbol renaming with validation
#### 6. **FoldingRangeProvider** - Code folding for sections and embedded code
#### 7. **DocumentHighlighter** - Highlight symbol occurrences

---

## Implementation Strategy

### 📋 **Phase 1: Enhanced Completion Provider**

**File:** `packages/language/src/services/rcl-completion-provider.ts`

```typescript
import { CompletionProvider, CompletionContext, MaybePromise, CompletionAcceptor } from 'langium';
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver';

export class RclCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): MaybePromise<void> {
        const node = context.node;

        if (this.isInSectionTypeContext(context)) {
            return this.completeSectionTypes(context, acceptor);
        }

        if (this.isInAttributeNameContext(context)) {
            return this.completeAttributeNames(context, acceptor);
        }

        if (this.isInAttributeValueContext(context)) {
            return this.completeAttributeValues(context, acceptor);
        }

        if (this.isInFlowOperandContext(context)) {
            return this.completeFlowOperands(context, acceptor);
        }

        // Fall back to default completion
        return super.completionFor(context, next, acceptor);
    }

    private completeSectionTypes(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const sectionTypes = [
            { name: 'agent', detail: 'Main agent configuration section' },
            { name: 'message', detail: 'Message template section' },
            { name: 'flow', detail: 'Conversation flow definition' },
            { name: 'authentication message', detail: 'Authentication message template' },
            { name: 'transaction message', detail: 'Transaction message template' },
        ];

        sectionTypes.forEach(section => {
            acceptor(context, {
                label: section.name,
                kind: CompletionItemKind.Keyword,
                detail: section.detail,
                insertText: `${section.name} `,
                documentation: this.getSectionTypeDocumentation(section.name)
            });
        });
    }

    private completeAttributeNames(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const parentSection = this.getParentSection(context.node);
        const sectionType = this.getSectionType(parentSection);

        const attributes = this.getValidAttributesForSection(sectionType);

        attributes.forEach(attr => {
            acceptor(context, {
                label: attr.name,
                kind: CompletionItemKind.Property,
                detail: attr.type,
                insertText: `${attr.name}: `,
                documentation: attr.documentation,
                filterText: attr.name
            });
        });
    }

    private completeAttributeValues(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const attribute = this.getCurrentAttribute(context.node);
        const attributeName = this.getAttributeName(attribute);

        // Type-specific completions
        if (this.isBooleanAttribute(attributeName)) {
            this.completeBooleanValues(context, acceptor);
        } else if (this.isEnumAttribute(attributeName)) {
            this.completeEnumValues(context, acceptor, attributeName);
        } else if (this.isTypeConversionContext(context)) {
            this.completeTypeConversions(context, acceptor);
        }
    }

    private completeBooleanValues(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const booleanValues = [
            { label: 'True', insertText: 'True' },
            { label: 'False', insertText: 'False' },
            { label: 'On', insertText: 'On' },
            { label: 'Off', insertText: 'Off' },
            { label: 'Yes', insertText: 'Yes' },
            { label: 'No', insertText: 'No' }
        ];

        booleanValues.forEach(value => {
            acceptor(context, {
                label: value.label,
                kind: CompletionItemKind.Value,
                insertText: value.insertText
            });
        });
    }

    private completeTypeConversions(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const typeConversions = [
            { name: 'date', example: '<date>2024-01-15</date>', description: 'Date value' },
            { name: 'time', example: '<time>14:30:00</time>', description: 'Time value' },
            { name: 'email', example: '<email>user@example.com</email>', description: 'Email address' },
            { name: 'phone', example: '<phone>+1234567890</phone>', description: 'Phone number' },
            { name: 'url', example: '<url>https://example.com</url>', description: 'URL address' }
        ];

        typeConversions.forEach(type => {
            acceptor(context, {
                label: `<${type.name}>`,
                kind: CompletionItemKind.Snippet,
                insertText: `<${type.name}>\${1:value}</${type.name}>`,
                insertTextFormat: InsertTextFormat.Snippet,
                detail: type.description,
                documentation: `Example: ${type.example}`
            });
        });
    }
}
```

### 📋 **Phase 2: Hover Provider with Rich Information**

**File:** `packages/language/src/services/rcl-hover-provider.ts`

```typescript
export class RclHoverProvider extends AbstractHoverProvider {

    protected getHoverContent(document: LangiumDocument, params: HoverParams): MaybePromise<Hover | undefined> {
        const rootNode = document.parseResult?.value;
        if (!rootNode) return undefined;

        const targetNode = findLeafNodeAtOffset(rootNode, document.textDocument.offsetAt(params.position));
        if (!targetNode) return undefined;

        return this.getAstNodeHoverContent(targetNode);
    }

    protected getAstNodeHoverContent(node: AstNode): Hover | undefined {
        if (isSection(node)) {
            return this.getSectionHover(node);
        }

        if (isAttribute(node)) {
            return this.getAttributeHover(node);
        }

        if (isBooleanLiteral(node)) {
            return this.getBooleanLiteralHover(node);
        }

        if (isTypeConversion(node)) {
            return this.getTypeConversionHover(node);
        }

        if (isEmbeddedCodeBlock(node)) {
            return this.getEmbeddedCodeHover(node);
        }

        if (isIdentifier(node)) {
            return this.getIdentifierHover(node);
        }

        return undefined;
    }

    private getSectionHover(section: Section): Hover {
        const sectionType = this.getSectionType(section);
        const sectionName = this.getSectionName(section);

        const content = [
            `**Section:** \`${sectionType}${sectionName ? ` ${sectionName}` : ''}\``,
            '',
            this.getSectionTypeDocumentation(sectionType),
            '',
            `**Allowed attributes:**`,
            ...this.getValidAttributesForSection(sectionType).map(attr =>
                `- \`${attr.name}\`: ${attr.type} - ${attr.description}`
            )
        ].join('\n');

        return {
            contents: {
                kind: 'markdown',
                value: content
            }
        };
    }

    private getAttributeHover(attribute: Attribute): Hover {
        const attributeName = this.getAttributeName(attribute);
        const parentSection = this.getParentSection(attribute);
        const sectionType = this.getSectionType(parentSection);

        const attributeInfo = this.getAttributeInfo(sectionType, attributeName);

        const content = [
            `**Attribute:** \`${attributeName}\``,
            '',
            `**Type:** \`${attributeInfo.type}\``,
            '',
            `**Description:** ${attributeInfo.description}`,
            ''
        ];

        if (attributeInfo.examples?.length) {
            content.push('**Examples:**');
            attributeInfo.examples.forEach(example => {
                content.push(`\`\`\`rcl\n${example}\n\`\`\``);
            });
        }

        if (attributeInfo.constraints?.length) {
            content.push('**Constraints:**');
            attributeInfo.constraints.forEach(constraint => {
                content.push(`- ${constraint}`);
            });
        }

        return {
            contents: {
                kind: 'markdown',
                value: content.join('\n')
            }
        };
    }

    private getEmbeddedCodeHover(codeBlock: EmbeddedCodeBlock): Hover {
        const language = this.getEmbeddedLanguage(codeBlock);
        const content = this.getCodeContent(codeBlock);

        return {
            contents: {
                kind: 'markdown',
                value: [
                    `**Embedded ${language} Code**`,
                    '',
                    `\`\`\`${language}`,
                    content,
                    '```',
                    '',
                    '_This code block will be executed in the target runtime environment._'
                ].join('\n')
            }
        };
    }

    private getTypeConversionHover(typeConversion: TypeConversion): Hover {
        const typeName = typeConversion.type;
        const value = this.getTypeConversionValue(typeConversion);

        const typeInfo = this.getTypeInfo(typeName);

        return {
            contents: {
                kind: 'markdown',
                value: [
                    `**Type Conversion:** \`<${typeName}>\``,
                    '',
                    `**Value:** \`${value}\``,
                    '',
                    `**Description:** ${typeInfo.description}`,
                    '',
                    `**Format:** ${typeInfo.format}`,
                    '',
                    `**Example:** \`${typeInfo.example}\``
                ].join('\n')
            }
        };
    }
}
```

### 📋 **Phase 3: Reference Provider for Go-to-Definition**

**File:** `packages/language/src/services/rcl-reference-provider.ts`

```typescript
export class RclReferenceProvider implements ReferenceProvider {

    findReferences(document: LangiumDocument, params: ReferenceParams): Location[] {
        const targetNode = this.getNodeAtPosition(document, params.position);
        if (!targetNode) return [];

        if (isIdentifier(targetNode)) {
            return this.findIdentifierReferences(targetNode, document, params.context.includeDeclaration);
        }

        if (isSectionName(targetNode)) {
            return this.findSectionReferences(targetNode, document, params.context.includeDeclaration);
        }

        if (isFlowOperand(targetNode)) {
            return this.findFlowOperandReferences(targetNode, document, params.context.includeDeclaration);
        }

        return [];
    }

    private findIdentifierReferences(identifier: Identifier, document: LangiumDocument, includeDeclaration: boolean): Location[] {
        const identifierValue = this.getIdentifierValue(identifier);
        const locations: Location[] = [];

        // Find all occurrences of this identifier in the document
        const allNodes = streamAllContents(document.parseResult.value);

        for (const node of allNodes) {
            if (isIdentifier(node) && this.getIdentifierValue(node) === identifierValue) {
                const location = this.getNodeLocation(node, document);
                if (location) {
                    locations.push(location);
                }
            }

            // Also check for references in flow operands
            if (isFlowOperand(node) && this.getFlowOperandValue(node) === identifierValue) {
                const location = this.getNodeLocation(node, document);
                if (location) {
                    locations.push(location);
                }
            }
        }

        return locations;
    }

    private findSectionReferences(sectionName: SectionName, document: LangiumDocument, includeDeclaration: boolean): Location[] {
        const sectionNameValue = this.getSectionNameValue(sectionName);
        const locations: Location[] = [];

        // Find section definition
        const sections = this.getAllSections(document);
        const targetSection = sections.find(section =>
            this.getSectionNameValue(section.sectionName) === sectionNameValue
        );

        if (targetSection && includeDeclaration) {
            const location = this.getNodeLocation(targetSection.sectionName, document);
            if (location) {
                locations.push(location);
            }
        }

        // Find references in flow rules
        const flowRules = this.getAllFlowRules(document);
        for (const flowRule of flowRules) {
            if (this.getFlowOperandValue(flowRule.source) === sectionNameValue ||
                this.getFlowOperandValue(flowRule.target) === sectionNameValue) {

                const location = this.getNodeLocation(flowRule, document);
                if (location) {
                    locations.push(location);
                }
            }
        }

        return locations;
    }

    private getNodeLocation(node: AstNode, document: LangiumDocument): Location | undefined {
        const range = getNodeRange(node);
        if (!range) return undefined;

        return {
            uri: document.uri.toString(),
            range: range
        };
    }
}
```

### 📋 **Phase 4: Document Symbol Provider**

**File:** `packages/language/src/services/rcl-document-symbol-provider.ts`

```typescript
export class RclDocumentSymbolProvider extends DefaultDocumentSymbolProvider {

    protected getSymbols(document: LangiumDocument): DocumentSymbol[] {
        const rootNode = document.parseResult?.value;
        if (!rootNode) return [];

        return this.getDocumentSymbols(rootNode, document);
    }

    private getDocumentSymbols(node: AstNode, document: LangiumDocument): DocumentSymbol[] {
        const symbols: DocumentSymbol[] = [];

        if (isRclFile(node)) {
            // Add imports as symbols
            for (const importStmt of node.imports) {
                symbols.push(this.createImportSymbol(importStmt, document));
            }

            // Add agent section
            if (node.agentSection) {
                symbols.push(this.createSectionSymbol(node.agentSection, document));
            }
        }

        return symbols;
    }

    private createSectionSymbol(section: Section, document: LangiumDocument): DocumentSymbol {
        const sectionType = this.getSectionType(section);
        const sectionName = this.getSectionName(section);
        const displayName = sectionName ? `${sectionType} ${sectionName}` : sectionType;

        const symbol: DocumentSymbol = {
            name: displayName,
            kind: SymbolKind.Class,
            range: this.getNodeRange(section, document),
            selectionRange: this.getNodeRange(section, document),
            children: []
        };

        // Add attributes as child symbols
        for (const attribute of section.attributes || []) {
            symbol.children!.push(this.createAttributeSymbol(attribute, document));
        }

        // Add nested sections as child symbols
        for (const subSection of section.subSections || []) {
            symbol.children!.push(this.createSectionSymbol(subSection, document));
        }

        // Add flow rules as child symbols
        for (const flowContent of section.flowContent || []) {
            if (isFlowRule(flowContent)) {
                symbol.children!.push(this.createFlowRuleSymbol(flowContent, document));
            }
        }

        return symbol;
    }

    private createAttributeSymbol(attribute: Attribute, document: LangiumDocument): DocumentSymbol {
        const attributeName = this.getAttributeName(attribute);
        const attributeType = this.getAttributeType(attribute);

        return {
            name: attributeName,
            kind: SymbolKind.Property,
            detail: attributeType,
            range: this.getNodeRange(attribute, document),
            selectionRange: this.getNodeRange(attribute.key, document)
        };
    }

    private createFlowRuleSymbol(flowRule: FlowRule, document: LangiumDocument): DocumentSymbol {
        const source = this.getFlowOperandValue(flowRule.source);
        const target = this.getFlowOperandValue(flowRule.target);

        return {
            name: `${source} → ${target}`,
            kind: SymbolKind.Function,
            range: this.getNodeRange(flowRule, document),
            selectionRange: this.getNodeRange(flowRule, document)
        };
    }
}
```

---

## Service Registration

### 🛠️ **Update RclModule**

**File:** `packages/language/src/rcl-module.ts`

```typescript
import { RclCompletionProvider } from './services/rcl-completion-provider.js';
import { RclHoverProvider } from './services/rcl-hover-provider.js';
import { RclReferenceProvider } from './services/rcl-reference-provider.js';
import { RclDocumentSymbolProvider } from './services/rcl-document-symbol-provider.js';

export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    // ... existing services

    lsp: {
        CompletionProvider: (services) => new RclCompletionProvider(services),
        HoverProvider: (services) => new RclHoverProvider(services),
        ReferenceProvider: (services) => new RclReferenceProvider(services),
        DocumentSymbolProvider: (services) => new RclDocumentSymbolProvider(services),
    }
};
```

---

## Testing Strategy

### 🧪 **Completion Provider Tests**

```typescript
describe('RclCompletionProvider', () => {
    test('should provide section type completions', async () => {
        const input = 'a|'; // | represents cursor position
        const completions = await getCompletions(input);

        expect(completions).toContain({
            label: 'agent',
            kind: CompletionItemKind.Keyword
        });
    });

    test('should provide attribute completions based on section type', async () => {
        const input = `
agent TestAgent
    d|
        `;
        const completions = await getCompletions(input);

        expect(completions).toContain({
            label: 'description',
            kind: CompletionItemKind.Property
        });
    });

    test('should provide boolean value completions', async () => {
        const input = `
agent TestAgent
    enabled: T|
        `;
        const completions = await getCompletions(input);

        expect(completions).toContainEqual(
            expect.objectContaining({ label: 'True' })
        );
    });
});
```

### 🧪 **Reference Provider Tests**

```typescript
describe('RclReferenceProvider', () => {
    test('should find section references in flow rules', async () => {
        const input = `
agent TestAgent

flow Welcome
    :start -> :welcome
        `;

        const references = await findReferences(input, positionOf('Welcome'));
        expect(references).toHaveLength(2); // Definition + flow rule reference
    });

    test('should find identifier references across document', async () => {
        const input = `
agent TestAgent
    name: MyAgent
    display: MyAgent
        `;

        const references = await findReferences(input, positionOf('MyAgent', 0));
        expect(references).toHaveLength(2); // Both occurrences
    });
});
```

---

## Success Criteria

### ✅ **Must Have**
1. **Completion:** Context-aware suggestions for section types, attributes, and values
2. **Hover:** Rich information showing types, descriptions, and examples
3. **References:** Go-to-definition and find-all-references for identifiers and sections
4. **Document Symbols:** Outline view showing sections, attributes, and flow rules
5. **Error Messages:** Clear, actionable diagnostic messages

### 🎯 **Should Have**
1. **Snippets:** Smart code snippets for common patterns
2. **Quick Fixes:** Automatic fixes for common errors
3. **Rename:** Safe symbol renaming with validation
4. **Folding:** Code folding for sections and embedded code

### 🌟 **Nice to Have**
1. **Workspace Symbols:** Find symbols across multiple files
2. **Call Hierarchy:** Show relationships between sections
3. **Code Lens:** Inline information and actions
4. **Inlay Hints:** Type information and parameter hints

---

## Timeline

- **Completion Provider:** 4 days
- **Hover Provider:** 3 days
- **Reference Provider:** 3 days
- **Document Symbol Provider:** 2 days
- **Service Integration:** 2 days
- **Testing & Polish:** 4 days

**Total: 18 days**