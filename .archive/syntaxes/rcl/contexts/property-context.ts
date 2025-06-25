/**
 * RCL Property-Level Context Patterns
 * Defines the structure of key: value assignments.
 */

type Repository = any;

const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';
const ALL_MULTILINE_MARKERS = ['\\|', '\\|-', '\\+', '\\+\\|'].join('|');
const ALL_SECTION_TYPES = ['Config', 'Defaults', 'Messages', 'Flow', 'agent', 'message', 'agentMessage'].join('|');

const singleLinePropertyValuePatterns: any[] = [
	{ include: '#type_conversion' },
	{ include: '#embedded_js_inline' },
	{ include: '#embedded_ts_inline' },
	{ include: '#collections' },
	{ include: '#expression' },
	{ include: '#primitives' },
	{ include: '#references' },
	{ include: '#keywords' },
];

const propertyAssignmentSingleLine: any = {
	key: 'property_assignment_singleline',
	scope: 'meta.property.assignment.rcl',
	begin: new RegExp(`(^\\s*)(${COMMON_NOUN})(\\s*:\\s*)(?!\\S)(?!${ALL_MULTILINE_MARKERS})`),
	beginCaptures: {
		'1': { scope: 'punctuation.whitespace.leading.rcl' },
		'2': { scope: 'variable.other.property.rcl' },
		'3': { scope: 'punctuation.separator.key-value.rcl' },
	},
	end: `(?=#)|(?=$)|(?=\\s*${COMMON_NOUN}\\s*:\\s*(?!\\S))|(?=\\s*(?:${ALL_SECTION_TYPES})\\b)`,
	patterns: [
		{
			key: 'comment_after_colon',
			scope: 'comment.line.number-sign.rcl',
			match: /^\s*(#.*)$/,
			captures: {
				'1': { scope: 'comment.line.content.rcl' },
			},
		},
		...singleLinePropertyValuePatterns,
	],
};

const propertyAssignmentMultiline: any = {
	key: 'property_assignment_multiline',
	scope: 'meta.property.assignment.rcl',
	begin: new RegExp(`(^\\s*)(${COMMON_NOUN})(\\s*:\\s*)(${ALL_MULTILINE_MARKERS})(\\s*(?:#.*)?)?$`),
	beginCaptures: {
		'1': { scope: 'punctuation.whitespace.leading.rcl' },
		'2': { scope: 'variable.other.property.rcl' },
		'3': { scope: 'punctuation.separator.key-value.rcl' },
		'4': { scope: 'punctuation.definition.string.begin.rcl' },
		'5': { scope: 'comment.line.number-sign.rcl' },
	},
	end: `^(?!\\1[ \\t])(?=\\S)|^(?=.{0,%\\1width%}(?! \\S))(?<!\\1)`,
	contentName: 'string.unquoted.multiline',
	patterns: [{ include: '#multiline_string_content' }],
};

const propertyAssignment: any = {
	key: 'property_assignment',
	patterns: [{ include: '#property_assignment_multiline' }, { include: '#property_assignment_singleline' }],
};

export const propertyContextRepository: Repository = {
	property_assignment_singleline: propertyAssignmentSingleLine,
	property_assignment_multiline: propertyAssignmentMultiline,
	property_assignment: propertyAssignment,
}; 