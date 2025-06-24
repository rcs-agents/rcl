import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

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
export type SupportScope = ScopeTree<'support', {
  /**
   * Represents the `support.function` scope.
   * Library functions (`console.log`, `NSLog`).
   * Full path: `support.function`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  function: ScopeTree<'function', {
    /**
     * Represents the `support.function.builtin` scope.
     * Built-in functions provided by the language.
     * Full path: `support.function.builtin`
     */
    builtin: Scope<'builtin'>;
  }>;

  /**
   * Represents the `support.class` scope.
   * Library classes.
   * Full path: `support.class`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  class: Scope<'class'>;

  /**
   * Represents the `support.type` scope.
   * Library types.
   * Full path: `support.type`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  type: Scope<'type'>;

  /**
   * Represents the `support.constant` scope.
   * Library constants.
   * Full path: `support.constant`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  constant: Scope<'constant'>;

  /**
   * Represents the `support.module` scope.
   * Library modules.
   * Full path: `support.module`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  module: Scope<'module'>;

  /**
   * Represents the `support.variable` scope.
   * Library variables.
   * Full path: `support.variable`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#support)
   */
  variable: Scope<'variable'>;
}>;

export const SUPPORT_SCOPE: SupportScope = buildScopes<SupportScope>([
  ['function', [
    ['builtin', []]
  ]],
  ['class', []],
  ['type', []],
  ['constant', []],
  ['variable', []],
  ['module', []],
], 'support'); 