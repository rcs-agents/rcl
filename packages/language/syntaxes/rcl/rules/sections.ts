import type { MatchRule, BeginEndRule, IncludeRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopes } from '../scopes.js';

// Define what can be inside sections to avoid circular dependency
const baseSectionContentPatterns = [
    { include: '#string-literal' },
    { include: '#number-literal' },
    { include: '#boolean-literal' },
    { include: '#null-literal' },
    { include: '#atom-literal' },
    { include: '#attribute-key' },
    { include: '#hash-comment' },
];

const agentSectionContentPatterns = [
    { include: '#agent-config-section' },
    { include: '#agent-defaults-section' },
    { include: '#flow-section' },
    { include: '#messages-section' },
    ...baseSectionContentPatterns
];

/**
 * Agent section
 * Examples: agent BMW Customer Service Agent:
 */
export const agentSection: BeginEndRule = {
    key: 'agent-section',
    begin: new RegExp(`(${R.AGENT_KW.source})\\s+(${R.PROPER_NOUN.source})`),
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section,
    beginCaptures: {
        '1': { scope: scopes.keywords.section },
        '2': { scope: scopes.identifiers.sectionName }
    },
    patterns: agentSectionContentPatterns
};

/**
 * Agent config section
 * Examples: agentConfig Config:
 */
export const agentConfigSection: BeginEndRule = {
    key: 'agent-config-section',
    begin: R.AGENT_CONFIG_KW,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section_agentConfig,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: baseSectionContentPatterns
};

/**
 * Agent defaults section
 * Examples: agentDefaults Defaults:
 */
export const agentDefaultsSection: BeginEndRule = {
    key: 'agent-defaults-section',
    begin: R.AGENT_DEFAULTS_KW,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section_agentDefaults,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: baseSectionContentPatterns
};

/**
 * Flow section
 * Examples: flow Welcome Flow:, flows:
 */
export const flowSection: BeginEndRule = {
    key: 'flow-section',
    begin: R.FLOW_KW,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section_flow,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: [
        { include: '#flow-rule' },
        ...baseSectionContentPatterns
    ]
};

/**
 * Flows section
 */
export const flowsSection: BeginEndRule = {
    key: 'flows-section',
    begin: R.FLOWS_KW,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: baseSectionContentPatterns
};

/**
 * Messages section
 * Examples: messages Messages:
 */
export const messagesSection: BeginEndRule = {
    key: 'messages-section',
    begin: R.MESSAGES_KW,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section_messages,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: [
        { include: '#message-definition' },
        { include: '#message-shortcut' },
        ...baseSectionContentPatterns
    ]
};

/**
 * Message definition
 * Examples: Welcome Message:, Support Response:
 */
export const messageDefinition: BeginEndRule = {
    key: 'message-definition',
    scope: scopes.meta.messageDefinition,
    begin: /([A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)\s*(:)/,
    beginCaptures: {
        1: { scope: scopes.identifiers.messageName }, // message name
        3: { scope: scopes.punctuation.colon }, // :
    },
    end: /(?=^[A-Z])/m,
    patterns: [
        { include: '#agent-message-keyword' },
        { include: '#content-message-keyword' },
        { include: '#suggestion-keyword' },
        { include: '#attribute-key' },
        { include: '#string-literal' },
        { include: '#embedded-code-line' },
    ]
};

/**
 * Message shortcuts (text, richCard, etc.)
 */
export const messageShortcut: MatchRule = {
    key: 'message-shortcut',
    scope: scopes.meta.messageShortcut,
    match: /(\b(?:text|richCard|carousel|rbmFile|file)\b)\s+(.+)/,
    captures: {
        1: { scope: scopes.keywords.message }, // shortcut type
        2: { scope: scopes.literals.string.unquoted }, // shortcut content
    },
};

/**
 * Section names (space-separated identifiers)
 */
export const sectionName: MatchRule = {
    key: 'section-name',
    scope: scopes.identifiers.sectionName,
    match: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,
};

/**
 * Section separator (colon)
 */
export const sectionSeparator: MatchRule = {
    key: 'section-separator',
    scope: scopes.punctuation.colon,
    match: R.COLON,
};

/**
 * Fallback for any other section name not explicitly defined
 */
export const genericSection: BeginEndRule = {
    key: 'generic-section',
    begin: R.PROPER_NOUN,
    end: /(?=^[a-z][a-zA-Z0-9_]*:)|(?=^import\b)|(?=\Z)/,
    scope: scopes.meta.section,
    beginCaptures: {
        '0': { scope: scopes.keywords.section }
    },
    patterns: baseSectionContentPatterns
};

/**
 * Generic section (for patterns to be added dynamically)
 */
export const section: IncludeRule = {
    key: 'section',
    patterns: [
        agentSection,
        agentDefaultsSection,
        agentConfigSection,
        flowSection,
        flowsSection,
        messagesSection
    ]
};

export const allSections = [
    agentSection,
    agentConfigSection,
    agentDefaultsSection,
    flowSection,
    messagesSection,
    messageDefinition,
    messageShortcut,
    sectionName,
    sectionSeparator,
    // Removed 'section' to prevent circular reference - individual sections are already included
];
