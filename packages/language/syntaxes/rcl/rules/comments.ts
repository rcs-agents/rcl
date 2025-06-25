import type { MatchRule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const singleLineComment: MatchRule = {
	key: 'sl-comment',
	scope: scopes.comment.line.double_slash,
	match: R.SL_COMMENT,
};

export const allComments = [singleLineComment]; 