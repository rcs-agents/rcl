/**
 * Regex helper utilities for building patterns
 */
import type { RegexList as RegexValueList, RegexValue } from '../types.js';

/**
 * Convert regex input to string pattern
 */
const toPattern = (input: RegexValue): string => 
  typeof input === 'string' ? input : input.source;

/**
 * Wrap text with word boundaries
 * @example bounded('function') // "\\bfunction\\b"
 * @example bounded(/function/) // "\\bfunction\\b"
 */
export const bounded = (text: RegexValue): string => `\\b${toPattern(text)}\\b`;

/**
 * Positive lookahead - matches if followed by pattern
 * @example before('\\(') // "(?=\()"
 * @example before(/\(/) // "(?=\()"
 */
export const before = (pattern: RegexValue): string => `(?=${toPattern(pattern)})`;

/**
 * Negative lookahead - matches if NOT followed by pattern
 * @example notBefore('\\(') // "(?!\()"
 * @example notBefore(/\(/) // "(?!\()"
 */
export const notBefore = (pattern: RegexValue): string => `(?!${toPattern(pattern)})`;

/**
 * Positive lookbehind - matches if preceded by pattern
 * @example after('=') // "(?<=\=)"
 * @example after(/=/) // "(?<=\=)"
 */
export const after = (pattern: RegexValue): string => `(?<=${toPattern(pattern)})`;

/**
 * Negative lookbehind - matches if NOT preceded by pattern
 * @example notAfter('\\\\') // "(?<!\\\\)"
 * @example notAfter(/\\/) // "(?<!\\)"
 */
export const notAfter = (pattern: RegexValue): string => `(?<!${toPattern(pattern)})`;

/**
 * Create alternation pattern from array of strings or RegExp
 * @example oneOf(['if', 'else', 'while']) // "(if|else|while)"
 * @example oneOf('while', ['if', 'else']) // "(while|if|else)"
 * @example oneOf(/if/, /else/, /while/) // "(if|else|while)"
 */
export const oneOf = (...options: RegexValueList): string => `(${options.flat().map(toPattern).join('|')})`;

/**
 * Create word boundary alternation for keywords
 * @example keywords(['if', 'else']) // "\b(if|else)\b"
 * @example keywords([/if/, /else/]) // "\b(if|else)\b"
 */
export const keywords = (...words: RegexValueList): string => bounded(oneOf(...words));

/**
 * Escape special regex characters
 * @example escape('test.file') // "test\.file"
*/
// biome-ignore lint/suspicious/noShadowRestrictedNames: The global `escape` have been deprecated for a long time
export const escape = (str: string): string => str.replace(/[.\*\+\?\^\$\{\}\(\)\|\[\]\\]/g, '\\$&');

/**
 * Create optional pattern
 * @example optional('s') // "s?"
 * @example optional(/s/) // "s?"
 */
export const optional = (pattern: RegexValue): string => `${toPattern(pattern)}?`;

/**
 * Create zero or more pattern
 * @example zeroOrMore('\\w') // "\w*"
 * @example zeroOrMore(/\w/) // "\w*"
 */
export const zeroOrMore = (pattern: RegexValue): string => `${toPattern(pattern)}*`;

/**
 * Create one or more pattern
 * @example oneOrMore('\\d') // "\d+"
 * @example oneOrMore(/\d/) // "\d+"
 */
export const oneOrMore = (pattern: RegexValue): string => `${toPattern(pattern)}+`;

/**
 * Create capturing group
 * @example capture('\\w+') // "(\w+)"
 * @example capture(/\w+/) // "(\w+)"
 */
export const capture = (pattern: RegexValue): string => `(${toPattern(pattern)})`;

/**
 * Create non-capturing group
 * @example group('\\w+') // "(?:\w+)"
 * @example group(/\w+/) // "(?:\w+)"
 */
export const group = (pattern: RegexValue): string => `(?:${toPattern(pattern)})`;

/**
 * Concatenate multiple regex values (RegExp or string) and return a new RegExp
 * 
 * @example concat(/start/, '-', /middle/, '-', /end/) // /(start-middle-end)/
 * @example concat(BOL, /(a)/, /b/, /(?=c)/, EOL) // /(^(a)b(?=c)$)/
 */
export const concat = (...exps: RegexValueList): RegExp => 
  new RegExp(`(${exps.flat().map(toPattern).join('')})`);