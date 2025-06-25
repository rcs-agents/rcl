/**
 * RCL Flow-Level Context Patterns
 * Defines what can appear inside an RCL flow section.
 */

type Repository = any;

const flowLevelPatterns: any = {
	key: 'flow_level_patterns',
	patterns: [
		{ include: '#comments' },
		{ include: '#flow_rule' },
		{ include: '#conditional' },
		{ include: '#loop' },
		{ include: '#return_statement' },
		{ include: '#throw_statement' },
	],
};

const flowRuleContext: any = {
	key: 'flow_rule_context',
	patterns: [
		{ include: '#flow_operand' },
		{ include: '#atom' },
		{ include: '#proper_noun' },
		{ include: '#common_noun' },
	],
};

export const flowContextRepository: Repository = {
	flow_level_patterns: flowLevelPatterns,
	flow_rule_context: flowRuleContext,
}; 