import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

/**
 * Root scope for `storage`.
 * Keywords affecting how variables, functions, or data structures are stored or accessed.
 * Full path: `storage`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
 * 
 * @example
 * ```typescript
 * scopes.storage.type.function // "storage.type.function"
 * scopes.storage.modifier("js") // "storage.modifier.js"
 * scopes.storage.type.class // "storage.type.class"
 * ```
 */
export type StorageScope = ScopeTree<'storage', {
  /**
   * Represents the `storage.type` scope.
   * Type keywords (`int`, `bool`, `char`).
   * Full path: `storage.type`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
   */
  type: ScopeTree<'type', {
    /**
     * Represents the `storage.type.function` scope.
     * Function keywords (`def`, `function`) + `keyword.declaration.function`.
     * Full path: `storage.type.function`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    function: Scope<'function'>;
    /**
     * Represents the `storage.type.class` scope.
     * Class keywords (`class`) + `keyword.declaration.class`.
     * Full path: `storage.type.class`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    class: Scope<'class'>;
    /**
     * Represents the `storage.type.struct` scope.
     * Struct keywords + `keyword.declaration.struct`.
     * Full path: `storage.type.struct`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    struct: Scope<'struct'>;
    /**
     * Represents the `storage.type.enum` scope.
     * Enum keywords + `keyword.declaration.enum`.
     * Full path: `storage.type.enum`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    enum: Scope<'enum'>;
    /**
     * Represents the `storage.type.union` scope.
     * Union keywords + `keyword.declaration.union`.
     * Full path: `storage.type.union`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    union: Scope<'union'>;
    /**
     * Represents the `storage.type.trait` scope.
     * Trait keywords + `keyword.declaration.trait`.
     * Full path: `storage.type.trait`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    trait: Scope<'trait'>;
    /**
     * Represents the `storage.type.interface` scope.
     * Interface keywords + `keyword.declaration.interface`.
     * Full path: `storage.type.interface`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    interface: Scope<'interface'>;
    /**
     * Represents the `storage.type.impl` scope.
     * Implementation keywords + `keyword.declaration.impl`.
     * Full path: `storage.type.impl`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    impl: Scope<'impl'>;
    /**
     * Represents the `storage.type.type` scope.
     * Type keywords (`int`, `bool`, `char`).
     * Full path: `storage.type.type`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    type: Scope<'type'>;
    /**
     * Represents the `storage.type.annotation` scope.
     * Annotation keywords + `keyword.declaration.annotation`.
     * Full path: `storage.type.annotation`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    annotation: Scope<'annotation'>;
    /**
     * Represents the `storage.type.primitive` scope.
     * Primitive keywords + `keyword.declaration.primitive`.
     * Full path: `storage.type.primitive`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    primitive: Scope<'primitive'>;
  }>;

  /**
   * Represents the `storage.modifier` scope.
   * Storage modifiers (`static`, `const`, `public`, `private`).
   * Full path: `storage.modifier`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
   */
  modifier: Scope<'modifier'>;
}>;

export const STORAGE_SCOPE: StorageScope = buildScopes<StorageScope>([
  ['type', [
    ['function', []],
    ['class', []],
    ['struct', []],
    ['enum', []],
    ['union', []],
    ['trait', []],
    ['interface', []],
    ['impl', []],
    ['type', []],
    ['annotation', []],
    ['primitive', []],
  ]],
  ['modifier', []],
], 'storage'); 