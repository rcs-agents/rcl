/**
 * Root scope for `invalid`.
 * Invalid or deprecated code. Use sparingly to avoid unpleasant highlighting.
 * Full path: `invalid`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#invalid)
 * 
 * @example
 * ```typescript
 * scopes.invalid.illegal // "invalid.illegal"
 * scopes.invalid.deprecated("js") // "invalid.deprecated.js"
 * ```
 */
export const INVALID_SCOPE = {
    /**
     * Represents the `invalid.illegal` scope.
     * Syntax errors, illegal characters.
     * Full path: `invalid.illegal`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#invalid)
     */
    illegal: null,
    /**
     * Represents the `invalid.deprecated` scope.
     * Deprecated features (use very rarely).
     * Full path: `invalid.deprecated`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#invalid)
     */
    deprecated: null,
  };