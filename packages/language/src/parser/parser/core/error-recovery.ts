/**
 * Error Recovery
 * 
 * Provides error recovery and synchronization strategies for the parser.
 * Helps the parser continue parsing after encountering errors.
 */

import type { TokenStream } from './token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';

export class ErrorRecovery {
  
  /**
   * Synchronize parser after an error by finding a safe recovery point
   */
  synchronize(tokenStream: TokenStream): void {
    tokenStream.advance();

    while (!tokenStream.isAtEnd()) {
      // If we hit a newline, that's a natural synchronization point
      if (tokenStream.previous().tokenType === RclTokens.NL) {
        return;
      }

      // Look for section start keywords as synchronization points
      const current = tokenStream.peek();
      if (current && this.isSectionStartToken(current.tokenType)) {
        return;
      }

      tokenStream.advance();
    }
  }

  /**
   * Check if a token type represents the start of a major section
   */
  private isSectionStartToken(tokenType: any): boolean {
    return tokenType === RclTokens.AGENT_KW ||
           tokenType === RclTokens.FLOW_KW ||
           tokenType === RclTokens.FLOWS_KW ||
           tokenType === RclTokens.MESSAGES_KW ||
           tokenType === RclTokens.AGENT_CONFIG_KW ||
           tokenType === RclTokens.AGENT_DEFAULTS_KW ||
           tokenType === RclTokens.IMPORT_KW;
  }

  /**
   * Try to recover from a missing token by inserting it conceptually
   */
  recoverMissingToken(expectedTokenType: any, tokenStream: TokenStream): boolean {
    // For some tokens like COLON, we can be more forgiving
    if (expectedTokenType === RclTokens.COLON) {
      // Check if the next meaningful token suggests we should continue
      const nextToken = tokenStream.peek();
      if (nextToken && (
        nextToken.tokenType === RclTokens.STRING ||
        nextToken.tokenType === RclTokens.NUMBER ||
        nextToken.tokenType === RclTokens.IDENTIFIER
      )) {
        return true; // Pretend we found the colon
      }
    }

    return false;
  }

  /**
   * Skip to the next statement boundary
   */
  skipToNextStatement(tokenStream: TokenStream): void {
    while (!tokenStream.isAtEnd()) {
      const token = tokenStream.peek();
      if (!token) break;

      // Statement boundaries
      if (token.tokenType === RclTokens.NL ||
          token.tokenType === RclTokens.DEDENT ||
          this.isSectionStartToken(token.tokenType)) {
        break;
      }

      tokenStream.advance();
    }
  }

  /**
   * Skip to the next section boundary
   */
  skipToNextSection(tokenStream: TokenStream): void {
    while (!tokenStream.isAtEnd()) {
      const token = tokenStream.peek();
      if (!token) break;

      if (this.isSectionStartToken(token.tokenType)) {
        break;
      }

      tokenStream.advance();
    }
  }
}