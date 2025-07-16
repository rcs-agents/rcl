import type { MatchRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopes } from '../scopes.js';

/**
 * String literals with double quotes
 * Examples: "Hello world", "BMW Customer Service"
 */
export const stringLiteral: MatchRule = {
	key: 'string-literal',
	match: R.STRING,
	scope: scopes.literals.string.quoted
};

/**
 * Numeric literals (integers and floats)
 * Examples: 42, 3.14, 1.23e5
 */
export const numberLiteral: MatchRule = {
	key: 'number-literal',
	match: R.NUMBER,
	scope: scopes.literals.number
};

/**
 * ISO duration literals
 * Examples: P1Y2M3DT4H5M6S, 3600s, 2.5s
 */
export const durationLiteral: MatchRule = {
	key: 'duration-literal',
	match: R.ISO_DURATION_LITERAL,
	scope: scopes.literals.duration
};

/**
 * Atom literals (symbols)
 * Examples: :start, :transactional, :promotional
 */
export const atomLiteral: MatchRule = {
	key: 'atom-literal',
	match: R.ATOM,
	scope: scopes.literals.atom
};

/**
 * Boolean true literals
 * Examples: True, Yes, On, Enabled, Active
 */
export const trueLiteral: MatchRule = {
	key: 'true-literal',
	scope: scopes.literals.boolean,
	match: R.TRUE_KW
};

/**
 * Boolean false literals
 * Examples: False, No, Off, Disabled, Inactive
 */
export const falseLiteral: MatchRule = {
	key: 'false-literal',
	scope: scopes.literals.boolean,
	match: R.FALSE_KW
};

/**
 * Null literals
 * Examples: Null, None, Void, null
 */
export const nullLiteral: MatchRule = {
	key: 'null-literal',
	match: R.NULL_KW,
	scope: scopes.literals.null
};

/**
 * Combined boolean literal for backward compatibility
 */
export const booleanLiteral: MatchRule = {
	key: 'boolean-literal',
	match: /\b(True|Yes|On|Enabled|Active|False|No|Off|Disabled|Inactive)\b/,
	scope: scopes.literals.boolean
};

export const allLiterals = [
	durationLiteral, // Check duration before number to avoid conflicts
	stringLiteral,
	numberLiteral,
	atomLiteral,
	trueLiteral,
	falseLiteral,
	nullLiteral,
	booleanLiteral,
]; 