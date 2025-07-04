/**
 * Root scope for `punctuation`.
 * Structural and syntactic punctuation. Use specific subtypes for precise editor behavior.
 * Full path: `punctuation`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
 * 
 * @example
 * ```typescript
 * scopes.punctuation.separator // "punctuation.separator"
 * scopes.punctuation.definition.string.begin("js") // "punctuation.definition.string.begin.js"
 * scopes.punctuation.section.block.begin // "punctuation.section.block.begin"
 * ```
 */
export const PUNCTUATION_SCOPE = {
    /**
     * Represents the `punctuation.separator` scope.
     * Commas, colons.
     * Full path: `punctuation.separator`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
     */
    separator: {
      /**
       * Represents the `punctuation.separator.continuation` scope.
       * Line continuation characters.
       * Full path: `punctuation.separator.continuation`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      continuation: null,
      /**
       * Represents the `punctuation.separator.comma` scope.
       * Comma separators.
       * Full path: `punctuation.separator.comma`
       */
      comma: null,
    },
    /**
     * Represents the `punctuation.terminator` scope.
     * Semicolons, statement terminators.
     * Full path: `punctuation.terminator`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
     */
    terminator: null,
    /**
     * Represents the `punctuation.accessor` scope.
     * Member access (`.`, `->`, `::`).
     * Full path: `punctuation.accessor`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
     */
    accessor: null,
    /**
     * Represents the `punctuation.definition` scope.
     * Punctuation that defines other scopes.
     * Full path: `punctuation.definition`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
     */
    definition: {
      /**
       * Represents the `punctuation.definition.comment` scope.
       * Comment delimiters.
       * Full path: `punctuation.definition.comment`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      comment: null,
      /**
       * Represents the `punctuation.definition.string` scope.
       * String quote punctuation.
       * Full path: `punctuation.definition.string`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      string: {
        /**
         * Represents the `punctuation.definition.string.begin` scope.
         * String opening quotes.
         * Full path: `punctuation.definition.string.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.definition.string.end` scope.
         * String closing quotes.
         * Full path: `punctuation.definition.string.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.definition.keyword` scope.
       * Keyword punctuation.
       * Full path: `punctuation.definition.keyword`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      keyword: null,
      /**
       * Represents the `punctuation.definition.variable` scope.
       * Variable symbols (`$` in PHP).
       * Full path: `punctuation.definition.variable`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      variable: null,
      /**
       * Represents the `punctuation.definition.annotation` scope.
       * Annotation symbols.
       * Full path: `punctuation.definition.annotation`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      annotation: null,
      /**
       * Represents the `punctuation.definition.generic` scope.
       * Generic type punctuation.
       * Full path: `punctuation.definition.generic`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      generic: {
        /**
         * Represents the `punctuation.definition.generic.begin` scope.
         * Generic opening delimiters `<`.
         * Full path: `punctuation.definition.generic.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.definition.generic.end` scope.
         * Generic closing delimiters `>`.
         * Full path: `punctuation.definition.generic.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.definition.template-string` scope.
       * Template string delimiters (backticks).
       * Full path: `punctuation.definition.template-string`
       */
      'template-string': {
        /**
         * Represents the `punctuation.definition.template-string.begin` scope.
         * Template string opening delimiters `` ` ``.
         * Full path: `punctuation.definition.template-string.begin`
         */
        begin: null,
        /**
         * Represents the `punctuation.definition.template-string.end` scope.
         * Template string closing delimiters `` ` ``.
         * Full path: `punctuation.definition.template-string.end`
         */
        end: null,
      },
      /**
       * Represents the `punctuation.definition.template-expression` scope.
       * Template expression delimiters.
       * Full path: `punctuation.definition.template-expression`
       */
      'template-expression': {
        /**
         * Represents the `punctuation.definition.template-expression.begin` scope.
         * Template expression opening delimiters `${`.
         * Full path: `punctuation.definition.template-expression.begin`
         */
        begin: null,
        /**
         * Represents the `punctuation.definition.template-expression.end` scope.
         * Template expression closing delimiters `}`.
         * Full path: `punctuation.definition.template-expression.end`
         */
        end: null,
      },
    },
    /**
     * Represents the `punctuation.section` scope.
     * Section delimiters.
     * Full path: `punctuation.section`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
     */
    section: {
      /**
       * Represents the `punctuation.section.block` scope.
       * Block delimiters `{}`.
       * Full path: `punctuation.section.block`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      block: {
        /**
         * Represents the `punctuation.section.block.begin` scope.
         * Block opening delimiters `{`.
         * Full path: `punctuation.section.block.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.block.end` scope.
         * Block closing delimiters `}`.
         * Full path: `punctuation.section.block.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.section.group` scope.
       * Group delimiters `()`.
       * Full path: `punctuation.section.group`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      group: {
        /**
         * Represents the `punctuation.section.group.begin` scope.
         * Group opening delimiters `(`.
         * Full path: `punctuation.section.group.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.group.end` scope.
         * Group closing delimiters `)`.
         * Full path: `punctuation.section.group.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.section.parens` scope.
       * Alternative for parentheses.
       * Full path: `punctuation.section.parens`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      parens: {
        /**
         * Represents the `punctuation.section.parens.begin` scope.
         * Parentheses opening delimiters.
         * Full path: `punctuation.section.parens.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.parens.end` scope.
         * Parentheses closing delimiters.
         * Full path: `punctuation.section.parens.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.section.brackets` scope.
       * Bracket delimiters `[]`.
       * Full path: `punctuation.section.brackets`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      brackets: {
        /**
         * Represents the `punctuation.section.brackets.begin` scope.
         * Bracket opening delimiters `[`.
         * Full path: `punctuation.section.brackets.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.brackets.end` scope.
         * Bracket closing delimiters `]`.
         * Full path: `punctuation.section.brackets.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.section.braces` scope.
       * Alternative for curly braces.
       * Full path: `punctuation.section.braces`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      braces: {
        /**
         * Represents the `punctuation.section.braces.begin` scope.
         * Braces opening delimiters.
         * Full path: `punctuation.section.braces.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.braces.end` scope.
         * Braces closing delimiters.
         * Full path: `punctuation.section.braces.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
      /**
       * Represents the `punctuation.section.interpolation` scope.
       * Interpolation delimiters.
       * Full path: `punctuation.section.interpolation`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
       */
      interpolation: {
        /**
         * Represents the `punctuation.section.interpolation.begin` scope.
         * Interpolation opening delimiters.
         * Full path: `punctuation.section.interpolation.begin`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        begin: null,
        /**
         * Represents the `punctuation.section.interpolation.end` scope.
         * Interpolation closing delimiters.
         * Full path: `punctuation.section.interpolation.end`
         * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#punctuation)
         */
        end: null,
      },
    },
  };