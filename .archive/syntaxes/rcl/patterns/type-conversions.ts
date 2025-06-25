/**
 * RCL type conversion patterns (as :type, value|type)
 */
import { type BeginEndRule, type MatchRule, type Rule, scopesFor } from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

type Repository = Record<string, Rule>;

// Regexes for operands
const ATOM = ':[a-zA-Z_][\\w_]*';
const PROPER_WORD = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const PROPER_NOUN = `${PROPER_WORD}(?:\\s+${PROPER_WORD})*`;
const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';
const STRING_DOUBLE_QUOTED = '"(?:\\\\.|[^"\\\\\\\\])*"';
const FLOW_OPERAND_REGEX = `(?:${ATOM}|${PROPER_NOUN}|${COMMON_NOUN}|${STRING_DOUBLE_QUOTED})`;

const TYPE_TAG_KEYWORDS = ['date', 'datetime', 'time', 'email', 'phone', 'msisdn', 'url', 'zipcode', 'zip'].join('|');

const typeConversionAs: MatchRule = {
	key: 'type_conversion_as',
	scope: 'meta.type_conversion.rcl',
	match: new RegExp(`(${FLOW_OPERAND_REGEX})\\s+(as)\\s+(${ATOM})`),
	captures: {
		'1': { scope: 'variable.other.value.rcl' },
		'2': { scope: 'keyword.operator.type_conversion.rcl' },
		'3': { scope: 'storage.type.atom.rcl' },
	},
};

const typeConversionPipe: MatchRule = {
	key: 'type_conversion_pipe',
	scope: 'meta.type_conversion.rcl',
	match: new RegExp(`(${FLOW_OPERAND_REGEX})\\s*\\|\\s*(${ATOM})`),
	captures: {
		'1': { scope: 'variable.other.value.rcl' },
		'2': { scope: 'storage.type.atom.rcl' },
	},
};

const typeTag: BeginEndRule = {
	key: 'type_tag',
	scope: 'meta.type_tag.rcl',
	begin: new RegExp(`(${TYPE_TAG_KEYWORDS})\\s*\\(`),
	beginCaptures: {
		'1': { scope: 'storage.type.tag.rcl' },
	},
	end: /\)/,
	patterns: [{ include: '#primitives' }, { include: '#string' }],
};

export const typeConversionsRepository: Repository = {
	type_conversion_as: typeConversionAs,
	type_conversion_pipe: typeConversionPipe,
	type_tag: typeTag,
}; 