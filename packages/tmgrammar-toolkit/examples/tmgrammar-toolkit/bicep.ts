/**
 * Bicep TextMate Grammar using tmgrammar-toolkit
 * Converted from bicep.tmlanguage.json
 */

import {
  createGrammar,
  regex,
  scopesFor,
  meta,
  type Grammar,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Rule,
  concat as r,
  notBefore,
  before,
  bounded,
} from '#src';
import { COMMENT } from '#src/terminals';

const scopes = scopesFor('bicep');

// Expression rule (include all expression patterns)
const expression: IncludeRule = {
  key: 'expression',
  patterns: [
    // Patterns will be added at the end of the file
  ]
};

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

// Comments include rule - demonstrates direct rule references in patterns
// Instead of { include: '#line-comment' }, we can now use the rule directly
const comments: IncludeRule = {
  key: 'comments',
  patterns: [
    lineComment,
    blockComment
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
  scope: meta,
  begin: /(?<!\\)(\$\{)/,
  beginCaptures: {
    '1': { scope: scopes.punctuation.definition['template-expression'].begin }
  },
  end: /(\})/,
  endCaptures: {
    '1': { scope: scopes.punctuation.definition['template-expression'].end }
  },
  patterns: [
    expression,
    comments
  ]
};

// String literal rule
const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: scopes.string.quoted.single,
  begin: r(/'/, notBefore(/''/)),
  end: /'/,
  patterns: [
    escapeCharacter,
    stringLiteralSubst
  ]
};


// String verbatim rule
const stringVerbatim: BeginEndRule = {
  key: 'string-verbatim',
  scope: scopes.string.quoted('multi'),
  begin: /'''/,
  end: r(/'''/, notBefore(/'/)),
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
  scope: meta,
  begin: r(/#/, bounded(/[_a-zA-Z-0-9]+/)),
  end: /$/,
  patterns: [
    directiveVariable,
    comments
  ]
};

// Object property key rule
const objectPropertyKey: MatchRule = {
  key: 'object-property-key',
  scope: scopes.variable.other('property'),
  match: r(
    /\b[_$[:alpha:]][_$[:alnum:]]*\b/,
    before(/(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*:/)
  )
};

// Object literal rule
const objectLiteral: BeginEndRule = {
  key: 'object-literal',
  scope: meta,
  begin: /\{/,
  end: /\}/,
  patterns: [
    objectPropertyKey,
    expression,
    comments
  ]
};

// Array literal rule
const arrayLiteral: BeginEndRule = {
  key: 'array-literal',
  scope: meta,
  begin: /\[(?!(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\bfor\b)/,
  end: /]/,
  patterns: [
    expression,
    comments
  ]
};

// Function call rule
const functionCall: BeginEndRule = {
  key: 'function-call',
  scope: meta,
  begin: /(\b[_$[:alpha:]][_$[:alnum:]]*\b)(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\(/,
  beginCaptures: {
    '1': { scope: scopes.entity.name.function }
  },
  end: /\)/,
  patterns: [
    expression,
    comments
  ]
};

// Lambda start rule
const lambdaStart: BeginEndRule = {
  key: 'lambda-start',
  scope: meta,
  begin: /(\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*(,(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)*\)|\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\)|(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)(?=(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*=>)/,
  beginCaptures: {
    '1': {
      scope: meta,
      patterns: [
        identifier,
        comments
      ]
    }
  },
  end: /(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*=>/
};

// Decorator rule
const decorator: BeginEndRule = {
  key: 'decorator',
  scope: meta,
  begin: /@(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*(?=\b[_$[:alpha:]][_$[:alnum:]]*\b)/,
  end: '',
  patterns: [
    expression,
    comments
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

expression.patterns.concat([
  arrayLiteral,
  decorator,
  directive,
  functionCall,
  identifier,
  keyword,
  lambdaStart,
  namedLiteral,
  numericLiteral,
  objectLiteral,
  stringLiteral,
  stringVerbatim,
]);

// Export all rules for testing and reuse if needed by other modules
export {
  arrayLiteral,
  blockComment,
  comments,
  decorator,
  directive,
  directiveVariable,
  escapeCharacter,
  expression,
  functionCall,
  identifier,
  keyword,
  lambdaStart,
  lineComment,
  namedLiteral,
  numericLiteral,
  objectLiteral,
  objectPropertyKey,
  stringLiteral,
  stringLiteralSubst,
  stringVerbatim,
};