/**
 * Identifier pattern terminals for TextMate grammars
 * Common patterns for various identifier naming conventions
 */

/** Standard programming identifier */
export const ID = /[a-zA-Z_][a-zA-Z0-9_]*/;

/** Camel case identifier */
export const CAMEL_CASE_ID = /[a-z][a-zA-Z0-9]*/;

/** Pascal case identifier */
export const PASCAL_CASE_ID = /[A-Z][a-zA-Z0-9]*/;

/** Snake case identifier */
export const SNAKE_CASE_ID = /[a-z][a-z0-9_]*/;

/** Constant identifier (all caps) */
export const CONSTANT_ID = /[A-Z][A-Z0-9_]*/;

/** Kebab case identifier */
export const KEBAB_CASE_ID = /[a-z][a-z0-9-]*/; 