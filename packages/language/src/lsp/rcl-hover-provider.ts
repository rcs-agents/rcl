import { type AstNode, type MaybePromise } from 'langium';
import { AstNodeHoverProvider } from 'langium/lsp';
import { type Hover, type CancellationToken } from 'vscode-languageserver-protocol';
import { MarkupKind } from 'vscode-languageserver-types';
import { isSection, type Section, isAttribute, type Attribute } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';
import type { SectionTypeRegistry } from '../services/section-registry.js';

export class RclHoverProvider extends AstNodeHoverProvider {
  protected readonly sectionRegistry: SectionTypeRegistry;

  constructor(services: RclServices) {
    super(services);
    this.sectionRegistry = services.meta.SectionTypeRegistry;
  }

  protected getAstNodeHoverContent(node: AstNode, cancelToken?: CancellationToken): MaybePromise<Hover | undefined> {
    if (isSection(node)) {
      return this.getSectionHoverDetails(node);
    }
    if (isAttribute(node)) {
      return this.getAttributeHoverDetails(node);
    }
    return undefined;
  }

  private getSectionHoverDetails(section: Section): Hover | undefined {
    let actualSectionType: string | undefined = section.sectionType;
    const sectionTitle = section.sectionName || section.reservedName || section.sectionType || "Section";
    let markdownLines: string[] = [];

    if (!actualSectionType && section.reservedName) {
      const parent = section.$container;
      if (parent && isSection(parent) && parent.sectionType) {
        const parentConstants = this.sectionRegistry.getConstants(parent.sectionType);
        const reservedInfo = parentConstants?.reservedSubSections?.find(rs => rs.name === section.reservedName);
        if (reservedInfo) {
          actualSectionType = reservedInfo.impliedType;
        }
      }
    }
    const typeForDisplay = actualSectionType || (section.reservedName ? 'Reserved Section' : 'Generic Section');
    markdownLines.push(`\`\`\`rcl\n${sectionTitle} (type: ${typeForDisplay})\n\`\`\``);

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
    return { contents: { kind: MarkupKind.Markdown, value: markdownLines.join('') } };
  }

  private getAttributeHoverDetails(attribute: Attribute): Hover | undefined {
    const attributeName = attribute.key;
    let markdownLines: string[] = [];

    if (!attributeName) {
      return undefined;
    }

    markdownLines.push(`\`\`\`rcl\n${attributeName}\n\`\`\``);
    markdownLines.push('\nAn attribute definition.'); // Highly simplified

    // Simplified: Attempt to get immediate parent section type without deep traversal issues
    const parentContainer = attribute.$container;
    if (parentContainer && isSection(parentContainer)) {
      const parentType = parentContainer.sectionType || (parentContainer.reservedName ? "Reserved Section" : "Unnamed Section");
      markdownLines.push(`\n(Attribute of section: ${parentContainer.sectionName || parentContainer.reservedName || parentType})`);
    } else if (parentContainer && parentContainer.$type === 'NestedBlockAttribute') {
      // If inside a NestedBlockAttribute, its container should be a Section
      const sectionContainer = parentContainer.$container;
      if (sectionContainer && isSection(sectionContainer)) {
        const sectionType = sectionContainer.sectionType || (sectionContainer.reservedName ? "Reserved Section" : "Unnamed Section");
        markdownLines.push(`\n(Attribute within a nested block in section: ${sectionContainer.sectionName || sectionContainer.reservedName || sectionType})`);
      }
    }

    return { contents: { kind: MarkupKind.Markdown, value: markdownLines.join('') } };
  }
}