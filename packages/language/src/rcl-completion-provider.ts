import type { AstNode } from 'langium';
// AbstractElement and NextFeature not needed for this implementation
import { CompletionItemKind } from 'vscode-languageserver-protocol';


import { DefaultCompletionProvider, type CompletionAcceptor, type CompletionContext } from 'langium/lsp';


import { isSection, type Section } from './parser/ast/index.js';
import { SectionTypeRegistry } from './services/section-registry.js';
import type { RclServices } from './rcl-module.js';
import { KW } from './constants.js';
import { Attribute } from './parser/ast/core/base-types.js';

/**
 * Context information for completion
 */
interface CompletionContextInfo {
  type: 'section-type' | 'attribute-name' | 'attribute-value' | 'unknown';
  currentSection?: Section;
  parentSection?: Section;
  isAtRootLevel: boolean;
  isInsideSection: boolean;
  isAfterColon: boolean;
  indentationLevel: number;
  context: CompletionContext;
}

/**
 * RCL Completion Provider - provides context-aware auto-completion
 * based on section types and their allowed attributes/subsections
 */
export class RclCompletionProvider extends DefaultCompletionProvider {
  protected readonly services: RclServices;
  private sectionRegistry: SectionTypeRegistry;

  constructor(services: RclServices) {
    super(services);
    this.services = services;
    this.sectionRegistry = new SectionTypeRegistry();
  }

  protected override async completionFor(
    context: CompletionContext,
    next: any, // NextFeature<AbstractElement> not available in this Langium version
    acceptor: CompletionAcceptor
  ): Promise<void> {
    const root = context.document.parseResult.value;
    if (!root) {
        return;
    }
    const cst = root.$cstNode;
    if (!cst) {
        return;
    }
    // Determine completion context based on AST structure and cursor position
    const completionContext = this.analyzeCompletionContext(context);

    switch (completionContext.type) {
      case 'section-type':
        this.completeSectionTypes(completionContext, acceptor);
        break;
      case 'attribute-name':
        this.completeAttributeNames(completionContext, acceptor);
        break;
      case 'attribute-value':
        this.completeAttributeValues(completionContext, acceptor);
        break;
    }
  }

  /**
   * Find the current section context from AST node
   */
  private findCurrentSection(node: AstNode | undefined): Section | undefined {
    let current = node;
    while (current) {
      if (isSection(current)) {
        return current;
      }
      current = current.$container;
    }
    return undefined;
  }

  /**
   * Extract section type string from Section node
   */
  private getSectionType(section: Section): string | undefined {
    return section.type;
  }

  /**
 * Analyze completion context based on AST structure and cursor position
 */
  private analyzeCompletionContext(context: CompletionContext): CompletionContextInfo {
    const text = context.document.textDocument.getText();
    const offset = context.document.textDocument.offsetAt(context.position);
    const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
    const currentLine = text.substring(lineStart, offset);
    const lineText = currentLine.trim();

    // Calculate indentation level (spaces/tabs before content)
    const indentMatch = currentLine.match(/^(\s*)/);
    const indentationLevel = indentMatch ? indentMatch[1].length : 0;

    // Find current and parent sections from AST
    const currentSection = this.findCurrentSection(context.node);
    const parentSection = currentSection ? this.findParentSection(currentSection) : undefined;

    const isAtRootLevel = !currentSection;
    const isInsideSection = !!currentSection;
    const isAfterColon = lineText.includes(':') && !lineText.endsWith(':');

    let type: CompletionContextInfo['type'] = 'unknown';

    // Determine completion type based on context
    if (isAfterColon) {
      // We're after a colon, completing attribute value
      type = 'attribute-value';
    } else if (isAtRootLevel || indentationLevel === 0) {
      // At root level, can only complete section types
      if (lineText === '' || /^[a-zA-Z]*$/.test(lineText)) {
        type = 'section-type';
      }
    } else if (isInsideSection) {
      // Inside a section with indentation
      if (lineText === '' || lineText.endsWith(':') || /^[a-zA-Z_]*$/.test(lineText)) {
        if (this.isLikelyAttributeName(lineText, indentationLevel)) {
          type = 'attribute-name';
        } else {
          type = 'section-type'; // Subsection
        }
      }
    }

    return {
      type,
      currentSection,
      parentSection,
      isAtRootLevel,
      isInsideSection,
      isAfterColon,
      indentationLevel,
      context
    };
  }

  /**
   * Check if the current input is likely an attribute name based on pattern
   */
  private isLikelyAttributeName(lineText: string, indentationLevel: number): boolean {
    // Attribute names are lowercase and start with a letter
    return indentationLevel > 0 && (
      lineText === '' ||
      /^[a-z][a-zA-Z0-9_]*$/.test(lineText) ||
      lineText.endsWith(':')
    );
  }

  /**
   * Find parent section of a given section
   */
  private findParentSection(section: Section): Section | undefined {
    return section.$container && isSection(section.$container) ? section.$container : undefined;
  }

  /**
 * Complete attribute names for the current section type
 */
  private completeAttributeNames(
    contextInfo: CompletionContextInfo,
    acceptor: CompletionAcceptor
  ): void {
    if (!contextInfo.currentSection) return;

    const sectionType = this.getSectionType(contextInfo.currentSection);
    if (!sectionType) return;

    const allowedAttributes = this.sectionRegistry.getAllowedAttributes(sectionType);
    const requiredAttributes = this.sectionRegistry.getRequiredAttributes(sectionType);

    // Get already used attributes
    const usedAttributes = ((contextInfo.currentSection as any)?.attributes ?? [])
      .filter((attr: Attribute): attr is Attribute => attr !== undefined)
      .map((attr: Attribute) => attr.key)
      .filter((key: string): key is string => key !== undefined);

    // Create completions for unused attributes
    for (const attr of allowedAttributes) {
      if (!usedAttributes.includes(attr)) {
        const isRequired = requiredAttributes.includes(attr);

        acceptor(contextInfo.context, {
          label: attr,
          kind: CompletionItemKind.Property,
          detail: `${attr}: value${isRequired ? ' (required)' : ''}`,
          documentation: this.getAttributeDocumentation(sectionType, attr),
          insertText: `${attr}: `,
          sortText: isRequired ? `0_${attr}` : `1_${attr}` // Required attributes first
        });
      }
    }
  }


  /**
 * Complete section types based on current context
 */
  private completeSectionTypes(
    contextInfo: CompletionContextInfo,
    acceptor: CompletionAcceptor
  ): void {
    if (contextInfo.isAtRootLevel) {
      // At root level, only suggest 'agent' section type
      acceptor(contextInfo.context, {
        label: KW.Agent,
        kind: 14, // Module
        detail: 'agent section - root container for all agent configuration',
        documentation: this.getSectionDocumentation(KW.Agent),
        insertText: `${KW.Agent} `,
        sortText: `0_${KW.Agent}`
      });
      return;
    }

    const { currentSection, parentSection } = contextInfo;
    const sectionForContext = parentSection || currentSection;

    if (sectionForContext) {
      const sectionType = this.getSectionType(sectionForContext);
      if (sectionType) {
        // Suggest allowed subsections
        const allowedSubSections = this.sectionRegistry.getAllowedSubSections(sectionType);
        for (const sub of allowedSubSections) {
          acceptor(contextInfo.context, {
            label: sub,
            kind: 14, // Module
            detail: `${sub} section`,
            documentation: this.getSectionDocumentation(sub),
            insertText: `${sub} `
          });
        }
      }
    }
  }

  /**
   * Complete attribute values (basic implementation)
   */
  private completeAttributeValues(
    contextInfo: CompletionContextInfo,
    acceptor: CompletionAcceptor
  ): void {
    // For now, just return - could be enhanced to provide value suggestions based on attribute type
    return;
  }

  /**
   * Get documentation for an attribute
   */
  private getAttributeDocumentation(sectionType: string, attributeName: string): string {
    // This could be enhanced to load documentation from external sources
    const attributeDocs: Record<string, Record<string, string>> = {
      [KW.Agent]: {
        'displayName': 'The display name shown to users when interacting with this agent',
        'brandName': 'The brand name associated with this agent'
      },
      [KW.AgentConfig]: {
        'description': 'A brief description of what this agent does',
        'logoUri': "URL to the agent's logo image",
        'heroUri': "URL to the agent's hero/banner image",
        'color': "Primary color for the agent's branding (hex format)"
      },
      [KW.Message]: {
        'text': 'The text content of the message',
        'fileName': 'Name of an attached file',
        'contentInfo': 'Additional content metadata'
      }
    };

    return attributeDocs[sectionType]?.[attributeName] || `${attributeName} attribute`;
  }

  /**
   * Get documentation for a section type
   */
  private getSectionDocumentation(sectionType: string): string {
    const sectionDocs: Record<string, string> = {
      [KW.Agent]: 'Defines the main agent configuration and contains all other sections',
      [KW.AgentConfig]: 'Configuration settings for the agent including branding and contact info',
      [KW.AgentDefaults]: 'Default values and preferences for the agent',
      [KW.Flow]: 'Defines conversation flows and state transitions',
      [KW.Messages]: 'Container for message definitions',
      [KW.Message]: 'A standard message definition',
      [KW.AuthenticationMessage]: 'A message used for authentication flows',
      [KW.TransactionMessage]: 'A message used for transaction confirmations',
      [KW.PromotionMessage]: 'A promotional/marketing message',
      [KW.ServiceRequestMessage]: 'A message for service requests',
      [KW.AcknowledgeMessage]: 'An acknowledgement message'
    };

    return sectionDocs[sectionType] || `${sectionType} section`;
  }
}

  