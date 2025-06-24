import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

/**
 * Root scope for `variable`.
 * Variable names and identifiers representing mutable data.
 * Apply `punctuation.definition.variable` to variable prefixes like `$` in PHP.
 * Full path: `variable`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
 * 
 * @example
 * ```typescript
 * scopes.variable.other.readwrite // "variable.other.readwrite"
 * scopes.variable.language("js") // "variable.language.js"
 * scopes.variable.parameter // "variable.parameter"
 * ```
 */
export type VariableScope = ScopeTree<'variable', {
  /**
   * Represents the `variable.other` scope.
   * Generic variables.
   * Full path: `variable.other`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
   */
  other: ScopeTree<'other', {
    /**
     * Represents the `variable.other.readwrite` scope.
     * Mutable variables.
     * Full path: `variable.other.readwrite`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    readwrite: Scope<'readwrite'>;
    /**
     * Represents the `variable.other.constant` scope.
     * Immutable variables.
     * Full path: `variable.other.constant`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    constant: Scope<'constant'>;
    /**
     * Represents the `variable.other.member` scope.
     * Object properties/fields.
     * Full path: `variable.other.member`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    member: Scope<'member'>;
  }>;

  /**
   * Represents the `variable.language` scope.
   * Language-reserved variables (`this`, `self`, `super`).
   * Full path: `variable.language`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
   */
  language: Scope<'language'>;

  /**
   * Represents the `variable.parameter` scope.
   * Function parameters.
   * Full path: `variable.parameter`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
   */
  parameter: Scope<'parameter'>;

  /**
   * Represents the `variable.function` scope.
   * Function names (when called, not defined).
   * Full path: `variable.function`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
   */
  function: Scope<'function'>;

  /**
   * Represents the `variable.annotation` scope.
   * Annotation identifiers.
   * Full path: `variable.annotation`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
   */
  annotation: Scope<'annotation'>;
}>;

export const VARIABLE_SCOPE: VariableScope = buildScopes<VariableScope>([
  ['other', [
    ['readwrite', []],
    ['constant', []],
    ['member', []],
  ]],
  ['language', []],
  ['parameter', []],
  ['function', []],
  ['annotation', []],
], 'variable'); 