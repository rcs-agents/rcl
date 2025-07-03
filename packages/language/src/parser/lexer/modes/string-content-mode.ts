/**
 * String Content Mode
 * 
 * Handles tokenization of multi-line string content and embedded expression content.
 * Properly handles indented blocks and chomping markers.
 */

import type { TokenType } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';

export class StringContentMode {
  /**
   * Get tokens for string content mode
   */
  getTokens(): TokenType[] {
    // In string/expression content mode, we mainly work with synthetic tokens
    // but still need access to basic punctuation and structure
    return [
      // Content tokens
      RclTokens.STRING_CONTENT,
      RclTokens.MULTI_LINE_EXPRESSION_CONTENT,
      
      // Basic structure
      RclTokens.WS,
      RclTokens.NL,
      RclTokens.INDENT,
      RclTokens.DEDENT,
      
      // Basic punctuation (needed for embedded expressions)
      RclTokens.LBRACE,
      RclTokens.RBRACE,
      RclTokens.LPAREN,
      RclTokens.RPAREN,
      RclTokens.COMMA,
      RclTokens.DOT,
      RclTokens.COLON,
      
      // Literals that might appear in content
      RclTokens.STRING,
      RclTokens.NUMBER,
      RclTokens.IDENTIFIER
    ];
  }
}