/**
 * Collections TextMate Grammar
 */

import {
  scopesFor,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const array: BeginEndRule = {
  key: 'array',
  scope: scopes.meta.structure.array,
  begin: /\[/,
  beginCaptures: { '0': { scope: scopes.punctuation.definition.array.begin } },
  end: /\]/,
  endCaptures: {
    '0': { scope: scopes.punctuation.definition.array.end.rcl },
  },
  patterns: [
    { include: '#primitives' },
    { include: '#collections' },
    { include: '#references' },
    { include: '#embedded-code' },
    {
      scope: scopes.punctuation.separator.array,
      match: /,/,
    },
  ],
};

const mapping: BeginEndRule = {
  key: 'mapping',
  scope: scopes.meta.structure.mapping,
  begin: /\{/,
  beginCaptures: { '0': { scope: scopes.punctuation.definition.mapping.begin } },
  end: /\}/,
  endCaptures: {
    '0': { scope: scopes.punctuation.definition.mapping.end.rcl },
  },
  patterns: [
    {
      scope: scopes.meta.structure.mapping.key,
      match: /([a-zA-Z][a-zA-Z0-9]*|"[^"]*"|'[^']*')\s*:/,
      captures: { '1': { scope: scopes.entity.name.tag } },
    },
    { include: '#primitives' },
    { include: '#collections' },
    { include: '#references' },
    { include: '#embedded-code' },
    {
      scope: scopes.punctuation.separator.mapping,
      match: /,/,
    },
  ],
};

export const collections: Rule = {
  key: 'collections',
  patterns: [
    array,
    mapping,
  ],
}; 