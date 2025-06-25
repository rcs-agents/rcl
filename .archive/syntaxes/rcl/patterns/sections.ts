/**
 * RCL section patterns (agent, message, config, etc.)
 */
import { type BeginEndRule, type Rule, scopesFor } from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

type Repository = Record<string, Rule>;

const PROPER_WORD = '[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const PROPER_NOUN = `${PROPER_WORD}(?:\\s+${PROPER_WORD})*`;

const agentSection: BeginEndRule = {
	key: 'agent_section',
	scope: 'meta.section.agent.rcl',
	begin: new RegExp(`\\b(agent)\\s+(${PROPER_NOUN})`),
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
		'2': { scope: scopes.entity.name.section },
	},
	end: /^(?=\S)/,
	patterns: [
		{ include: '#comments' },
		{ include: '#config_section' },
		{ include: '#defaults_section' },
		{ include: '#messages_section' },
		{ include: '#flow_section' },
	],
};

const configSection: BeginEndRule = {
	key: 'config_section',
	scope: 'meta.section.config.rcl',
	begin: /^\s*(Config|agentConfig)\s*$/,
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#property_assignments' }],
};

const defaultsSection: BeginEndRule = {
	key: 'defaults_section',
	scope: 'meta.section.defaults.rcl',
	begin: /^\s*(Defaults|agentDefaults)\s*$/,
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#property_assignments' }],
};

const messagesSection: BeginEndRule = {
	key: 'messages_section',
	scope: 'meta.section.messages.rcl',
	begin: /^\s*(Messages|messages)\s*$/,
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#message_definition' }],
};

const flowSection: BeginEndRule = {
	key: 'flow_section',
	scope: 'meta.section.flow.rcl',
	begin: new RegExp(`\\b(flow)\\s+(${PROPER_NOUN})`),
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
		'2': { scope: scopes.entity.name.section },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#flow_rule' }],
};

const messageDefinition: BeginEndRule = {
	key: 'message_definition',
	scope: 'meta.message.definition.rcl',
	begin: new RegExp(`\\b(message)\\s+(${PROPER_NOUN})`),
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
		'2': { scope: scopes.entity.name.section },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#property_assignments' }],
};

const agentMessageDefinition: BeginEndRule = {
	key: 'agent_message_definition',
	scope: 'meta.message.agent.definition.rcl',
	begin: new RegExp(`\\b(agentMessage)\\s+(${PROPER_NOUN})`),
	beginCaptures: {
		'1': { scope: 'keyword.control.section.rcl' },
		'2': { scope: scopes.entity.name.section },
	},
	end: /^(?=\S)/,
	patterns: [{ include: '#property_assignments' }],
};

export const sectionsRepository: Repository = {
	agent_section: agentSection,
	config_section: configSection,
	defaults_section: defaultsSection,
	messages_section: messagesSection,
	flow_section: flowSection,
	message_definition: messageDefinition,
	agent_message_definition: agentMessageDefinition,
}; 