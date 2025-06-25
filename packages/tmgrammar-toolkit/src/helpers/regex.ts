/**
 * Regex helper utilities for building patterns
 */
import { validateRegex } from '#src/validation';
import type { RegexList as RegexValueList, RegexValue } from '../types.js';

/**
 * Validates a regex source string using the project's validation logic.
 * Throws an error if the regex is invalid.
 * @param pattern - The regex source string to validate.
 * @returns The validated regex source string.
 * @throws {Error} If the regex is invalid.
 */
const createOrThrow = (pattern: string): RegExp => {
  if (!validateRegex(pattern)) {
    throw new Error(`Failed to concatenate regex values: ${pattern}`);
  }
  return new RegExp(pattern);
};

/**
 * Convert regex input to string pattern.
 * @param input - The regex value (string or RegExp).
 * @returns The string pattern of the regex.
 */
const toPattern = (input: RegexValue): string =>
  typeof input === 'string' ? input : input.source;

/**
 * Wrap text with word boundaries.
 * @example bounded('function') // "\\bfunction\\b"
 * @example bounded(/function/) // "\\bfunction\\b"
 * @param text - The text or regex to wrap with word boundaries.
 * @returns The pattern string with word boundaries.
 */
export const bounded = (text: RegexValue): RegExp => {
  const pattern = `\\b${toPattern(text)}\\b`;
  return createOrThrow(pattern);
};

/**
 * Wraps the given content with the specified wrapper pattern on both sides.
 * @example wrap('foo', '"') // "\"foo\""
 * @example wrap(/foo/, /"/) // "\"foo\""
 * @param content - The content to wrap.
 * @param wrapper - The wrapper to use on both sides.
 * @returns The wrapped pattern string.
 */
export const wrap = (content: RegexValue, wrapper: RegexValue): RegExp => {
  const pattern = `${toPattern(wrapper)}${toPattern(content)}${toPattern(wrapper)}`;
  return createOrThrow(pattern);
};

/**
 * Positive lookahead - matches if followed by pattern.
 * @example before('\\(') // "(?=\()"
 * @example before(/\(/) // "(?=\()"
 * @param pattern - The pattern to look ahead for.
 * @returns The lookahead pattern string.
 */
export const before = (pattern: RegexValue): RegExp => {
  const result = `(?=${toPattern(pattern)})`;
  return createOrThrow(result);
};

/**
 * Negative lookahead - matches if NOT followed by pattern.
 * @example notBefore('\\(') // "(?!\()"
 * @example notBefore(/\(/) // "(?!\()"
 * @param pattern - The pattern to not look ahead for.
 * @returns The negative lookahead pattern string.
 */
export const notBefore = (pattern: RegexValue): RegExp => {
  const result = `(?!${toPattern(pattern)})`;
  return createOrThrow(result);
};

/**
 * Positive lookbehind - matches if preceded by pattern.
 * @example after('=') // "(?<=\=)"
 * @example after(/=/) // "(?<=\=)"
 * @param pattern - The pattern to look behind for.
 * @returns The lookbehind pattern string.
 */
export const after = (pattern: RegexValue): RegExp => {
  const result = `(?<=${toPattern(pattern)})`;
  return createOrThrow(result);
};

/**
 * Negative lookbehind - matches if NOT preceded by pattern.
 * @example notAfter('\\\\') // "(?<!\\\\)"
 * @example notAfter(/\\/) // "(?<!\\)"
 * @param pattern - The pattern to not look behind for.
 * @returns The negative lookbehind pattern string.
 */
export const notAfter = (pattern: RegexValue): RegExp => {
  const result = `(?<!${toPattern(pattern)})`;
  return createOrThrow(result);
};

/**
 * Create alternation pattern from array of strings or RegExp.
 * @example oneOf(['if', 'else', 'while']) // "(if|else|while)"
 * @example oneOf('while', ['if', 'else']) // "(while|if|else)"
 * @example oneOf(/if/, /else/, /while/) // "(if|else|while)"
 * @param options - The options to alternate between.
 * @returns The alternation pattern string.
 */
export const oneOf = (...options: RegexValueList): RegExp => {
  const pattern = `(${options.flat().map(toPattern).join('|')})`;
  return createOrThrow(pattern);
};

/**
 * Create word boundary alternation for keywords.
 * @example keywords(['if', 'else']) // "\b(if|else)\b"
 * @example keywords([/if/, /else/]) // "\b(if|else)\b"
 * @param words - The keywords to alternate between.
 * @returns The word boundary alternation pattern string.
 */
export const keywords = (...words: RegexValueList): RegExp => bounded(oneOf(...words));

/**
 * Escape special regex characters.
 * @example escape('test.file') // "test\.file"
 * @param str - The string to escape.
 * @returns The escaped string.
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: The global `escape` have been deprecated for a long time
export const escape = (str: string): string => str.replace(/[.\*\+\?\^\$\{\}\(\)\|\[\]\\]/g, '\\$&');

/**
 * Create optional pattern.
 * @example optional('s') // "s?"
 * @example optional(/s/) // "s?"
 * @param pattern - The pattern to make optional.
 * @returns The optional pattern string.
 */
export const optional = (pattern: RegexValue): RegExp => {
  const result = `${group(toPattern(pattern))}?`;
  return createOrThrow(result);
};

/**
 * Create zero or more pattern.
 * @example zeroOrMore('\\w') // "\w*"
 * @example zeroOrMore(/\w/) // "\w*"
 * @param pattern - The pattern to repeat zero or more times.
 * @returns The zero or more pattern string.
 */
export const zeroOrMore = (pattern: RegexValue): RegExp => {
  const result = `${group(toPattern(pattern))}*`;
  return createOrThrow(result);
};

/**
 * Create one or more pattern.
 * @example oneOrMore('\\d') // "\d+"
 * @example oneOrMore(/\d/) // "\d+"
 * @param pattern - The pattern to repeat one or more times.
 * @returns The one or more pattern string.
 */
export const oneOrMore = (pattern: RegexValue): RegExp => {
  const result = `${group(toPattern(pattern)).source}+`;
  return createOrThrow(result);
};

/**
 * Create capturing group.
 * @example capture('\\w+') // "(\w+)"
 * @example capture(/\w+/) // "(\w+)"
 * @param patterns - The patterns to capture.
 * @returns The capturing group pattern string.
 */
export const capture = (...patterns: RegexValueList): RegExp => {
  const pattern = `(${patterns.flat().map(toPattern).join('')})`;
  return createOrThrow(pattern);
};

/**
 * Create non-capturing group.
 * @example group('\\w+') // "(?:\w+)"
 * @example group(/\w+/) // "(?:\w+)"
 * @param patterns - The patterns to group.
 * @returns The non-capturing group pattern string.
 */
export const group = (...patterns: RegexValueList): RegExp => {
  const pattern = `(?:${patterns.flat().map(toPattern).join('')})`;
  return createOrThrow(pattern);
};

/**
 * Concatenate multiple regex values (RegExp or string) and return a new RegExp.
 *
 * @example concat(/start/, '-', /middle/, '-', /end/) // /(start-middle-end)/
 * @example concat(BOL, /(a)/, /b/, /(?=c)/, EOL) // /(^(a)b(?=c)$)/
 * @param patterns - The patterns to concatenate.
 * @returns The concatenated RegExp.
 */
export const concat = (...patterns: RegexValueList): RegExp => {
  const pattern = `${patterns.flat().map(toPattern).join('')}`;
  return createOrThrow(pattern);
};

/**
 * Alias for {@link r}
 */
export const r = concat;