import { execSync } from 'node:child_process';
import type { DeclarativeTestOptions, SnapshotTestOptions } from './types.js';

/**
 * Create a programmatic tester for the given grammar
 * Uses our existing scope.test.ts utilities for detailed token-by-token testing
 */
export const test = (grammarPath: string, scopeName: string) => {
  const { createTesterFromFile } = require('./programmatic.js');
  return createTesterFromFile(grammarPath, scopeName);
};

/**
 * Run declarative tests using vscode-tmgrammar-test CLI
 * Supports the .test.lang file format with embedded scope assertions
 */
export function declarativeTest(testFiles: string, options: DeclarativeTestOptions = {}) {
  const args = [testFiles];

  if (options.compact) {
    args.push('-c');
  }

  if (options.grammar) {
    args.push('-g', options.grammar);
  }

  if (options.config) {
    args.push('--config', options.config);
  }

  const command = `vscode-tmgrammar-test ${args.join(' ')}`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe']
    });
    return {
      success: true,
      output: result,
      command
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || '',
      command,
      exitCode: error.status
    };
  }
}

/**
 * Run snapshot tests using vscode-tmgrammar-test
 * Generates and compares snapshots of tokenization output
 */
export function snapshot(testFiles: string, options: SnapshotTestOptions = {}) {
  const args = [testFiles];

  if (options.updateSnapshots) {
    args.push('-u');
  }

  if (options.grammar) {
    args.push('-g', options.grammar);
  }

  if (options.config) {
    args.push('--config', options.config);
  }

  if (options.printNotModified) {
    args.push('--printNotModified');
  }

  if (options.expandDiff) {
    args.push('--expandDiff');
  }

  const command = `vscode-tmgrammar-snap ${args.join(' ')}`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe']
    });
    return {
      success: true,
      output: result,
      command
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || '',
      command,
      exitCode: error.status
    };
  }
}
