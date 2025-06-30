import { AstUtils, AstNode, type LangiumDocument, MaybePromise, CstUtils, GrammarUtils } from 'langium';
import { Location, type ReferenceParams, type CancellationToken } from 'vscode-languageserver-protocol';
import { DefaultReferencesProvider } from 'langium/lsp';
import { isSection, type Section, isFlowRule } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';

export class RclReferenceProvider extends DefaultReferencesProvider {

  protected readonly services: RclServices;

  constructor(services: RclServices) {
    super(services);
    this.services = services;
  }

  override findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken?: CancellationToken): MaybePromise<Location[]> {
    const rootAstNode = document.parseResult.value;
    if (!rootAstNode?.$cstNode) {
      return [];
    }
    const offset = document.textDocument.offsetAt(params.position);
    const cstNode = CstUtils.findLeafNodeAtOffset(rootAstNode.$cstNode, offset);

    if (!cstNode?.element) {
      return [];
    }

    const astNodeForLeaf = cstNode.element;

    if (isSection(astNodeForLeaf) && astNodeForLeaf.name && cstNode.text === astNodeForLeaf.name) {
      return this.findSectionReferences(astNodeForLeaf, document, params.context.includeDeclaration, cancelToken);
    }

    const enclosingSection = AstUtils.getContainerOfType(astNodeForLeaf, isSection);

    if (enclosingSection?.name && cstNode.text === enclosingSection.name) {
      return this.findSectionReferences(enclosingSection, document, params.context.includeDeclaration, cancelToken);
    }

    return [];
  }

  protected findSectionReferences(sectionNode: Section, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];
    const targetName = sectionNode.name;
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

      // Check for flow rule references
      if (isFlowRule(node)) {
        if (node.destination?.ref === sectionNode) {
          const destCstNode = GrammarUtils.findNodeForProperty(node.$cstNode, 'destination');
          const loc = this.getNodeLocationFromCst(destCstNode, document);
          if (loc) {
            locations.push(loc);
          }
        }
      }

      // Check other sections with the same name (duplicates)
      if (isSection(node) && node.name === targetName && node !== sectionNode) {
        const loc = this.getNodeLocation(node, document);
        if (loc) locations.push(loc);
      }
    }
    return locations;
  }

  protected getNodeLocation(node: AstNode, document: LangiumDocument): Location | undefined {
    if (node.$cstNode) {
      return Location.create(
        document.uri.toString(),
        node.$cstNode.range
      );
    }
    return undefined;
  }

  protected getNodeLocationFromCst(cstNode: AstNode['$cstNode'], document: LangiumDocument): Location | undefined {
    if (!cstNode) return undefined;
    return { uri: document.uri.toString(), range: cstNode.range };
  }
}