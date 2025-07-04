/**
 * Comment scopes with full type safety and hierarchical structure.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * scopes.comment.line.double_slash // "comment.line.double-slash"
 * scopes.comment.block.documentation("js") // "comment.block.documentation.js"
 * ```
 */
export const COMMENT_SCOPE = {
    /**
     * Represents the `comment.line` scope.
     * Line comment constructs.
     * Full path: `comment.line`
     */
    line: {
      /**
       * Used for // style comments.
       * Full path: `comment.line.double-slash`
       */
      double_slash: null,
      /**
       * Used for -- style comments.
       * Full path: `comment.line.double-dash`
       */
      double_dash: null,
      /**
       * Used for # style comments.
       * Full path: `comment.line.number-sign`
       */
      number_sign: null,
      /**
       * Used for % style comments.
       * Full path: `comment.line.percentage`
       */
      percentage: null,
    },
    /**
     * Use for the entire block comment construct.
     * Full path: `comment.block`
     */
    block: {
      /**
       * Used for actual documentation part of a comment block.
       * Full path: `comment.block.documentation`
       */
      documentation: null,
    },
  };

export default COMMENT_SCOPE;