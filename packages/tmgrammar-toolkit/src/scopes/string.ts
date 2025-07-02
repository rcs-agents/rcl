import { buildScopes } from './lib/internal.js';

/**
 * Raw string scope definitions used for building the scope tree
 */
export const STRING_SCOPE_DEFINITION = {
    /**
     * Represents the `string.quoted` scope.
     * Quoted strings with various quote styles.
     * Full path: `string.quoted`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    quoted: {
      /**
       * Represents the `string.quoted.single` scope.
       * Single-quoted strings.
       * Full path: `string.quoted.single`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
       */
      single: null,
      /**
       * Represents the `string.quoted.double` scope.
       * Double-quoted strings.
       * Full path: `string.quoted.double`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
       */
      double: null,
      /**
       * Represents the `string.quoted.triple` scope.
       * Triple-quoted strings.
       * Full path: `string.quoted.triple`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
       */
      triple: null,
      /**
       * Represents the `string.quoted.other` scope.
       * Other quoting styles.
       * Full path: `string.quoted.other`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
       */
      other: null,
    },

    /**
     * Represents the `string.unquoted` scope.
     * Unquoted strings (`shell`, `batch`).
     * Full path: `string.unquoted`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    unquoted: null,

    /**
     * Represents the `string.regexp` scope.
     * Regular expression literals.
     * Full path: `string.regexp`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    regexp: null,
  };

export const STRING_SCOPE = buildScopes({ prefix: 'string' }, STRING_SCOPE_DEFINITION);

/**
 * Root scope for `string`.
 * String literals and related constructs. Use `meta.string` for entire strings including punctuation.
 * Full path: `string`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
 * 
 * @example
 * ```typescript
 * scopes.string.quoted.single // "string.quoted.single"
 * scopes.string.quoted.double("js") // "string.quoted.double.js"
 * scopes.string.regexp // "string.regexp"
 * ```
 */
export type StringScope = typeof STRING_SCOPE; 