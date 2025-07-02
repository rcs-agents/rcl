/**
 * Simple Language Grammar - TMGrammar Toolkit Example
 * 
 * This example demonstrates the core features of tmgrammar-toolkit:
 * • Type-safe scopes with scopesFor
 * • Pre-built terminal patterns
 * • Regex helpers for readable patterns
 * • Clean grammar creation
 */

import { createGrammar, scopesFor, regex, type Grammar } from '#src';
import { COMMENT, NUM, ID } from '#src/terminals';

// 1. Create type-safe scopes for your language
const scopes = scopesFor(
  { suffix: 'simple', allowScopeExtension: false },
  { custom: { emphasis: null } }
);

// 2. Define patterns using helpers and terminals

// Keywords using regex helper
const keywords = {
  key: 'keywords',
  scope: scopes.keyword.control,
  match: regex.keywords(['if', 'else', 'while', 'for', 'function', 'return'])
};

// Line comments using terminal pattern
const lineComment = {
  key: 'line-comment',
  scope: scopes.comment.line.double_slash,
  match: regex.concat(COMMENT.SLASHES, /.*$/)
};

// Numbers using terminal pattern
const numbers = {
  key: 'numbers',
  scope: scopes.constant.numeric,
  match: NUM.DEC  // Handles: 123, 123.45, 1.23e-4
};

// Strings with escape sequences
const strings = {
  key: 'strings',
  scope: scopes.string.quoted.double,
  begin: /"/,
  end: /"/,
  patterns: [
    {
      key: 'string-escape',
      scope: scopes.constant.character.escape,
      match: /\\./
    }
  ]
};

// Identifiers using terminal pattern
const identifiers = {
  key: 'identifiers',
  scope: scopes.variable.other.readwrite,
  match: ID  // Standard [a-zA-Z_][a-zA-Z0-9_]* pattern
};

// Custom emphasis pattern
const emphasis = {
  key: 'emphasis',
  scope: scopes.custom.emphasis,
  match: /!+/ 
};

// 3. Create the complete grammar
export const simpleGrammar: Grammar = createGrammar(
  'Simple Language',
  'source.simple',
  ['simple'],
  [
    lineComment,
    keywords,
    strings,
    numbers,
    emphasis,
    identifiers
  ]
);

export default simpleGrammar; 