/**
 * Expressions TextMate Grammar
 */

import {
  scopesFor,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const inlineJs: BeginEndRule = {
  key: 'inline-js',
  scope: scopes.meta.embedded.inline.javascript,
  begin: /(\$js>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /$/,
  contentName: 'source.js',
  patterns: [{ include: 'source.js' }],
};

const inlineTs: BeginEndRule = {
  key: 'inline-ts',
  scope: scopes.meta.embedded.inline.typescript,
  begin: /(\$ts>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.ts } },
  end: /$/,
  contentName: 'source.ts',
  patterns: [{ include: 'source.ts' }],
};

const inlineGeneric: BeginEndRule = {
  key: 'inline-generic',
  scope: scopes.meta.embedded.inline.generic,
  begin: /(\$>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.generic } },
  end: /$/,
  contentName: 'source.js',
  patterns: [{ include: 'source.js' }],
};

const blockJs: BeginEndRule = {
  key: 'block-js',
  scope: scopes.meta.embedded.block.javascript,
  begin: /^(\s*)(\$js>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /^(?!\1\s+\S)/,
  contentName: 'source.js',
  patterns: [
    {
      begin: /^(\1\s+)/,
      end: /$/,
      contentName: 'source.js',
      patterns: [{ include: 'source.js' }],
    },
  ],
};

const blockTs: BeginEndRule = {
  key: 'block-ts',
  scope: scopes.meta.embedded.block.typescript,
  begin: /^(\s*)(\$ts>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.ts } },
  end: /^(?!\1\s+\S)/,
  contentName: 'source.ts',
  patterns: [
    {
      begin: /^(\1\s+)/,
      end: /$/,
      contentName: 'source.ts',
      patterns: [{ include: 'source.ts' }],
    },
  ],
};

const blockGeneric: BeginEndRule = {
  key: 'block-generic',
  scope: scopes.meta.embedded.block.generic,
  begin: /^(\s*)(\$>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.generic } },
  end: /^(?!\1\s+\S)/,
  contentName: 'source.js',
  patterns: [
    {
      begin: /^(\1\s+)/,
      end: /$/,
      contentName: 'source.js',
      patterns: [{ include: 'source.js' }],
    },
  ],
};

export const expressions: Rule = {
  key: 'expressions',
  patterns: [
    inlineJs,
    inlineTs,
    inlineGeneric,
    blockJs,
    blockTs,
    blockGeneric,
  ],
}; 