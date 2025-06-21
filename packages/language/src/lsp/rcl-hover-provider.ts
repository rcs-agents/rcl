import { type AstNode, type MaybePromise, AstUtils } from 'langium';
import { AstNodeHoverProvider } from 'langium/lsp';
import { type Hover, type CancellationToken } from 'vscode-languageserver-protocol';
import { MarkupKind } from 'vscode-languageserver-types';
import { isSection, type Section, isAttribute, type Attribute, isBooleanValue, type BooleanValue, isTypeConversion, type TypeConversion, isEmbeddedCodeBlock, type EmbeddedCodeBlock, isIdentifier, type Identifier, isLiteralValue, type LiteralValue, type ReservedSectionName } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';
import type { SectionTypeRegistry } from '../services/section-registry.js';
import { KW } from '../constants.js';

export class RclHoverProvider extends AstNodeHoverProvider {
  protected readonly sectionRegistry: SectionTypeRegistry;

  constructor(services: RclServices) {
    super(services);
    this.sectionRegistry = services.meta.SectionTypeRegistry;
  }

  protected override getAstNodeHoverContent(node: AstNode, cancelToken?: CancellationToken): MaybePromise<Hover | undefined> {
    if (isSection(node)) {
      return this.getSectionHoverDetails(node);
    }
    if (isAttribute(node)) {
      return this.getAttributeHoverDetails(node);
    }
    if (isBooleanValue(node)) {
      return this.getBooleanValueHover(node);
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

  private buildMarkdown(...lines: string[]): string {
    return lines.join('\n');
  }

  private getSectionHoverDetails(section: Section): Hover | undefined {
    let actualSectionType: string | undefined = section.sectionType;
    const sectionTitle = section.sectionName || (section as Section & { reservedName?: ReservedSectionName }).reservedName || section.sectionType || "Section";
    const markdownLines: string[] = [];

    if (!actualSectionType && (section as Section & { reservedName?: ReservedSectionName }).reservedName) {
      const parent = section.$container;
      if (parent && isSection(parent)) {
        let parentSectionType = parent.sectionType;
        if (!parentSectionType && (parent as Section & { reservedName?: ReservedSectionName }).reservedName) {
          const grandparent = parent.$container;
          if (grandparent && isSection(grandparent) && grandparent.sectionType) {
            const grandparentConstants = this.sectionRegistry.getConstants(grandparent.sectionType);
            const reservedParentInfo = grandparentConstants?.reservedSubSections?.find(rs => rs.name === (parent as Section & { reservedName?: ReservedSectionName }).reservedName);
            if (reservedParentInfo) parentSectionType = reservedParentInfo.impliedType;
          }
        }
        if (parentSectionType) {
          const parentConstants = this.sectionRegistry.getConstants(parentSectionType);
          const reservedInfo = parentConstants?.reservedSubSections?.find(rs => rs.name === (section as Section & { reservedName?: ReservedSectionName }).reservedName);
          if (reservedInfo) {
            actualSectionType = reservedInfo.impliedType;
          }
        }
      }
    }
    const typeForDisplay = actualSectionType || ((section as Section & { reservedName?: ReservedSectionName }).reservedName ? 'Reserved Section' : 'Generic Section');
    markdownLines.push(`\`\`\`rcl
${sectionTitle} (type: ${typeForDisplay})
\`\`\``);

    if (actualSectionType) {
      const constants = this.sectionRegistry.getConstants(actualSectionType);
      markdownLines.push('\n\n---\n');
      markdownLines.push(constants?.name ? `Definition for section type: **${constants.name}**.` : 'Details for this section type.');

      if (constants?.allowedAttributes?.length) {
        markdownLines.push('\n\n**Allowed attributes:**');
        for (const attrKey of constants.allowedAttributes) {
          const required = constants.requiredAttributes?.includes(attrKey) ? ' (required)' : '';
          markdownLines.push(`\n- \`${attrKey}\`${required}`);
        }
      }
    } else {
      markdownLines.push('\nA section definition.');
    }
    return { contents: { kind: MarkupKind.Markdown, value: this.buildMarkdown(...markdownLines) } };
  }

  private getAttributeHoverDetails(attribute: Attribute): Hover | undefined {
    const attributeName = attribute.key;
    if (!attributeName) return undefined;
    const markdownLines: string[] = [];
    markdownLines.push(`\`\`\`rcl
${attributeName}
\`\`\``);

    const parentSection = AstUtils.getContainerOfType(attribute, isSection);
    let parentSectionTypeName: string | undefined;
    if (parentSection) {
      parentSectionTypeName = parentSection.sectionType;
      if (!parentSectionTypeName && (parentSection as Section & { reservedName?: ReservedSectionName }).reservedName) {
        const grandParent = parentSection.$container;
        if (grandParent && isSection(grandParent)) {
          let grandParentSectionType = grandParent.sectionType;
          if(!grandParentSectionType && (grandParent as Section & { reservedName?: ReservedSectionName }).reservedName){
            const greatGrandParent = grandParent.$container;
            if(greatGrandParent && isSection(greatGrandParent) && greatGrandParent.sectionType){
              const greatGrandParentConsts = this.sectionRegistry.getConstants(greatGrandParent.sectionType);
              const reservedGrandParentInfo = greatGrandParentConsts?.reservedSubSections?.find(rs => rs.name === (grandParent as Section & { reservedName?: ReservedSectionName }).reservedName);
              if(reservedGrandParentInfo) grandParentSectionType = reservedGrandParentInfo.impliedType;
            }
          }

          if (grandParentSectionType) {
            const grandParentConstants = this.sectionRegistry.getConstants(grandParentSectionType);
            const reservedInfo = grandParentConstants?.reservedSubSections?.find(rs => rs.name === (parentSection as Section & { reservedName?: ReservedSectionName }).reservedName);
            if (reservedInfo) {
              parentSectionTypeName = reservedInfo.impliedType;
            }
          }
        }
      }
    }

    if (parentSectionTypeName) {
      markdownLines.push(`\nAttribute of section type **${parentSectionTypeName}**.`);
    } else {
      markdownLines.push('\n(Attribute not within a known section context)');
    }
    markdownLines.push('\nAn attribute definition.');
    return { contents: { kind: MarkupKind.Markdown, value: this.buildMarkdown(...markdownLines) } };
  }

  private getBooleanValueHover(booleanNode: BooleanValue): Hover | undefined {
    const value = booleanNode.value;
    const markdown = this.buildMarkdown(
      `\`\`\`rcl
${value}
\`\`\``,
      `Boolean literal: **${value}**.`
    );
    return { contents: { kind: MarkupKind.Markdown, value: markdown } };
  }

  private getLiteralValueText(literal: LiteralValue): string {
    if (literal.val_str) return `"${literal.val_str}"`;
    if (literal.val_num !== undefined) return literal.val_num.toString();
    if (literal.val_bool) return literal.val_bool.value;
    if (literal.val_atom) return literal.val_atom;
    if (literal.val_null) return 'Null';
    return 'unknown_literal';
  }

  private getTypeConversionHover(tc: TypeConversion): Hover | undefined {
    const typeName = tc.type;
    let valueText = 'unknown_value';
    if (tc.value) {
      if (isLiteralValue(tc.value)) {
        valueText = this.getLiteralValueText(tc.value);
      } else if (isIdentifier(tc.value)) {
        valueText = tc.value.value;
      }
    }

    const markdown = this.buildMarkdown(
      `**Type Conversion:** \`<${typeName}>\``,
      `**Value:** \`${valueText}\``,
      `Converts input to the **${typeName}** type.`,
      tc.modifier ? `Modifier: \`${tc.modifier}\`` : ''
    ).trim();
    return { contents: { kind: MarkupKind.Markdown, value: markdown } };
  }

  private getEmbeddedLanguageFromText(blockText: string): string {
    if (blockText.startsWith(KW.JsPrefix) || blockText.startsWith(KW.JsMultiLinePrefix)) return 'javascript';
    if (blockText.startsWith(KW.TsPrefix) || blockText.startsWith(KW.TsMultiLinePrefix)) return 'typescript';
    if (blockText.startsWith(KW.GenericPrefix) || blockText.startsWith(KW.GenericMultiLinePrefix)) return 'unknown';
    return 'unknown';
  }

  private getEmbeddedCodeHover(codeBlock: EmbeddedCodeBlock): Hover | undefined {
    const blockText = codeBlock.$cstNode?.text || '';
    const language = this.getEmbeddedLanguageFromText(blockText);
    const markdown = this.buildMarkdown(
      `**Embedded ${language} Code**`,
      '_This code block is treated as inline code by the RCL interpreter._'
    );
    return { contents: { kind: MarkupKind.Markdown, value: markdown } };
  }

  private getIdentifierHover(identifier: Identifier): Hover | undefined {
    const markdown = this.buildMarkdown(
      `\`\`\`rcl
${identifier.value}
\`\`\``,
      `Identifier: **${identifier.value}**.`
    );
    return { contents: { kind: MarkupKind.Markdown, value: markdown } };
  }
}