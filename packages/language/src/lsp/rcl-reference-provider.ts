import { AstUtils, AstNode, CstUtils, type LangiumDocument, MaybePromise } from 'langium';
import { Location, type ReferenceParams, type CancellationToken } from 'vscode-languageserver-protocol';
import type { ReferencesProvider } from 'langium/lsp';
import { isSection, type Section, isFlowRule, type FlowRule, type ReservedSectionName } from '../generated/ast.js';
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

      // Check for flow operand references
      if (isFlowRule(node)) {
        // Handle flow rule references
        return this.findFlowOperandReferences(node.source, document, includeDeclaration, cancelToken);
      }

      // TODO: FlowOperand is now a union type string | FlowStartAction | FlowTextAction
      // This needs to be reimplemented when the grammar structure is stabilized

      // Check other sections with the same name (duplicates)
      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === targetName && node !== sectionNode) {
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

  protected findFlowOperandReferences(operandValue: string, document: LangiumDocument, includeDeclaration: boolean, cancelToken?: CancellationToken): Location[] {
    const locations: Location[] = [];

    if (!operandValue) return [];

    // Note: Since FlowOperand is now a string, we can't get a location for the declaration
    // This would need to be implemented differently when the grammar supports it

    // Find all flow rules that use this operand value
    for (const node of AstUtils.streamAllContents(document.parseResult.value)) {
      if (cancelToken?.isCancellationRequested) return locations;

      if (isFlowRule(node)) {
        const flowRule = node as FlowRule;
        // Check source operand (string)
        if (flowRule.source === operandValue) {
          const loc = this.getNodeLocation(flowRule, document);
          if (loc) locations.push(loc);
        }

        // Check transitions operands (array of strings)
        for (const transition of flowRule.transitions || []) {
          if (transition === operandValue) {
            const loc = this.getNodeLocation(flowRule, document);
            if (loc) locations.push(loc);
          }
        }
      }

      // Also check if any sections are named the same as this flow operand
      const typedNode = node as Section & { sectionName?: string };
      if (isSection(node) && typedNode.sectionName === operandValue) {
        const loc = this.getNodeLocation(node, document);
        if (loc) locations.push(loc);
      }
    }

    return locations;
  }
}