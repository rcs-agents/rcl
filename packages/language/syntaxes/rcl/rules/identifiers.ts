import type { MatchRule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const properNoun: MatchRule = {
	key: 'proper-noun',
	scope: scopes.entity.name.class,
	match: R.PROPER_NOUN,
};

export const commonNoun: MatchRule = {
	key: 'common-noun',
	scope: scopes.variable.other,
	match: R.COMMON_NOUN,
};

export const allIdentifiers = [properNoun, commonNoun]; 