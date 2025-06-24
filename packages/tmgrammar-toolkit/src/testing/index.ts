/**
 * Testing utilities for TextMate grammars
 * 
 * This module provides both programmatic and declarative testing capabilities
 * for TextMate grammars, acting as a facade over vscode-tmgrammar-test.
 */

// Programmatic testing API
export {
  ProgrammaticTester,
  createTesterFromFile,
  createTesterFromContent,
  tokenizeWithGrammar,
} from './programmatic.js';

// Declarative testing helpers  
export {
  test,
  declarativeTest,
  snapshot,
} from './helpers.js';

// Types
export type {
  TokenInfo,
  GrammarInitOptions,
  DeclarativeTestOptions,
  SnapshotTestOptions,
  TestResult,
} from './types.js'; 