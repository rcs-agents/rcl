import { type AstNode, type MaybePromise, AstUtils, CstUtils, type LangiumDocument } from 'langium';
import type { ReferencesProvider } from 'langium/lsp';
import type { Location, ReferenceParams, CancellationToken } from 'vscode-languageserver-protocol';
import { isIdentifier, type Identifier, isSection, type Section, isFlowOperand, type FlowOperand, isAttribute, type Attribute } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';

export class RclReferenceProvider implements ReferencesProvider {

  protected readonly services: RclServices;

  constructor(services: RclServices) {
    this.services = services;
  }

  findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken?: CancellationToken): MaybePromise<Location[]> {
    const rootAstNode = document.parseResult.value;
    if (!rootAstNode?.$cstNode) {
      return [];
    }
    const offset = document.textDocument.offsetAt(params.position);
    const cstLeaf = CstUtils.findLeafNodeAtOffset(rootAstNode.$cstNode, offset);

    if (!cstLeaf?.element) {
      return [];
    }

    const astNodeForLeaf = cstLeaf.element;

    if (isIdentifier(astNodeForLeaf)) {
      return this.findIdentifierReferences(astNodeForLeaf, document, params.context.includeDeclaration, cancelToken);
    }

    if (isFlowOperand(astNodeForLeaf)) {
      return this.findFlowOperandReferences(astNodeForLeaf, document, params.context.includeDeclaration, cancelToken);
    }

    if (isSection(astNodeForLeaf) && astNodeForLeaf.sectionName && cstLeaf.text === astNodeForLeaf.sectionName) {
      return this.findSectionReferences(astNodeForLeaf, document, params.context.includeDeclaration, cancelToken);
    }

    const enclosingSection = AstUtils.getContainerOfType(astNodeForLeaf, isSection);

    if (enclosingSection?.sectionName && cstLeaf.text === enclosingSection.sectionName) {
      return this.findSectionReferences(enclosingSection, document, params.context.includeDeclaration, cancelToken);
    }

    return [];
  }

  protected findIdentifierReferences(identifierNode: Identifier, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    const targetName = identifierNode.value;
    if (!targetName) return [];

    if (includeDeclaration) {
      const loc = this.getNodeLocation(identifierNode, document);
      if (loc) locations.push(loc);
    }

    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return locations;
      if (node === identifierNode) continue;

      if (isIdentifier(node) && node.value === targetName) {
        const loc = this.getNodeLocation(node, document);
        if (loc) locations.push(loc);
      } else if (isFlowOperand(node) && node.identifier?.value === targetName) {
        const loc = this.getNodeLocation(node.identifier!, document);
        if (loc) locations.push(loc);
      }
    }
    return locations;
  }

  protected findSectionReferences(sectionNode: Section, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    const targetName = sectionNode.sectionName;
    if (!targetName) return [];

    if (includeDeclaration) {
      const nameCstNode = this.services.references.NameProvider.getNameNode(sectionNode);
      const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(sectionNode, document);
      if (loc) locations.push(loc);
    }

    // Find all references to this section
    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return locations;
      if (node === sectionNode) continue;

      // Check flow operands that reference this section
      if (isFlowOperand(node)) {
        const operandValue = this.getFlowOperandValue(node);
        if (operandValue === targetName) {
          const loc = this.getNodeLocation(node, document);
          if (loc) locations.push(loc);
        }
      }

      // Check other sections with the same name (duplicates)
      if (isSection(node) && node.sectionName === targetName && node !== sectionNode) {
        const loc = this.getNodeLocation(node, document);
        if (loc) locations.push(loc);
      }

      // Check attributes that might reference sections (e.g., startFlow: SectionName)
      if (isAttribute(node)) {
        const attributeValue = this.getAttributeValue(node);
        if (attributeValue === targetName) {
          const loc = this.getNodeLocation(node, document);
          if (loc) locations.push(loc);
        }
      }
    }
    return locations;
  }

  protected findFlowOperandReferences(operandNode: FlowOperand, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    const targetValue = this.getFlowOperandValue(operandNode);

    if (!targetValue) return [];

    if (includeDeclaration) {
      const loc = this.getNodeLocation(operandNode, document);
      if (loc) locations.push(loc);
    }

    // Find all other flow operands with the same value
    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return locations;
      if (node === operandNode) continue;

      if (isFlowOperand(node)) {
        const operandValue = this.getFlowOperandValue(node);
        if (operandValue === targetValue) {
          const loc = this.getNodeLocation(node, document);
          if (loc) locations.push(loc);
        }
      }

      // Also check if any sections are named the same as this flow operand
      if (isSection(node) && node.sectionName === targetValue) {
        const loc = this.getNodeLocation(node, document);
        if (loc) locations.push(loc);
      }
    }

    return locations;
  }

  protected getNodeLocation(node: AstNode, document: LangiumDocument): Location | undefined {
    const nodeRange = node.$cstNode?.range;
    if (!nodeRange) {
      return undefined;
    }
    return { uri: document.uri.toString(), range: nodeRange };
  }

  protected getNodeLocationFromCst(cstNode: AstNode['$cstNode'], document: LangiumDocument): Location | undefined {
    if (!cstNode) return undefined;
    return { uri: document.uri.toString(), range: cstNode.range };
  }

  /**
   * Extract the value from a FlowOperand
   */
  private getFlowOperandValue(operand: FlowOperand): string | undefined {
    // FlowOperand could be a symbol (:start, :end), identifier, or string
    if ((operand as any).symbol) {
      return (operand as any).symbol;
    }
    if (operand.identifier) {
      return operand.identifier.value;
    }
    if ((operand as any).value) {
      return (operand as any).value;
    }

    // Fallback: try to extract from the $cstNode if available
    if (operand.$cstNode) {
      return operand.$cstNode.text;
    }

    return undefined;
  }

  /**
   * Extract the value from an Attribute (simplified)
   */
  private getAttributeValue(attribute: Attribute): string | undefined {
    // This is a simplified implementation - in practice you'd need to handle
    // different value types (strings, identifiers, type conversions, etc.)
    if (attribute.value && (attribute.value as any).identifier) {
      return (attribute.value as any).identifier.value;
    }

    // For string values, type conversions, etc., you'd need more specific handling
    // based on the actual AST structure
    if (attribute.value?.$cstNode) {
      const text = attribute.value.$cstNode.text.trim();
      // Remove quotes if it's a string literal
      if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        return text.slice(1, -1);
      }
      return text;
    }

    return undefined;
  }
}