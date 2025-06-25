/**
 * Primitives TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const atoms: MatchRule = {
  key: 'atoms',
  scope: scopes.constant.other.atom,
  match: /:[a-zA-Z_][a-zA-Z0-9_]*\b/,
};

const booleans: MatchRule = {
  key: 'booleans',
  scope: scopes.constant.language.boolean,
  match: /\b(True|False)\b/,
};

const nulls: MatchRule = {
  key: 'nulls',
  scope: scopes.constant.language.null,
  match: /\b(Null|null)\b/,
};

const doubleQuotedStrings: BeginEndRule = {
  key: 'double-quoted-strings',
  scope: scopes.string.quoted.double,
  begin: /"/,
  beginCaptures: { '0': { scope: scopes.punctuation.definition.string.begin } },
  end: /"/,
  endCaptures: {
    '0': { scope: scopes.punctuation.definition.string.end.rcl },
  },
  patterns: [
    {
      scope: scopes.constant.character.escape,
      match: /\\./,
    },
  ],
};

const singleQuotedStrings: BeginEndRule = {
  key: 'single-quoted-strings',
  scope: scopes.string.quoted.single,
  begin: /'/,
  beginCaptures: { '0': { scope: scopes.punctuation.definition.string.begin } },
  end: /'/,
  endCaptures: {
    '0': { scope: scopes.punctuation.definition.string.end.rcl },
  },
  patterns: [
    {
      scope: scopes.constant.character.escape,
      match: /\\./,
    },
  ],
};

const multilineStrings: BeginEndRule = {
  key: 'multiline-strings',
  scope: scopes.string.unquoted.multiline,
  begin: /^\s*(\|[+-]?[|+]?)\s*$/,
  beginCaptures: { '1': { scope: scopes.punctuation.definition.string.multiline.begin } },
  end: /^(?=\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content,
      match: /.*/,
    },
  ],
};

const integers: MatchRule = {
  key: 'integers',
  scope: scopes.constant.numeric.integer,
  match: /\b-?\d+\b(?!\.)/,
};

const floats: MatchRule = {
  key: 'floats',
  scope: scopes.constant.numeric.float,
  match: /\b-?\d+\.\d+([eE][+-]?\d+)?\b/,
};

const times: MatchRule = {
  key: 'times',
  scope: scopes.constant.numeric.time,
  match: /\b\d{1,2}:\d{2}(:\d{2})?\b/,
};

const dates: MatchRule = {
  key: 'dates',
  scope: scopes.constant.other.date,
  match: /\b\d{4}-\d{2}-\d{2}\b/,
};

const datetimes: MatchRule = {
  key: 'datetimes',
  scope: scopes.constant.other.datetime,
  match: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?\b/,
};

export const primitives: Rule = {
  key: 'primitives',
  patterns: [
    atoms,
    booleans,
    nulls,
    doubleQuotedStrings,
    singleQuotedStrings,
    multilineStrings,
    integers,
    floats,
    times,
    dates,
    datetimes,
  ],
}; 