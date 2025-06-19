import type { AstNode, LangiumDocument, MaybePromise } from 'langium';
import { AstUtils } from 'langium'; // For AstUtils.streamAllContents
import type { FoldingRangeProvider } from 'langium/lsp';
import { FoldingRange, FoldingRangeKind, type CancellationToken, type FoldingRangeParams } from 'vscode-languageserver-protocol';
import { isSection, type Section, isMultiLineEmbeddedCodeBlock, type MultiLineEmbeddedCodeBlock } from '../generated/ast.js'; // Ensure specific types are available for casting
import type { RclServices } from '../rcl-module.js';

export class RclFoldingRangeProvider implements FoldingRangeProvider {

  protected readonly services: RclServices; // Ensure services property is declared

  constructor(services: RclServices) { // Uncommented constructor
    this.services = services;
  }

  getFoldingRanges(document: LangiumDocument, params: FoldingRangeParams, cancelToken?: CancellationToken): MaybePromise<FoldingRange[]> {
    const rootNode = document.parseResult.value;
    if (!rootNode?.$cstNode) { // Ensure root CST node exists
      return Promise.resolve([]);
    }

    const foldingRanges: FoldingRange[] = [];
    const nodes = AstUtils.streamAllContents(rootNode).filter((n: AstNode) =>
      isSection(n) || isMultiLineEmbeddedCodeBlock(n)
    );

    for (const node of nodes) {
      const nodeCst = node.$cstNode;
      if (!nodeCst) {
        continue;
      }

      let startLine = nodeCst.range.start.line;
      let endLine = nodeCst.range.end.line;
      let kind: FoldingRangeKind | undefined = undefined;
      let startCharacter: number | undefined = 0; // Default to start of line for folding content
      let endCharacter: number | undefined = undefined; // Let client decide or use line length

      if (isSection(node)) {
        const sectionNode = node as Section; // Use sectionNode after cast
        kind = FoldingRangeKind.Region;

        // Fold content after the first line of the section declaration
        if (sectionNode.$cstNode && endLine > sectionNode.$cstNode.range.start.line) {
          startLine = sectionNode.$cstNode.range.start.line + 1;
        } else {
          continue; // Not enough lines to fold content
        }
      } else if (isMultiLineEmbeddedCodeBlock(node)) {
        const codeBlockNode = node as MultiLineEmbeddedCodeBlock; // Use codeBlockNode after cast
        kind = FoldingRangeKind.Region;
        // Fold content after the line of the start marker (e.g., $js>>>)
        if (codeBlockNode.$cstNode && endLine > codeBlockNode.$cstNode.range.start.line) {
          startLine = codeBlockNode.$cstNode.range.start.line + 1;
        } else {
          continue; // No content lines to fold
        }
      }

      if (startLine < endLine) {
        // Create takes: startLine, endLine, startCharacter (opt), endCharacter (opt), kind (opt)
        foldingRanges.push(FoldingRange.create(startLine, endLine, startCharacter, endCharacter, kind));
      }
    }
    return Promise.resolve(foldingRanges);
  }
}