/**
 * TypeSpec TextMate Grammar using tmgrammar-toolkit
 * Converted from the original tmlanguage-generator version
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
} from '#src';
import { COMMENT, NUM } from '#src/terminals';

// Create static scopes for TypeSpec (recommended pattern)
const scopes = scopesFor(
  { 
    suffix: 'tsp', 
    allowScopeExtension: false 
  },
  {
    // Custom TypeSpec-specific scopes
    keyword: {
      directive: {
        name: null
      },
      tag: {
        tspdoc: null
      },
      operator: {
        'type.annotation': null,
        optional: null,
        selector: null,
        spread: null
      }
    },
    punctuation: {
      definition: {
        typeparameters: {
          begin: null,
          end: null
        },
        'template-expression': {
          begin: null,
          end: null
        }
      },
      squarebracket: {
        open: null,
        close: null
      },
      curlybrace: {
        open: null,
        close: null
      },
      parenthesis: {
        open: null,
        close: null
      },
      hashcurlybrace: {
        open: null
      },
      hashsquarebracket: {
        open: null
      },
      comma: null
    },
    variable: {
      name: null
    }
  }
);

// Pattern constants for TypeSpec
const identifierStart = "[_$[:alpha:]]";
const identifierContinue = "[_$[:alnum:]]";
const beforeIdentifier = `(?=(${identifierStart}|\`))`;
const escapedIdentifier = "`(?:[^`\\\\]|\\\\.)*`";
const simpleIdentifier = `\\b${identifierStart}${identifierContinue}*\\b`;
const identifier = `${simpleIdentifier}|${escapedIdentifier}`;
const qualifiedIdentifier = `\\b${identifierStart}(?:${identifierContinue}|\\.${identifierStart})*\\b`;
const stringPattern = '\\"(?:[^\\"\\\\]|\\\\.)*\\"';
const modifierKeyword = `\\b(?:extern)\\b`;
const statementKeyword = `\\b(?:namespace|model|op|using|import|enum|alias|union|interface|dec|fn)\\b`;
const universalEnd = `(?=,|;|@|\\)|\\}|${modifierKeyword}|${statementKeyword})`;
const universalEndExceptComma = `(?=;|@|\\)|\\}|${modifierKeyword}|${statementKeyword})`;
const expressionEnd = `(?=,|;|@|\\)|\\}|=|${statementKeyword})`;

// Complex number pattern for TypeSpec
const hexNumber = "\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$)";
const binaryNumber = "\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$)";
const decimalNumber =
  "(?<!\\$)(?:" +
  "(?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1.1E+3
  "(?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1.E+3
  "(?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // .1E+3
  "(?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1E+3
  "(?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|" + // 1.1
  "(?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|" + // 1.
  "(?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|" + // .1
  "(?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))" + // 1
  ")(?!\\$)";
const anyNumber = `(?:${hexNumber}|${binaryNumber}|${decimalNumber})`;

// Forward declarations for circular references
const expression: IncludeRule = {
  key: "expression",
  patterns: [] // Will be populated later
};

const statement: IncludeRule = {
  key: "statement", 
  patterns: [] // Will be populated later
};

// Comments
const lineComment: MatchRule = {
  key: "line-comment",
  scope: scopes.comment.line.double_slash,
  match: "//.*$"
};

const blockComment: BeginEndRule = {
  key: "block-comment",
  scope: scopes.comment.block,
  begin: /\/\*/,
  end: /\*\//
};

const docCommentParam: MatchRule = {
  key: "doc-comment-param-tag",
  scope: scopes.comment.block,
  match: new RegExp(`((@)(?:param|template|prop))\\s+(${identifier})\\b`),
  captures: {
    "1": { scope: scopes.keyword.tag.tspdoc },
    "2": { scope: scopes.keyword.tag.tspdoc },
    "3": { scope: scopes.variable.name }
  }
};

const docCommentReturn: MatchRule = {
  key: "doc-comment-return-tag",
  scope: scopes.comment.block,
  match: /((@)(?:returns))\b/,
  captures: {
    "1": { scope: scopes.keyword.tag.tspdoc },
    "2": { scope: scopes.keyword.tag.tspdoc }
  }
};

const docCommentUnknownTag: MatchRule = {
  key: "doc-comment-unknown-tag",
  scope: scopes.comment.block,
  match: new RegExp(`((@)(?:${identifier}))\\b`),
  captures: {
    "1": { scope: scopes.entity.name.tag },
    "2": { scope: scopes.entity.name.tag }
  }
};

const docCommentBlock: IncludeRule = {
  key: "doc-comment-block",
  patterns: [docCommentParam, docCommentReturn, docCommentUnknownTag]
};

const docComment: BeginEndRule = {
  key: "doc-comment",
  scope: scopes.comment.block,
  begin: /\/\*\*/,
  beginCaptures: {
    "0": { scope: scopes.comment.block }
  },
  end: /\*\//,
  endCaptures: {
    "0": { scope: scopes.comment.block }
  },
  patterns: [docCommentBlock]
};

// Literals
const booleanLiteral: MatchRule = {
  key: "boolean-literal",
  scope: scopes.constant.language,
  match: /\b(true|false)\b/
};

const escapeCharacter: MatchRule = {
  key: "escape-character",
  scope: scopes.constant.character.escape,
  match: /\\./
};

const numericLiteral: MatchRule = {
  key: "numeric-literal",
  scope: scopes.constant.numeric,
  match: new RegExp(anyNumber)
};

// Template expressions
const templateExpression: BeginEndRule = {
  key: "template-expression",
  scope: meta,
  begin: /\$\{/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.definition['template-expression'].begin }
  },
  end: /\}/,
  endCaptures: {
    "0": { scope: scopes.punctuation.definition['template-expression'].end }
  },
  patterns: [expression]
};

// Strings
const stringLiteral: BeginEndRule = {
  key: "string-literal",
  scope: scopes.string.quoted.double,
  begin: /"/,
  end: /"|$/,
  patterns: [templateExpression, escapeCharacter]
};

const tripleQuotedStringLiteral: BeginEndRule = {
  key: "triple-quoted-string-literal",
  scope: scopes.string.quoted.triple,
  begin: /"""/,
  end: /"""/,
  patterns: [templateExpression, escapeCharacter]
};

// Punctuation
const punctuationComma: MatchRule = {
  key: "punctuation-comma",
  scope: scopes.punctuation.comma,
  match: /,/
};

const punctuationAccessor: MatchRule = {
  key: "punctuation-accessor",
  scope: scopes.punctuation.accessor,
  match: /\./
};

const punctuationSemicolon: MatchRule = {
  key: "punctuation-semicolon",
  scope: scopes.punctuation.terminator.statement,
  match: /;/
};

// Operators
const operatorAssignment: MatchRule = {
  key: "operator-assignment",
  scope: scopes.keyword.operator.assignment,
  match: /=/
};

// Identifiers
const identifierExpression: MatchRule = {
  key: "identifier-expression",
  scope: scopes.entity.name.type,
  match: new RegExp(identifier)
};

// Tokens (basic literals and comments)
const token: IncludeRule = {
  key: "token",
  patterns: [
    docComment,
    lineComment,
    blockComment,
    tripleQuotedStringLiteral,
    stringLiteral,
    booleanLiteral,
    numericLiteral
  ]
};

// Expressions
const parenthesizedExpression: BeginEndRule = {
  key: "parenthesized-expression",
  scope: meta,
  begin: /\(/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.parenthesis.open }
  },
  end: /\)/,
  endCaptures: {
    "0": { scope: scopes.punctuation.parenthesis.close }
  },
  patterns: [expression, punctuationComma]
};

const callExpression: BeginEndRule = {
  key: "call-expression",
  scope: meta,
  begin: new RegExp(`(${qualifiedIdentifier})\\s*(\\()`),
  beginCaptures: {
    "1": { scope: scopes.entity.name.function },
    "2": { scope: scopes.punctuation.parenthesis.open }
  },
  end: /\)/,
  endCaptures: {
    "0": { scope: scopes.punctuation.parenthesis.close }
  },
  patterns: [token, expression, punctuationComma]
};

// Directives
const directive: BeginEndRule = {
  key: "directive",
  scope: meta,
  begin: new RegExp(`\\s*(#${simpleIdentifier})`),
  beginCaptures: {
    "1": { scope: scopes.keyword.directive.name }
  },
  end: new RegExp(`$|${universalEnd}`),
  patterns: [stringLiteral, identifierExpression]
};

// Decorators
const decorator: BeginEndRule = {
  key: "decorator",
  scope: meta,
  begin: new RegExp(`((@)${qualifiedIdentifier})`),
  beginCaptures: {
    "1": { scope: scopes.entity.name.tag },
    "2": { scope: scopes.entity.name.tag }
  },
  end: new RegExp(`${beforeIdentifier}|${universalEnd}`),
  patterns: [token, parenthesizedExpression]
};

const augmentDecoratorStatement: BeginEndRule = {
  key: "augment-decorator-statement",
  scope: meta,
  begin: new RegExp(`((@@)${qualifiedIdentifier})`),
  beginCaptures: {
    "1": { scope: scopes.entity.name.tag },
    "2": { scope: scopes.entity.name.tag }
  },
  end: new RegExp(`${beforeIdentifier}|${universalEnd}`),
  patterns: [token, parenthesizedExpression]
};

// Type arguments and parameters
const typeArguments: BeginEndRule = {
  key: "type-arguments",
  scope: meta,
  begin: /</,
  beginCaptures: {
    "0": { scope: scopes.punctuation.definition.typeparameters.begin }
  },
  end: />/,
  endCaptures: {
    "0": { scope: scopes.punctuation.definition.typeparameters.end }
  },
  patterns: [expression, punctuationComma]
};

const typeParameters: BeginEndRule = {
  key: "type-parameters",
  scope: meta,
  begin: /</,
  beginCaptures: {
    "0": { scope: scopes.punctuation.definition.typeparameters.begin }
  },
  end: />/,
  endCaptures: {
    "0": { scope: scopes.punctuation.definition.typeparameters.end }
  },
  patterns: [punctuationComma] // Simplified for this example
};

// Model expressions
const modelExpression: BeginEndRule = {
  key: "model-expression",
  scope: meta,
  begin: /\{/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.curlybrace.open }
  },
  end: /\}/,
  endCaptures: {
    "0": { scope: scopes.punctuation.curlybrace.close }
  },
  patterns: [token, directive, decorator, punctuationSemicolon]
};

// Object literals
const objectLiteral: BeginEndRule = {
  key: "object-literal",
  scope: meta,
  begin: /#\{/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.hashcurlybrace.open }
  },
  end: /\}/,
  endCaptures: {
    "0": { scope: scopes.punctuation.curlybrace.close }
  },
  patterns: [token, directive, punctuationComma]
};

// Tuple expressions
const tupleLiteral: BeginEndRule = {
  key: "tuple-literal",
  scope: meta,
  begin: /#\[/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.hashsquarebracket.open }
  },
  end: /\]/,
  endCaptures: {
    "0": { scope: scopes.punctuation.squarebracket.close }
  },
  patterns: [expression, punctuationComma]
};

const tupleExpression: BeginEndRule = {
  key: "tuple-expression",
  scope: meta,
  begin: /\[/,
  beginCaptures: {
    "0": { scope: scopes.punctuation.squarebracket.open }
  },
  end: /\]/,
  endCaptures: {
    "0": { scope: scopes.punctuation.squarebracket.close }
  },
  patterns: [expression]
};

// Statements (simplified for this example)
const namespaceStatement: BeginEndRule = {
  key: "namespace-statement",
  scope: meta,
  begin: /\b(namespace)\b/,
  beginCaptures: {
    "1": { scope: scopes.keyword.other }
  },
  end: new RegExp(`((?<=\\})|${universalEnd})`),
  patterns: [token, identifierExpression, modelExpression]
};

const modelStatement: BeginEndRule = {
  key: "model-statement",
  scope: meta,
  begin: /\b(model)\b/,
  beginCaptures: {
    "1": { scope: scopes.keyword.other }
  },
  end: new RegExp(`(?<=\\})|${universalEnd}`),
  patterns: [token, typeParameters, modelExpression, expression]
};

const operationStatement: BeginEndRule = {
  key: "operation-statement",
  scope: meta,
  begin: new RegExp(`\\b(op)\\b\\s+(${identifier})`),
  beginCaptures: {
    "1": { scope: scopes.keyword.other },
    "2": { scope: scopes.entity.name.function }
  },
  end: new RegExp(universalEnd),
  patterns: [token, typeParameters, parenthesizedExpression]
};

const importStatement: BeginEndRule = {
  key: "import-statement",
  scope: meta,
  begin: /\b(import)\b/,
  beginCaptures: {
    "1": { scope: scopes.keyword.other }
  },
  end: new RegExp(universalEnd),
  patterns: [token]
};

const usingStatement: BeginEndRule = {
  key: "using-statement",
  scope: meta,
  begin: /\b(using)\b/,
  beginCaptures: {
    "1": { scope: scopes.keyword.other }
  },
  end: new RegExp(universalEnd),
  patterns: [token, identifierExpression, punctuationAccessor]
};

// Collect all rules
const allTypeSpecRules: Rule[] = [
  // Comments
  lineComment,
  blockComment,
  docCommentParam,
  docCommentReturn,
  docCommentUnknownTag,
  docCommentBlock,
  docComment,
  // Literals
  booleanLiteral,
  escapeCharacter,
  numericLiteral,
  // Template expressions
  templateExpression,
  // Strings
  stringLiteral,
  tripleQuotedStringLiteral,
  // Punctuation
  punctuationComma,
  punctuationAccessor,
  punctuationSemicolon,
  // Operators
  operatorAssignment,
  // Identifiers
  identifierExpression,
  // Tokens
  token,
  // Expressions
  parenthesizedExpression,
  callExpression,
  // Directives
  directive,
  // Decorators
  decorator,
  augmentDecoratorStatement,
  // Type arguments and parameters
  typeArguments,
  typeParameters,
  // Model expressions
  modelExpression,
  // Object literals
  objectLiteral,
  // Tuple expressions
  tupleLiteral,
  tupleExpression,
  // Statements
  namespaceStatement,
  modelStatement,
  operationStatement,
  importStatement,
  usingStatement,
  // Include rules
  expression,
  statement
];

// Populate expression patterns
expression.patterns.push(
  token,
  directive,
  parenthesizedExpression,
  typeArguments,
  objectLiteral,
  tupleLiteral,
  tupleExpression,
  modelExpression,
  callExpression,
  identifierExpression
);

// Populate statement patterns  
statement.patterns.push(
  token,
  directive,
  augmentDecoratorStatement,
  decorator,
  modelStatement,
  namespaceStatement,
  operationStatement,
  importStatement,
  usingStatement,
  punctuationSemicolon
);

// Create the complete TypeSpec grammar
export const grammar: Grammar = createGrammar(
  'TypeSpec',
  'source.tsp',
  ['tsp'],
  [statement],
  {
    repositoryItems: allTypeSpecRules
  }
);

// Export rules for testing and reuse
export {
  // Comments
  lineComment,
  blockComment,
  docComment,
  // Literals
  booleanLiteral,
  numericLiteral,
  // Strings
  stringLiteral,
  tripleQuotedStringLiteral,
  // Expressions
  expression,
  statement,
  // Complex constructs
  modelExpression,
  callExpression,
  typeArguments,
  typeParameters
};

export default grammar;