import { AstUtils, CstUtils } from 'langium';
import type { NameProvider, LangiumDocument } from 'langium';
import { DefaultDefinitionProvider } from 'langium/lsp';
import type { CancellationToken, DefinitionParams, Location, LocationLink } from 'vscode-languageserver-protocol';

import { isSection } from '#src/parser/ast';
import type { RclServices } from '../rcl-module.js';

export class RclDefinitionProvider extends DefaultDefinitionProvider {

  protected override readonly nameProvider: NameProvider;

  constructor(services: RclServices) {
    super(services);
    this.nameProvider = services.references.NameProvider;
  }

  override async getDefinition(document: LangiumDocument, params: DefinitionParams, cancelToken?: CancellationToken): Promise<LocationLink[] | undefined> {
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

    // Handle section name references
    if (isSection(astNodeForLeaf) && astNodeForLeaf.name && cstLeaf.text === astNodeForLeaf.name) {
      // This is already the definition, so return it
      const nameCstNode = this.nameProvider.getNameNode(astNodeForLeaf);
      const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(astNodeForLeaf, document);
      return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
    }

    // Check if we're clicking on a section name that's part of a larger context
    const enclosingSection = AstUtils.getContainerOfType(astNodeForLeaf, isSection);
    if (enclosingSection && enclosingSection.name && cstLeaf.text === enclosingSection.name) {
      const nameCstNode = this.nameProvider.getNameNode(enclosingSection);
      const loc = nameCstNode ? this.getNodeLocationFromCst(nameCstNode, document) : this.getNodeLocation(enclosingSection, document);
      return loc ? [{ targetUri: loc.uri, targetRange: loc.range, targetSelectionRange: loc.range }] : undefined;
    }

    const targetNode = this.references.findDeclaration(cstLeaf);

    if (targetNode) {
      const definition = await super.getDefinition(document, params, cancelToken);
      if (definition) {
        return definition;
      }
    }

    return undefined;
  }

  protected getNodeLocation(node: any, document: LangiumDocument): Location | undefined {
    const nodeRange = node.$cstNode?.range;
    if (!nodeRange) {
      return undefined;
    }
    return { uri: document.uri.toString(), range: nodeRange };
  }

  protected getNodeLocationFromCst(cstNode: any, document: LangiumDocument): Location | undefined {
    if (!cstNode) return undefined;
    return { uri: document.uri.toString(), range: cstNode.range };
  }
}