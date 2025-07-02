import { test, expect, describe } from 'bun:test';
import {
  bounded,
  before,
  notBefore,
  after,
  notAfter,
  oneOf,
  keywords,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: this only apply to browsers
  escape,
  optional,
  zeroOrMore,
  oneOrMore,
  capture,
  group,
  concat
} from './regex.js';

describe('regex helpers', () => {
  describe('bounded', () => {
    test('wraps string with word boundaries', () => {
      expect(bounded('function').source).toBe('\\bfunction\\b');
    });

    test('wraps RegExp with word boundaries', () => {
      expect(bounded(/function/).source).toBe('\\bfunction\\b');
    });

    test('handles complex patterns', () => {
      expect(bounded(/[a-zA-Z_]\w*/).source).toBe('\\b[a-zA-Z_]\\w*\\b');
    });
  });

  describe('lookahead/lookbehind', () => {
    test('before creates positive lookahead', () => {
      expect(before('\\(').source).toBe('(?=\\()');
      expect(before(/\(/).source).toBe('(?=\\()');
    });

    test('notBefore creates negative lookahead', () => {
      expect(notBefore('\\(').source).toBe('(?!\\()');
      expect(notBefore(/\(/).source).toBe('(?!\\()');
    });

    test('after creates positive lookbehind', () => {
      expect(after('=').source).toBe('(?<==)');
      expect(after(/=/).source).toBe('(?<==)');
    });

    test('notAfter creates negative lookbehind', () => {
      expect(notAfter('\\\\').source).toBe('(?<!\\\\)');
      expect(notAfter(/\\/).source).toBe('(?<!\\\\)');
    });
  });

  describe('pattern combination', () => {
    test('oneOf creates alternation from string array', () => {
      expect(oneOf(['if', 'else', 'while']).source).toBe('(if|else|while)');
    });

    test('oneOf creates alternation from RegExp array', () => {
      expect(oneOf([/if/, /else/, /while/]).source).toBe('(if|else|while)');
    });

    test('oneOf handles mixed arrays', () => {
      expect(oneOf(['if', /else/, 'while']).source).toBe('(if|else|while)');
    });

    test('keywords combines oneOf with bounded', () => {
      expect(keywords(['if', 'else']).source).toBe('\\b(if|else)\\b');
      expect(keywords([/if/, /else/]).source).toBe('\\b(if|else)\\b');
    });
  });

  describe('escape', () => {
    test('escapes special regex characters', () => {
      expect(escape('test.file')).toBe('test\\.file');
      expect(escape('(hello)')).toBe('\\(hello\\)');
      expect(escape('[a-z]+')).toBe('\\[a-z\\]\\+');
      expect(escape('$^{}')).toBe('\\$\\^\\{\\}');
    });

    test('leaves regular characters unchanged', () => {
      expect(escape('hello')).toBe('hello');
      expect(escape('123abc')).toBe('123abc');
    });
  });

  describe('quantifiers', () => {
    test('optional adds ? quantifier', () => {
      expect(optional('s').source).toBe('s?');
      expect(optional(/s/).source).toBe('s?');
      expect(optional(/[a-z]/).source).toBe('[a-z]?');
    });

    test('zeroOrMore adds * quantifier', () => {
      expect(zeroOrMore('\\w').source).toBe('\\w*');
      expect(zeroOrMore(/\w/).source).toBe('\\w*');
    });

    test('oneOrMore adds + quantifier', () => {
      expect(oneOrMore('\\d').source).toBe('\\d+');
      expect(oneOrMore(/\d/).source).toBe('\\d+');
    });
  });

  describe('grouping', () => {
    test('capture creates capturing group', () => {
      expect(capture('\\w+').source).toBe('(\\w+)');
      expect(capture(/\w+/).source).toBe('(\\w+)');
    });

    test('group creates non-capturing group', () => {
      expect(group('\\w+').source).toBe('(?:\\w+)');
      expect(group(/\w+/).source).toBe('(?:\\w+)');
    });
  });

  describe('concat', () => {
    test('concatenates RegExp objects', () => {
      const result = concat(/start/, /middle/, /end/);
      expect(result.source).toBe('(startmiddleend)');
    });

    test('handles complex RegExp patterns', () => {
      const result = concat(/\w+/, /\s*/, /=/);
      expect(result.source).toBe('(\\w+\\s*=)');
    });
  });

  describe('real-world combinations', () => {
    test('function declaration pattern', () => {
      const pattern = concat(
        keywords(['function']),
        oneOrMore(/\s/),
        capture(/[a-zA-Z_][a-zA-Z0-9_]*/),
        before(/\s*\(/)
      );
      
      expect(pattern.source).toBe('(\\b(function)\\b\\s+([a-zA-Z_][a-zA-Z0-9_]*)(?=\\s*\\())');
    });

    test('escaped string pattern', () => {
      const pattern = concat(notAfter(/\\/), /"/, notBefore(/"/));
      
      expect(pattern.source).toBe('((?<!\\\\)"(?!"))');
    });

    test('keyword at statement boundary', () => {
      const pattern = concat(
        after(/(^|[\s{};])/),
        keywords(['if', 'while']),
        before(/\s*(\(|{)/)
      );
      
      expect(pattern.source).toBe('((?<=(^|[\\s{};]))\\b(if|while)\\b(?=\\s*(\\(|{))))');
    });
  });
}); 