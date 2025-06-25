/**
 * Section Type TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type Rule,
  regex,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const typedMessageKeywords: MatchRule = {
  key: 'typed-message-keywords',
  scope: scopes.keyword.control.section.message.typed,
  match: regex.keywords(['authentication message', 'transaction message', 'promotion message', 'servicerequest message', 'acknowledge message']),
};

const reservedKeywords: MatchRule = {
  key: 'reserved-keywords',
  scope: scopes.keyword.control.section.reserved,
  match: regex.keywords(['Config', 'Defaults', 'Messages']),
};

const sectionKeywords: MatchRule = {
  key: 'section-keywords',
  scope: scopes.keyword.control.section,
  match: regex.keywords(['agent', 'agentConfig', 'agentDefaults', 'flow', 'messages', 'message']),
};

export const sectionKeywordsRule: Rule = {
  key: 'section-keywords-rule',
  patterns: [
    typedMessageKeywords,
    reservedKeywords,
    sectionKeywords,
  ],
}; 