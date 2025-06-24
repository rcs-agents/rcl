/**
 * Comment pattern terminals for TextMate grammars  
 * Common comment delimiter patterns across languages
 */

/**
 * Comment delimiter patterns
 */
export const COMMENT = {  
  /** Double slash comment */
  SLASHES: /\/\//,
  
  /** Block comment start */
  BLOCK: {
    START: /\/\*/,
    END: /\*\//,
  },
} as const;
