import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

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
export type CommentScope = ScopeTree<'comment', {
  line: ScopeTree<'line', {
    double_slash: Scope<'double-slash'>;
    double_dash: Scope<'double-dash'>;
    number_sign: Scope<'number-sign'>;
    percentage: Scope<'percentage'>;
  }>;
  block: ScopeTree<'block', {
    documentation: Scope<'documentation'>;
  }>;
}>;

export const COMMENT_SCOPE: CommentScope = buildScopes<CommentScope>([
  ['line', [
    ['double_slash', []],
    ['double_dash', []],
    ['number_sign', []],
    ['percentage', []],
  ]],
  ['block', [
    ['documentation', []],
  ]],
], 'comment');