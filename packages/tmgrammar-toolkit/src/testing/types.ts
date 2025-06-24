/**
 * Options for declarative testing with vscode-tmgrammar-test
 */

import type { Grammar } from "#src/types";

export interface DeclarativeTestOptions {
  /** Display output in compact format for VSCode problem matchers */
  compact?: boolean;
  /** Path to grammar file */
  grammar?: string;
  /** Path to language configuration (package.json) */
  config?: string;
}
/**
 * Options for snapshot testing with vscode-tmgrammar-snap
 */

export interface SnapshotTestOptions {
  /** Update snapshot files with new changes */
  updateSnapshots?: boolean;
  /** Path to grammar file */
  grammar?: string;
  /** Path to language configuration (package.json) */
  config?: string;
  /** Include not modified scopes in output */
  printNotModified?: boolean;
  /** Produce each diff on two lines prefixed with "++" and "--" */
  expandDiff?: boolean;
}
/**
 * Result of running a test command
 */

export interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  command: string;
  exitCode?: number;
}

/**
 * Token information extracted from grammar tokenization
 */
export interface TokenInfo {
  text: string;
  scopes: string[];
  startIndex: number;
  endIndex: number;
  line: number;
}

/**
 * Options for initializing a grammar for testing
 */
export interface GrammarInitOptions {
  /** Path to the grammar file (.tmLanguage.json) */
  grammarPath?: string;
  /** Grammar content as object (alternative to grammarPath) */
  grammar?: Grammar;
  /** Grammar scope name (e.g., 'source.rcl') */
  scopeName: string;
  /** Additional grammars for embedded languages */
  embeddedGrammars?: Record<string, any>;
}
