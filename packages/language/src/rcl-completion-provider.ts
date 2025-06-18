import type { AstNode } from 'langium';
import type { CompletionAcceptor, CompletionContext, NextFeature } from 'langium/lsp';
import { DefaultCompletionProvider } from 'langium/lsp';
import type { Section } from './generated/ast.js';
import { isSection } from './generated/ast.js';
import type { SectionTypeRegistry } from './services/section-registry.js';
import type { RclServices } from './rcl-module.js';

/**
 * Context information for completion
 */
interface CompletionContextInfo {
  type: 'section-type' | 'attribute-name' | 'attribute-value' | 'reserved-section-name' | 'unknown';
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
  private registry: SectionTypeRegistry;

  constructor(services: RclServices) {
    super(services);
    this.registry = services.meta.SectionTypeRegistry;
  }

  protected override async completionFor(
    context: CompletionContext,
    next: NextFeature,
    acceptor: CompletionAcceptor
  ): Promise<void> {

    // Call default completion first
    await super.completionFor(context, next, acceptor);

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
      case 'reserved-section-name':
        this.completeReservedSectionNames(completionContext, acceptor);
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
    return section.sectionType;
  }

  /**
 * Analyze completion context based on AST structure and cursor position
 */
  private analyzeCompletionContext(context: CompletionContext): CompletionContextInfo {
    const text = context.textDocument.getText();
    const offset = context.offset;
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
      // At root level, can only complete section types or reserved section names
      if (lineText === '' || /^[a-zA-Z]*$/.test(lineText)) {
        type = 'section-type';
      }
    } else if (isInsideSection) {
      // Inside a section with indentation
      if (lineText === '' || lineText.endsWith(':') || /^[a-zA-Z_]*$/.test(lineText)) {
        // Check if we might be completing a reserved section name
        const sectionType = this.getSectionType(currentSection!);
        if (sectionType && this.couldBeReservedSectionName(lineText, sectionType)) {
          type = 'reserved-section-name';
        } else if (this.isLikelyAttributeName(lineText, indentationLevel)) {
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
   * Check if the current input could be a reserved section name
   */
  private couldBeReservedSectionName(lineText: string, sectionType: string): boolean {
    if (!lineText || lineText.toLowerCase() === lineText) return false; // Reserved names are capitalized

    const reservedNames = this.registry.getReservedSubSections(sectionType)
      .map(r => r.name);

    return reservedNames.some(name =>
      name.toLowerCase().startsWith(lineText.toLowerCase()) ||
      lineText === ''
    );
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

    const allowedAttributes = this.registry.getAllowedAttributes(sectionType);
    const requiredAttributes = this.registry.getRequiredAttributes(sectionType);

    // Get already used attributes
    const usedAttributes = contextInfo.currentSection.attributes
      .map(attr => attr.key)
      .filter(key => key !== undefined);

    // Create completions for unused attributes
    for (const attr of allowedAttributes) {
      if (!usedAttributes.includes(attr)) {
        const isRequired = requiredAttributes.includes(attr);

        acceptor(contextInfo.context, {
          label: attr,
          kind: 10, // Property
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
        label: 'agent',
        kind: 14, // Module
        detail: 'agent section - root container for all agent configuration',
        documentation: this.getSectionDocumentation('agent'),
        insertText: 'agent ',
        sortText: '0_agent'
      });
      return;
    }

    if (!contextInfo.currentSection) return;

    const parentSectionType = this.getSectionType(contextInfo.currentSection);
    if (!parentSectionType) return;

    const allowedSubSections = this.registry.getAllowedSubSections(parentSectionType);

    // Add allowed subsection types
    for (const subType of allowedSubSections) {
      acceptor(contextInfo.context, {
        label: subType,
        kind: 14, // Module
        detail: `${subType} section`,
        documentation: this.getSectionDocumentation(subType),
        insertText: `${subType} `,
        sortText: `2_${subType}`
      });
    }
  }

  /**
 * Complete reserved section names (Config, Defaults, Messages)
 */
  private completeReservedSectionNames(
    contextInfo: CompletionContextInfo,
    acceptor: CompletionAcceptor
  ): void {
    if (!contextInfo.currentSection) return;

    const sectionType = this.getSectionType(contextInfo.currentSection);
    if (!sectionType) return;

    const reservedSubSections = this.registry.getReservedSubSections(sectionType);

    // Get existing subsection names to avoid duplicates
    const existingSubSections = contextInfo.currentSection.subSections
      .map(sub => this.getSectionName(sub))
      .filter(name => name !== undefined);

    for (const reserved of reservedSubSections) {
      if (!existingSubSections.includes(reserved.name)) {
        acceptor(contextInfo.context, {
          label: reserved.name,
          kind: 14, // Module
          detail: `${reserved.name} (${reserved.impliedType})${reserved.required ? ' - required' : ''}`,
          documentation: `Reserved ${reserved.name} subsection of type ${reserved.impliedType}`,
          insertText: `${reserved.name}`,
          sortText: reserved.required ? `0_${reserved.name}` : `1_${reserved.name}`
        });
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
      'agent': {
        'displayName': 'The display name shown to users when interacting with this agent',
        'brandName': 'The brand name associated with this agent'
      },
      'agentConfig': {
        'description': 'A brief description of what this agent does',
        'logoUri': 'URL to the agent\'s logo image',
        'heroUri': 'URL to the agent\'s hero/banner image',
        'color': 'Primary color for the agent\'s branding (hex format)'
      },
      'message': {
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
      'agent': 'Defines the main agent configuration and contains all other sections',
      'agentConfig': 'Configuration settings for the agent including branding and contact info',
      'agentDefaults': 'Default values and preferences for the agent',
      'flow': 'Defines conversation flows and state transitions',
      'messages': 'Container for message definitions',
      'message': 'A standard message definition',
      'authentication message': 'A message used for authentication flows',
      'transaction message': 'A message used for transaction confirmations',
      'promotion message': 'A promotional/marketing message',
      'servicerequest message': 'A message for service requests',
      'acknowledge message': 'An acknowledgement message'
    };

    return sectionDocs[sectionType] || `${sectionType} section`;
  }

  /**
 * Extract section name from section node
 */
  private getSectionName(section: Section): string | undefined {
    // Check if section has a reserved name
    if (section.reservedName) {
      return section.reservedName;
    }

    // section.sectionName is directly a string
    if (section.sectionName) {
      return section.sectionName;
    }
    return undefined;
  }
}