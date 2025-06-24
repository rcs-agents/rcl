import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

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
export type StringScope = ScopeTree<'string', {
  /**
   * Represents the `string.quoted` scope.
   * Quoted strings with various quote styles.
   * Full path: `string.quoted`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
   */
  quoted: ScopeTree<'quoted', {
    /**
     * Represents the `string.quoted.single` scope.
     * Single-quoted strings.
     * Full path: `string.quoted.single`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    single: Scope<'single'>;
    /**
     * Represents the `string.quoted.double` scope.
     * Double-quoted strings.
     * Full path: `string.quoted.double`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    double: Scope<'double'>;
    /**
     * Represents the `string.quoted.triple` scope.
     * Triple-quoted strings.
     * Full path: `string.quoted.triple`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    triple: Scope<'triple'>;
    /**
     * Represents the `string.quoted.other` scope.
     * Other quoting styles.
     * Full path: `string.quoted.other`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
     */
    other: Scope<'other'>;
  }>;

  /**
   * Represents the `string.unquoted` scope.
   * Unquoted strings (`shell`, `batch`).
   * Full path: `string.unquoted`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
   */
  unquoted: Scope<'unquoted'>;

  /**
   * Represents the `string.regexp` scope.
   * Regular expression literals.
   * Full path: `string.regexp`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#string)
   */
  regexp: Scope<'regexp'>;
}>;

export const STRING_SCOPE: StringScope = buildScopes<StringScope>([
  ['quoted', [
    ['single', []],
    ['double', []],
    ['triple', []],
    ['other', []],
  ]],
  ['unquoted', []],
  ['regexp', []],
], 'string'); 