import type { MatchRule } from 'tmgrammar-toolkit';
import { regex, scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const stringLiteral: MatchRule = {
	key: 'string-literal',
	scope: scopes.string.quoted.double,
	match: R.STRING,
};

export const numberLiteral: MatchRule = {
	key: 'number-literal',
	scope: scopes.constant.numeric,
	match: R.NUMBER,
};

export const booleanLiteral: MatchRule = {
	key: 'boolean-literal',
	scope: scopes.constant.language,
	match: regex.oneOf([R.TRUE_KW, R.FALSE_KW]),
};

export const nullLiteral: MatchRule = {
	key: 'null-literal',
	scope: scopes.constant.language,
	match: /Null/, // This is a simple keyword, no need for a regex file entry for now.
};

export const atomLiteral: MatchRule = {
	key: 'atom-literal',
	scope: scopes.constant.other('symbol'),
	match: R.ATOM,
};

export const allLiterals = [
	stringLiteral,
	numberLiteral,
	booleanLiteral,
	nullLiteral,
	atomLiteral,
]; 