/**
 * RCL Reference Patterns (Imports and qualified names)
 */
import { type BeginEndRule, type MatchRule, type Rule, scopesFor } from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

type Repository = Record<string, Rule>;

const PROPER_NOUN = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const COMMON_NOUN = '[a-z][a-zA-Z0-9_]*';

const qualifiedReference: MatchRule = {
	key: 'qualified_reference',
	scope: 'meta.reference.qualified.rcl',
	match: new RegExp(`(${PROPER_NOUN})\\.(${PROPER_NOUN})(?:\\.(${PROPER_NOUN}))?`),
	captures: {
		'1': { scope: scopes.entity.name.namespace },
		'2': { scope: 'entity.name.module.rcl' },
		'3': { scope: 'entity.name.item.rcl' },
	},
};

const simpleReference: MatchRule = {
	key: 'simple_reference',
	scope: 'variable.other.reference.rcl',
	match: new RegExp(`\\b${PROPER_NOUN}\\b`),
};

const importStatement: BeginEndRule = {
	key: 'import_statement',
	scope: 'meta.import.rcl',
	begin: /\b(import)\b/,
	beginCaptures: {
		'1': { scope: scopes.keyword.control.import },
	},
	end: /(?=\n|$)/,
	patterns: [
		{
			key: 'import_namespace',
			scope: 'meta.import.namespace.rcl',
			match: new RegExp(`(${PROPER_NOUN})\\s*/\\s*(${PROPER_NOUN})`),
			captures: {
				'1': { scope: scopes.entity.name.namespace },
				'2': { scope: 'punctuation.separator.namespace.rcl' },
				'3': { scope: 'entity.name.module.rcl' },
			},
		},
		{
			key: 'import_alias',
			scope: 'meta.import.alias.rcl',
			match: /\s+(as)\s+([a-zA-Z_][a-zA-Z0-9_]*)/,
			captures: {
				'1': { scope: scopes.keyword.control.import },
				'2': { scope: 'variable.other.alias.rcl' },
			},
		},
	],
};

const contextualReference: MatchRule = {
	key: 'contextual_reference',
	scope: 'variable.other.reference.contextual.rcl',
	match: new RegExp(`(?:\\^|@)(${COMMON_NOUN})`),
	captures: {
		'1': { scope: 'variable.other.property.rcl' },
	},
};

const propertyAccess: MatchRule = {
	key: 'property_access',
	scope: 'meta.property_access.rcl',
	match: new RegExp(`(${COMMON_NOUN})\\.(${COMMON_NOUN})`),
	captures: {
		'1': { scope: 'variable.other.object.rcl' },
		'2': { scope: 'variable.other.property.rcl' },
	},
};

export const referencesRepository: Repository = {
	qualified_reference: qualifiedReference,
	simple_reference: simpleReference,
	import_statement: importStatement,
	contextual_reference: contextualReference,
	property_access: propertyAccess,
}; 