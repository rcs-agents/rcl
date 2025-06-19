import { type AstNode, type MaybePromise, AstUtils, CstUtils, type LangiumDocument } from 'langium';
import type { ReferencesProvider } from 'langium/lsp';
import type { Location, ReferenceParams, CancellationToken } from 'vscode-languageserver-protocol';
import { isIdentifier, type Identifier, isSection, type Section, isFlowOperand, type FlowOperand } from '../generated/ast.js';
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

    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return locations;
      if (node === sectionNode) continue;
    }
    return locations;
  }

  private flowOperandReferencesName(operand: FlowOperand | undefined, name: string): boolean {
    if (!operand) return false;
    return (isIdentifier(operand.identifier) && operand.identifier.value === name) ||
      (operand.symbol === name) ||
      (operand.string === name);
  }

  protected findFlowOperandReferences(operandNode: FlowOperand, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    if (includeDeclaration) {
      const loc = this.getNodeLocation(operandNode, document);
      if (loc) locations.push(loc);
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
}