import type { MatchRule, BeginEndRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopeGroups } from '../scopes.js';

/**
 * Regular quoted strings
 * Example: "Hello world"
 */
export const quotedString: MatchRule = {
  key: 'quoted-string',
  match: R.STRING,
  scope: scopeGroups.literals.string.quoted
};

/**
 * Multi-line string with clean chomping (|)
 * Example: |
 *   Line one
 *   Line two
 */
export const multiLineStringClean: BeginEndRule = {
  key: 'multiline-string-clean',
  begin: R.MULTILINE_STR_CLEAN,
  end: /(?=^(?![ \t]))/m,
  scope: scopeGroups.literals.string.unquoted,
  patterns: [
    { match: /.*/, scope: scopeGroups.literals.string.unquoted }
  ]
};

/**
 * Multi-line string with trim chomping (|-)
 * Example: |-
 *   Line one
 *   Line two
 */
export const multiLineStringTrim: BeginEndRule = {
  key: 'multiline-string-trim',
  begin: R.MULTILINE_STR_TRIM,
  end: /(?=^(?![ \t]))/m,
  scope: scopeGroups.literals.string.unquoted,
  patterns: [
    { match: /.*/, scope: scopeGroups.literals.string.unquoted }
  ]
};

/**
 * Multi-line string with preserve chomping (+|)
 * Example: +|
 *   Line one
 *   Line two
 */
export const multiLineStringPreserve: BeginEndRule = {
  key: 'multiline-string-preserve',
  begin: R.MULTILINE_STR_PRESERVE,
  end: /(?=^(?![ \t]))/m,
  scope: scopeGroups.literals.string.unquoted,
  patterns: [
    { match: /.*/, scope: scopeGroups.literals.string.unquoted }
  ]
};

/**
 * Multi-line string with preserve-all chomping (+|+)
 * Example: +|+
 *   Line one
 *   Line two
 */
export const multiLineStringPreserveAll: BeginEndRule = {
  key: 'multiline-string-preserve-all',
  begin: R.MULTILINE_STR_PRESERVE_ALL,
  end: /(?=^(?![ \t]))/m,
  scope: scopeGroups.literals.string.unquoted,
  patterns: [
    { match: /.*/, scope: scopeGroups.literals.string.unquoted }
  ]
};

/**
 * All string rules
 */
export const allStrings = [
    quotedString,
    multiLineStringClean,
    multiLineStringTrim,
    multiLineStringPreserve,
    multiLineStringPreserveAll
]; 