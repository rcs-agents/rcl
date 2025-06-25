/**
 * Properties TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const commentAsSolePropertyValue: MatchRule = {
  key: 'commentAsSolePropertyValue',
  match: /\G\s*(#.*)$/,
  captures: { '1': { scope: scopes.comment.line.number_sign } },
};

const propertyValueIsSingleLineExpressionOrPrimitive: BeginEndRule = {
  key: 'propertyValueIsSingleLineExpressionOrPrimitive',
  scope: scopes.meta.value.singleline,
  begin: /\G\s*/,
  end: /(?=#)|$/,
  patterns: [
    { include: '#expressions' },
    { include: '#keywords' },
    { include: '#primitives' },
  ],
};

const propertyValueIsMultilineStarterLine: MatchRule = {
  key: 'propertyValueIsMultilineStarterLine',
  scope: scopes.meta.value.multiline_indicator_line,
  match: /\G\s*(\|[+-]?[|+]?)\s*(?:#.*)?$/,
  captures: {
    '1': { scope: scopes.punctuation.definition.string.multiline.begin },
    '2': { scope: scopes.comment.line.number_sign },
  },
};

const propertyValueIsMultilineEmbeddedExpression: BeginEndRule = {
  key: 'propertyValueIsMultilineEmbeddedExpression',
  scope: scopes.meta.value.multiline_embedded,
  begin: /\G\s*(\$(?:js|ts|)>>>)\s*(?:(#.*))?$/,
  beginCaptures: {
    '1': { scope: scopes.keyword.control.embedded.marker.multiline },
    '2': { scope: scopes.comment.line.number_sign },
  },
  end: /^(?!\s+\S)/,
  patterns: [
    {
      key: 'embedded-block-content',
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
};

const multilineContentLines: MatchRule = {
  key: 'multilineContentLines',
  scope: scopes.string.quoted.multiline.content,
  match: /^\s+.*$/,
};

const endOfLineComment: MatchRule = {
  key: 'endOfLineComment',
  match: /\s*(#.*)$/,
  captures: {
    '1': { scope: scopes.comment.line.number_sign.rcl },
  },
};

const propertyAssignmentLine: BeginEndRule = {
  key: 'propertyAssignmentLine',
  scope: scopes.meta.property.assignment,
  begin: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*(:)(?!\S)/,
  beginCaptures: {
    '1': { scope: scopes.punctuation.whitespace.leading },
    '2': { scope: scopes.variable.other.property },
    '3': { scope: scopes.punctuation.separator.key_value },
  },
  end: /^(?=\S)|^(?=\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:)/,
  patterns: [
    commentAsSolePropertyValue,
    propertyValueIsMultilineStarterLine,
    propertyValueIsMultilineEmbeddedExpression,
    propertyValueIsSingleLineExpressionOrPrimitive,
    multilineContentLines,
    endOfLineComment,
  ],
};

export const properties: Rule = {
  key: 'properties',
  patterns: [
    propertyAssignmentLine,
  ],
}; 