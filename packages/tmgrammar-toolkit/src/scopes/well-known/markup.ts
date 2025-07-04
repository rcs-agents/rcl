/**
 * Root scope for `markup`.
 * Content markup in documentation and markup languages. Use for content formatting, not code syntax.
 * Full path: `markup`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
 * 
 * @example
 * ```typescript
 * scopes.markup.heading // "markup.heading"
 * scopes.markup.list.unnumbered("md") // "markup.list.unnumbered.md"
 * scopes.markup.raw.block // "markup.raw.block"
 * ```
 */
export const MARKUP_SCOPE = {
    /**
     * Represents the `markup.heading` scope.
     * Section headings.
     * Full path: `markup.heading`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    heading: null,
    /**
     * Represents the `markup.list` scope.
     * Lists and list items.
     * Full path: `markup.list`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    list: {
      /**
       * Represents the `markup.list.unnumbered` scope.
       * Bullet lists.
       * Full path: `markup.list.unnumbered`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
       */
      unnumbered: null,
      /**
       * Represents the `markup.list.numbered` scope.
       * Numbered lists.
       * Full path: `markup.list.numbered`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
       */
      numbered: null,
    },
    /**
     * Represents the `markup.bold` scope.
     * Bold text.
     * Full path: `markup.bold`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    bold: null,
    /**
     * Represents the `markup.italic` scope.
     * Italic text.
     * Full path: `markup.italic`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    italic: null,
    /**
     * Represents the `markup.underline` scope.
     * Underlined text.
     * Full path: `markup.underline`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    underline: {
      /**
       * Represents the `markup.underline.link` scope.
       * Links (inherits underline styling).
       * Full path: `markup.underline.link`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
       */
      link: null,
    },
    /**
     * Represents the `markup.inserted` scope.
     * Inserted content (diff).
     * Full path: `markup.inserted`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    inserted: null,
    /**
     * Represents the `markup.deleted` scope.
     * Deleted content (diff).
     * Full path: `markup.deleted`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    deleted: null,
    /**
     * Represents the `markup.quote` scope.
     * Blockquotes.
     * Full path: `markup.quote`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    quote: null,
    /**
     * Represents the `markup.raw` scope.
     * Raw code content.
     * Full path: `markup.raw`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    raw: {
      /**
       * Represents the `markup.raw.inline` scope.
       * Inline code.
       * Full path: `markup.raw.inline`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
       */
      inline: null,
      /**
       * Represents the `markup.raw.block` scope.
       * Code blocks (disables spell checking).
       * Full path: `markup.raw.block`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
       */
      block: null,
    },
    /**
     * Represents the `markup.other` scope.
     * Other markup constructs.
     * Full path: `markup.other`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#markup)
     */
    other: null,
  };
