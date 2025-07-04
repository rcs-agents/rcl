/**
 * Mode Manager
 * 
 * Handles multi-mode lexing for different contexts like type tags, 
 * multi-line strings, and embedded expressions.
 */

import type { IToken, TokenType } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';
import type { PositionTracker } from '../core/position-tracker.js';
import type { ErrorHandler } from '../core/error-handler.js';
import { DefaultMode } from './default-mode.js';
import { TypeTagMode } from './type-tag-mode.js';
import { StringContentMode } from './string-content-mode.js';

export type LexerMode = 'default' | 'type_tag' | 'type_tag_modifier' | 'string_content' | 'expression_content';

export interface ModeTransitionResult {
  startedSpecialMode: boolean;
  modeType?: 'string' | 'expression' | 'type_tag';
}

export class ModeManager {
  private currentMode: LexerMode = 'default';
  private modeStack: LexerMode[] = [];
  
  // Mode handlers
  private defaultMode: DefaultMode;
  private typeTagMode: TypeTagMode;
  private stringContentMode: StringContentMode;
  
  // Special mode state
  private inSpecialMode: boolean = false;
  private specialModeType: 'string' | 'expression' | 'type_tag' | null = null;
  private specialModeIndent: number = 0;

  constructor() {
    this.defaultMode = new DefaultMode();
    this.typeTagMode = new TypeTagMode();
    this.stringContentMode = new StringContentMode();
  }

  reset(): void {
    this.currentMode = 'default';
    this.modeStack = [];
    this.inSpecialMode = false;
    this.specialModeType = null;
    this.specialModeIndent = 0;
  }

  /**
   * Get tokens for the current lexing mode
   */
  getTokensForCurrentMode(): TokenType[] {
    switch (this.currentMode) {
      case 'type_tag':
      case 'type_tag_modifier':
        return this.typeTagMode.getTokens();
      case 'string_content':
      case 'expression_content':
        return this.stringContentMode.getTokens();
      default:
        return this.defaultMode.getTokens();
    }
  }

  /**
   * Handle mode transitions based on token types
   */
  handleModeTransition(tokenType: TokenType, tokenImage: string): ModeTransitionResult {
    // Handle type tag mode transitions
    if (tokenType === RclTokens.LT) {
      this.pushMode('type_tag');
      return { startedSpecialMode: false };
    }
    
    if (tokenType === RclTokens.GT && this.currentMode === 'type_tag') {
      this.popMode();
      return { startedSpecialMode: false };
    }
    
    if (tokenType === RclTokens.PIPE && this.currentMode === 'type_tag') {
      this.pushMode('type_tag_modifier');
      return { startedSpecialMode: false };
    }

    // Handle multi-line string markers
    if (this.isMultiLineStringMarker(tokenType)) {
      return { startedSpecialMode: true, modeType: 'string' };
    }

    // Handle multi-line expression start
    if (tokenType === RclTokens.MULTI_LINE_EXPRESSION_START) {
      return { startedSpecialMode: true, modeType: 'expression' };
    }

    return { startedSpecialMode: false };
  }

  /**
   * Start a special mode for multi-line content processing
   */
  startSpecialMode(modeType: 'string' | 'expression' | 'type_tag', text: string, offset: number): void {
    this.inSpecialMode = true;
    this.specialModeType = modeType;
    
    // Find the indentation level of the next line
    this.specialModeIndent = this.calculateNextLineIndentation(text, offset);
    
    // Switch to appropriate mode
    if (modeType === 'string') {
      this.pushMode('string_content');
    } else if (modeType === 'expression') {
      this.pushMode('expression_content');
    }
  }

  /**
   * Check if currently in a special mode
   */
  isInSpecialMode(): boolean {
    return this.inSpecialMode;
  }

  /**
   * Handle content processing in special modes
   */
  handleSpecialModeContent(
    text: string,
    offset: number,
    tokens: IToken[],
    positionTracker: PositionTracker,
    errorHandler: ErrorHandler
  ): { processed: boolean; newOffset: number } {
    if (!this.inSpecialMode || !this.specialModeType) {
      return { processed: false, newOffset: offset };
    }

    const content = this.extractIndentedBlock(text, offset, this.specialModeIndent);
    
    if (content) {
      // Create appropriate token for the content
      const tokenType = this.specialModeType === 'expression' 
        ? RclTokens.MULTI_LINE_EXPRESSION_CONTENT
        : RclTokens.STRING_CONTENT;
      
      const token = this.createContentToken(tokenType, content.text, content.startOffset, positionTracker);
      tokens.push(token);
      
      // Update position
      positionTracker.updateFromOffset(text, content.endOffset);
      
      // Exit special mode
      this.inSpecialMode = false;
      this.specialModeType = null;
      this.specialModeIndent = 0;
      this.popMode();
      
      return { processed: true, newOffset: content.endOffset };
    }

    // Exit special mode even if no content found
    this.inSpecialMode = false;
    this.specialModeType = null;
    this.specialModeIndent = 0;
    this.popMode();

    return { processed: false, newOffset: offset };
  }

  private pushMode(mode: LexerMode): void {
    this.modeStack.push(this.currentMode);
    this.currentMode = mode;
  }

  private popMode(): void {
    if (this.modeStack.length > 0) {
      this.currentMode = this.modeStack.pop()!;
    } else {
      this.currentMode = 'default';
    }
  }

  private isMultiLineStringMarker(tokenType: TokenType): boolean {
    return tokenType === RclTokens.MULTILINE_STR_CLEAN ||
           tokenType === RclTokens.MULTILINE_STR_TRIM ||
           tokenType === RclTokens.MULTILINE_STR_PRESERVE ||
           tokenType === RclTokens.MULTILINE_STR_PRESERVE_ALL;
  }

  private calculateNextLineIndentation(text: string, offset: number): number {
    let nextLineOffset = offset;
    
    // Find the next newline
    while (nextLineOffset < text.length && text[nextLineOffset] !== '\n') {
      nextLineOffset++;
    }
    
    if (nextLineOffset < text.length) {
      nextLineOffset++; // Skip the newline
    }

    return this.getIndentationLevel(text, nextLineOffset);
  }

  private getIndentationLevel(text: string, offset: number): number {
    let level = 0;
    let currentOffset = offset;
    
    while (currentOffset < text.length) {
      const char = text[currentOffset];
      if (char === ' ') {
        level++;
        currentOffset++;
      } else if (char === '\t') {
        level += 8;
        currentOffset++;
      } else {
        break;
      }
    }
    
    return level;
  }

  private extractIndentedBlock(
    text: string, 
    startOffset: number, 
    minIndentLevel: number
  ): { text: string; startOffset: number; endOffset: number } | null {
    let currentOffset = startOffset;
    let blockText = '';
    const blockStartOffset = startOffset;

    while (currentOffset < text.length) {
      const lineStart = currentOffset;
      
      // Get indentation of current line
      const indentLevel = this.getIndentationLevel(text, currentOffset);
      currentOffset += indentLevel;

      // If we hit end of file or a line with less indentation, we're done
      if (currentOffset >= text.length || 
          (indentLevel < minIndentLevel && 
           text[currentOffset] !== '\n' && 
           text[currentOffset] !== '\r' &&
           text[currentOffset] !== '#')) {
        break;
      }

      // Find end of line
      let lineEnd = currentOffset;
      while (lineEnd < text.length && 
             text[lineEnd] !== '\n' && 
             text[lineEnd] !== '\r') {
        lineEnd++;
      }

      // Include the line in the block
      blockText += text.substring(lineStart, lineEnd);
      
      // Include newline if present
      if (lineEnd < text.length && 
          (text[lineEnd] === '\n' || text[lineEnd] === '\r')) {
        if (text[lineEnd] === '\r' && 
            lineEnd + 1 < text.length && 
            text[lineEnd + 1] === '\n') {
          blockText += '\r\n';
          currentOffset = lineEnd + 2;
        } else {
          blockText += text[lineEnd];
          currentOffset = lineEnd + 1;
        }
      } else {
        currentOffset = lineEnd;
      }
    }

    return blockText ? { text: blockText, startOffset: blockStartOffset, endOffset: currentOffset } : null;
  }

  private createContentToken(
    tokenType: TokenType,
    image: string,
    offset: number,
    positionTracker: PositionTracker
  ): IToken {
    const position = positionTracker.getPosition();
    const endPosition = positionTracker.calculateEndPosition(image);

    return {
      image,
      startOffset: offset,
      endOffset: offset + image.length,
      startLine: position.line,
      endLine: endPosition.line,
      startColumn: position.column,
      endColumn: endPosition.column,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      tokenType
    };
  }

  /**
   * Get current mode for testing/debugging
   */
  getCurrentMode(): LexerMode {
    return this.currentMode;
  }

  /**
   * Get mode stack for testing/debugging
   */
  getModeStack(): readonly LexerMode[] {
    return [...this.modeStack];
  }
}