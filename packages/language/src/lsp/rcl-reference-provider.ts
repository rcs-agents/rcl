import { AstUtils, CstUtils, type LangiumDocument, type MaybePromise } from 'langium';
import { Location, type ReferenceParams, CancellationToken } from 'vscode-languageserver-protocol';
import { DefaultReferencesProvider } from 'langium/lsp';
import { isSection, isFlowRule } from '../parser/ast/type-guards.js';
import type { FlowRule } from '../parser/ast/index.js';
import type { RclServices } from '../rcl-module.js';

export class RclReferenceProvider extends DefaultReferencesProvider {

  constructor(services: RclServices) {
    super(services);
  }

  override findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken = CancellationToken.None): MaybePromise<Location[]> {
    const root = document.parseResult.value;
    if (!root?.$cstNode) {
        return [];
    }
    const cstNode = CstUtils.findLeafNodeAtOffset(root.$cstNode, document.textDocument.offsetAt(params.position));
    if (!cstNode) {
        return [];
    }
    const targetNode = this.references.findDeclaration(cstNode);
    if (!targetNode) {
        return [];
    }

    const locations: Location[] = [];

    if (isSection(targetNode)) {
        for(const node of AstUtils.streamAllContents(root)) {
            if (isFlowRule(node)) {
                const flowRule = node as FlowRule;
                for (const operand of flowRule.operands) {
                    if (operand.$cstNode) {
                        const declaration = this.references.findDeclaration(operand.$cstNode);
                        if (declaration === targetNode) {
                            locations.push(Location.create(document.uri.toString(), operand.$cstNode.range));
                        }
                    }
                }
            }
        }
    }
    
    const nameNode = this.nameProvider.getNameNode(targetNode);
    if (nameNode) {
        locations.push(Location.create(document.uri.toString(), nameNode.range));
    }

    return locations;
  }

  protected getNodeLocationFromCst(cstNode: any, document: LangiumDocument): Location | undefined {
    if (!cstNode) return undefined;
    return { uri: document.uri.toString(), range: cstNode.range };
  }
}