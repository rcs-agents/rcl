import { createGrammar } from '../../../src/factory.js';
import { scopes } from '../../../src/scopes/index.js';
import type { MatchRule, BeginEndRule, IncludeRule } from '../../../src/types.js';

const valueRule: IncludeRule = {
  key: 'value',
  patterns: [
    { include: '#string' },
    { include: '#number' },
    { include: '#boolean' },
    { include: '#null' },
    { include: '#array' },
    { include: '#object' }
  ]
};

const stringRule: BeginEndRule = {
  key: 'string',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double,
  patterns: [
    {
      match: /\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/,
      scope: scopes.constant.character.escape
    }
  ]
};

const numberRule: MatchRule = {
  key: 'number',
  match: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
  scope: scopes.constant.numeric
};

const booleanRule: MatchRule = {
  key: 'boolean',
  match: /\b(true|false)\b/,
  scope: scopes.constant.language.boolean
};

const nullRule: MatchRule = {
  key: 'null',
  match: /\bnull\b/,
  scope: scopes.constant.language.null
};

const arrayRule: BeginEndRule = {
  key: 'array',
  begin: /\[/,
  end: /\]/,
  scope: scopes.meta.array,
  patterns: [
    { include: '#value' },
    {
      match: /,/,
      scope: scopes.punctuation.separator.array
    }
  ]
};

const objectRule: BeginEndRule = {
  key: 'object',
  begin: /\{/,
  end: /\}/,
  scope: scopes.meta.dictionary,
  patterns: [
    {
      begin: /"/,
      end: /"/,
      scope: scopes.string.quoted.double,
      patterns: [
        {
          match: /\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/,
          scope: scopes.constant.character.escape
        }
      ]
    },
    {
      match: /:/,
      scope: scopes.punctuation.separator.key_value
    },
    { include: '#value' },
    {
      match: /,/,
      scope: scopes.punctuation.separator.pair
    }
  ]
};

export const grammar = createGrammar(
  'JSON Simple',
  'source.json-simple',
  ['json'],
  [valueRule],
  {
    repositoryItems: [
      valueRule,
      stringRule,
      numberRule,
      booleanRule,
      nullRule,
      arrayRule,
      objectRule
    ]
  }
);