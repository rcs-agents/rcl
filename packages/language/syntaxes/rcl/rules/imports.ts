import type { MatchRule, BeginEndRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

/**
 * Complete import statement
 */
export const importStatement: BeginEndRule = {
  key: 'import-statement',
  begin: R.IMPORT_KW,
  end: /$/,
  scope: 'meta.import.rcl',
  beginCaptures: {
    '0': { scope: 'keyword.control.import.rcl' }
  },
  patterns: [
    { include: '#namespace-path' },
    { include: '#import-alias' },
    { include: '#from-clause' }
  ]
};

/**
 * Namespace import paths with spaces (e.g., "Shared / Common Flows")
 */
export const namespacePath: MatchRule = {
  key: 'namespace-path',
  match: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*(\s*\/\s*[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)*/,
  scope: 'string.unquoted.namespace.rcl'
};

/**
 * Import aliases with "as" keyword
 */
export const importAlias: BeginEndRule = {
  key: 'import-alias',
  begin: R.AS_KW,
  end: /(?=from|$)/,
  scope: 'meta.import-alias.rcl',
  beginCaptures: {
    '0': { scope: 'keyword.control.import.as.rcl' }
  },
  patterns: [
    { include: '#alias-name' }
  ]
};

/**
 * From clauses in imports
 */
export const fromClause: BeginEndRule = {
  key: 'from-clause',
  begin: R.FROM_KW,
  end: /$/,
  scope: 'meta.import-from.rcl',
  beginCaptures: {
    '0': { scope: 'keyword.control.import.from.rcl' }
  },
  patterns: [
    { include: '#import-path' }
  ]
};

/**
 * Import file paths (quoted strings)
 */
export const importPath: MatchRule = {
  key: 'import-path',
  match: R.STRING,
  scope: 'string.quoted.double.rcl'
};

/**
 * All import rules
 */
export const allImports = [
  importStatement,
  namespacePath,
  importAlias,
  fromClause,
  importPath
]; 