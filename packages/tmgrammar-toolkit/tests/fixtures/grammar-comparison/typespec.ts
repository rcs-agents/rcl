/**
 * TypeSpec TextMate Grammar using tmgrammar-toolkit
 * Converted from typescpec.tmlanguage.json
 */

import {
  createGrammar,
  regex,
  scopes,
  type Grammar,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Rule
} from '#src';
import { NUM, COMMENT, ID } from '#src/terminals';

// Basic token patterns
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: 'comment.line.double-slash.tsp',
  match: /\/\/.*$/
};

const blockComment: BeginEndRule = {
  key: 'block-comment',
  scope: 'comment.block.tsp',
  begin: /\/\*/,
  end: /\*\//
};

const docComment: BeginEndRule = {
  key: 'doc-comment',
  scope: 'comment.block.tsp',
  begin: /\/\*\*/,
  beginCaptures: {
    '0': { scope: 'comment.block.tsp' }
  },
  end: /\*\//,
  endCaptures: {
    '0': { scope: 'comment.block.tsp' }
  },
  patterns: [
    { include: '#doc-comment-block' }
  ]
};

const booleanLiteral: MatchRule = {
  key: 'boolean-literal',
  scope: 'constant.language.tsp',
  match: regex.keywords('true', 'false')
};

const numericLiteral: MatchRule = {
  key: 'numeric-literal',
  scope: 'constant.numeric.tsp',
  match: /(?:\b(?<!\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\b(?!\$)|\b(?<!\$)0(?:b|B)[01][01_]*(n)?\b(?!\$)|(?<!\$)(?:(?:\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\b)|(?:\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\b)|(?:\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\b)|(?:\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\b)|(?:\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\b)|(?:\b[0-9][0-9_]*(\\.)(n)?\B)|(?:\B(\\.)[0-9][0-9_]*(n)?\b)|(?:\b[0-9][0-9_]*(n)?\b(?!\\.)))(?!\$))/
};

const escapeCharacter: MatchRule = {
  key: 'escape-character',
  scope: 'constant.character.escape.tsp',
  match: /\\./
};

// String patterns
const templateExpression: BeginEndRule = {
  key: 'template-expression',
  scope: 'meta.template-expression.typespec',
  begin: /\$\{/,
  beginCaptures: {
    '0': { scope: 'punctuation.definition.template-expression.begin.tsp' }
  },
  end: /\}/,
  endCaptures: {
    '0': { scope: 'punctuation.definition.template-expression.end.tsp' }
  },
  patterns: [
    { include: '#expression' }
  ]
};

const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: 'string.quoted.double.tsp',
  begin: /"/,
  end: /"|$/,
  patterns: [
    { include: '#template-expression' },
    { include: '#escape-character' }
  ]
};

const tripleQuotedStringLiteral: BeginEndRule = {
  key: 'triple-quoted-string-literal',
  scope: 'string.quoted.triple.tsp',
  begin: /"""/,
  end: /"""/,
  patterns: [
    { include: '#template-expression' },
    { include: '#escape-character' }
  ]
};

// Identifier pattern
const identifierExpression: MatchRule = {
  key: 'identifier-expression',
  scope: 'entity.name.type.tsp',
  match: /\b[_$[:alpha:]][_$[:alnum:]]*\b|`(?:[^`\\]|\\.)*`/
};

// Punctuation patterns
const punctuationAccessor: MatchRule = {
  key: 'punctuation-accessor',
  scope: 'punctuation.accessor.tsp',
  match: /\./
};

const punctuationComma: MatchRule = {
  key: 'punctuation-comma',
  scope: 'punctuation.comma.tsp',
  match: /,/
};

const punctuationSemicolon: MatchRule = {
  key: 'punctuation-semicolon',
  scope: 'punctuation.terminator.statement.tsp',
  match: /;/
};

const operatorAssignment: MatchRule = {
  key: 'operator-assignment',
  scope: 'keyword.operator.assignment.tsp',
  match: /=/
};

// Directive pattern
const directive: BeginEndRule = {
  key: 'directive',
  scope: 'meta.directive.typespec',
  begin: /\s*(#\b[_$[:alpha:]][_$[:alnum:]]*\b)/,
  beginCaptures: {
    '1': { scope: 'keyword.directive.name.tsp' }
  },
  end: /\$|(?=,|;|@|\)|\}|\b(?:extern)\b|\b(?:namespace|model|op|using|import|enum|alias|union|interface|dec|fn)\b)/,
  patterns: [
    { include: '#string-literal' },
    { include: '#identifier-expression' }
  ]
};

// Doc comment patterns
const docCommentParam: MatchRule = {
  key: 'doc-comment-param',
  scope: 'comment.block.tsp',
  match: /((@)(?:param|template|prop))\s+(\b[_$[:alpha:]][_$[:alnum:]]*\b|`(?:[^`\\]|\\.)*`)\b/,
  captures: {
    '1': { scope: 'keyword.tag.tspdoc' },
    '2': { scope: 'keyword.tag.tspdoc' },
    '3': { scope: 'variable.name.tsp' }
  }
};

const docCommentReturnTag: MatchRule = {
  key: 'doc-comment-return-tag',
  scope: 'comment.block.tsp',
  match: /((@)(?:returns))\b/,
  captures: {
    '1': { scope: 'keyword.tag.tspdoc' },
    '2': { scope: 'keyword.tag.tspdoc' }
  }
};

const docCommentUnknownTag: MatchRule = {
  key: 'doc-comment-unknown-tag',
  scope: 'comment.block.tsp',
  match: /((@)(?:\b[_$[:alpha:]][_$[:alnum:]]*\b|`(?:[^`\\]|\\.)*`))\b/,
  captures: {
    '1': { scope: 'entity.name.tag.tsp' },
    '2': { scope: 'entity.name.tag.tsp' }
  }
};

const docCommentBlock: IncludeRule = {
  key: 'doc-comment-block',
  patterns: [
    { include: '#doc-comment-param' },
    { include: '#doc-comment-return-tag' },
    { include: '#doc-comment-unknown-tag' }
  ]
};

// Token include rule
const token: IncludeRule = {
  key: 'token',
  patterns: [
    { include: '#doc-comment' },
    { include: '#line-comment' },
    { include: '#block-comment' },
    { include: '#triple-quoted-string-literal' },
    { include: '#string-literal' },
    { include: '#boolean-literal' },
    { include: '#numeric-literal' }
  ]
};

// Parenthesized expression
const parenthesizedExpression: BeginEndRule = {
  key: 'parenthesized-expression',
  scope: 'meta.parenthesized-expression.typespec',
  begin: /\(/,
  beginCaptures: {
    '0': { scope: 'punctuation.parenthesis.open.tsp' }
  },
  end: /\)/,
  endCaptures: {
    '0': { scope: 'punctuation.parenthesis.close.tsp' }
  },
  patterns: [
    { include: '#expression' },
    { include: '#punctuation-comma' }
  ]
};

// Call expression
const callExpression: BeginEndRule = {
  key: 'callExpression',
  scope: 'meta.callExpression.typespec',
  begin: /(\b[_$[:alpha:]](?:[_$[:alnum:]]|\.[_$[:alpha:]])*\b)\s*(\()/,
  beginCaptures: {
    '1': { scope: 'entity.name.function.tsp' },
    '2': { scope: 'punctuation.parenthesis.open.tsp' }
  },
  end: /\)/,
  endCaptures: {
    '0': { scope: 'punctuation.parenthesis.close.tsp' }
  },
  patterns: [
    { include: '#token' },
    { include: '#expression' },
    { include: '#punctuation-comma' }
  ]
};

// Type parameters
const typeParameters: BeginEndRule = {
  key: 'type-parameters',
  scope: 'meta.type-parameters.typespec',
  begin: /</,
  beginCaptures: {
    '0': { scope: 'punctuation.definition.typeparameters.begin.tsp' }
  },
  end: />/,
  endCaptures: {
    '0': { scope: 'punctuation.definition.typeparameters.end.tsp' }
  },
  patterns: [
    { include: '#type-parameter' },
    { include: '#punctuation-comma' }
  ]
};

// Type parameter
const typeParameter: BeginEndRule = {
  key: 'type-parameter',
  scope: 'meta.type-parameter.typespec',
  begin: /(\b[_$[:alpha:]][_$[:alnum:]]*\b|`(?:[^`\\]|\\.)*`)/,
  beginCaptures: {
    '1': { scope: 'entity.name.type.tsp' }
  },
  end: /(?=>)|(?=,|;|@|\)|\}|\b(?:extern)\b|\b(?:namespace|model|op|using|import|enum|alias|union|interface|dec|fn)\b)/,
  patterns: [
    { include: '#token' },
    { include: '#type-parameter-constraint' },
    { include: '#type-parameter-default' }
  ]
};

// Type parameter constraint
const typeParameterConstraint: BeginEndRule = {
  key: 'type-parameter-constraint',
  scope: 'meta.type-parameter-constraint.typespec',
  begin: /extends/,
  beginCaptures: {
    '0': { scope: 'keyword.other.tsp' }
  },
  end: /(?=>)|(?=,|;|@|\)|\}|\b(?:extern)\b|\b(?:namespace|model|op|using|import|enum|alias|union|interface|dec|fn)\b)/,
  patterns: [
    { include: '#expression' }
  ]
};

// Type parameter default
const typeParameterDefault: BeginEndRule = {
  key: 'type-parameter-default',
  scope: 'meta.type-parameter-default.typespec',
  begin: /=/,
  beginCaptures: {
    '0': { scope: 'keyword.operator.assignment.tsp' }
  },
  end: /(?=>)|(?=,|;|@|\)|\}|\b(?:extern)\b|\b(?:namespace|model|op|using|import|enum|alias|union|interface|dec|fn)\b)/,
  patterns: [
    { include: '#expression' }
  ]
};

// Expression patterns
const expression: IncludeRule = {
  key: 'expression',
  patterns: [
    { include: '#token' },
    { include: '#directive' },
    { include: '#parenthesized-expression' },
    { include: '#callExpression' },
    { include: '#identifier-expression' }
  ]
};

// Statement pattern (top-level)
const statement: IncludeRule = {
  key: 'statement',
  patterns: [
    { include: '#token' },
    { include: '#directive' },
    { include: '#expression' }
  ]
};

const allTypespecRules: Rule[] = [
  lineComment,
  blockComment,
  docComment,
  booleanLiteral,
  numericLiteral,
  escapeCharacter,
  templateExpression,
  stringLiteral,
  tripleQuotedStringLiteral,
  identifierExpression,
  punctuationAccessor,
  punctuationComma,
  punctuationSemicolon,
  operatorAssignment,
  directive,
  docCommentParam,
  docCommentReturnTag,
  docCommentUnknownTag,
  docCommentBlock,
  token,
  parenthesizedExpression,
  callExpression,
  typeParameters,
  typeParameter,
  typeParameterConstraint,
  typeParameterDefault,
  expression,
  statement
];

// Export patterns for potential reuse and testing
export {
  lineComment,
  blockComment,
  docComment,
  booleanLiteral,
  numericLiteral,
  escapeCharacter,
  templateExpression,
  stringLiteral,
  tripleQuotedStringLiteral,
  identifierExpression,
  punctuationAccessor,
  punctuationComma,
  punctuationSemicolon,
  operatorAssignment,
  directive,
  docCommentParam,
  docCommentReturnTag,
  docCommentUnknownTag,
  docCommentBlock,
  token,
  parenthesizedExpression,
  callExpression,
  typeParameters,
  typeParameter,
  typeParameterConstraint,
  typeParameterDefault,
  expression,
  statement
};

// Create the complete grammar
export const grammar: Grammar = createGrammar(
  'TypeSpec',
  'source.tsp',
  ['tsp'],
  [
    statement
  ],
  {
    repositoryItems: allTypespecRules
  }
);

export default grammar;