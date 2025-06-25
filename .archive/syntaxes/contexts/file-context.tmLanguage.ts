/**
 * File Context TextMate Grammar
 */

import {
  BeginEndRule,
  MatchRule,
  scopesFor,
  Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

export const fileContext: Rule = {
  key: 'file-context',
  patterns: [
    {
      key: 'comment-line',
      scope: scopes.comment.line.number_sign,
      begin: /^\s*(#)/,
      beginCaptures: { '1': { scope: scopes.punctuation.definition.comment } },
      end: /$/,
      patterns: [
        {
          key: 'line-comment-content',
          scope: scopes.comment.line,
          match: /.*/,
        } as MatchRule,
      ],
    } as BeginEndRule,
    {
      key: 'import-statement',
      scope: scopes.meta.import,
      begin: /^\s*(import)\s+/,
      beginCaptures: { '1': { scope: scopes.keyword.control.import } },
      end: /$/,
      patterns: [
        {
          key: 'import-namespace',
          scope: scopes.entity.name.namespace,
          match: /([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?=\s*\/)/,
        } as MatchRule,
        {
          key: 'import-separator',
          scope: scopes.punctuation.separator,
          match: /\//,
        } as MatchRule,
        {
          key: 'import-module',
          scope: scopes.entity.name.namespace,
          match: /([A-Za-z][A-Za-z0-9\.]*[A-Za-z0-9])(?=\s+as\b)/,
        } as MatchRule,
        {
          key: 'import-as',
          scope: scopes.keyword.other,
          match: /\bas\b/,
        } as MatchRule,
        {
          key: 'import-alias',
          scope: scopes.entity.name.type,
          match: /([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?=\s*$)/,
        } as MatchRule,
      ],
    } as BeginEndRule,
    { include: '#section-level-patterns' },
  ],
};
