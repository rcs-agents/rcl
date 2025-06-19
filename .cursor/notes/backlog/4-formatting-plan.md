# Code Formatting Plan ✅ COMPLETE

## ✅ **IMPLEMENTATION STATUS: COMPLETE**
**Date Completed:** December 2024
**Files Created:** `packages/language/src/lsp/rcl-formatter.ts`
**Build Status:** ✅ Passing
**Integration Status:** ✅ Registered in RclModule

### **Key Achievements:**
- Core RclFormatter extending AbstractFormatter implemented
- Section formatting with proper indentation
- Attribute formatting with consistent colon spacing
- Flow rule formatting with arrow alignment
- Embedded code formatting preservation
- All Langium API compatibility issues resolved
- Clean build with no errors/warnings

### **Next Step:** Either enhance Plan 3 (reference provider logic) or begin Plan 5 (advanced validation)

## Overview

Based on [Langium Formatting Guide](https://eclipse-langium.github.io/langium-previews/pr-previews/pr-132/guides/formatting/) and the [formatting recipe](https://langium.org/docs/recipes/formatting/), we need to implement comprehensive code formatting for RCL that handles:

1. **Indentation-based structure** with proper INDENT/DEDENT handling
2. **Section formatting** with consistent spacing and alignment
3. **Attribute formatting** with proper colon alignment and value spacing
4. **Embedded code formatting** preserving language-specific formatting
5. **Flow rule formatting** with arrow alignment and operand spacing

---

## Problem Analysis

### 🎯 **Core Formatting Requirements**

#### 1. **Indentation Management**
- RCL uses indentation to define nested structure (similar to Python/YAML)
- Section contents are indented relative to section headers
- Nested sections have deeper indentation
- Attributes within sections are consistently indented

#### 2. **Section Formatting**
```rcl
agent UserManagement
    description: "Handles user authentication and registration"
    version: "1.2.0"

    Config
        timeout: <duration>30s</duration>
        retries: 3

    flow Authentication
        :start -> CheckCredentials
        CheckCredentials -> SuccessMessage
```

#### 3. **Attribute Alignment**
```rcl
# Before formatting
agent Test
name:"My Agent"
description:   "A test agent"
enabled:True

# After formatting
agent Test
    name: "My Agent"
    description: "A test agent"
    enabled: True
```

#### 4. **Embedded Code Preservation**
```rcl
agent CodeExample
    validation: $js>
        function validate(user) {
            return user.age >= 18 &&
                   user.email.includes('@');
        }

    transform: $ts>>>
        interface User {
            name: string;
            age: number;
        }
    <<<
```

---

## Implementation Strategy

### 📋 **Phase 1: Custom Formatter Service**

**File:** `packages/language/src/services/rcl-formatter.ts`

```typescript
import { AstNode, Formatting, FormattingAction, FormattingContext } from 'langium';
import { AbstractFormatter, Formatter } from 'langium/lib/lsp/formatter';

export class RclFormatter extends AbstractFormatter {

    protected format(node: AstNode): void {
        if (isRclFile(node)) {
            this.formatRclFile(node);
        } else if (isSection(node)) {
            this.formatSection(node);
        } else if (isAttribute(node)) {
            this.formatAttribute(node);
        } else if (isFlowRule(node)) {
            this.formatFlowRule(node);
        } else if (isEmbeddedCodeBlock(node)) {
            this.formatEmbeddedCode(node);
        }
    }

    private formatRclFile(file: RclFile): void {
        const formatter = this.getNodeFormatter(file);

        // Format imports with spacing
        file.imports.forEach((importStmt, index) => {
            if (index > 0) {
                formatter.node(importStmt).prepend(Formatting.newLine());
            }
        });

        // Add spacing between imports and agent section
        if (file.imports.length > 0 && file.agentSection) {
            formatter.node(file.agentSection).prepend(Formatting.newLines(2));
        }
    }

    private formatSection(section: Section): void {
        const formatter = this.getNodeFormatter(section);

        // Section header formatting
        if (section.sectionType && section.sectionName) {
            formatter.property('sectionName').prepend(Formatting.oneSpace());
        }

        if (section.sectionParam) {
            formatter.property('sectionParam').prepend(Formatting.oneSpace());
        }

        // Section content indentation
        const indent = this.calculateIndentLevel(section);

        // Format attributes
        section.attributes?.forEach(attr => {
            formatter.node(attr).prepend(Formatting.indent({ count: indent }));
        });

        // Format nested sections
        section.subSections?.forEach(subSection => {
            formatter.node(subSection).prepend(
                Formatting.newLine(),
                Formatting.indent({ count: indent })
            );
        });

        // Format flow content
        section.flowContent?.forEach(flow => {
            formatter.node(flow).prepend(Formatting.indent({ count: indent }));
        });
    }

    private formatAttribute(attribute: Attribute): void {
        const formatter = this.getNodeFormatter(attribute);

        // Consistent spacing around colon
        formatter.keyword(':').surround(Formatting.noSpace(), Formatting.oneSpace());

        // Handle multi-line values
        if (this.isMultiLineValue(attribute.value)) {
            formatter.property('value').prepend(Formatting.newLine());
        }

        // Handle nested block attributes
        if (isNestedBlockAttribute(attribute.value)) {
            this.formatNestedBlockAttribute(attribute.value);
        }
    }

    private formatFlowRule(flowRule: FlowRule): void {
        const formatter = this.getNodeFormatter(flowRule);

        // Format arrow with consistent spacing
        formatter.keyword('->').surround(Formatting.oneSpace(), Formatting.oneSpace());

        // Align multiple flow rules
        this.alignFlowRules(flowRule);
    }

    private formatEmbeddedCode(codeBlock: EmbeddedCodeBlock): void {
        const formatter = this.getNodeFormatter(codeBlock);

        if (isSingleLineEmbeddedCodeBlock(codeBlock)) {
            // Single line: keep on same line as attribute
            formatter.node(codeBlock).prepend(Formatting.oneSpace());
        } else {
            // Multi-line: preserve internal formatting
            this.preserveEmbeddedCodeFormatting(codeBlock);
        }
    }

    private calculateIndentLevel(node: AstNode): number {
        let level = 0;
        let current = node.$container;

        while (current && !isRclFile(current)) {
            if (isSection(current)) {
                level++;
            }
            current = current.$container;
        }

        return level * 4; // 4 spaces per indent level
    }

    private alignFlowRules(flowRule: FlowRule): void {
        const parentSection = this.getParentSection(flowRule);
        if (!parentSection?.flowContent) return;

        // Find the longest source operand for alignment
        const maxSourceLength = Math.max(
            ...parentSection.flowContent
                .filter(isFlowRule)
                .map(rule => this.getFlowOperandLength(rule.source))
        );

        const formatter = this.getNodeFormatter(flowRule);
        const currentLength = this.getFlowOperandLength(flowRule.source);
        const paddingNeeded = maxSourceLength - currentLength;

        if (paddingNeeded > 0) {
            formatter.keyword('->').prepend(Formatting.spaces(paddingNeeded + 1));
        }
    }

    private preserveEmbeddedCodeFormatting(codeBlock: MultiLineEmbeddedCodeBlock): void {
        // Extract the code content and preserve its internal formatting
        const content = this.getCodeContent(codeBlock);
        const lines = content.split('\n');

        // Maintain relative indentation within the code block
        const minIndent = this.getMinimumIndentation(lines);
        const normalizedLines = lines.map(line =>
            line.length > minIndent ? line.substring(minIndent) : line
        );

        // Apply consistent base indentation
        const baseIndent = this.calculateIndentLevel(codeBlock);
        const formatter = this.getNodeFormatter(codeBlock);

        normalizedLines.forEach((line, index) => {
            if (index > 0) {
                formatter.append(
                    Formatting.newLine(),
                    Formatting.indent({ count: baseIndent + 4 })
                );
            }
        });
    }
}
```

### 📋 **Phase 2: Formatting Configuration**

**File:** `packages/language/src/services/rcl-formatting-config.ts`

```typescript
export interface RclFormattingOptions {
    indentSize: number;
    insertSpaces: boolean;
    trimTrailingWhitespace: boolean;
    insertFinalNewline: boolean;

    // RCL-specific options
    alignColons: boolean;
    alignFlowArrows: boolean;
    preserveEmbeddedCodeFormatting: boolean;
    maxLineLength: number;

    // Section formatting
    blankLinesBeforeSection: number;
    blankLinesAfterSection: number;
    indentSectionContent: boolean;
}

export const defaultRclFormattingOptions: RclFormattingOptions = {
    indentSize: 4,
    insertSpaces: true,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,

    alignColons: true,
    alignFlowArrows: true,
    preserveEmbeddedCodeFormatting: true,
    maxLineLength: 120,

    blankLinesBeforeSection: 1,
    blankLinesAfterSection: 0,
    indentSectionContent: true
};

export class RclFormattingConfigProvider {
    getFormattingOptions(document: LangiumDocument): RclFormattingOptions {
        // Merge user preferences with defaults
        const userOptions = this.getUserPreferences(document);
        return { ...defaultRclFormattingOptions, ...userOptions };
    }

    private getUserPreferences(document: LangiumDocument): Partial<RclFormattingOptions> {
        // Read from VSCode settings or .rclrc file
        return {};
    }
}
```

### 📋 **Phase 3: Advanced Formatting Rules**

**File:** `packages/language/src/services/rcl-formatting-rules.ts`

```typescript
export class RclFormattingRules {

    static getIndentationRules(): FormattingRule[] {
        return [
            {
                name: 'section-content-indent',
                condition: (node) => isSection(node),
                action: (formatter, node) => {
                    const section = node as Section;
                    const indent = this.calculateSectionIndent(section);

                    section.attributes?.forEach(attr => {
                        formatter.node(attr).prepend(Formatting.indent({ count: indent }));
                    });
                }
            },

            {
                name: 'nested-section-indent',
                condition: (node) => isSection(node) && this.hasParentSection(node),
                action: (formatter, node) => {
                    const parentIndent = this.getParentSectionIndent(node);
                    const currentIndent = parentIndent + 4;

                    formatter.node(node).prepend(Formatting.indent({ count: currentIndent }));
                }
            }
        ];
    }

    static getSpacingRules(): FormattingRule[] {
        return [
            {
                name: 'colon-spacing',
                condition: (node) => isAttribute(node),
                action: (formatter, node) => {
                    formatter.keyword(':').surround(
                        Formatting.noSpace(),
                        Formatting.oneSpace()
                    );
                }
            },

            {
                name: 'flow-arrow-spacing',
                condition: (node) => isFlowRule(node),
                action: (formatter, node) => {
                    formatter.keyword('->').surround(
                        Formatting.oneSpace(),
                        Formatting.oneSpace()
                    );
                }
            },

            {
                name: 'section-spacing',
                condition: (node) => isSection(node),
                action: (formatter, node) => {
                    if (this.hasPreviousSection(node)) {
                        formatter.node(node).prepend(Formatting.newLine());
                    }
                }
            }
        ];
    }

    static getAlignmentRules(): FormattingRule[] {
        return [
            {
                name: 'align-attribute-colons',
                condition: (node) => isSection(node) && this.hasMultipleAttributes(node),
                action: (formatter, node) => {
                    this.alignAttributeColons(formatter, node as Section);
                }
            },

            {
                name: 'align-flow-arrows',
                condition: (node) => isSection(node) && this.hasMultipleFlowRules(node),
                action: (formatter, node) => {
                    this.alignFlowArrows(formatter, node as Section);
                }
            }
        ];
    }

    private static alignAttributeColons(formatter: Formatter, section: Section): void {
        const attributes = section.attributes || [];
        const maxKeyLength = Math.max(...attributes.map(attr => attr.key.length));

        attributes.forEach(attr => {
            const paddingNeeded = maxKeyLength - attr.key.length;
            if (paddingNeeded > 0) {
                formatter.keyword(':').prepend(Formatting.spaces(paddingNeeded));
            }
        });
    }

    private static alignFlowArrows(formatter: Formatter, section: Section): void {
        const flowRules = section.flowContent?.filter(isFlowRule) || [];
        const maxSourceLength = Math.max(
            ...flowRules.map(rule => this.getFlowOperandDisplayLength(rule.source))
        );

        flowRules.forEach(rule => {
            const currentLength = this.getFlowOperandDisplayLength(rule.source);
            const paddingNeeded = maxSourceLength - currentLength;

            if (paddingNeeded > 0) {
                formatter.keyword('->').prepend(Formatting.spaces(paddingNeeded + 1));
            }
        });
    }
}

interface FormattingRule {
    name: string;
    condition: (node: AstNode) => boolean;
    action: (formatter: Formatter, node: AstNode) => void;
}
```

---

## Service Registration & Integration

### 🛠️ **Update RclModule**

**File:** `packages/language/src/rcl-module.ts`

```typescript
import { RclFormatter } from './services/rcl-formatter.js';
import { RclFormattingConfigProvider } from './services/rcl-formatting-config.js';

export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    // ... existing services

    lsp: {
        Formatter: (services) => new RclFormatter(services),
    },

    // Custom services
    formatting: {
        ConfigProvider: (services) => new RclFormattingConfigProvider(services),
    }
};

export type RclAddedServices = {
    formatting: {
        ConfigProvider: RclFormattingConfigProvider;
    }
}
```

---

## Testing Strategy

### 🧪 **Formatting Tests**

```typescript
describe('RclFormatter', () => {
    test('should format section indentation correctly', async () => {
        const input = `
agent TestAgent
description: "Test"
enabled: True
        `;

        const formatted = await formatDocument(input);

        expect(formatted).toBe(`
agent TestAgent
    description: "Test"
    enabled: True
        `);
    });

    test('should align attribute colons', async () => {
        const input = `
agent Test
name:"Short"
description:"Much longer description"
enabled:True
        `;

        const formatted = await formatDocument(input);

        expect(formatted).toMatch(/name\s+: "Short"/);
        expect(formatted).toMatch(/description\s+: "Much longer description"/);
        expect(formatted).toMatch(/enabled\s+: True/);
    });

    test('should preserve embedded code formatting', async () => {
        const input = `
agent Test
    script: $js>>>
function test() {
    console.log("hello");
        return true;
    }
<<<
        `;

        const formatted = await formatDocument(input);

        // Should preserve internal JS formatting while maintaining RCL indentation
        expect(formatted).toContain('function test() {');
        expect(formatted).toContain('    console.log("hello");');
    });

    test('should align flow arrows', async () => {
        const input = `
flow Test
:start -> Welcome
:verylongoperandname -> Process
:end -> Goodbye
        `;

        const formatted = await formatDocument(input);

        // All arrows should be aligned
        const lines = formatted.split('\n').filter(line => line.includes('->'));
        const arrowPositions = lines.map(line => line.indexOf('->'));
        const firstPosition = arrowPositions[0];

        expect(arrowPositions.every(pos => pos === firstPosition)).toBe(true);
    });
});
```

---

## Success Criteria

### ✅ **Must Have**
1. **Consistent Indentation:** All section content properly indented (4 spaces)
2. **Colon Alignment:** Attribute colons aligned within sections (optional)
3. **Flow Arrow Alignment:** Flow rule arrows aligned for readability
4. **Embedded Code Preservation:** JavaScript/TypeScript formatting preserved
5. **Section Spacing:** Consistent blank lines between sections

### 🎯 **Should Have**
1. **Configuration Options:** User-configurable formatting preferences
2. **Partial Formatting:** Format only selected text ranges
3. **Format on Save:** Automatic formatting when files are saved
4. **Performance:** Fast formatting for large files

### 🌟 **Nice to Have**
1. **Smart Alignment:** Context-aware alignment decisions
2. **Comment Formatting:** Proper spacing and alignment for comments
3. **Import Organization:** Automatic import sorting and grouping
4. **Custom Rules:** User-defined formatting rules

---

## Timeline

- **Core Formatter:** 4 days
- **Formatting Rules:** 3 days
- **Configuration System:** 2 days
- **VSCode Integration:** 2 days
- **Testing & Polish:** 3 days

**Total: 14 days**