/**
 * References TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const importStatement: BeginEndRule = {
  key: 'import-statement',
  scope: scopes.meta.import,
  begin: /^\s*(import)\s+/,
  beginCaptures: { '1': { scope: scopes.keyword.control.import } },
  end: /$/,
  patterns: [
    {
      scope: scopes.entity.name.namespace,
      match: /([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?=\s*\/)/,
    },
    {
      scope: scopes.punctuation.separator.namespace,
      match: /\//,
    },
    {
      scope: scopes.entity.name.module,
      match: /([A-Za-z][A-Za-z0-9\.]*[A-Za-z0-9])(?=\s+as\b)/,
    },
    {
      scope: scopes.keyword.control.import,
      match: /\bas\b/,
    },
    {
      scope: scopes.entity.name.alias,
      match: /([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?=\s*$)/,
    },
  ],
};

const simpleReference: MatchRule = {
  key: 'simple-reference',
  scope: scopes.variable.other.reference,
  match: /\$([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])/,
  captures: { '1': { scope: scopes.entity.name.reference } },
};

const qualifiedReference: MatchRule = {
  key: 'qualified-reference',
  scope: scopes.variable.other.reference.qualified,
  match: /\$([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])\.([a-zA-Z][a-zA-Z0-9]*)/,
  captures: {
    '1': { scope: scopes.entity.name.reference },
    '2': { scope: scopes.variable.other.property },
  },
};

export const references: Rule = {
  key: 'references',
  patterns: [
    importStatement,
    simpleReference,
    qualifiedReference,
  ],
}; 