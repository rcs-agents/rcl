import { type AstNode, type MaybePromise, AstUtils, CstUtils, type LangiumDocument } from 'langium';
import type { ReferencesProvider } from 'langium/lsp';
import type { Location, ReferenceParams, CancellationToken } from 'vscode-languageserver-protocol';
import { isIdentifier, type Identifier, isSection, type Section, isFlowOperand, type FlowOperand, isAttribute, type Attribute, type ReservedSectionName } from '../generated/ast.js';
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

    const typedAstNodeForLeaf = astNodeForLeaf as Section & { sectionName?: string, reservedName?: ReservedSectionName };
    if (isSection(astNodeForLeaf) && typedAstNodeForLeaf.sectionName && cstLeaf.text === typedAstNodeForLeaf.sectionName) {
      return this.findSectionReferences(astNodeForLeaf, document, params.context.includeDeclaration, cancelToken);
    }

    const enclosingSection = AstUtils.getContainerOfType(astNodeForLeaf, isSection);
    const typedEnclosingSection = enclosingSection as Section & { sectionName?: string, reservedName?: ReservedSectionName };

    if (typedEnclosingSection?.sectionName && cstLeaf.text === typedEnclosingSection.sectionName) {
      return this.findSectionReferences(typedEnclosingSection, document, params.context.includeDeclaration, cancelToken);
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
      } else if (isFlowOperand(node)) {
        const operandValue = this.getFlowOperandValue(node);
        if (operandValue === targetName) {
          const loc = this.getNodeLocation(node, document);
          if (loc) locations.push(loc);
        }
      }
    }
    return locations;
  }

  protected findSectionReferences(sectionNode: Section, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    const targetName = (sectionNode as Section & { sectionName?: string }).sectionName;
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
      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === targetName && node !== sectionNode) {
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
      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === targetValue) {
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
    // Early return for undefined operands
    if (!operand) {
      return undefined;
    }

    // FlowOperand structure based on grammar: symbol=ATOM | variable=ProperNoun | attribute=COMMON_NOUN | string=STRING
    if (operand.symbol) {
      return operand.symbol;
    }
    if (operand.variable) {
      return operand.variable;
    }
    if (operand.attribute) {
      return operand.attribute;
    }
    if (operand.string) {
      // Remove quotes from string literals
      const str = operand.string;
      if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
      }
      return str;
    }

    // Fallback: try to extract from the $cstNode if available
    // This fallback might be redundant if the grammar ensures one of the above fields is always present on FlowOperand
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
    const valueNode = attribute.value;
    if (valueNode) {
      if (isIdentifier(valueNode)) { // Check if value is an Identifier AST node
        return valueNode.value;       // Access the 'value' property of the Identifier
      }
      // For other LiteralValue types or complex types, extract text from CST node
      if (valueNode.$cstNode) {
        const text = valueNode.$cstNode.text.trim();
        // Remove quotes if it's a string literal
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
          return text.slice(1, -1);
        }
        return text;
      }
    }

    return undefined;
  }
}