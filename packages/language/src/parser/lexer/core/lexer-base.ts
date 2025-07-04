/**
 * RCL Lexer Base Implementation
 * 
 * Provides the core lexing functionality with improved architecture and specification compliance.
 * Handles indentation-sensitive parsing, multi-mode lexing, and proper error recovery.
 */

import type { IToken, TokenType, IMultiModeLexerDefinition } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';
import { IndentationHandler } from './indentation-handler.js';
import { PositionTracker } from './position-tracker.js';
import { ErrorHandler } from './error-handler.js';
import { ModeManager } from '../modes/mode-manager.js';

export interface LexingResult {
  tokens: IToken[];
  errors: LexingError[];
}

export interface LexingError {
  message: string;
  offset: number;
  length: number;
  line: number;
  column: number;
}

/**
 * Main RCL Lexer with modular architecture
 */
export class RclLexer {
  private indentationHandler: IndentationHandler;
  private positionTracker: PositionTracker;
  private errorHandler: ErrorHandler;
  private modeManager: ModeManager;
  
  private tokens: IToken[] = [];
  private text: string = '';
  private offset: number = 0;

  constructor() {
    this.indentationHandler = new IndentationHandler();
    this.positionTracker = new PositionTracker();
    this.errorHandler = new ErrorHandler();
    this.modeManager = new ModeManager();
  }

  /**
   * Tokenize input text and return tokens with errors
   */
  tokenize(text: string): LexingResult {
    this.reset();
    this.text = text;

    while (this.offset < this.text.length) {
      try {
        const matched = this.tryMatchToken();
        if (!matched) {
          this.handleUnexpectedCharacter();
        }
      } catch (error) {
        this.errorHandler.addError(
          `Internal lexer error: ${error instanceof Error ? error.message : String(error)}`,
          this.offset,
          1,
          this.positionTracker.getLine(),
          this.positionTracker.getColumn()
        );
        this.advance(1); // Skip problematic character and continue
      }
    }

    // Add remaining dedents at end of file
    this.indentationHandler.flushRemainingDedents(this.tokens, this.offset, this.positionTracker);

    return {
      tokens: this.tokens,
      errors: this.errorHandler.getErrors()
    };
  }

  private reset(): void {
    this.indentationHandler.reset();
    this.positionTracker.reset();
    this.errorHandler.reset();
    this.modeManager.reset();
    this.tokens = [];
    this.text = '';
    this.offset = 0;
  }

  private tryMatchToken(): boolean {
    // Check for malformed embedded expressions before normal token matching
    if (this.detectMalformedEmbeddedExpression()) {
      return true; // Error was reported, advance handled
    }

    // Handle multi-line blocks in special modes
    if (this.modeManager.isInSpecialMode()) {
      const result = this.modeManager.handleSpecialModeContent(
        this.text,
        this.offset,
        this.tokens,
        this.positionTracker,
        this.errorHandler
      );
      
      if (result.processed) {
        this.offset = result.newOffset;
        this.positionTracker.updateFromOffset(this.text, result.newOffset);
        return true;
      }
      
      return false;
    }

    // Handle indentation at start of line
    if (this.isStartOfLine()) {
      const handled = this.indentationHandler.handleIndentation(
        this.text,
        this.offset,
        this.tokens,
        this.positionTracker,
        this.errorHandler
      );
      
      if (handled.tokensAdded > 0) {
        this.offset = handled.newOffset;
        this.positionTracker.updateFromOffset(this.text, handled.newOffset);
        return true;
      }
      
      this.offset = handled.newOffset;
    }

    // Try to match each token type in order
    const tokensToTry = this.modeManager.getTokensForCurrentMode();
    
    for (const tokenType of tokensToTry) {
      if (this.isSyntheticToken(tokenType)) {
        continue; // Skip synthetic tokens
      }

      if (this.tryMatchTokenType(tokenType)) {
        return true;
      }
    }

    return false;
  }

  private tryMatchTokenType(tokenType: TokenType): boolean {
    const pattern = tokenType.PATTERN;
    if (!(pattern instanceof RegExp)) return false;

    // Create sticky regex for current position
    const regex = new RegExp(pattern.source, 'y');
    regex.lastIndex = this.offset;
    const match = regex.exec(this.text);

    if (!match) return false;

    // Handle mode transitions
    const modeChange = this.modeManager.handleModeTransition(tokenType, match[0]);
    
    // Create token
    const token = this.createToken(tokenType, match[0], this.offset);
    
    // Skip hidden tokens but track position
    if (!this.isHiddenToken(tokenType)) {
      this.tokens.push(token);
    }

    // Advance position
    this.advance(match[0].length);

    // Handle special constructs that start multi-line modes
    if (modeChange.startedSpecialMode) {
      this.modeManager.startSpecialMode(modeChange.modeType!, this.text, this.offset);
    }

    return true;
  }

  private isStartOfLine(): boolean {
    return this.offset === 0 || this.text[this.offset - 1] === '\n';
  }

  private isSyntheticToken(tokenType: TokenType): boolean {
    return tokenType === RclTokens.INDENT || 
           tokenType === RclTokens.DEDENT ||
           tokenType === RclTokens.STRING_CONTENT ||
           tokenType === RclTokens.MULTI_LINE_EXPRESSION_CONTENT ||
           tokenType === RclTokens.TYPE_TAG_VALUE_CONTENT ||
           tokenType === RclTokens.TYPE_TAG_MODIFIER_CONTENT;
  }

  private isHiddenToken(tokenType: TokenType): boolean {
    // For indentation-sensitive parsing, we need whitespace tokens to be visible
    return false;
  }

  private createToken(tokenType: TokenType, image: string, offset: number): IToken {
    const endOffset = offset + image.length;
    const position = this.positionTracker.getPosition();
    
    // Calculate end position
    const endPosition = this.positionTracker.calculateEndPosition(image);

    return {
      image,
      startOffset: offset,
      endOffset,
      startLine: position.line,
      endLine: endPosition.line,
      startColumn: position.column,
      endColumn: endPosition.column,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      tokenType
    };
  }

  private advance(length: number): void {
    this.positionTracker.advance(this.text, this.offset, length);
    this.offset += length;
  }

  private handleUnexpectedCharacter(): void {
    const char = this.text[this.offset];
    const position = this.positionTracker.getPosition();
    
    this.errorHandler.addError(
      `Unexpected character '${char}'`,
      this.offset,
      1,
      position.line,
      position.column
    );
    
    this.advance(1);
  }

  private detectMalformedEmbeddedExpression(): boolean {
    // Look for patterns like $js>>, $ts>>, $>> etc. (exactly 2 > characters)
    const malformedPattern = /^\$((js|ts)?)>{2}(?!>)/;
    const match = this.text.substring(this.offset).match(malformedPattern);
    
    if (match) {
      const position = this.positionTracker.getPosition();
      const matchLength = match[0].length;
      
      this.errorHandler.addError(
        `Malformed embedded expression '${match[0]}'. Use '$${match[1] || ''}>' for single-line or '$${match[1] || ''}>>>' for multi-line expressions.`,
        this.offset,
        matchLength,
        position.line,
        position.column
      );
      
      this.advance(matchLength);
      return true;
    }
    
    return false;
  }

  /**
   * Get all token types for integration with Langium or other parsers
   */
  static getAllTokens(): TokenType[] {
    return RclTokens.getAllTokens();
  }

  /**
   * Create a multi-mode lexer definition for Chevrotain integration
   */
  static createMultiModeLexerDefinition(): IMultiModeLexerDefinition {
    const defaultModeTokens = RclTokens.getAllTokens();
    
    // Type tag mode - prioritize type tag names over general identifiers
    const typeTagModeTokens = [...defaultModeTokens].sort((a, b) => {
      const typeTagTokens = RclTokens.getTypeTagTokens();
      const aIsTypeTag = typeTagTokens.includes(a);
      const bIsTypeTag = typeTagTokens.includes(b);
      
      if (aIsTypeTag && !bIsTypeTag) return -1;
      if (!aIsTypeTag && bIsTypeTag) return 1;
      return 0;
    });

    return {
      modes: {
        default: defaultModeTokens,
        type_tag: typeTagModeTokens,
        type_tag_modifier: typeTagModeTokens,
        string_content: defaultModeTokens,
        expression_content: defaultModeTokens
      },
      defaultMode: 'default'
    };
  }
}