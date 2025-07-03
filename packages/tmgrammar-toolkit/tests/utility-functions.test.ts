import { describe, test, expect } from 'vitest';
import * as regex from '../src/helpers/regex.js';

describe('Utility Functions', () => {
  describe('Regex Helpers', () => {
    describe('bounded', () => {
      test('wraps string with word boundaries', () => {
        const result = regex.bounded('function');
        expect(result.source).toBe('\\bfunction\\b');
      });

      test('wraps RegExp with word boundaries', () => {
        const result = regex.bounded(/function/);
        expect(result.source).toBe('\\bfunction\\b');
      });

      test('works with complex patterns', () => {
        const result = regex.bounded(/if|else|while/);
        expect(result.source).toBe('\\bif|else|while\\b');
      });
    });

    describe('wrap', () => {
      test('wraps content with wrapper on both sides', () => {
        const result = regex.wrap('content', '"');
        expect(result.source).toBe('"content"');
      });

      test('works with RegExp inputs', () => {
        const result = regex.wrap(/content/, /"/);
        expect(result.source).toBe('"content"');
      });

      test('works with complex wrappers', () => {
        const result = regex.wrap(/text/, /\[\]/);
        expect(result.source).toBe('\\[\\]text\\[\\]');
      });
    });

    describe('before (positive lookahead)', () => {
      test('creates positive lookahead pattern', () => {
        const result = regex.before(/\(/);
        expect(result.source).toBe('(?=\\()');
      });

      test('works with RegExp input', () => {
        const result = regex.before(/\(/);
        expect(result.source).toBe('(?=\\()');
      });

      test('works with complex patterns', () => {
        const result = regex.before(/[a-z]+/);
        expect(result.source).toBe('(?=[a-z]+)');
      });
    });

    describe('notBefore (negative lookahead)', () => {
      test('creates negative lookahead pattern', () => {
        const result = regex.notBefore(/\(/);
        expect(result.source).toBe('(?!\\()');
      });

      test('works with RegExp input', () => {
        const result = regex.notBefore(/\(/);
        expect(result.source).toBe('(?!\\()');
      });
    });

    describe('after (positive lookbehind)', () => {
      test('creates positive lookbehind pattern', () => {
        const result = regex.after(/=/);
        expect(result.source).toBe('(?<==)');
      });

      test('works with RegExp input', () => {
        const result = regex.after(/=/);
        expect(result.source).toBe('(?<==)');
      });
    });

    describe('notAfter (negative lookbehind)', () => {
      test('creates negative lookbehind pattern', () => {
        const result = regex.notAfter(/\\/);
        expect(result.source).toBe('(?<!\\\\)');
      });

      test('works with RegExp input', () => {
        const result = regex.notAfter(/\\/);
        expect(result.source).toBe('(?<!\\\\)');
      });
    });

    describe('oneOf (alternation)', () => {
      test('creates alternation from array of strings', () => {
        const result = regex.oneOf(['if', 'else', 'while']);
        expect(result.source).toBe('(if|else|while)');
      });

      test('creates alternation from multiple arguments', () => {
        const result = regex.oneOf('if', 'else', 'while');
        expect(result.source).toBe('(if|else|while)');
      });

      test('works with RegExp inputs', () => {
        const result = regex.oneOf(/if/, /else/, /while/);
        expect(result.source).toBe('(if|else|while)');
      });

      test('handles mixed string and RegExp inputs', () => {
        const result = regex.oneOf('if', /else/, 'while');
        expect(result.source).toBe('(if|else|while)');
      });

      test('handles nested arrays', () => {
        const result = regex.oneOf(['if', 'else'], ['while', 'for']);
        expect(result.source).toBe('(if|else|while|for)');
      });

      test('handles single option', () => {
        const result = regex.oneOf('single');
        expect(result.source).toBe('(single)');
      });

      test('handles empty array', () => {
        const result = regex.oneOf([]);
        expect(result.source).toBe('()');
      });
    });

    describe('keywords', () => {
      test('creates word-bounded alternation', () => {
        const result = regex.keywords(['if', 'else']);
        expect(result.source).toBe('\\b(if|else)\\b');
      });

      test('works with multiple arguments', () => {
        const result = regex.keywords('if', 'else', 'while');
        expect(result.source).toBe('\\b(if|else|while)\\b');
      });

      test('works with RegExp inputs', () => {
        const result = regex.keywords(/if/, /else/);
        expect(result.source).toBe('\\b(if|else)\\b');
      });
    });

    describe('escape', () => {
      test('escapes special regex characters', () => {
        expect(regex.escape('test.file')).toBe('test\\.file');
        expect(regex.escape('a*b+c?')).toBe('a\\*b\\+c\\?');
        expect(regex.escape('^start$')).toBe('\\^start\\$');
        expect(regex.escape('{n,m}')).toBe('\\{n,m\\}');
        expect(regex.escape('(group)')).toBe('\\(group\\)');
        expect(regex.escape('[char]')).toBe('\\[char\\]');
        expect(regex.escape('back\\slash')).toBe('back\\\\slash');
        expect(regex.escape('alt|option')).toBe('alt\\|option');
      });

      test('leaves normal characters unchanged', () => {
        expect(regex.escape('normal')).toBe('normal');
        expect(regex.escape('123abc')).toBe('123abc');
        expect(regex.escape('under_score')).toBe('under_score');
        expect(regex.escape('hyphen-dash')).toBe('hyphen-dash');
      });

      test('handles empty string', () => {
        expect(regex.escape('')).toBe('');
      });
    });

    describe('optional', () => {
      test('makes pattern optional', () => {
        const result = regex.optional(/s/);
        expect(result.source).toBe('s?');
      });

      test('works with RegExp input', () => {
        const result = regex.optional(/s/);
        expect(result.source).toBe('s?');
      });

      test('works with complex patterns', () => {
        const result = regex.optional(/[a-z]+/);
        expect(result.source).toBe('(?:[a-z]+)?');
      });
    });

    describe('zeroOrMore', () => {
      test('creates zero or more quantifier', () => {
        const result = regex.zeroOrMore(/\w/);
        expect(result.source).toBe('(?:\\w)*');
      });

      test('works with RegExp input', () => {
        const result = regex.zeroOrMore(/\w/);
        expect(result.source).toBe('(?:\\w)*');
      });

      test('works with complex patterns', () => {
        const result = regex.zeroOrMore(/[a-z]/);
        expect(result.source).toBe('(?:[a-z])*');
      });
    });

    describe('oneOrMore', () => {
      test('creates one or more quantifier', () => {
        const result = regex.oneOrMore(/\d/);
        expect(result.source).toBe('(?:\\d)+');
      });

      test('works with RegExp input', () => {
        const result = regex.oneOrMore(/\d/);
        expect(result.source).toBe('(?:\\d)+');
      });

      test('works with complex patterns', () => {
        const result = regex.oneOrMore(/[0-9]/);
        expect(result.source).toBe('(?:[0-9])+');
      });
    });

    describe('capture', () => {
      test('creates capturing group from single pattern', () => {
        const result = regex.capture(/\w+/);
        expect(result.source).toBe('(\\w+)');
      });

      test('creates capturing group from multiple patterns', () => {
        const result = regex.capture(/\w+/, /\s*/, /\d+/);
        expect(result.source).toBe('(\\w+\\s*\\d+)');
      });

      test('works with RegExp inputs', () => {
        const result = regex.capture(/\w+/, /\s*/, /\d+/);
        expect(result.source).toBe('(\\w+\\s*\\d+)');
      });

      test('handles arrays of patterns', () => {
        const result = regex.capture([/\w+/, /\s*/], /\d+/);
        expect(result.source).toBe('(\\w+\\s*\\d+)');
      });
    });

    describe('group', () => {
      test('creates non-capturing group from single pattern', () => {
        const result = regex.group(/\w+/);
        expect(result.source).toBe('(?:\\w+)');
      });

      test('creates non-capturing group from multiple patterns', () => {
        const result = regex.group(/\w+/, /\s*/, /\d+/);
        expect(result.source).toBe('(?:\\w+\\s*\\d+)');
      });

      test('works with RegExp inputs', () => {
        const result = regex.group(/\w+/, /\s*/, /\d+/);
        expect(result.source).toBe('(?:\\w+\\s*\\d+)');
      });

      test('handles arrays of patterns', () => {
        const result = regex.group([/\w+/, /\s*/], /\d+/);
        expect(result.source).toBe('(?:\\w+\\s*\\d+)');
      });
    });

    describe('concat', () => {
      test('concatenates multiple patterns', () => {
        const result = regex.concat('start', '-', 'end');
        expect(result.source).toBe('(start-end)');
      });

      test('works with RegExp inputs', () => {
        const result = regex.concat(/start/, /-/, /end/);
        expect(result.source).toBe('(start-end)');
      });

      test('handles mixed inputs', () => {
        const result = regex.concat('^', /\w+/, '$');
        expect(result.source).toBe('(^\\w+$)');
      });

      test('handles arrays of patterns', () => {
        const result = regex.concat(['^', /\w+/], '$');
        expect(result.source).toBe('(^\\w+$)');
      });
    });

    describe('r (alias for concat)', () => {
      test('works as alias for concat', () => {
        const concatResult = regex.concat('a', 'b', 'c');
        const rResult = regex.r('a', 'b', 'c');
        expect(rResult.source).toBe(concatResult.source);
      });
    });
  });

  describe('Error Handling', () => {
    test('throws error for invalid regex patterns', () => {
      expect(() => regex.bounded('[invalid')).toThrow(/Invalid regex pattern/);
      expect(() => regex.wrap('[invalid', '"')).toThrow(/Invalid regex pattern/);
      expect(() => regex.before('[invalid')).toThrow(/Invalid regex pattern/);
      expect(() => regex.notBefore('[invalid')).toThrow(/Invalid regex pattern/);
      expect(() => regex.after('[invalid')).toThrow(/Invalid regex pattern/);
      expect(() => regex.notAfter('[invalid')).toThrow(/Invalid regex pattern/);
    });

    test('provides helpful error messages', () => {
      try {
        regex.bounded('[invalid');
      } catch (e) {
        expect(e.message).toContain('Invalid regex pattern');
        expect(e.message).toContain('/\\b[invalid\\b/');
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string inputs', () => {
      expect(regex.bounded('').source).toBe('\\b\\b');
      expect(regex.wrap('', '').source).toBe('(?:)');
      expect(regex.oneOf('').source).toBe('()');
      expect(regex.capture('').source).toBe('()');
      expect(regex.group('').source).toBe('(?:)');
    });

    test('handles special regex characters in content', () => {
      const escaped = regex.escape('.*+?^${}()|[]\\');
      expect(regex.bounded(escaped).source).toBe('\\b\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\\\b');
    });

    test('handles unicode characters', () => {
      const result = regex.bounded(/你好/u);
      expect(
        result.source == '\\b你好\\b' ||
        // when running the tests via `bun test` the result is '\\b\\u4F60\\u597D\\b'
        result.source == '\\b\\u4F60\\u597D\\b'
      ).toBe(true);
      expect(result.flags).toBe('u');
      // Note: \b doesn't work with Unicode chars, so test with ASCII boundaries instead
      const asciiTest = regex.bounded(/hello/u);
      expect(asciiTest.test('hello')).toBe(true);
    });

    test('handles very long patterns', () => {
      const longString = 'a'.repeat(10000);
      const result = regex.concat(longString);
      expect(result.source).toBe(`(${longString})`);
    });
  });

  describe('Flag Preservation', () => {
    const flagsToTest: { flag: string; property: keyof RegExp }[] = [
      { flag: 'g', property: 'global' },
      { flag: 'i', property: 'ignoreCase' },
      { flag: 'm', property: 'multiline' },
      { flag: 's', property: 'dotAll' },
      { flag: 'u', property: 'unicode' },
      { flag: 'y', property: 'sticky' },
    ];

    const multiFlags = 'gim';

    const singleArgFunctions: Record<string, (arg: RegExp) => RegExp> = {
      bounded: regex.bounded,
      before: regex.before,
      notBefore: regex.notBefore,
      after: regex.after,
      notAfter: regex.notAfter,
      optional: regex.optional,
      zeroOrMore: regex.zeroOrMore,
      oneOrMore: regex.oneOrMore,
    };

    describe.each(Object.entries(singleArgFunctions))('for %s()', (name, func) => {
      describe.each(flagsToTest)('preserves the "$flag" flag', ({ flag, property }) => {
        test(`using /test/${flag}`, () => {
          const input = new RegExp('test', flag);
          const result = func(input);
          expect(result.flags).toBe(flag);
          expect(result[property]).toBe(true);
        });
      });

      test(`preserves multiple flags: "${multiFlags}"`, () => {
        const input = new RegExp('test', multiFlags);
        const result = func(input);
        expect(result.flags).toBe('gim');
        expect(result.global).toBe(true);
        expect(result.ignoreCase).toBe(true);
        expect(result.multiline).toBe(true);
      });
    });

    const multiArgFunctions: Record<string, (...args: any[]) => RegExp> = {
      wrap: regex.wrap,
      oneOf: regex.oneOf,
      keywords: regex.keywords,
      capture: regex.capture,
      group: regex.group,
      concat: regex.concat,
      r: regex.r,
    };

    describe.each(Object.entries(multiArgFunctions))('for %s()', (name, func) => {
      test('combines flags from multiple RegExp inputs', () => {
        const r1 = /a/g;
        const r2 = /b/i;
        const r3 = 'c'; // string input, no flags
        const r4 = /d/m;

        const result = name === 'wrap' ? func(r1, r2) : func(r1, r2, r3, r4);
        
        const expectedFlags = (name === 'wrap' ? 'gi' : 'gim').split('').sort().join('');
        expect(result.flags).toBe(expectedFlags);
        expect(result.global).toBe(true);
        expect(result.ignoreCase).toBe(true);
        if (name !== 'wrap') {
          expect(result.multiline).toBe(true);
        }
      });

      test('deduplicates flags from multiple RegExp inputs', () => {
        const r1 = /a/gi;
        const r2 = /b/im;
        
        const result = name === 'wrap' ? func(r1, r2) : func(r1, r2);

        expect(result.flags).toBe('gim');
      });
    });

    test('handles modern "d" (hasIndices) flag if supported', () => {
      // Test hasIndices flag if supported
      try {
        const withIndices = new RegExp('test', 'd');
        const result = regex.bounded(withIndices);
        expect(result.flags).toContain('d');
         // @ts-ignore - hasIndices is not in all TS versions
        expect(result.hasIndices).toBe(true);
      } catch (e) {
        // hasIndices not supported in this environment
        console.warn('Skipping "d" flag test: not supported in this JS environment.');
      }
    });
  });

  describe('Complex Combinations', () => {
    test('combines multiple utilities', () => {
      const keywordPattern = regex.keywords('if', 'else', 'while');
      const optionalWhitespace = regex.optional(/\s+/);
      const identifier = regex.bounded(/\w+/);

      const combined = regex.concat(keywordPattern, optionalWhitespace, identifier);
      expect(combined.source).toBe('(\\b(if|else|while)\\b(?:\\s+)?\\b\\w+\\b)');
    });

    test('creates complex lookahead/lookbehind patterns', () => {
      const notAfterBackslash = regex.notAfter(/\\/);
      const beforeQuote = regex.before(/"/);
      const combined = regex.concat(notAfterBackslash, 'character', beforeQuote);

      expect(combined.source).toBe('((?<!\\\\)character(?="))');
    });

    test('creates nested capturing groups', () => {
      const innerCapture = regex.capture(/\w+/);
      const outerCapture = regex.capture('start', innerCapture, 'end');

      expect(outerCapture.source).toBe('(start(\\w+)end)');
    });
  });
});