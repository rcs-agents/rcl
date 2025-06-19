import type { AstNode, LangiumDocument, MaybePromise } from 'langium';
import { AstUtils } from 'langium'; // For AstUtils.streamAllContents
import type { FoldingRangeProvider } from 'langium/lsp';
import { FoldingRange, FoldingRangeKind, type CancellationToken, type FoldingRangeParams } from 'vscode-languageserver-protocol';
import { isSection, isMultiLineEmbeddedCodeBlock } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';

export class RclFoldingRangeProvider implements FoldingRangeProvider {

  protected readonly services: RclServices;

  constructor(services: RclServices) {
    this.services = services;
  }

  getFoldingRanges(document: LangiumDocument, params: FoldingRangeParams, cancelToken?: CancellationToken): MaybePromise<FoldingRange[]> {
    const rootNode = document.parseResult.value;
    if (!rootNode) {
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
      const endLine = nodeCst.range.end.line;
      let kind: FoldingRangeKind | undefined = undefined;
      let startCharacter: number | undefined = nodeCst.range.start.character; // Default to actual start
      let endCharacter: number | undefined = nodeCst.range.end.character; // Default to actual end

      if (isSection(node)) {
        kind = FoldingRangeKind.Region;
        // Fold from the line after the header to the end of the section
        if (endLine > startLine) {
          startLine = startLine + 1;
          startCharacter = 0; // Typically fold whole lines from the start of the line
        }
      } else if (isMultiLineEmbeddedCodeBlock(node)) {
        kind = FoldingRangeKind.Region;
        // For MultiLineEmbeddedCodeBlock, its $cstNode.range is only the start marker (e.g., $js>>>)
        // The actual content ends with a DEDENT token which is not part of this AST node.
        // Finding the true end requires deeper CST inspection or assumptions.
        // For now, we can't reliably determine the endLine for folding MultiLineEmbeddedCodeBlock content robustly from AST alone.
        // Let's skip folding these for now until a robust CST-based solution is in place.
        continue;
      }

      if (startLine < endLine) {
        foldingRanges.push(FoldingRange.create(startLine, endLine, startCharacter, endCharacter, kind));
      }
    }
    return Promise.resolve(foldingRanges);
  }
}