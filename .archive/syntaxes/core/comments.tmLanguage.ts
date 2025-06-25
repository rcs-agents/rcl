/**
 * Comments TextMate Grammar
 */

import {
  scopesFor,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

export const comments: Rule = {
  key: 'comments',
  patterns: [
    {
      key: 'line-comment',
      scope: scopes.comment.line.number_sign,
      begin: /\s*(#)/,
      beginCaptures: { '1': { scope: scopes.punctuation.definition.comment } },
      end: /$/,
      patterns: [
        {
          scope: scopes.comment.line.content,
          match: /.*/,
        },
      ],
    },
  ],
}; 