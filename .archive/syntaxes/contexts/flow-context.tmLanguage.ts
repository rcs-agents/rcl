/**
 * Flow Context TextMate Grammar
 */

import {
  BeginEndRule,
  MatchRule,
  scopesFor,
  Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

export const flowContext: Rule = {
  key: 'flow-context',
  patterns: [
    {
      key: 'flow-rule',
      scope: scopes.meta.flow.rule,
      match: /([a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")\s*(->)\s*([a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")/,
      captures: {
        '1': { scope: scopes.variable.other.flow.source },
        '2': { scope: scopes.keyword.operator.flow.arrow },
        '3': { scope: scopes.variable.other.flow.target },
      },
    },
    {
      key: 'flow-rule-with-atoms',
      scope: scopes.meta.flow.rule_with_atoms,
      match: /:[a-zA-Z_][a-zA-Z0-9_]*\s*(->)\s*([a-zA-Z_][a-zA-Z0-9_]*|:[a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")/,
      captures: {
        '1': { scope: scopes.constant.other.atom },
        '2': { scope: scopes.keyword.operator.flow.arrow },
        '3': { scope: scopes.variable.other.flow.target },
      },
    },
  ],
};

export const flowControlStructures: Rule = {
  key: 'flow-control-structures',
  patterns: [
    {
      key: 'flow-control-condition',
      scope: scopes.meta.flow.control.condition,
      begin: /^\s*(if|when|unless|match)\b/,
      beginCaptures: { '1': { scope: scopes.keyword.control.flow.condition } },
      end: /^\s*(then|do)\b/,
      endCaptures: {
        '1': { scope: scopes.keyword.control.flow.action.rcl },
      },
      patterns: [
        { include: '#flow-condition-patterns' },
      ],
    },
    {
      key: 'flow-action-block',
      scope: scopes.meta.flow.action.block,
      begin: /^\s*(then|do)\b/,
      beginCaptures: { '1': { scope: scopes.keyword.control.flow.action } },
      end: /^\s*(end)\b/,
      endCaptures: {
        '1': { scope: scopes.keyword.control.flow.end.rcl },
      },
      patterns: [
        { include: '#flow-action-patterns' },
      ],
    },
  ],
};

export const flowConditionPatterns: Rule = {
  key: 'flow-condition-patterns',
  patterns: [
    { include: '#primitives' },
    { include: '#references' },
    { include: '#expressions' },
  ],
};

export const flowActionPatterns: Rule = {
  key: 'flow-action-patterns',
  patterns: [
    { include: '#primitives' },
    { include: '#references' },
    { include: '#expressions' },
  ],
};

export const flowLevelPatterns: Rule = {
  key: 'flow-level-patterns',
  patterns: [
    {
      key: 'comment-line',
      scope: scopes.comment.line.number_sign,
      begin: /^\s*(#)/,
      beginCaptures: { '1': { scope: scopes.punctuation.definition.comment } },
      end: /$/,
      patterns: [
        {
          key: 'lineCommentContent',
          scope: scopes.comment.line.content,
          match: /.*/,
        },
      ],
    } as BeginEndRule,
    { include: '#flow-control-structures' },
  ],
};
