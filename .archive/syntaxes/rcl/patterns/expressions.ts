/**
 * RCL Expression Language Patterns
 */

type Repository = any;

const LOGICAL_OPERATORS = ['and', 'or', 'not', 'is', 'is not'].join('|');
const COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>', '>='].join('|');
const ARITHMETIC_OPERATORS = ['\\+', '-', '\\*', '/', '%'].join('|');
const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';
const PROPER_WORD = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const PROPER_NOUN = `${PROPER_WORD}(?:\\s+${PROPER_WORD})*`;

const logicalOperatorsRule: any = {
	key: 'logical_operators',
	scope: 'keyword.operator.logical.rcl',
	match: new RegExp(`\\b(${LOGICAL_OPERATORS})\\b`),
};

const comparisonOperatorsRule: any = {
	key: 'comparison_operators',
	scope: 'keyword.operator.comparison.rcl',
	match: new RegExp(COMPARISON_OPERATORS),
};

const arithmeticOperatorsRule: any = {
	key: 'arithmetic_operators',
	scope: 'keyword.operator.arithmetic.rcl',
	match: new RegExp(ARITHMETIC_OPERATORS),
};

const attributeAccessRule: any = {
	key: 'attribute_access',
	patterns: [
		{
			key: 'contextual_attribute',
			scope: 'variable.other.attribute.contextual.rcl',
			match: new RegExp(`(?:\\^|@)(${COMMON_NOUN})\\b`),
			captures: {
				'1': { scope: 'variable.other.property.rcl' },
			},
		},
		{
			key: 'chained_attribute',
			scope: 'variable.other.attribute.chained.rcl',
			match: new RegExp(`${COMMON_NOUN}(?:\\.${COMMON_NOUN})+\\b`),
		},
		{
			key: 'simple_attribute',
			scope: 'variable.other.attribute.simple.rcl',
			match: new RegExp(`\\b${COMMON_NOUN}\\b`),
		},
	],
};

const functionCallRule: any = {
	key: 'function_call',
	scope: 'meta.function-call.rcl',
	begin: new RegExp(`(${PROPER_NOUN})(\\s*\\()`),
	beginCaptures: {
		'1': { scope: 'entity.name.function.rcl' },
		'2': { scope: 'punctuation.section.parens.begin.rcl' },
	},
	end: /\)/,
	endCaptures: {
		'0': { scope: 'punctuation.section.parens.end.rcl' },
	},
	patterns: [
		{ include: '#comments' },
		{ include: '#expression' },
		{
			key: 'comma_separator',
			scope: 'punctuation.separator.comma.rcl',
			match: /,/,
		},
	],
};

const groupedExpressionRule: any = {
	key: 'grouped_expression',
	scope: 'meta.expression.grouped.rcl',
	begin: /\(/,
	beginCaptures: {
		'0': { scope: 'punctuation.section.parens.begin.rcl' },
	},
	end: /\)/,
	endCaptures: {
		'0': { scope: 'punctuation.section.parens.end.rcl' },
	},
	patterns: [{ include: '#expression' }],
};

const expression: any = {
	key: 'expression',
	patterns: [
		{ include: '#comments' },
		{ include: '#function_call' },
		{ include: '#grouped_expression' },
		{ include: '#primitives' },
		{ include: '#references' },
		{ include: '#type_conversion' },
		{ include: '#attribute_access' },
		{ include: '#arithmetic_operators' },
		{ include: '#comparison_operators' },
		{ include: '#logical_operators' },
	],
};

export const expressionsRepository: Repository = {
	logical_operators: logicalOperatorsRule,
	comparison_operators: comparisonOperatorsRule,
	arithmetic_operators: arithmeticOperatorsRule,
	attribute_access: attributeAccessRule,
	function_call: functionCallRule,
	grouped_expression: groupedExpressionRule,
	expression,
}; 