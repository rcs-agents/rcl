import type { AstNode, MaybePromise } from 'langium';
import { AstUtils } from 'langium';
import { AstNodeHoverProvider } from 'langium/lsp';
import type { Hover, CancellationToken } from 'vscode-languageserver-protocol';
import { MarkupKind } from 'vscode-languageserver-types';
import { 
  isSection, 
  isAttribute, 
  isTypeConversion,
  type Section, 
  type Attribute, 
  type TypeConversion 
} from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';
import type { SectionTypeRegistry } from '../services/section-registry.js';

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
    if (isTypeConversion(node)) {
      return this.getTypeConversionHover(node);
    }
    // TODO: Re-enable when types are available in grammar
    // if (isBooleanValue(node)) {
    //   return this.getBooleanValueHover(node);
    // }
    // if (isEmbeddedCodeBlock(node)) {
    //   return this.getEmbeddedCodeHover(node);
    // }
    // if (isIdentifier(node)) {
    //   return this.getIdentifierHover(node);
    // }
    return undefined;
  }

  private buildMarkdown(...lines: string[]): string {
    return lines.join('\n');
  }

  private getSectionHoverDetails(section: Section): Hover | undefined {
    const actualSectionType: string | undefined = section.sectionType;
    const sectionTitle = section.sectionName || section.sectionType || "Section";
    const markdownLines: string[] = [];

    const typeForDisplay = actualSectionType || 'Generic Section';
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
    const parentSectionTypeName = parentSection?.sectionType;

    if (parentSectionTypeName) {
      markdownLines.push(`\nAttribute of section type **${parentSectionTypeName}**.`);
    } else {
      markdownLines.push('\n(Attribute not within a known section context)');
    }
    markdownLines.push('\nAn attribute definition.');
    return { contents: { kind: MarkupKind.Markdown, value: this.buildMarkdown(...markdownLines) } };
  }

  private getTypeConversionHover(tc: TypeConversion): Hover | undefined {
    const typeName = tc.target; // Current grammar uses 'target' not 'type'
    let valueText = 'unknown_value';
    if (tc.value?.value) {
      valueText = tc.value.value;
    }

    const markdown = this.buildMarkdown(
      `**Type Conversion:** \`<${typeName}>\``,
      `**Value:** \`${valueText}\``,
      `Converts input to the **${typeName}** type.`
    ).trim();
    return { contents: { kind: MarkupKind.Markdown, value: markdown } };
  }

  // TODO: Enhanced hover for specific language features
  // private getHoverForTypeConversion(node: TypeConversion): Hover | undefined {
  //   return undefined;
  // }
}