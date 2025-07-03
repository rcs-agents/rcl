import { createGrammar } from '../../../src/factory.js';
import { scopes } from '../../../src/scopes/index.js';
import type { MatchRule, BeginEndRule } from '../../../src/types.js';

const headingRule: MatchRule = {
  key: 'heading',
  match: /^(#{1,6})\s+(.+)$/,
  scope: scopes.markup.heading,
  captures: {
    1: { scope: scopes.punctuation.definition },
    2: { scope: scopes.entity.name.section }
  }
};

const boldRule: BeginEndRule = {
  key: 'bold',
  begin: /\*\*/,
  end: /\*\*/,
  scope: scopes.markup.bold,
  beginCaptures: {
    0: { scope: scopes.punctuation.definition }
  },
  endCaptures: {
    0: { scope: scopes.punctuation.definition }
  }
};

const italicRule: BeginEndRule = {
  key: 'italic',
  begin: /\*/,
  end: /\*/,
  scope: scopes.markup.italic,
  beginCaptures: {
    0: { scope: scopes.punctuation.definition }
  },
  endCaptures: {
    0: { scope: scopes.punctuation.definition }
  }
};

const codeSpanRule: BeginEndRule = {
  key: 'code-span',
  begin: /`/,
  end: /`/,
  scope: scopes.markup.raw.inline
};

const codeBlockRule: BeginEndRule = {
  key: 'code-block',
  begin: /^```(\w*)?$/,
  end: /^```$/,
  scope: scopes.markup.raw.block,
  beginCaptures: {
    1: { scope: scopes.entity.name.tag }
  }
};

const linkRule: MatchRule = {
  key: 'link',
  match: /\[([^\]]+)\]\(([^)]+)\)/,
  scope: scopes.meta.link,
  captures: {
    1: { scope: scopes.string.other },
    2: { scope: scopes.markup.underline }
  }
};

const listRule: MatchRule = {
  key: 'list',
  match: /^(\s*)([-*+]|\d+\.)\s+/,
  scope: scopes.markup.list,
  captures: {
    2: { scope: scopes.punctuation.definition }
  }
};

const blockquoteRule: MatchRule = {
  key: 'blockquote',
  match: /^>\s*/,
  scope: scopes.markup.quote,
  captures: {
    0: { scope: scopes.punctuation.definition }
  }
};

export const grammar = createGrammar(
  'Markdown Basic',
  'text.html.markdown.basic',
  ['md', 'markdown'],
  [
    headingRule,
    codeBlockRule,
    codeSpanRule,
    boldRule,
    italicRule,
    linkRule,
    listRule,
    blockquoteRule
  ],
  {
    repositoryItems: [
      headingRule,
      codeBlockRule,
      codeSpanRule,
      boldRule,
      italicRule,
      linkRule,
      listRule,
      blockquoteRule
    ]
  }
);