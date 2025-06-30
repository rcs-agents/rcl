import type { AstNode, LangiumDocument, MaybePromise } from 'langium';
import { AstUtils } from 'langium'; // For AstUtils.streamAllContents
import type { FoldingRangeProvider } from 'langium/lsp';
import { FoldingRange, FoldingRangeKind, type CancellationToken, type FoldingRangeParams } from 'vscode-languageserver-protocol';
import { isSection } from '../generated/ast.js';
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
      isSection(n)
    );

    for (const node of nodes) {
      const nodeCst = node.$cstNode;
      if (!nodeCst) {
        continue;
      }

      let startLine = nodeCst.range.start.line;
      const endLine = nodeCst.range.end.line;
      let kind: FoldingRangeKind | undefined = undefined;
      const startCharacter: number | undefined = 0; // Default to start of line for folding content
      const endCharacter: number | undefined = undefined; // Let client decide or use line length

      if (isSection(node)) {
        kind = FoldingRangeKind.Region;

        // Fold content after the first line of the section declaration
        if (endLine > nodeCst.range.start.line) {
          startLine = nodeCst.range.start.line + 1;
        } else {
          continue; // Not enough lines to fold content
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