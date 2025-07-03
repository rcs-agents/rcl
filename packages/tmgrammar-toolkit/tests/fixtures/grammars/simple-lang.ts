import { createGrammar } from '../../../src/factory.js';
import { scopes } from '../../../src/scopes/index.js';
import { regex } from '../../../src/helpers/index.js';
import type { MatchRule, BeginEndRule } from '../../../src/types.js';

const keywordRule: MatchRule = {
  key: 'keywords',
  match: regex.keywords('if', 'else', 'while', 'for', 'function', 'return', 'var', 'let', 'const'),
  scope: scopes.keyword.control
};

const numberRule: MatchRule = {
  key: 'numbers',
  match: /\b\d+(\.\d+)?\b/,
  scope: scopes.constant.numeric
};

const stringRule: BeginEndRule = {
  key: 'strings',
  begin: /"/,
  end: /"/,
  scope: scopes.string.quoted.double,
  patterns: [
    {
      match: /\\./,
      scope: scopes.constant.character.escape
    }
  ]
};

const singleQuoteStringRule: BeginEndRule = {
  key: 'single-quote-strings',
  begin: /'/,
  end: /'/,
  scope: scopes.string.quoted.single,
  patterns: [
    {
      match: /\\./,
      scope: scopes.constant.character.escape
    }
  ]
};

const commentRule: MatchRule = {
  key: 'line-comments',
  match: /\/\/.*$/,
  scope: scopes.comment.line.double_slash
};

const blockCommentRule: BeginEndRule = {
  key: 'block-comments',
  begin: /\/\*/,
  end: /\*\//,
  scope: scopes.comment.block
};

const functionRule: BeginEndRule = {
  key: 'function-definition',
  begin: /(function)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(\()/,
  end: /\)/,
  scope: scopes.meta.function,
  beginCaptures: {
    1: { scope: scopes.keyword.other },
    2: { scope: scopes.entity.name.function },
    3: { scope: scopes.punctuation.section.parens.begin }
  },
  endCaptures: {
    0: { scope: scopes.punctuation.section.parens.end }
  },
  patterns: [
    {
      match: /([a-zA-Z_][a-zA-Z0-9_]*)/,
      scope: scopes.variable.parameter
    },
    {
      match: /,/,
      scope: scopes.punctuation.separator.comma
    }
  ]
};

const identifierRule: MatchRule = {
  key: 'identifiers',
  match: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
  scope: scopes.variable.other
};

const operatorRule: MatchRule = {
  key: 'operators',
  match: /[+\-*/%=<>!&|]+/,
  scope: scopes.keyword.operator
};

export const grammar = createGrammar(
  'Simple Language',
  'source.simple-lang',
  ['simple', 'sl'],
  [
    keywordRule,
    functionRule,
    numberRule,
    stringRule,
    singleQuoteStringRule,
    blockCommentRule,
    commentRule,
    operatorRule,
    identifierRule
  ],
  {
    repositoryItems: [
      keywordRule,
      functionRule,
      numberRule,
      stringRule,
      singleQuoteStringRule,
      blockCommentRule,
      commentRule,
      operatorRule,
      identifierRule
    ],
    variables: {
      identifier: '[a-zA-Z_][a-zA-Z0-9_]*'
    }
  }
);