/**
 * Punctuation TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const keyValueSeparator: MatchRule = {
  key: 'key-value-separator',
  scope: scopes.punctuation.separator.key_value,
  match: /:/,
};

const commaSeparator: MatchRule = {
  key: 'comma-separator',
  scope: scopes.punctuation.separator.comma,
  match: /,/,
};

const arrayBegin: MatchRule = {
  key: 'array-begin',
  scope: scopes.punctuation.definition.array.begin,
  match: /\[/,
};

const arrayEnd: MatchRule = {
  key: 'array-end',
  scope: scopes.punctuation.definition.array.end,
  match: /\]/,
};

const mappingBegin: MatchRule = {
  key: 'mapping-begin',
  scope: scopes.punctuation.definition.mapping.begin,
  match: /\{/,
};

const mappingEnd: MatchRule = {
  key: 'mapping-end',
  scope: scopes.punctuation.definition.mapping.end,
  match: /\}/,
};

const paramsBegin: MatchRule = {
  key: 'params-begin',
  scope: scopes.punctuation.definition.parameters.begin,
  match: /\(/,
};

const paramsEnd: MatchRule = {
  key: 'params-end',
  scope: scopes.punctuation.definition.parameters.end,
  match: /\)/,
};

const arrowOperator: MatchRule = {
  key: 'arrow-operator',
  scope: scopes.keyword.operator.arrow,
  match: /->/,
};

const assignmentOperator: MatchRule = {
  key: 'assignment-operator',
  scope: scopes.keyword.operator.assignment,
  match: /=/,
};

const comparisonOperator: MatchRule = {
  key: 'comparison-operator',
  scope: scopes.keyword.operator.comparison,
  match: /==|!=|<=|>=|<|>/,
};

export const punctuation: Rule = {
  key: 'punctuation',
  patterns: [
    keyValueSeparator,
    commaSeparator,
    arrayBegin,
    arrayEnd,
    mappingBegin,
    mappingEnd,
    paramsBegin,
    paramsEnd,
    arrowOperator,
    assignmentOperator,
    comparisonOperator,
  ],
}; 