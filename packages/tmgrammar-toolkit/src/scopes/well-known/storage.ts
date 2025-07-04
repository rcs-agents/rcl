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
export const STORAGE_SCOPE = {
    /**
     * Represents the `storage.type` scope.
     * Type keywords (`int`, `bool`, `char`).
     * Full path: `storage.type`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    type: {
      /**
       * Represents the `storage.type.function` scope.
       * Function keywords (`def`, `function`) + `keyword.declaration.function`.
       * Full path: `storage.type.function`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      function: null,
      /**
       * Represents the `storage.type.class` scope.
       * Class keywords (`class`) + `keyword.declaration.class`.
       * Full path: `storage.type.class`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      class: null,
      /**
       * Represents the `storage.type.struct` scope.
       * Struct keywords + `keyword.declaration.struct`.
       * Full path: `storage.type.struct`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      struct: null,
      /**
       * Represents the `storage.type.enum` scope.
       * Enum keywords + `keyword.declaration.enum`.
       * Full path: `storage.type.enum`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      enum: null,
      /**
       * Represents the `storage.type.union` scope.
       * Union keywords + `keyword.declaration.union`.
       * Full path: `storage.type.union`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      union: null,
      /**
       * Represents the `storage.type.trait` scope.
       * Trait keywords + `keyword.declaration.trait`.
       * Full path: `storage.type.trait`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      trait: null,
      /**
       * Represents the `storage.type.interface` scope.
       * Interface keywords + `keyword.declaration.interface`.
       * Full path: `storage.type.interface`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      interface: null,
      /**
       * Represents the `storage.type.impl` scope.
       * Implementation keywords + `keyword.declaration.impl`.
       * Full path: `storage.type.impl`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      impl: null,
      /**
       * Represents the `storage.type.type` scope.
       * Type keywords (`int`, `bool`, `char`).
       * Full path: `storage.type.type`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      type: null,
      /**
       * Represents the `storage.type.annotation` scope.
       * Annotation keywords + `keyword.declaration.annotation`.
       * Full path: `storage.type.annotation`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      annotation: null,
      /**
       * Represents the `storage.type.primitive` scope.
       * Primitive keywords + `keyword.declaration.primitive`.
       * Full path: `storage.type.primitive`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
       */
      primitive: null,
    },

    /**
     * Represents the `storage.modifier` scope.
     * Storage modifiers (`static`, `const`, `public`, `private`).
     * Full path: `storage.modifier`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#storage)
     */
    modifier: null,
  };