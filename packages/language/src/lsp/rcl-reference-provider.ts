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

    if (enclosingSection && enclosingSection.sectionName && cstLeaf.text === enclosingSection.sectionName) {
      return this.findSectionReferences(enclosingSection, document, params.context.includeDeclaration, cancelToken);
    }

    return [];
  }

  protected findIdentifierReferences(identifier: Identifier, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    if (includeDeclaration) {
      const loc = this.getNodeLocation(identifier, document);
      if (loc) locations.push(loc);
    }
    return locations;
  }

  protected findSectionReferences(section: Section, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    if (includeDeclaration && section.sectionName) {
      const loc = this.getNodeLocation(section, document);
      if (loc) locations.push(loc);
    }
    return locations;
  }

  protected findFlowOperandReferences(operand: FlowOperand, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    if (includeDeclaration) {
      const loc = this.getNodeLocation(operand, document);
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
}