/**
 * String pattern terminals for TextMate grammars
 * Patterns for string delimiters and escape sequences
 */

/** Common escape sequences */
export const COMMON_ESCAPE = /\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]+\}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.|$)/;

/** Simple escape sequences */
export const SIMPLE_ESCAPE = /\\./;

/** Unicode escape sequences only */
export const UNICODE_ESCAPE = /\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\}/;

/** Hex escape sequences */
export const HEX_ESCAPE = /\\x[0-9A-Fa-f]{2}/;

/**
 * Quote patterns
 */
export const QUOTES = {
  ANY: /['"]/,
  ANY_TRIPLET: /'''|"""/,
} as const;