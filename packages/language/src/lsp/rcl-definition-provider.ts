import { type AstNode, type MaybePromise, AstUtils, CstUtils, type LangiumDocument } from 'langium';
import type { DefinitionProvider } from 'langium/lsp';
import type { Location, DefinitionParams, CancellationToken, LocationLink } from 'vscode-languageserver-protocol';
import { isIdentifier, type Identifier, isSection, isFlowOperand, type FlowOperand, type Section, type ReservedSectionName } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';

export class RclDefinitionProvider implements DefinitionProvider {

  protected readonly services: RclServices;

  constructor(services: RclServices) {
    this.services = services;
  }

  getDefinition(document: LangiumDocument, params: DefinitionParams, cancelToken?: CancellationToken): MaybePromise<LocationLink[] | undefined> {
    const rootAstNode = document.parseResult.value;
    if (!rootAstNode?.$cstNode) {
      return undefined;
    }
    const offset = document.textDocument.offsetAt(params.position);
    const cstLeaf = CstUtils.findLeafNodeAtOffset(rootAstNode.$cstNode, offset);

    if (!cstLeaf?.element) {
      return undefined;
    }

    const astNodeForLeaf = cstLeaf.element;

    // Handle identifiers (e.g., message names in flow operands)
    if (isIdentifier(astNodeForLeaf)) {
      return this.findIdentifierDefinition(astNodeForLeaf, document, cancelToken);
    }

    // Handle flow operands (e.g., message references in flow rules)
    if (isFlowOperand(astNodeForLeaf)) {
      return this.findFlowOperandDefinition(astNodeForLeaf, document, cancelToken);
    }

    // Handle section name references
    const typedAstNodeForLeaf = astNodeForLeaf as Section & { sectionName?: string, reservedName?: ReservedSectionName };
    if (isSection(astNodeForLeaf) && typedAstNodeForLeaf.sectionName && cstLeaf.text === typedAstNodeForLeaf.sectionName) {
      // This is already the definition, so return it
      const nameCstNode = this.services.references.NameProvider.getNameNode(astNodeForLeaf);
      const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(astNodeForLeaf, document);
      return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
    }

    // Check if we're clicking on a section name that's part of a larger context
    const enclosingSection = AstUtils.getContainerOfType(astNodeForLeaf, isSection);
    const typedEnclosingSection = enclosingSection as Section & { sectionName?: string, reservedName?: ReservedSectionName };
    if (typedEnclosingSection?.sectionName && cstLeaf.text === typedEnclosingSection.sectionName) {
      const nameCstNode = this.services.references.NameProvider.getNameNode(typedEnclosingSection);
      const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(typedEnclosingSection, document);
      return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
    }

    return undefined;
  }

  protected findIdentifierDefinition(identifierNode: Identifier, document: LangiumDocument, cancelToken?: CancellationToken): LocationLink[] | undefined {
    const targetName = identifierNode.value;
    if (!targetName) return undefined;

    // Look for sections with the same name as this identifier
    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return undefined;

      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === targetName) {
        // Found the section definition
        const nameCstNode = this.services.references.NameProvider.getNameNode(node);
        const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(node, document);
        return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
      }
    }

    return undefined;
  }

  protected findFlowOperandDefinition(operandNode: FlowOperand, document: LangiumDocument, cancelToken?: CancellationToken): LocationLink[] | undefined {
    const targetValue = this.getFlowOperandValue(operandNode);
    if (!targetValue) return undefined;

    // Look for sections with the same name as this flow operand
    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return undefined;

      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === targetValue) {
        // Found the section definition
        const nameCstNode = this.services.references.NameProvider.getNameNode(node);
        const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(node, document);
        return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
      }
    }

    return undefined;
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
    if (operand.symbol) { // ATOM terminal like :start, :end
      return operand.symbol;
    }
    if (operand.variable) { // ProperNoun rule
      return operand.variable;
    }
    if (operand.attribute) { // COMMON_NOUN rule
      return operand.attribute;
    }
    if (operand.string) { // STRING terminal
      const str = operand.string;
      // Remove quotes from string literals
      if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
      }
      return str;
    }

    // Fallback: try to extract from the $cstNode if available
    if (operand.$cstNode) {
      return operand.$cstNode.text;
    }

    return undefined;
  }
}