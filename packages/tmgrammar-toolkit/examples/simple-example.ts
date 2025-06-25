/**
 * Simple example demonstrating the tmgrammar-toolkit core API
 */

import {
  createGrammar,
  emitJSON,
  scopesFor,
  regex as R,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Grammar,
  type Rule,
  r,
} from '#src';
import { COMMENT, DOT } from '#src/terminals';

const scopes = scopesFor('simple');

// Example 1: Basic patterns using the core API
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line.double_slash,
  match: r(COMMENT.SLASHES, /.*(?=$)/)
};

const stringEscape: MatchRule = {
  key: 'string-escape',
  scope: scopes.constant.character.escape,
  match: DOT
};

const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: scopes.string.quoted.double,
  begin: '"',
  end: '"',
  patterns: [
    stringEscape
  ]
};

const keywords: MatchRule = {
  key: 'keywords',
  scope: scopes.keyword.control,
  match: R.keywords(['if', 'else', 'for', 'while', 'function'])
};

const numbers: MatchRule = {
  key: 'numbers',
  scope: scopes.constant.numeric.float,
  match: /\b\d+(\.\d+)?\b/
};

// Example 2: Grouping patterns
const comments: IncludeRule = {
  key: 'comments',
  patterns: [lineComment]
};

const literals: IncludeRule = {
  key: 'literals',
  patterns: [stringLiteral, numbers]
};

const allSimpleRules: Rule[] = [
  lineComment,
  stringEscape,
  stringLiteral,
  keywords,
  numbers,
  comments,
  literals
];

// Example 3: Complete grammar
const simpleGrammar: Grammar = createGrammar(
  'Simple Language',
  'source.simple',
  ['.simple'],
  [
    comments,
    literals,
    keywords
  ],
  {
    repositoryItems: allSimpleRules
  }
);

// Example 4: Generate the grammar
export async function generateSimpleGrammar(): Promise<string> {
  return await emitJSON(simpleGrammar);
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSimpleGrammar()
    .then(json => {
      console.log('Generated Simple Grammar:');
      console.log(json);
    })
    .catch(console.error);
}

export {
  simpleGrammar,
  lineComment,
  stringLiteral,
  stringEscape,
  keywords,
  numbers
}; 