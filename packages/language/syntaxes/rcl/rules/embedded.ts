import { scopesFor } from 'tmgrammar-toolkit';
import type { MatchRule, BeginEndRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

/**
 * Single-line embedded JavaScript code
 * Example: $js> console.log('hello')
 */
export const embeddedJavaScriptSingleLine: MatchRule = {
  key: 'embedded-javascript-single-line',
  match: R.EMBEDDED_CODE,
  scope: 'meta.embedded.line.javascript.rcl'
};

/**
 * Single-line embedded TypeScript code
 * Example: $ts> const x: number = 42
 */
export const embeddedTypeScriptSingleLine: MatchRule = {
  key: 'embedded-typescript-single-line',
  match: R.EMBEDDED_CODE,
  scope: 'meta.embedded.line.typescript.rcl'
};

/**
 * Multi-line embedded JavaScript code
 * Example: $js>>> { ... }
 */
export const embeddedJavaScriptMultiLine: BeginEndRule = {
  key: 'embedded-javascript-multi-line',
  begin: R.MULTI_LINE_EXPRESSION_START,
  end: /(?=^(?![ \t]))/m,
  scope: 'meta.embedded.block.javascript.rcl',
  patterns: [
    { match: /.*/, scope: 'source.js' }
  ]
};

/**
 * Multi-line embedded TypeScript code
 * Example: $ts>>> { ... }
 */
export const embeddedTypeScriptMultiLine: BeginEndRule = {
  key: 'embedded-typescript-multi-line',
  begin: R.MULTI_LINE_EXPRESSION_START,
  end: /(?=^(?![ \t]))/m,
  scope: 'meta.embedded.block.typescript.rcl',
  patterns: [
    { match: /.*/, scope: 'source.ts' }
  ]
};

/**
 * All embedded code rules
 */
export const allEmbedded = [
    embeddedJavaScriptSingleLine,
    embeddedTypeScriptSingleLine,
    embeddedJavaScriptMultiLine,
    embeddedTypeScriptMultiLine
]; 