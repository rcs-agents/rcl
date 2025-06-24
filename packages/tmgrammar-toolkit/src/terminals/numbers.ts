/**
 * Number pattern terminals for TextMate grammars
 * Common regex patterns for various number formats
 */

/**
 * Number patterns for different numeric formats
 */
export const NUM = {
  /** Decimal numbers with optional scientific notation */
  DEC: /(?<!\$)(?:(?:\b[0-9][0-9_]*(\.[0-9][0-9_]*)?|\b\.[0-9][0-9_]*)([eE][+-]?[0-9][0-9_]*)?(n)?|\b[0-9][0-9_]*n)\b(?!\$)/,
  
  /** Hexadecimal numbers */
  HEX: /\b(?<!\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\b(?!\$)/,
  
  /** Binary numbers */
  BIN: /\b(?<!\$)0(?:b|B)[01][01_]*(n)?\b(?!\$)/,
  
  /** Octal numbers */
  OCT: /\b(?<!\$)0(?:o|O)?[0-7][0-7_]*(n)?\b(?!\$)/,
  
  /** Simple integer */
  INT: /\b-?\d+\b(?!\.)/,
  
  /** Simple float */
  FLOAT: /\b-?\d+\.\d+([eE][+-]?\d+)?\b/,
} as const;