/**
 * RCL flow rule patterns (:start -> Welcome, condition -> target)
 */

type Repository = any;

// Regexes for operands
const ATOM = ':[a-zA-Z_][\\w_]*';
const PROPER_WORD = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const PROPER_NOUN = `${PROPER_WORD}(?:\\s+${PROPER_WORD})*`;
const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';

const FLOW_OPERAND_REGEX = `(?:${ATOM}|${PROPER_NOUN}|${COMMON_NOUN})`;

// Individual operand rules
const properNounRule: any = {
	key: 'proper_noun',
	scope: 'variable.other.flow-target.rcl',
	match: `\\b${PROPER_NOUN}\\b`,
};

const commonNounRule: any = {
	key: 'common_noun',
	scope: 'variable.other.flow-condition.rcl',
	match: `\\b${COMMON_NOUN}\\b`,
};

// The main flow rule
const flowRule: any = {
	key: 'flow_rule',
	scope: 'meta.flow-rule.rcl',
	match: `(${FLOW_OPERAND_REGEX})\\s*(->)\\s*(${FLOW_OPERAND_REGEX})`,
	captures: {
		'1': {
			patterns: [
				{ include: '#proper_noun' },
				{ include: '#common_noun' },
				{ include: '#atom' }, // Assuming 'atom' is in the main repo
			],
		},
		'2': { scope: 'keyword.operator.flow-arrow.rcl' },
		'3': {
			patterns: [
				{ include: '#proper_noun' },
				{ include: '#common_noun' },
				{ include: '#atom' }, // Assuming 'atom' is in the main repo
			],
		},
	},
};

// A pattern to match any flow operand
const flowOperand: any = {
	key: 'flow_operand',
	patterns: [
		{ include: '#proper_noun' },
		{ include: '#common_noun' },
		{ include: '#atom' }, // Assuming 'atom' is in the main repo
	],
};

// The repository
export const flowRulesRepository: Repository = {
	flow_rule: flowRule,
	flow_operand: flowOperand,
	proper_noun: properNounRule,
	common_noun: commonNounRule,
}; 