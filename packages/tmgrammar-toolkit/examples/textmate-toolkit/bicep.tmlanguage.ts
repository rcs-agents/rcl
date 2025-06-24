/**
 * Bicep TextMate Grammar using tmgrammar-toolkit
 * Converted from bicep.tmlanguage.json
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

// Line comment rule
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line['double-slash']('bicep'),
  match: `${COMMENT.SLASHES}.*(?=$)`
};

// Block comment rule
const blockComment: BeginEndRule = {
  key: 'block-comment',
  scope: scopes.comment.block('bicep'),
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
  scope: 'constant.numeric.bicep',
  match: /[0-9]+/
};

// Named literal rule (true, false, null)
const namedLiteral: MatchRule = {
  key: 'named-literal',
  scope: 'constant.language.bicep',
  match: regex.keywords('true', 'false', 'null')
};

// Escape character rule for strings
const escapeCharacter: MatchRule = {
  key: 'escape-character',
  scope: 'constant.character.escape.bicep',
  match: /\\(u\{[0-9A-Fa-f]+\}|n|r|t|\\|'|\$\{)/
};

// String interpolation rule
const stringLiteralSubst: BeginEndRule = {
  key: 'string-literal-subst',
  scope: 'meta.string-literal-subst.bicep',
  begin: /(?<!\\)(\$\{)/,
  beginCaptures: {
    '1': { scope: 'punctuation.definition.template-expression.begin.bicep' }
  },
  end: /(\})/,
  endCaptures: {
    '1': { scope: 'punctuation.definition.template-expression.end.bicep' }
  },
  patterns: [
    { include: '#expression' },
    { include: '#comments' }
  ]
};

// String literal rule
const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: 'string.quoted.single.bicep',
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
  scope: 'string.quoted.multi.bicep',
  begin: /'''/,
  end: /'''(?!')/,
  patterns: []
};

// Keyword rule
const keyword: MatchRule = {
  key: 'keyword',
  scope: 'keyword.control.declaration.bicep',
  match: regex.keywords([
    'metadata', 'targetScope', 'resource', 'module', 'param', 'var', 'output', 
    'for', 'in', 'if', 'existing', 'import', 'as', 'type', 'with', 'using', 
    'extends', 'func', 'assert', 'extension'
  ])
};

// Identifier rule
const identifier: MatchRule = {
  key: 'identifier',
  scope: 'variable.other.readwrite.bicep',
  match: regex.concat(
    /\b[_$[:alpha:]][_$[:alnum:]]*\b/,
    regex.notBefore(/(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\(/)
  )
};

// Directive variable rule
const directiveVariable: MatchRule = {
  key: 'directive-variable',
  scope: 'keyword.control.declaration.bicep',
  match: /\b[_a-zA-Z-0-9]+\b/
};

// Directive rule
const directive: BeginEndRule = {
  key: 'directive',
  scope: 'meta.directive.bicep',
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
  scope: 'variable.other.property.bicep',
  match: regex.concat(
    /\b[_$[:alpha:]][_$[:alnum:]]*\b/,
    regex.before(/(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*:/)
  )
};

// Object literal rule
const objectLiteral: BeginEndRule = {
  key: 'object-literal',
  scope: 'meta.object-literal.bicep',
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
  scope: 'meta.array-literal.bicep',
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
  scope: 'meta.function-call.bicep',
  begin: /(\b[_$[:alpha:]][_$[:alnum:]]*\b)(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\(/,
  beginCaptures: {
    '1': { scope: 'entity.name.function.bicep' }
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
  scope: 'meta.lambda-start.bicep',
  begin: /(\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*(,(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)*\)|\((?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\)|(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*\b[_$[:alpha:]][_$[:alnum:]]*\b(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*)(?=(?:[ \t\r\n]|\/\*(?:\*(?!\/)|[^*])*\*\/)*=>)/,
  beginCaptures: {
    '1': {
      scope: 'meta.undefined.bicep',
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
  scope: 'meta.decorator.bicep',
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