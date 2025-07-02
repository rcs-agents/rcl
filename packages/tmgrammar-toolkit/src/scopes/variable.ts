import { buildScopes } from './lib/internal.js';

/**
 * Raw variable scope definitions used for building the scope tree
 */
export const VARIABLE_SCOPE_DEFINITION = {
    /**
     * Represents the `variable.other` scope.
     * Generic variables.
     * Full path: `variable.other`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    other: {
      /**
       * Represents the `variable.other.readwrite` scope.
       * Mutable variables.
       * Full path: `variable.other.readwrite`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
       */
      readwrite: null,
      /**
       * Represents the `variable.other.constant` scope.
       * Immutable variables.
       * Full path: `variable.other.constant`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
       */
      constant: null,
      /**
       * Represents the `variable.other.member` scope.
       * Object properties/fields.
       * Full path: `variable.other.member`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
       */
      member: null,
    },

    /**
     * Represents the `variable.language` scope.
     * Language-reserved variables (`this`, `self`, `super`).
     * Full path: `variable.language`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    language: null,

    /**
     * Represents the `variable.parameter` scope.
     * Function parameters.
     * Full path: `variable.parameter`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    parameter: null,

    /**
     * Represents the `variable.function` scope.
     * Function names (when called, not defined).
     * Full path: `variable.function`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    function: null,

    /**
     * Represents the `variable.annotation` scope.
     * Annotation identifiers.
     * Full path: `variable.annotation`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#variable)
     */
    annotation: null,
  };

export const VARIABLE_SCOPE = buildScopes({ prefix: 'variable' }, VARIABLE_SCOPE_DEFINITION);

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
export type VariableScope = typeof VARIABLE_SCOPE; 