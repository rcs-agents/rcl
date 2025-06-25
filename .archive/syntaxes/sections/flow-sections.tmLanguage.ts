/**
 * Flow Sections TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const flowRule: MatchRule = {
  key: 'flowRule',
  scope: scopes.meta.flow.rule,
  match: /([a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")\s*(->)\s*([a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")/,
  captures: {
    '1': { scope: scopes.variable.other.flow.source },
    '2': { scope: scopes.keyword.operator.flow.arrow },
    '3': { scope: scopes.variable.other.flow.target },
  },
};

const flowRuleWithAtoms: MatchRule = {
  key: 'flowRuleWithAtoms',
  scope: scopes.meta.flow.rule_with_atoms,
  match: /:[a-zA-Z_][a-zA-Z0-9_]*\s*(->)\s*([a-zA-Z_][a-zA-Z0-9_]*|:[a-zA-Z_][a-zA-Z0-9_]*|"[^"]*")/,
  captures: {
    '1': { scope: scopes.constant.other.atom },
    '2': { scope: scopes.keyword.operator.flow.arrow },
    '3': { scope: scopes.variable.other.flow.target },
  },
};

const flowControl: BeginEndRule = {
  key: 'flowControl',
  scope: scopes.meta.flow.control,
  begin: /^\s*(if|when|unless|match)\b/,
  beginCaptures: { '1': { scope: scopes.keyword.control.flow } },
  end: /^\s*(then|do)\b/,
  endCaptures: {
    '1': { scope: scopes.keyword.control.flow.rcl },
  },
  patterns: [
    { include: '#expressions' },
    { include: '#primitives' },
    { include: '#references' },
    { include: '#comments' },
    { include: '#punctuation' },
  ],
};

const flowAction: BeginEndRule = {
  key: 'flowAction',
  scope: scopes.meta.flow.action,
  begin: /^\s*(then|do)\b/,
  beginCaptures: { '1': { scope: scopes.keyword.control.flow } },
  end: /^\s*(end)\b/,
  endCaptures: {
    '1': { scope: scopes.keyword.control.flow.rcl },
  },
  patterns: [
    { include: '#expressions' },
    { include: '#primitives' },
    { include: '#references' },
    { include: '#comments' },
    { include: '#punctuation' },
    { include: '#keywords' },
  ],
};

export const flowSections: Rule = {
  key: 'flow-sections',
  patterns: [
    flowRule,
    flowRuleWithAtoms,
    flowControl,
    flowAction,
  ],
}; 