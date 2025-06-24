import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

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
export type InvalidScope = ScopeTree<'invalid', {
  /**
   * Represents the `invalid.illegal` scope.
   * Syntax errors, illegal characters.
   * Full path: `invalid.illegal`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#invalid)
   */
  illegal: Scope<'illegal'>;
  /**
   * Represents the `invalid.deprecated` scope.
   * Deprecated features (use very rarely).
   * Full path: `invalid.deprecated`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#invalid)
   */
  deprecated: Scope<'deprecated'>;
}>;

export const INVALID_SCOPE: InvalidScope = buildScopes<InvalidScope>([
  ['illegal', []],
  ['deprecated', []],
], 'invalid'); 