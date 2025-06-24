/**
 * Simple example demonstrating the tmgrammar-toolkit core API
 */

import { 
  createGrammar, 
  emitJSON, 
  regex, 
  scopes,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Grammar
} from '../src/index.js';

// Example 1: Basic patterns using the core API
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line['double-slash']('simple'),
  match: `//.*${regex.before('$')}`
};

const stringLiteral: BeginEndRule = {
  key: 'string-literal',
  scope: 'string.quoted.double.simple',
  begin: '"',
  end: '"',
  patterns: [
    {
      key: 'string-escape',
      scope: 'constant.character.escape.simple',
      match: '\\\\.'
    } as MatchRule
  ]
};

const keywords: MatchRule = {
  key: 'keywords',
  scope: scopes.keyword.control('simple'),
  match: regex.keywords(['if', 'else', 'for', 'while', 'function'])
};

const numbers: MatchRule = {
  key: 'numbers',
  scope: 'constant.numeric.decimal.simple',
  match: '\\b\\d+(\\.\\d+)?\\b'
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

// Example 3: Complete grammar
const simpleGrammar: Grammar = createGrammar(
  'Simple Language',
  'source.simple',
  ['.simple'],
  [
    comments,
    literals,
    keywords
  ]
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
  keywords,
  numbers
}; 