import { AstNodeHoverProvider } from 'langium/lsp';
import type { MaybePromise } from 'langium';
import type { Hover, CancellationToken } from 'vscode-languageserver-protocol';
import { MarkupKind } from 'vscode-languageserver-types';
import { isSection, type Section } from '../parser/ast/index.js';
import type { RclServices } from '../rcl-module.js';
import { SectionTypeRegistry } from '../services/section-registry.js';

export class RclHoverProvider extends AstNodeHoverProvider {
  protected readonly sectionRegistry: SectionTypeRegistry;

  constructor(services: RclServices) {
    super(services);
    this.sectionRegistry = new SectionTypeRegistry();
  }

  protected override getAstNodeHoverContent(node: any, cancelToken?: CancellationToken): MaybePromise<Hover | undefined> {
    if (isSection(node)) {
      return this.getSectionHoverDetails(node);
    }
    return undefined;
  }

  private buildMarkdown(...lines: string[]): string {
    return lines.join('\n');
  }

  private getSectionHoverDetails(section: Section): Hover | undefined {
    const typeName = section.type;
    const name = section.name || typeName || 'Section';
    const lines: string[] = [];
    lines.push(`\`\`\`rcl
${name} (type: ${typeName})
\`\`\``);
    if (typeName) {
      const constants = this.sectionRegistry.getConstants(typeName);
      lines.push('\n\n---\n');
      lines.push(constants?.name ? `Definition for section type: **${constants.name}**.` : 'Details for this section type.');
      if (constants?.allowedAttributes?.length) {
        lines.push('\n\n**Allowed attributes:**');
        for (const attrKey of constants.allowedAttributes) {
          const required = constants.requiredAttributes?.includes(attrKey) ? ' (required)' : '';
          lines.push(`\n- \`${attrKey}\`${required}`);
        }
      }
    }
    return { contents: { kind: MarkupKind.Markdown, value: this.buildMarkdown(...lines) } };
  }
}
