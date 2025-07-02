import type { MatchRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopeGroups } from '../scopes.js';

// Import keywords
export const importKeywords: MatchRule = {
    key: 'import-keywords',
    match: R.IMPORT_KW,
    scope: scopeGroups.keywords.import
};

export const asKeyword: MatchRule = {
    key: 'as-keyword',
    scope: scopeGroups.keywords.import,
    match: R.AS_KW,
};

export const fromKeyword: MatchRule = {
    key: 'from-keyword',
    scope: scopeGroups.keywords.import,
    match: R.FROM_KW,
};

// Section keywords
export const agentKeyword: MatchRule = {
    key: 'agent-keyword',
    scope: scopeGroups.keywords.section,
    match: R.AGENT_KW,
};

export const agentDefaultsKeyword: MatchRule = {
    key: 'agent-defaults-keyword',
    scope: scopeGroups.keywords.section,
    match: R.AGENT_DEFAULTS_KW,
};

export const agentConfigKeyword: MatchRule = {
    key: 'agent-config-keyword',
    scope: scopeGroups.keywords.section,
    match: R.AGENT_CONFIG_KW,
};

export const flowKeyword: MatchRule = {
    key: 'flow-keyword',
    scope: scopeGroups.keywords.section,
    match: R.FLOW_KW,
};

export const flowsKeyword: MatchRule = {
    key: 'flows-keyword',
    scope: scopeGroups.keywords.section,
    match: R.FLOWS_KW,
};

export const messagesKeyword: MatchRule = {
    key: 'messages-keyword',
    scope: scopeGroups.keywords.section,
    match: R.MESSAGES_KW,
};

// Message keywords
export const agentMessageKeyword: MatchRule = {
    key: 'agent-message-keyword',
    scope: scopeGroups.keywords.message,
    match: R.AGENT_MESSAGE_KW,
};

export const contentMessageKeyword: MatchRule = {
    key: 'content-message-keyword',
    scope: scopeGroups.keywords.message,
    match: R.CONTENT_MESSAGE_KW,
};

export const suggestionKeyword: MatchRule = {
    key: 'suggestion-keyword',
    scope: scopeGroups.keywords.message,
    match: R.SUGGESTION_KW,
};

// Message type keywords
export const textKeyword: MatchRule = {
    key: 'text-keyword',
    scope: scopeGroups.storage.type,
    match: R.TEXT_KW,
};

export const richCardKeyword: MatchRule = {
    key: 'rich-card-keyword',
    scope: scopeGroups.storage.type,
    match: R.RICH_CARD_KW,
};

export const carouselKeyword: MatchRule = {
    key: 'carousel-keyword',
    scope: scopeGroups.storage.type,
    match: R.CAROUSEL_KW,
};

export const rbmFileKeyword: MatchRule = {
    key: 'rbm-file-keyword',
    scope: scopeGroups.storage.type,
    match: R.RBM_FILE_KW,
};

export const fileKeyword: MatchRule = {
    key: 'file-keyword',
    scope: scopeGroups.storage.type,
    match: R.FILE_KW,
};

// Action keywords
export const replyKeyword: MatchRule = {
    key: 'reply-keyword',
    scope: scopeGroups.keywords.action,
    match: R.REPLY_KW,
};

export const dialKeyword: MatchRule = {
    key: 'dial-keyword',
    scope: scopeGroups.keywords.action,
    match: R.DIAL_KW,
};

export const openUrlKeyword: MatchRule = {
    key: 'open-url-keyword',
    scope: scopeGroups.keywords.action,
    match: R.OPEN_URL_KW,
};

export const shareLocationKeyword: MatchRule = {
    key: 'share-location-keyword',
    scope: scopeGroups.keywords.action,
    match: R.SHARE_LOCATION_KW,
};

export const viewLocationKeyword: MatchRule = {
    key: 'view-location-keyword',
    scope: scopeGroups.keywords.action,
    match: R.VIEW_LOCATION_KW,
};

export const saveEventKeyword: MatchRule = {
    key: 'save-event-keyword',
    scope: scopeGroups.keywords.action,
    match: R.SAVE_EVENT_KW,
};

// Flow control keywords
export const startKeyword: MatchRule = {
    key: 'start-keyword',
    scope: scopeGroups.keywords.flow,
    match: R.START_KW,
};

export const withKeyword: MatchRule = {
    key: 'with-keyword',
    scope: scopeGroups.keywords.flow,
    match: R.WITH_KW,
};

export const whenKeyword: MatchRule = {
    key: 'when-keyword',
    scope: scopeGroups.keywords.flow,
    match: R.WHEN_KW,
};

export const ifKeyword: MatchRule = {
    key: 'if-keyword',
    scope: scopeGroups.keywords.conditional,
    match: R.IF_KW,
};

export const thenKeyword: MatchRule = {
    key: 'then-keyword',
    scope: scopeGroups.keywords.conditional,
    match: R.THEN_KW,
};

export const elseKeyword: MatchRule = {
    key: 'else-keyword',
    scope: scopeGroups.keywords.conditional,
    match: R.ELSE_KW,
};

export const unlessKeyword: MatchRule = {
    key: 'unless-keyword',
    scope: scopeGroups.keywords.conditional,
    match: R.UNLESS_KW,
};

export const andKeyword: MatchRule = {
    key: 'and-keyword',
    scope: scopeGroups.keywords.logical,
    match: R.AND_KW,
};

export const orKeyword: MatchRule = {
    key: 'or-keyword',
    scope: scopeGroups.keywords.logical,
    match: R.OR_KW,
};

export const notKeyword: MatchRule = {
    key: 'not-keyword',
    scope: scopeGroups.keywords.logical,
    match: R.NOT_KW,
};

export const isKeyword: MatchRule = {
    key: 'is-keyword',
    scope: scopeGroups.keywords.comparison,
    match: R.IS_KW,
};

// Collection keywords
export const listKeyword: MatchRule = {
    key: 'list-keyword',
    scope: scopeGroups.keywords.other,
    match: R.LIST_KW,
};

export const ofKeyword: MatchRule = {
    key: 'of-keyword',
    scope: scopeGroups.keywords.other,
    match: R.OF_KW,
};

// Traffic type keywords
export const transactionalKeyword: MatchRule = {
    key: 'transactional-keyword',
    scope: scopeGroups.keywords.other,
    match: R.TRANSACTIONAL_KW,
};

export const promotionalKeyword: MatchRule = {
    key: 'promotional-keyword',
    scope: scopeGroups.keywords.other,
    match: R.PROMOTIONAL_KW,
};

// Reserved names
export const defaultsKeyword: MatchRule = {
    key: 'defaults-keyword',
    scope: scopeGroups.keywords.other,
    match: R.DEFAULTS_KW,
};

export const configKeyword: MatchRule = {
    key: 'config-keyword',
    scope: scopeGroups.keywords.other,
    match: R.CONFIG_KW,
};

export const messagesReservedKeyword: MatchRule = {
    key: 'messages-reserved-keyword',
    scope: scopeGroups.keywords.other,
    match: R.MESSAGES_RESERVED_KW,
};

// All keywords grouped
export const allKeywords = [
    // Import
    importKeywords, asKeyword, fromKeyword,
    // Sections
    agentKeyword, agentDefaultsKeyword, agentConfigKeyword, flowKeyword, flowsKeyword, messagesKeyword,
    // Messages
    agentMessageKeyword, contentMessageKeyword, suggestionKeyword,
    // Message types
    textKeyword, richCardKeyword, carouselKeyword, rbmFileKeyword, fileKeyword,
    // Actions
    replyKeyword, dialKeyword, openUrlKeyword, shareLocationKeyword, viewLocationKeyword, saveEventKeyword,
    // Flow control
    startKeyword, withKeyword, whenKeyword, ifKeyword, thenKeyword, elseKeyword, unlessKeyword,
    // Operators
    andKeyword, orKeyword, notKeyword, isKeyword,
    // Collections
    listKeyword, ofKeyword,
    // Traffic types
    transactionalKeyword, promotionalKeyword,
    // Reserved
    defaultsKeyword, configKeyword, messagesReservedKeyword,
];

 