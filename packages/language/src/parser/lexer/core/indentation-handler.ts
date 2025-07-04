/**
 * Indentation Handler
 * 
 * Manages INDENT/DEDENT token generation for indentation-sensitive parsing.
 * Handles mixed spaces/tabs, validates indentation levels, and provides error recovery.
 */

import type { IToken } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';
import type { PositionTracker } from './position-tracker.js';
import type { ErrorHandler } from './error-handler.js';

export interface IndentationResult {
  tokensAdded: number;
  newOffset: number;
}

export class IndentationHandler {
  private indentationStack: number[] = [0];

  reset(): void {
    this.indentationStack = [0];
  }

  /**
   * Handle indentation at the start of a line
   */
  handleIndentation(
    text: string,
    offset: number,
    tokens: IToken[],
    positionTracker: PositionTracker,
    errorHandler: ErrorHandler
  ): IndentationResult {
    const startOffset = offset;
    let currentOffset = offset;
    let indentLevel = 0;
    let hasContent = false;

    // Count spaces and tabs
    while (currentOffset < text.length) {
      const char = text[currentOffset];
      if (char === ' ') {
        indentLevel++;
        currentOffset++;
      } else if (char === '\t') {
        indentLevel += 8; // Treat tab as 8 spaces
        currentOffset++;
      } else {
        hasContent = true;
        break;
      }
    }

    // If we hit a newline, comment, or end of file, this is not significant indentation
    if (!hasContent || 
        currentOffset >= text.length || 
        text[currentOffset] === '\n' || 
        text[currentOffset] === '\r' || 
        text[currentOffset] === '#') {
      return { tokensAdded: 0, newOffset: currentOffset }; // Always advance past whitespace
    }

    const prevIndentLevel = this.indentationStack[this.indentationStack.length - 1];
    let tokensAdded = 0;

    if (indentLevel > prevIndentLevel) {
      // Increased indentation - emit INDENT
      this.indentationStack.push(indentLevel);
      const token = this.createIndentToken(RclTokens.INDENT, '', startOffset, positionTracker);
      tokens.push(token);
      tokensAdded = 1;
    } else if (indentLevel < prevIndentLevel) {
      // Decreased indentation - emit DEDENT(s)
      while (this.indentationStack.length > 1 && 
             this.indentationStack[this.indentationStack.length - 1] > indentLevel) {
        this.indentationStack.pop();
        const token = this.createIndentToken(RclTokens.DEDENT, '', startOffset, positionTracker);
        tokens.push(token);
        tokensAdded++;
      }

      // Check for indentation error (be tolerant of mixed indentation)
      const hasReasonableMatch = this.indentationStack.some(level => Math.abs(level - indentLevel) <= 4);
      if (!hasReasonableMatch) {
        const position = positionTracker.getPosition();
        errorHandler.addError(
          `Invalid dedent level ${indentLevel}. Expected one of: ${this.indentationStack.join(', ')}`,
          startOffset,
          currentOffset - startOffset,
          position.line,
          position.column
        );
      }
    }

    return { tokensAdded, newOffset: currentOffset };
  }

  /**
   * Emit remaining DEDENT tokens at end of file
   */
  flushRemainingDedents(tokens: IToken[], offset: number, positionTracker: PositionTracker): void {
    while (this.indentationStack.length > 1) {
      this.indentationStack.pop();
      const token = this.createIndentToken(RclTokens.DEDENT, '', offset, positionTracker);
      tokens.push(token);
    }
  }

  private createIndentToken(
    tokenType: typeof RclTokens.INDENT | typeof RclTokens.DEDENT,
    image: string,
    offset: number,
    positionTracker: PositionTracker
  ): IToken {
    const position = positionTracker.getPosition();
    
    return {
      image,
      startOffset: offset,
      endOffset: offset,
      startLine: position.line,
      endLine: position.line,
      startColumn: position.column,
      endColumn: position.column,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      tokenType
    };
  }

  /**
   * Get current indentation level for testing/debugging
   */
  getCurrentIndentLevel(): number {
    return this.indentationStack[this.indentationStack.length - 1];
  }

  /**
   * Get indentation stack for testing/debugging
   */
  getIndentationStack(): readonly number[] {
    return [...this.indentationStack];
  }
}