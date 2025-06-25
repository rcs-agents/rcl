/**
 * RCL primitive type patterns (atoms, strings, numbers, booleans, null)
 */
import { type MatchRule, type BeginEndRule, type Rule, scopesFor } from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

type Repository = Record<string, Rule>;

const ATOM = ':[a-zA-Z_][\\w_]*';
const NUMBER = '[0-9]{1,3}(,[0-9]{3})*(\\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\\.[0-9]+)?([eE][-+]?[0-9]+)?';
const BOOLEAN_TRUE = ['True', 'On', 'Yes', 'Active', 'Enabled'].join('|');
const BOOLEAN_FALSE = ['False', 'Off', 'No', 'Inactive', 'Disabled'].join('|');
const NULL = 'Null';

const atom: MatchRule = {
	key: 'atom',
	scope: 'constant.other.atom.rcl',
	match: new RegExp(ATOM),
};

const number: MatchRule = {
	key: 'number',
	scope: scopes.constant.numeric,
	match: new RegExp(NUMBER),
};

const string: BeginEndRule = {
	key: 'string',
	scope: scopes.string.quoted.double,
	begin: /"/,
	beginCaptures: {
		'0': { scope: scopes.punctuation.definition.string.begin },
	},
	end: /"/,
	endCaptures: {
		'0': { scope: scopes.punctuation.definition.string.end },
	},
	patterns: [
		{
			key: 'string_escape',
			scope: scopes.constant.character.escape,
			match: /\\./,
		},
	],
};

const booleanTrue: MatchRule = {
	key: 'boolean_true',
	scope: 'constant.language.boolean.true.rcl',
	match: new RegExp(`\\b(${BOOLEAN_TRUE})\\b`),
};

const booleanFalse: MatchRule = {
	key: 'boolean_false',
	scope: 'constant.language.boolean.false.rcl',
	match: new RegExp(`\\b(${BOOLEAN_FALSE})\\b`),
};

const boolean: MatchRule = {
	key: 'boolean',
	scope: 'constant.language.boolean.rcl',
	match: new RegExp(`\\b(${BOOLEAN_TRUE}|${BOOLEAN_FALSE})\\b`),
};

const nullish: MatchRule = {
	key: 'null',
	scope: 'constant.language.null.rcl',
	match: new RegExp(`\\b(${NULL})\\b`),
};

export const primitivesRepository: Repository = {
	atom,
	number,
	string,
	boolean_true: booleanTrue,
	boolean_false: booleanFalse,
	boolean,
	null: nullish,
}; 