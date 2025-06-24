/**
 * Operator pattern terminals for TextMate grammars
 * Common operator patterns across programming languages
 */

/**
 * Operator patterns for different operator types
 */
export const OP = {
  /** Assignment operators */
  ANY_ASSIGNMENT: /=|\+=|-=|\*=|\/=|%=/,
  
  /** Comparison operators */
  ANY_COMPARISON: /==|!=|<=|>=|<|>/,
  
  /** Logical operators */
  ANY_LOGICAL: /&&|\|\||!/,
  
  /** Arithmetic operators */
  ARITHMETIC: /\+|-|\*|\/|%/,
  
  /** Arrow operator */
  ARROW: /->/,
  
  /** Fat arrow */
  FAT_ARROW: /=>/,
} as const;
