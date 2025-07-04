/**
 * Root scope for `keyword`.
 * Defines scopes for reserved words and operators that have special meaning in a language.
 * Full path: `keyword`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
 * 
 * @example
 * ```typescript
 * scopes.keyword.control.conditional // "keyword.control.conditional"
 * scopes.keyword.operator.assignment("js") // "keyword.operator.assignment.js"
 * scopes.keyword.declaration.function // "keyword.declaration.function"
 * scopes.keyword.other("python") // "keyword.other.python"
 * ```
 */
export const KEYWORD_SCOPE = {
    /**
     * Represents the `keyword.control` scope.
     * Defines scopes for control flow keywords.
     * Full path: `keyword.control`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
     */
    control: {
      /**
       * Represents the `keyword.control.other` scope.
       * Defines the scope for other control flow keywords.
       * Full path: `keyword.control.other`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      other: null,
      /**
       * Represents the `keyword.control.flow` scope.
       * Defines the scope for flow control keywords.
       * Full path: `keyword.control.flow`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      flow: null,
      /**
       * Represents the `keyword.control.conditional` scope.
       * Defines the scope for conditional keywords (e.g., `if`, `else`).
       * Full path: `keyword.control.conditional`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      conditional: null,
      /**
       * Represents the `keyword.control.import` scope.
       * Defines the scope for import/include keywords.
       * Full path: `keyword.control.import`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      import: null,
    },

    /**
     * Represents the `keyword.operator` scope.
     * Defines the scope for language operators (e.g., assignment, arithmetic, logical).
     * Full path: `keyword.operator`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
     */
    operator: {
      /**
       * Represents the `keyword.operator.assignment` scope.
       * Defines the scope for assignment operators.
       * Full path: `keyword.operator.assignment`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      assignment: null,
      /**
       * Represents the `keyword.operator.arithmetic` scope.
       * Defines the scope for math operators.
       * Full path: `keyword.operator.arithmetic`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      arithmetic: null,
      /**
       * Represents the `keyword.operator.bitwise` scope.
       * Defines the scope for bitwise operators.
       * Full path: `keyword.operator.bitwise`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      bitwise: null,
      /**
       * Represents the `keyword.operator.logical` scope.
       * Defines the scope for logical operators.
       * Full path: `keyword.operator.logical`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      logical: null,
      /**
       * Represents the `keyword.operator.word` scope.
       * Defines the scope for word operators (e.g., `and`, `or`, `not`).
       * Full path: `keyword.operator.word`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      word: null,
    },

    /**
     * Represents the `keyword.declaration` scope.
     * Defines scopes for declaration keywords (see `storage` section for combined usage).
     * Full path: `keyword.declaration`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
     */
    declaration: {
      /**
       * Represents the `keyword.declaration.function` scope.
       * Defines the scope for function declaration keywords.
       * Full path: `keyword.declaration.function`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      function: null,
      /**
       * Represents the `keyword.declaration.class` scope.
       * Defines the scope for class declaration keywords.
       * Full path: `keyword.declaration.class`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      class: null,
      /**
       * Represents the `keyword.declaration.struct` scope.
       * Defines the scope for struct declaration keywords.
       * Full path: `keyword.declaration.struct`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      struct: null,
      /**
       * Represents the `keyword.declaration.enum` scope.
       * Defines the scope for enum declaration keywords.
       * Full path: `keyword.declaration.enum`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      enum: null,
      /**
       * Represents the `keyword.declaration.union` scope.
       * Defines the scope for union declaration keywords.
       * Full path: `keyword.declaration.union`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      union: null,
      /**
       * Represents the `keyword.declaration.trait` scope.
       * Defines the scope for trait declaration keywords.
       * Full path: `keyword.declaration.trait`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      trait: null,
      /**
       * Represents the `keyword.declaration.interface` scope.
       * Defines the scope for interface declaration keywords.
       * Full path: `keyword.declaration.interface`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      interface: null,
      /**
       * Represents the `keyword.declaration.impl` scope.
       * Defines the scope for implementation declaration keywords.
       * Full path: `keyword.declaration.impl`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      impl: null,
      /**
       * Represents the `keyword.declaration.type` scope.
       * Defines the scope for type declaration keywords.
       * Full path: `keyword.declaration.type`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
       */
      type: null,
    },

    /**
     * Represents the `keyword.other` scope.
     * Defines the scope for other keywords that don't fit into control, operator, or declaration categories.
     * Full path: `keyword.other`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
     */
    other: null,
  };