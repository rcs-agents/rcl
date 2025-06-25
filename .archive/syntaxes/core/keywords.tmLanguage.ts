/**
 * Keywords TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type Rule,
  regex,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const otherKeywords: MatchRule = {
  key: 'other-keywords',
  scope: scopes.keyword.other,
  match: regex.keywords(['Flows', 'Actions', 'Shortcuts']),
};

const flowKeywords: MatchRule = {
  key: 'flow-keywords',
  scope: scopes.keyword.control.flow,
  match: regex.keywords(['if', 'when', 'unless', 'match', 'then', 'do', 'end', 'else', 'otherwise']),
};

const actionKeywords: MatchRule = {
  key: 'action-keywords',
  scope: scopes.keyword.control.action,
  match: regex.keywords(['action', 'suggestion', 'reply', 'card', 'carousel', 'media', 'file', 'location']),
};

const dialActionKeyword: MatchRule = {
  key: 'dial-action-keyword',
  scope: scopes.keyword.control.action.dial,
  match: /\bdialAction\b/,
};

const richCardKeyword: MatchRule = {
  key: 'rich-card-keyword',
  scope: scopes.keyword.control.entity.richcard,
  match: /\brichCard\b/,
};

const standaloneCardKeyword: MatchRule = {
  key: 'standalone-card-keyword',
  scope: scopes.keyword.control.entity.standalonecard,
  match: /\bstandaloneCard\b/,
};

const replyKeyword: MatchRule = {
  key: 'reply-keyword',
  scope: scopes.keyword.control.suggestion.reply,
  match: /\breply\b/,
};

const isNotKeyword: MatchRule = {
  key: 'is-not-keyword',
  scope: scopes.keyword.operator.logical.is_not,
  match: /\b(is\s+not)\b/,
};

const logicalKeywords: MatchRule = {
  key: 'logical-keywords',
  scope: scopes.keyword.operator.logical,
  match: regex.keywords(['and', 'or', 'not', 'is', 'in']),
};

const booleanConstants: MatchRule = {
  key: 'boolean-constants',
  scope: scopes.constant.language.boolean,
  match: regex.keywords(['True', 'False']),
};

const nullConstants: MatchRule = {
  key: 'null-constants',
  scope: scopes.constant.language.null,
  match: /\b(Null)\b/,
};

export const keywords: Rule = {
  key: 'keywords',
  patterns: [
    otherKeywords,
    flowKeywords,
    actionKeywords,
    dialActionKeyword,
    richCardKeyword,
    standaloneCardKeyword,
    replyKeyword,
    isNotKeyword,
    logicalKeywords,
    booleanConstants,
    nullConstants,
  ],
}; 