/**
 * Type Tag Mode
 * 
 * Handles tokenization inside type tag constructs like <email user@domain.com>
 * Prioritizes type tag names over general identifiers.
 */

import type { TokenType } from 'chevrotain';
import { RclTokens } from '../tokens/token-definitions.js';

export class TypeTagMode {
  /**
   * Get tokens for type tag mode with proper prioritization
   */
  getTokens(): TokenType[] {
    const allTokens = RclTokens.getAllTokens();
    const typeTagTokens = RclTokens.getTypeTagTokens();
    
    // Sort to prioritize type tag names over general identifiers
    return [...allTokens].sort((a, b) => {
      const aIsTypeTag = typeTagTokens.includes(a);
      const bIsTypeTag = typeTagTokens.includes(b);
      
      if (aIsTypeTag && !bIsTypeTag) return -1;
      if (!aIsTypeTag && bIsTypeTag) return 1;
      return 0;
    });
  }
}