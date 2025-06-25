/**
 * Multiline Strings TextMate Grammar
 */

import {
  scopesFor,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const trim: BeginEndRule = {
  key: 'trim',
  scope: scopes.string.unquoted.multiline.trim,
  begin: /^(\s*)(\)\|)\s*$/,
  beginCaptures: { '2': { scope: scopes.punctuation.definition.string.multiline.trim.begin } },
  end: /^(?!\1\s+\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content.trim,
      match: /.*/,
    },
  ],
};

const trimTrailing: BeginEndRule = {
  key: 'trim-trailing',
  scope: scopes.string.unquoted.multiline.trim_trailing,
  begin: /^(\s*)(\|-)\s*$/,
  beginCaptures: { '2': { scope: scopes.punctuation.definition.string.multiline.trim_trailing.begin } },
  end: /^(?!\1\s+\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content.trim_trailing,
      match: /.*/,
    },
  ],
};

const preserveLeading: BeginEndRule = {
  key: 'preserve-leading',
  scope: scopes.string.unquoted.multiline.preserve_leading,
  begin: /^(\s*)(\+\|)\s*$/,
  beginCaptures: { '2': { scope: scopes.punctuation.definition.string.multiline.preserve_leading.begin } },
  end: /^(?!\1\s+\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content.preserve_leading,
      match: /.*/,
    },
  ],
};

const preserveAll: BeginEndRule = {
  key: 'preserve-all',
  scope: scopes.string.unquoted.multiline.preserve_all,
  begin: /^(\s*)(\+\|\\+)\s*$/,
  beginCaptures: { '2': { scope: scopes.punctuation.definition.string.multiline.preserve_all.begin } },
  end: /^(?!\1\s+\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content.preserve_all,
      match: /.*/,
    },
  ],
};

const clean: BeginEndRule = {
  key: 'clean',
  scope: scopes.string.unquoted.multiline.clean,
  begin: /^(\s*)(\[\|\|\])\s*$/,
  beginCaptures: { '2': { scope: scopes.punctuation.definition.string.multiline.clean.begin } },
  end: /^(?!\1\s+\S)/,
  patterns: [
    {
      scope: scopes.string.unquoted.multiline.content.clean,
      match: /.*/,
    },
  ],
};

export const multilineStrings: Rule = {
  key: 'multiline-strings',
  patterns: [
    trim,
    trimTrailing,
    preserveLeading,
    preserveAll,
    clean,
  ],
}; 