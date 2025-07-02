import type { MatchRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopeGroups } from '../scopes.js';

/**
 * Hash-style comments (# comment)
 */
export const hashComment: MatchRule = {
  key: 'hash-comment',
  match: R.SL_COMMENT,
  scope: scopeGroups.comments.line
};

/**
 * All comment rules
 */
export const allComments = [hashComment]; 