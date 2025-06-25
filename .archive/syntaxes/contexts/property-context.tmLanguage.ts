/**
 * Property Context TextMate Grammar
 */

import {
  BeginEndRule,
  MatchRule,
  scopesFor,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const propertyValueComments: Rule = {
  key: 'propertyValueComments',
  patterns: [
    {
      key: 'lineCommentAfterValue',
      match: /\G\s*(#.*)$/,
      captures: {
        '1': { scope: scopes.comment.line.number_sign },
      },
    },
  ],
};

const actionKeywords: Rule = {
  key: 'actionKeywords',
  patterns: [
    {
      key: 'dialActionKeyword',
      scope: scopes.keyword.control.action.dial,
      match: /\bdialAction\b/,
    },
    {
      key: 'richCardKeyword',
      scope: scopes.keyword.control.section.rich_card,
      match: /\brichCard\b/,
    },
    {
      key: 'standaloneCardKeyword',
      scope: scopes.keyword.control.section.standalone_card,
      match: /\bstandaloneCard\b/,
    },
    {
      key: 'replySuggestionKeyword',
      scope: scopes.keyword.control.suggestion.reply,
      match: /\breply\b/,
    },
  ],
};

const propertyValueSingleLine: Rule = {
  key: 'propertyValueSingleLine',
  patterns: [
    {
      key: 'singleLineValue',
      scope: scopes.meta.value.single_line,
      begin: /\G\s*/,
      end: /(?=#)|$/,
      patterns: [
        { include: '#primitives' },
        { include: '#references' },
        { include: '#embedded-code' },
        { include: '#actionKeywords' },
      ],
    },
  ],
};

const propertyValueMultiline: Rule = {
  key: 'propertyValueMultiline',
  patterns: [
    {
      key: 'multilineEmbeddedValue',
      scope: scopes.meta.value.multiline_embedded,
      begin: /\G\s*(\$(?:js|ts|)>>>)\s*(?:(#.*))?$/,
      beginCaptures: {
        '1': { scope: scopes.keyword.control.embedded.marker.multiline },
        '2': { scope: scopes.comment.line.number_sign },
      },
      end: /^(?!\s+\S)/,
      patterns: [
        {
          key: 'embeddedBlockContent',
          scope: scopes.meta.embedded.block.content,
          begin: /^(\s+)/,
          end: /$/,
          beginCaptures: {
            '1': { scope: scopes.punctuation.whitespace.leading.embedded.rcl },
          },
          contentName: 'source.js',
          patterns: [{ include: 'source.js' }],
        },
      ],
    },
  ],
};

const propertyValueMultilineStrings: Rule = {
  key: 'propertyValueMultilineStrings',
  patterns: [
    {
      key: 'multilineStringValue',
      scope: scopes.meta.value.multiline_string,
      match: /\G\s*(\|[+-]?[|+]?)\s*(?:#.*)?$/,
      captures: {
        '1': { scope: scopes.punctuation.definition.string.multiline.begin },
        '2': { scope: scopes.comment.line.number_sign },
      },
    },
  ],
};

const propertyValueMultilineContent: Rule = {
  key: 'propertyValueMultilineContent',
  patterns: [
    {
      key: 'multilineContent',
      scope: scopes.string.quoted.multiline.content,
      match: /^\s+.*$/,
    },
  ],
};

const propertyLevelComments: Rule = {
  key: 'propertyLevelComments',
  patterns: [
    {
      key: 'lineCommentOnPropertyLine',
      match: /\s*(#.*)$/,
      captures: {
        '1': { scope: scopes.comment.line.number_sign },
      },
    },
  ],
};

export const propertyValuePatterns: Rule = {
  key: 'propertyValuePatterns',
  patterns: [
    { include: '#propertyValueComments' },
    { include: '#propertyValueMultiline' },
    { include: '#propertyValueSingleLine' },
    { include: '#propertyValueMultilineStrings' },
    { include: '#propertyValueMultilineContent' },
  ],
};

export const propertyContext: Rule = {
  key: 'propertyContext',
  patterns: [
    {
      key: 'propertyAssignment',
      scope: scopes.meta.property.assignment,
      begin: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*(:)(?!\S)/,
      beginCaptures: {
        '1': { scope: scopes.punctuation.whitespace.leading },
        '2': { scope: scopes.variable.other.property },
        '3': { scope: scopes.punctuation.separator.key_value },
      },
      end: /^(?=\S)|^(?=\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:)|(?=\s*(Config|Defaults|Messages)\b)|(?=\s*(agentConfig|agentDefaults|flow|messages|message|authentication message|transaction message|promotion message|servicerequest message|acknowledge message)\b)/,
      patterns: [
        { include: '#propertyValuePatterns' },
        { include: '#propertyLevelComments' },
      ],
    },
  ],
  repository: {
    propertyValueComments,
    propertyValueSingleLine,
    propertyValueMultiline,
    propertyValueMultilineStrings,
    propertyValueMultilineContent,
    propertyLevelComments,
    actionKeywords,
    propertyValuePatterns,
  },
};