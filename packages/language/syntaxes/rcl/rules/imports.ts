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
    { include: '#whitespace' },
    { include: '#namespace-path' },
    { include: '#namespace-separator' },
    { include: '#import-alias' },
    { include: '#from-clause' }
  ]
};

/**
 * Whitespace in import statements
 */
export const importWhitespace: MatchRule = {
  key: 'whitespace',
  match: /\s+/,
  scope: 'meta.import.rcl'
};

/**
 * Individual namespace components
 */
export const namespacePath: MatchRule = {
  key: 'namespace-path',
  match: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,
  scope: 'entity.name.namespace.rcl'
};

/**
 * Module name after last slash
 */
export const moduleName: MatchRule = {
  key: 'module-name',
  match: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*(\.[a-zA-Z0-9]+)?/,
  scope: 'entity.name.module.rcl'
};

/**
 * Namespace separators (/)
 */
export const namespaceSeparator: MatchRule = {
  key: 'namespace-separator',
  match: /\//,
  scope: 'punctuation.separator.namespace.rcl'
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
    { include: '#whitespace' },
    { include: '#alias-name' }
  ]
};

/**
 * Alias names
 */
export const aliasName: MatchRule = {
  key: 'alias-name',
  match: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,
  scope: 'entity.name.alias.rcl'
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
  importWhitespace,
  namespacePath,
  moduleName,
  namespaceSeparator,
  importAlias,
  aliasName,
  fromClause,
  importPath
]; 