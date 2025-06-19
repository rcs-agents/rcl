import type { AstNode } from 'langium';
import { AbstractFormatter, Formatting } from 'langium/lsp';

/**
 * Custom formatter for RCL that handles indentation-based structure,
 * section formatting, attribute alignment, and embedded code preservation.
 */
export class RclFormatter extends AbstractFormatter {

  protected override format(node: AstNode): void {
    if (this.isRclFile(node)) {
      this.formatRclFile(node);
    } else if (this.isSection(node)) {
      this.formatSection(node);
    } else if (this.isAttribute(node)) {
      this.formatAttribute(node);
    } else if (this.isFlowRule(node)) {
      this.formatFlowRule(node);
    } else if (this.isEmbeddedCodeBlock(node)) {
      this.formatEmbeddedCode(node);
    }
  }

  private formatRclFile(file: AstNode): void {
    const formatter = this.getNodeFormatter(file);

    // Handle imports if they exist
    const imports = this.getImports(file);
    if (imports && imports.length > 0) {
      imports.forEach((importStmt, index) => {
        if (index > 0) {
          formatter.node(importStmt).prepend(Formatting.newLine());
        }
      });

      // Add spacing between imports and agent section
      const agentSection = this.getAgentSection(file);
      if (agentSection) {
        formatter.node(agentSection).prepend(Formatting.newLines(2));
      }
    }
  }

  private formatSection(section: AstNode): void {
    const formatter = this.getNodeFormatter(section);

    // Section header formatting - ensure space between section type and name
    if (this.hasSectionName(section)) {
      const sectionName = this.getSectionName(section);
      if (sectionName) {
        formatter.node(sectionName).prepend(Formatting.oneSpace());
      }
    }

    // Section content indentation
    const indentFormatting = Formatting.indent();

    // Format attributes
    const attributes = this.getAttributes(section);
    if (attributes && attributes.length > 0) {
      attributes.forEach(attr => {
        formatter.node(attr).prepend(Formatting.newLine());
        formatter.node(attr).prepend(indentFormatting);
      });
    }

    // Format nested sections
    const subSections = this.getSubSections(section);
    if (subSections && subSections.length > 0) {
      subSections.forEach(subSection => {
        formatter.node(subSection).prepend(Formatting.newLine());
        formatter.node(subSection).prepend(indentFormatting);
      });
    }

    // Format flow content
    const flowContent = this.getFlowContent(section);
    if (flowContent && flowContent.length > 0) {
      flowContent.forEach(flow => {
        formatter.node(flow).prepend(Formatting.newLine());
        formatter.node(flow).prepend(indentFormatting);
      });
    }
  }

  private formatAttribute(attribute: AstNode): void {
    const formatter = this.getNodeFormatter(attribute);

    // Consistent spacing around colon: no space before, one space after
    formatter.keyword(':').prepend(Formatting.noSpace());
    formatter.keyword(':').append(Formatting.oneSpace());

    // Handle multi-line values
    if (this.isMultiLineValue(attribute)) {
      const value = this.getAttributeValue(attribute);
      if (value) {
        formatter.node(value).prepend(Formatting.newLine());
      }
    }
  }

  private formatFlowRule(flowRule: AstNode): void {
    const formatter = this.getNodeFormatter(flowRule);

    // Format arrow with consistent spacing
    formatter.keyword('->').prepend(Formatting.oneSpace());
    formatter.keyword('->').append(Formatting.oneSpace());

    // Align multiple flow rules within the same section
    this.alignFlowRules(flowRule);
  }

  private formatEmbeddedCode(codeBlock: AstNode): void {
    const formatter = this.getNodeFormatter(codeBlock);

    if (this.isSingleLineEmbeddedCode(codeBlock)) {
      // Single line: keep on same line as attribute
      formatter.node(codeBlock).prepend(Formatting.oneSpace());
    } else {
      // Multi-line: preserve internal formatting but ensure proper base indentation
      this.preserveEmbeddedCodeFormatting(codeBlock);
    }
  }



  private alignFlowRules(flowRule: AstNode): void {
    const parentSection = this.getParentSection(flowRule);
    if (!parentSection) {
      return;
    }

    const flowContent = this.getFlowContent(parentSection);
    if (!flowContent || flowContent.length <= 1) {
      return;
    }

    // Find the longest source operand for alignment
    const flowRules = flowContent.filter(content => this.isFlowRule(content));
    const maxSourceLength = Math.max(
      ...flowRules.map(rule => this.getFlowOperandLength(this.getFlowSource(rule)))
    );

    const formatter = this.getNodeFormatter(flowRule);
    const currentLength = this.getFlowOperandLength(this.getFlowSource(flowRule));
    const paddingNeeded = maxSourceLength - currentLength;

    if (paddingNeeded > 0) {
      formatter.keyword('->').prepend(Formatting.spaces(paddingNeeded));
    }
  }

  private preserveEmbeddedCodeFormatting(codeBlock: AstNode): void {
    // For multi-line code blocks, preserve internal formatting
    // while ensuring consistent base indentation
    const formatter = this.getNodeFormatter(codeBlock);

    // Apply base indentation but preserve relative indentation within the code
    formatter.node(codeBlock).prepend(Formatting.newLine());
    formatter.node(codeBlock).prepend(Formatting.indent());
  }

  // Type guard and utility methods
  private isRclFile(node: AstNode): boolean {
    return node.$type === 'RclFile';
  }

  private isSection(node: AstNode): boolean {
    return node.$type === 'Section' ||
      node.$type === 'AgentDefinition' ||
      node.$type === 'ConfigSection' ||
      node.$type === 'DefaultsSection' ||
      node.$type === 'MessagesSection' ||
      node.$type === 'FlowSection';
  }

  private isAttribute(node: AstNode): boolean {
    return node.$type === 'PropertyAssignment' ||
      node.$type === 'Attribute' ||
      node.$type === 'Parameter';
  }

  private isFlowRule(node: AstNode): boolean {
    return node.$type === 'FlowRule' || node.$type === 'EnhancedFlowRule';
  }

  private isEmbeddedCodeBlock(node: AstNode): boolean {
    return node.$type === 'SingleLineExpression' ||
      node.$type === 'MultiLineExpression' ||
      node.$type === 'EmbeddedCodeBlock';
  }

  private getImports(file: AstNode): AstNode[] | undefined {
    return (file as any).imports || (file as any).importStatements;
  }

  private getAgentSection(file: AstNode): AstNode | undefined {
    return (file as any).agentDefinition || (file as any).agentSection;
  }

  private hasSectionName(section: AstNode): boolean {
    return !!(section as any).sectionName || !!(section as any).name;
  }

  private getSectionName(section: AstNode): AstNode | undefined {
    return (section as any).sectionName || (section as any).name;
  }

  private getAttributes(section: AstNode): AstNode[] | undefined {
    return (section as any).attributes || (section as any).properties || (section as any).content;
  }

  private getSubSections(section: AstNode): AstNode[] | undefined {
    return (section as any).subSections || (section as any).sections;
  }

  private getFlowContent(section: AstNode): AstNode[] | undefined {
    return (section as any).flowContent || (section as any).rules || (section as any).content;
  }

  private getAttributeValue(attribute: AstNode): AstNode | undefined {
    return (attribute as any).value;
  }

  private isMultiLineValue(attribute: AstNode): boolean {
    const value = this.getAttributeValue(attribute);
    return !!(value && (this.isEmbeddedCodeBlock(value) || this.isMultiLineString(value)));
  }

  private isMultiLineString(node: AstNode): boolean {
    return node.$type === 'MultiLineString';
  }

  private isSingleLineEmbeddedCode(codeBlock: AstNode): boolean {
    return codeBlock.$type === 'SingleLineExpression';
  }

  private getParentSection(node: AstNode): AstNode | undefined {
    let current = node.$container;
    while (current && !this.isSection(current)) {
      current = current.$container;
    }
    return current;
  }

  private getFlowSource(flowRule: AstNode): AstNode | undefined {
    return (flowRule as any).source || (flowRule as any).from;
  }

  private getFlowOperandLength(operand: AstNode | undefined): number {
    if (!operand) return 0;

    // Get the text representation of the operand
    const text = (operand as any).value || (operand as any).name || (operand as any).$cstNode?.text || '';
    return text.length;
  }
}