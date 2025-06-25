/**
 * RCL Base TextMate Grammar
 */

import {
	BeginEndRule,
	createGrammar,
	Grammar,
	MatchRule,
	regex,
	Rule,
	scopesFor,
} from "tmgrammar-toolkit";

const scopes = scopesFor('rcl');

const comments: BeginEndRule = {
  key: 'comments',
  scope: scopes.comment_line,
  begin: /#/,
  beginCaptures: { '1': { scope: scopes.punctuation_whitespace_comment_leading } },
  end: /(?=$)/,
};

const keywords: MatchRule = {
  key: 'keywords',
  scope: scopes.keyword_control,
  match: regex.keywords(['agent', 'config', 'defaults', 'messages', 'flow']),
};

const strings: BeginEndRule = {
  key: 'strings',
  scope: scopes.string_quoted_double,
  begin: /"/,
  beginCaptures: { '0': { scope: scopes.punctuation_definition_string_begin } },
  end: /"/,
  endCaptures: { '0': { scope: scopes.punctuation_definition_string_end } },
  patterns: [{ key: 'escape', match: /\\./, scope: scopes.constant_character_escape }],
};

const atoms: MatchRule = {
  key: 'atoms',
  scope: scopes.constant_other_atom,
  match: /:[a-zA-Z_][\w_]*/,
};

const numbers: MatchRule = {
  key: 'numbers',
  scope: scopes.constant_numeric,
  match: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
};

const booleans: MatchRule = {
  key: 'booleans',
  scope: scopes.constant_language_boolean,
  match: /\b(True|On|Yes|Active|Enabled|False|Off|No|Inactive|Disabled)\b/,
};

const nulls: MatchRule = {
  key: 'nulls',
  scope: scopes.constant_language_null,
  match: /\b(Null)\b/,
};

const allRclBaseRules: Rule[] = [
  comments,
  keywords,
  strings,
  atoms,
  numbers,
  booleans,
  nulls,
];

export const grammar: Grammar = createGrammar(
  'rcl',
  'source.rcl',
  ['rcl'],
  [
    { include: '#comments' },
    { include: '#keywords' },
    { include: '#strings' },
    { include: '#atoms' },
    { include: '#numbers' },
    { include: '#booleans' },
    { include: '#nulls' },
  ],
  {
    repositoryItems: allRclBaseRules,
  }
); 