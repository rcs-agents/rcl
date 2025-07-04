/**
 * Root scope for `support`.
 * Elements provided by frameworks, libraries, and language runtimes (as opposed to user-defined elements).
 * Many syntaxes also apply these to unrecognized user constructs, effectively scoping all user-defined elements.
 * Full path: `support`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
 * 
 * @example
 * ```typescript
 * scopes.support.function // "support.function"
 * scopes.support.class("js") // "support.class.js"
 * scopes.support.constant // "support.constant"
 * ```
 */
export const SUPPORT_SCOPE = {
    /**
     * Represents the `support.function` scope.
     * Library functions (`console.log`, `NSLog`).
     * Full path: `support.function`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    function: {
      /**
       * Represents the `support.function.builtin` scope.
       * Built-in functions provided by the language.
       * Full path: `support.function.builtin`
       */
      builtin: null,
    },

    /**
     * Represents the `support.class` scope.
     * Library classes.
     * Full path: `support.class`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    class: null,

    /**
     * Represents the `support.type` scope.
     * Library types.
     * Full path: `support.type`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    type: null,

    /**
     * Represents the `support.constant` scope.
     * Library constants.
     * Full path: `support.constant`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    constant: null,

    /**
     * Represents the `support.variable` scope.
     * Library variables.
     * Full path: `support.variable`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    variable: null,

    /**
     * Represents the `support.module` scope.
     * Library modules.
     * Full path: `support.module`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
     */
    module: null,
  };