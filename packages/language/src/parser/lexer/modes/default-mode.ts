/**
 * Default Lexing Mode
 * 
 * Handles standard RCL tokenization in the default context.
 */

import type { TokenType } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';

export class DefaultMode {
  /**
   * Get tokens for default mode processing
   */
  getTokens(): TokenType[] {
    return RclTokens.getAllTokens();
  }
}