/**
 * Utility functions for creating regular expressions.
 * All functions return a new RegExp object.
 */

import type { RegexValue, RegexValueList } from "#src/types";

/**
 * Extract flags from a RegExp object.
 * @param regex - The RegExp to extract flags from.
 * @returns The flags as a string.
 */
const extractFlags = (regex: RegExp): string => {
  return regex.flags;
};

/**
 * Get the most appropriate flags from a list of RegExp inputs.
 * If all inputs are strings, returns empty string.
 * If there are RegExp inputs, combines their flags.
 * @param inputs - Array of RegExp or string inputs.
 * @returns Combined flags string.
 */
const combineFlags = (inputs: RegexValue[]): string => {
  const allFlags = inputs
    .filter((input): input is RegExp => input instanceof RegExp)
    .map(extractFlags)
    .join('');
  
  // Remove duplicates and sort for consistency
  return [...new Set(allFlags)].sort().join('');
};

/**
 * Creates a RegExp object from a string, throwing an error if the pattern is invalid.
 * This is an internal helper to ensure all generated regex patterns are valid.
 * 
 * @param pattern - The regex pattern string.
 * @param flags - Optional flags to apply to the RegExp.
 * @returns A new RegExp object.
 * @internal
 */
const createOrThrow = (pattern: string, flags?: string): RegExp => {
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    throw new Error(`Invalid regex pattern: /${pattern}/${flags || ''}\n${(e as any).message || String(e)}`);
  }
};

/**
 * Converts a string or RegExp to its string pattern.
 * If the input is a string, it's returned as is.
 * If it's a RegExp, its `source` is returned.
 * 
 * @param input - The regex value (string or RegExp).
 * @returns The string pattern of the regex.
 */
const toPattern = (input: RegexValue): string =>
  typeof input === 'string' ? input : input.source;

/**
 * Wrap text with word boundaries.
 * @example bounded('function') // "\\bfunction\\b"
 * @example bounded(/function/) // "\\bfunction\\b"
 * @param text - The pattern to wrap with word boundaries.
 * @returns The pattern string with word boundaries.
 */
export const bounded = (text: RegexValue): RegExp => {
  const pattern = `\\b${toPattern(text)}\\b`;
  const flags = text instanceof RegExp ? extractFlags(text) : '';
  return createOrThrow(pattern, flags);
};

/**
 * Wraps the given content with the specified wrapper pattern on both sides.
 * @example wrap('foo', '"') // "\\"foo\\""
 * @example wrap(/foo/, /"/) // "\\"foo\\""
 * @param content - The content to wrap.
 * @param wrapper - The wrapper to use on both sides.
 * @returns The wrapped pattern string.
 */
export const wrap = (content: RegexValue, wrapper: RegexValue): RegExp => {
  const pattern = `${toPattern(wrapper)}${toPattern(content)}${toPattern(wrapper)}`;
  const flags = combineFlags([content, wrapper]);
  return createOrThrow(pattern, flags);
};

/**
 * Create a positive lookahead `(?=...)` pattern.
 * @example before('\\(') // "(?=\\()"
 * @example before(/\(/) // "(?=\\()"
 * @param pattern - The pattern for the lookahead.
 * @returns The lookahead pattern string.
 */
export const before = (pattern: RegexValue): RegExp => {
  const result = `(?=${toPattern(pattern)})`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create a negative lookahead `(?!...)` pattern.
 * @example notBefore('\\)') // "(?!\\))"
 * @example notBefore(/\)/) // "(?!\\))"
 * @param pattern - The pattern for the negative lookahead.
 * @returns The negative lookahead pattern string.
 */
export const notBefore = (pattern: RegexValue): RegExp => {
  const result = `(?!${toPattern(pattern)})`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create a positive lookbehind `(?<=...)` pattern.
 * @example after('=') // "(?<=\=)"
 * @example after(/=/) // "(?<=\=)"
 * @param pattern - The pattern for the lookbehind.
 * @returns The lookbehind pattern string.
 */
export const after = (pattern: RegexValue): RegExp => {
  const result = `(?<=${toPattern(pattern)})`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create a negative lookbehind `(?<!...)` pattern.
 * @example notAfter('\\\\') // "(?<!\\\\)"
 * @example notAfter(/\\/) // "(?<!\\\\)"
 * @param pattern - The pattern for the negative lookbehind.
 * @returns The negative lookbehind pattern string.
 */
export const notAfter = (pattern: RegexValue): RegExp => {
  const result = `(?<!${toPattern(pattern)})`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create alternation pattern from array of strings or RegExp.
 * @example oneOf(['if', 'else', 'while']) // "(if|else|while)"
 * @example oneOf('if', 'else', 'while') // "(if|else|while)"
 * @example oneOf(/if/, /else/) // "(if|else)"
 * @param options - The patterns to alternate. Can be a single array or multiple arguments.
 * @returns The alternation pattern string.
 */
export const oneOf = (...options: RegexValueList): RegExp => {
  const flatOptions = options.flat();
  const patterns = flatOptions.map(toPattern);
  const pattern = `(${patterns.join('|')})`;
  const flags = combineFlags(flatOptions);
  return createOrThrow(pattern, flags);
};

/**
 * Create word-bounded alternation pattern from array of strings or RegExp.
 * @example keywords(['if', 'else']) // "\\b(if|else)\\b"
 * @example keywords('if', 'else') // "\\b(if|else)\\b"
 * @param words - The keywords to alternate. Can be a single array or multiple arguments.
 * @returns The word-bounded alternation pattern string.
 */
export const keywords = (...words: RegexValueList): RegExp => {
  const flatWords = words.flat();
  const alternation = oneOf(...flatWords).source;
  const pattern = `\\b${alternation}\\b`;
  const flags = combineFlags(flatWords);
  return createOrThrow(pattern, flags);
};

/**
 * Escape special regex characters in a string.
 * @example escape('test.file') // "test\\.file"
 * @param text - The string to escape.
 * @returns The escaped string.
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: this is only a concern in old browsers
export const escape = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Make a pattern optional (zero or one time) `...?`.
 * Note: Appends '?' which might need grouping `(?:...)?` for sequences.
 * @example optional('s') // "s?"
 * @example optional(/s/) // "s?"
 * @param pattern - The pattern to make optional.
 * @returns The optional pattern string.
 */
export const optional = (pattern: RegexValue): RegExp => {
  const p = toPattern(pattern);
  const result = p.length > 1 ? `(?:${p})?` : `${p}?`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create zero or more pattern `...*`.
 * Note: Appends '*' which might need grouping `(?:...)*` for sequences.
 * @example zeroOrMore('\\w') // "\\w*"
 * @example zeroOrMore(/\\w/) // "\\w*"
 * @param pattern - The pattern to repeat zero or more times.
 * @returns The zero or more pattern string.
 */
export const zeroOrMore = (pattern: RegexValue): RegExp => {
  const p = toPattern(pattern);
  const result = p.length > 1 ? `(?:${p})*` : `${p}*`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create one or more pattern `...+`.
 * Note: Appends '+' which might need grouping `(?:...)+` for sequences.
 * @example oneOrMore('\\d') // "(?:\\d)+"
 * @example oneOrMore(/\\d/) // "(?:\\d)+"
 * @param pattern - The pattern to repeat one or more times.
 * @returns The one or more pattern string.
 */
export const oneOrMore = (pattern: RegexValue): RegExp => {
  const p = toPattern(pattern);
  const result = p.length > 1 ? `(?:${p})+` : `(?:${p})+`;
  const flags = pattern instanceof RegExp ? extractFlags(pattern) : '';
  return createOrThrow(result, flags);
};

/**
 * Create a capturing group `(...)`.
 * @example capture('\\w+') // "(\\w+)"
 * @example capture('\\w+', '\\s*') // "(\\w+\\s*)"
 * @param patterns - The patterns to include in the group.
 * @returns The capturing group pattern string.
 */
export const capture = (...patterns: RegexValueList): RegExp => {
  const flatPatterns = patterns.flat();
  const pattern = `(${flatPatterns.map(toPattern).join('')})`;
  const flags = combineFlags(flatPatterns);
  return createOrThrow(pattern, flags);
};

/**
 * Create a non-capturing group `(?:...)`.
 * @example group('\\w+') // "(?:\\w+)"
 * @example group('\\w+', '\\s*') // "(?:\\w+\\s*)"
 * @param patterns - The patterns to include in the group.
 * @returns The non-capturing group pattern string.
 */
export const group = (...patterns: RegexValueList): RegExp => {
  const flatPatterns = patterns.flat();
  const pattern = `(?:${flatPatterns.map(toPattern).join('')})`;
  const flags = combineFlags(flatPatterns);
  return createOrThrow(pattern, flags);
};

/**
 * Concatenate multiple regex values (RegExp or string) and return a new RegExp.
 * The result is wrapped in a non-capturing group `(?:...)` for atomicity.
 * This is useful for combining multiple fragments into a single logical unit.
 * 
 * @example concat('a', /b/, 'c') // "(?:abc)"
 * @param patterns - The patterns to concatenate.
 * @returns The concatenated RegExp.
 */
export const concat = (...patterns: RegexValueList): RegExp => {
  const flatPatterns = patterns.flat();
  const pattern = `(${flatPatterns.map(toPattern).join('')})`;
  const flags = combineFlags(flatPatterns);
  return createOrThrow(pattern, flags);
};

/**
 * Alias for `concat` function.
 */
export const r = concat;