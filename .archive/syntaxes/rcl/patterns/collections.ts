/**
 * RCL collection patterns (arrays, objects, maps)
 */

type Repository = any;

const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';
const STRING_DOUBLE_QUOTED = '"(?:\\.|[^"\\\\])*"';
const ATOM = ':[a-zA-Z_][\\w_]*';
const PROPER_WORD = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const PROPER_NOUN = `${PROPER_WORD}(?:\\s+${PROPER_WORD})*`;
const FLOW_OPERAND_REGEX = `(?:${ATOM}|${PROPER_NOUN}|${COMMON_NOUN}|${STRING_DOUBLE_QUOTED})`;

const arrayElements: any = {
	key: 'array_elements',
	patterns: [{ include: '#primitives' }, { include: '#expressions' }, { include: '#collections' }],
};

const array: any = {
	key: 'array',
	scope: 'meta.structure.array.rcl',
	begin: /\[/,
	beginCaptures: {
		'0': { scope: 'punctuation.section.brackets.begin.rcl' },
	},
	end: /\]/,
	endCaptures: {
		'0': { scope: 'punctuation.section.brackets.end.rcl' },
	},
	patterns: [
		{ include: '#comments' },
		{ include: '#array_elements' },
		{
			key: 'array_separator',
			scope: 'punctuation.separator.comma.rcl',
			match: /,/,
		},
	],
};

const objectMember: any = {
	key: 'object_member',
	scope: 'meta.object.member.rcl',
	begin: new RegExp(`(?:${COMMON_NOUN}|${STRING_DOUBLE_QUOTED})\\s*(?=:)`),
	beginCaptures: {
		'0': { scope: 'entity.name.tag.rcl' },
	},
	end: /(?=,|\}|_$)/,
	patterns: [
		{
			key: 'object_separator',
			scope: 'punctuation.separator.rcl',
			match: /:/,
		},
		{ include: '#primitives' },
		{ include: '#expressions' },
		{ include: '#collections' },
	],
};

const objectMembers: any = {
	key: 'object_members',
	patterns: [objectMember],
};

const object: any = {
	key: 'object',
	scope: 'meta.structure.object.rcl',
	begin: /\{/,
	beginCaptures: {
		'0': { scope: 'punctuation.section.braces.begin.rcl' },
	},
	end: /\}/,
	endCaptures: {
		'0': { scope: 'punctuation.section.braces.end.rcl' },
	},
	patterns: [
		{ include: '#comments' },
		{ include: '#object_members' },
		{
			key: 'object_comma_separator',
			scope: 'punctuation.separator.comma.rcl',
			match: /,/,
		},
	],
};

const mapEntry: any = {
	key: 'map_entry',
	scope: 'meta.map.entry.rcl',
	match: new RegExp(`(${FLOW_OPERAND_REGEX})\\s*(->)\\s*(${FLOW_OPERAND_REGEX})`),
	captures: {
		'1': { scope: 'entity.name.tag.rcl' },
		'2': { scope: 'keyword.operator.arrow.rcl' },
		'3': { scope: 'meta.map.value.rcl' },
	},
};

const mapEntries: any = {
	key: 'map_entries',
	patterns: [mapEntry],
};

const map: any = {
	key: 'map',
	scope: 'meta.structure.map.rcl',
	begin: /\bMap\s*\(/,
	beginCaptures: {
		'0': { scope: 'entity.name.function.rcl' },
	},
	end: /\)/,
	endCaptures: {
		'0': { scope: 'punctuation.section.parens.end.rcl' },
	},
	patterns: [
		{ include: '#comments' },
		{ include: '#map_entries' },
		{
			key: 'map_separator',
			scope: 'punctuation.separator.comma.rcl',
			match: /,/,
		},
	],
};

export const collectionsRepository: Repository = {
	array,
	array_elements: arrayElements,
	object,
	object_members: objectMembers,
	map,
	map_entries: mapEntries,
}; 