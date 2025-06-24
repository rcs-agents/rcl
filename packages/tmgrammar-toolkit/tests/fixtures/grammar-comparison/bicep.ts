/**
 * Bicep TextMate Grammar using tmgrammar-toolkit
 * Converted from bicep.tmlanguage.json
 */

import {
  createGrammar,
  regex,
  scopesFor,
  type Grammar,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Rule
} from '#src';
import { NUM, COMMENT, ID } from '#src/terminals';

const scopes = scopesFor('bicep');

// Line comment rule
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line.double_slash,
  match: `${COMMENT.SLASHES}.*(?=$)`
};

// Block comment rule
const blockComment: BeginEndRule = {
  key: 'block-comment',
  scope: scopes.comment.block,
  begin: /\/\*/,
  end: /\*\//
};

// Comments include rule
const comments: IncludeRule = {
  key: 'comments',
  patterns: [
    { include: '#line-comment' },
    { include: '#block-comment' }
  ]
};

// Numeric literal rule
const numericLiteral: MatchRule = {
  key: 'numeric-literal',
  scope: scopes.constant.numeric,
  match: /[0-9]+/
};

// Named literal rule (true, false, null)
const namedLiteral: MatchRule = {
  key: 'named-literal',
  scope: scopes.constant.language,
  match: regex.keywords('true', 'false', 'null')
};

// Escape character rule for strings
const escapeCharacter: MatchRule = {
  key: 'escape-character',
  scope: scopes.constant.character.escape,
  match: /\\(u\{[0-9A-Fa-f]+\}|n|r|t|\\|'|\$\{)/
};

// String interpolation rule
const stringLiteralSubst: BeginEndRule = {
  key: 'string-literal-subst',
  scope: scopes.meta('string-literal-subst'),
  begin: /(?<!\\)(\$\{)/,
  beginCaptures: {
    '1': { scope: scopes.punctuation.definition.template_expression.begin }
  },
  end: /(\})/,
  endCaptures: {
    '1': { scope: scopes.punctuation.definition.template_expression.end }
  },
  patterns: [
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// String literal rule
const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: scopes.string.quoted.single,
  begin: /'(?!'')/,
  end: /'/,
  patterns: [
    { include: '#escape-character' },
    { include: '#string-literal-subst' }
  ]
};

// String verbatim rule
const stringVerbatim: BeginEndRule = {
  key: 'string-verbatim',
  scope: scopes.string.quoted('multi'),
  begin: /'''/,
  end: /'''(?!')/,
  patterns: []
};

// Keyword rule
const keyword: MatchRule = {
  key: 'keyword',
  scope: scopes.keyword.control('declaration'),
  match: regex.keywords([
    'metadata', 'targetScope', 'resource', 'module', 'param', 'var', 'output', 
    'for', 'in', 'if', 'existing', 'import', 'as', 'type', 'with', 'using', 
    'extends', 'func', 'assert', 'extension'
  ])
};

// Identifier rule
const identifier: MatchRule = {
  key: 'identifier',
  scope: scopes.variable.other.readwrite,
  match: regex.concat(
    /\b[_$[:alpha:]][_$[:alnum:]]*\b/,
    regex.notBefore(/(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\(/)
  )
};

// Directive variable rule
const directiveVariable: MatchRule = {
  key: 'directive-variable',
  scope: scopes.keyword.control('declaration'),
  match: /\b[_a-zA-Z-0-9]+\b/
};

// Directive rule
const directive: BeginEndRule = {
  key: 'directive',
  scope: scopes.meta('directive'),
  begin: /#\b[_a-zA-Z-0-9]+\b/,
  end: /$/,
  patterns: [
    { include: '#directive-variable' },
    { include: '#comments' }
  ]
};

// Object property key rule
const objectPropertyKey: MatchRule = {
  key: 'object-property-key',
  scope: scopes.variable.other('property'),
  match: regex.concat(
    /\b[_$[:alpha:]][_$[:alnum:]]*\b/,
    regex.before(/(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*:/)
  )
};

// Object literal rule
const objectLiteral: BeginEndRule = {
  key: 'object-literal',
  scope: scopes.meta('object-literal'),
  begin: /\{/,
  end: /\}/,
  patterns: [
    { include: '#object-property-key' },
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// Array literal rule
const arrayLiteral: BeginEndRule = {
  key: 'array-literal',
  scope: scopes.meta('array-literal'),
  begin: /\[(?!(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\bfor\b)/,
  end: /]/,
  patterns: [
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// Function call rule
const functionCall: BeginEndRule = {
  key: 'function-call',
  scope: scopes.meta('function-call'),
  begin: /(\b[_$[:alpha:]][_$[:alnum:]]*\b)(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\(/,
  beginCaptures: {
    '1': { scope: scopes.entity.name.function }
  },
  end: /\)/,
  patterns: [
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// Lambda start rule
const lambdaStart: BeginEndRule = {
  key: 'lambda-start',
  scope: scopes.meta('lambda-start'),
  begin: /(\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*(,(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)*\)|\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\)|(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)(?=(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*=>)/,
  beginCaptures: {
    '1': {
      scope: scopes.meta('undefined'),
      patterns: [
        { include: '#identifier' },
        { include: '#comments' }
      ]
    }
  },
  end: /(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*=>/
};

// Decorator rule
const decorator: BeginEndRule = {
  key: 'decorator',
  scope: scopes.meta('decorator'),
  begin: /@(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*(?=\b[_$[:alpha:]][_$[:alnum:]]*\b)/,
  end: '',
  patterns: [
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// Expression rule (include all expression patterns)
const expression: IncludeRule = {
  key: 'expression',
  patterns: [
    { include: '#string-literal' },
    { include: '#string-verbatim' },
    { include: '#numeric-literal' },
    { include: '#named-literal' },
    { include: '#object-literal' },
    { include: '#array-literal' },
    { include: '#keyword' },
    { include: '#identifier' },
    { include: '#function-call' },
    { include: '#decorator' },
    { include: '#lambda-start' },
    { include: '#directive' }
  ]
};

const allBicepRules: Rule[] = [
  lineComment,
  blockComment,
  comments,
  numericLiteral,
  namedLiteral,
  escapeCharacter,
  stringLiteralSubst,
  stringLiteral,
  stringVerbatim,
  keyword,
  identifier,
  directiveVariable,
  directive,
  objectPropertyKey,
  objectLiteral,
  arrayLiteral,
  functionCall,
  lambdaStart,
  decorator,
  expression
];

// Create the complete Bicep grammar
export const grammar: Grammar = createGrammar(
  'Bicep',
  'source.bicep',
  ['.bicep', '.bicepparam'],
  [
    expression, // Main patterns are still the top-level rules
    comments
  ],
  {
    repositoryItems: allBicepRules // Provide all defined rules for the repository
  }
);

// Export all rules for testing and reuse if needed by other modules
export {
  lineComment,
  blockComment,
  comments,
  numericLiteral,
  namedLiteral,
  escapeCharacter,
  stringLiteralSubst,
  stringLiteral,
  stringVerbatim,
  keyword,
  identifier,
  directiveVariable,
  directive,
  objectPropertyKey,
  objectLiteral,
  arrayLiteral,
  functionCall,
  lambdaStart,
  decorator,
  expression
};