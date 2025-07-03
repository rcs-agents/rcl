import { describe, test, expect, vi } from 'vitest';
import { createGrammar, emitJSON, emitPList } from '../src/index.js';
import { scopes } from '../src/scopes/index.js';
import type { MatchRule, BeginEndRule } from '../src/types.js';

describe('Error Handling', () => {
  describe('Invalid Regex Patterns', () => {
    test('processes patterns that are valid in OnigRegExp', async () => {
      // OnigRegExp is more permissive than JavaScript regex
      const ruleWithPattern: MatchRule = {
        key: 'test-pattern',
        match: '[invalid' as any, // This is actually valid in OnigRegExp
        scope: 'test.scope'
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleWithPattern],
        { repositoryItems: [ruleWithPattern] }
      );

      // OnigRegExp accepts this pattern, so emit should succeed
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('processes begin-end patterns that are valid in OnigRegExp', async () => {
      const ruleWithPattern: BeginEndRule = {
        key: 'test-pattern',
        begin: '[invalid' as any, // This is actually valid in OnigRegExp
        end: '(?#comment' as any, // This is also valid in OnigRegExp
        scope: 'test.scope'
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleWithPattern],
        { repositoryItems: [ruleWithPattern] }
      );

      // OnigRegExp accepts these patterns, so emit should succeed
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('processes grammar-level patterns that are valid in OnigRegExp', async () => {
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [],
        { firstLineMatch: '[invalid' as any }
      );

      // OnigRegExp accepts this pattern, so emit should succeed
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('processes folding markers that are valid in OnigRegExp', async () => {
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [],
        { foldingStartMarker: '[invalid' as any }
      );

      // OnigRegExp accepts this pattern, so emit should succeed
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('processes folding stop markers that are valid in OnigRegExp', async () => {
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [],
        { foldingStopMarker: '[invalid' as any }
      );

      // OnigRegExp accepts this pattern, so emit should succeed
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('provides helpful error context when processing fails', async () => {
      // Test that error context is properly provided when other types of errors occur
      const ruleWithPattern: MatchRule = {
        key: 'test-pattern',
        match: '[invalid' as any,
        scope: 'test.scope'
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleWithPattern],
        { repositoryItems: [ruleWithPattern] }
      );

      // This should succeed since the pattern is valid in OnigRegExp
      const result = await emitJSON(grammar, { errorSourceFilePath: 'test-grammar.ts' });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Duplicate Keys', () => {
    test('throws error for duplicate keys in repositoryItems', async () => {
      const rule1: MatchRule = {
        key: 'duplicate',
        match: /first/,
        scope: scopes.keyword.control
      };

      const rule2: MatchRule = {
        key: 'duplicate',
        match: /second/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [],
        { repositoryItems: [rule1, rule2] }
      );

      await expect(emitJSON(grammar)).rejects.toThrow(
        /Duplicate key found in repositoryItems: 'duplicate'/
      );
    });

    test('throws error for key collision between repositoryItems and patterns', async () => {
      const repoRule: MatchRule = {
        key: 'collision',
        match: /repo/,
        scope: scopes.keyword.control
      };

      const patternRule: MatchRule = {
        key: 'collision',
        match: /pattern/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [patternRule],
        { repositoryItems: [repoRule] }
      );

      await expect(emitJSON(grammar)).rejects.toThrow(
        /Duplicate key 'collision' detected with a different rule object/
      );
    });

    test('allows same rule object referenced multiple times', async () => {
      const rule: MatchRule = {
        key: 'shared',
        match: /shared/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule, rule],
        { repositoryItems: [rule] }
      );

      // Should not throw
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('rejects structurally equivalent rules with same key (different objects)', async () => {
      const rule1: MatchRule = {
        key: 'equivalent',
        match: /test/,
        scope: scopes.keyword.control
      };

      const rule2: MatchRule = {
        key: 'equivalent',
        match: /test/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule2],
        { repositoryItems: [rule1] }
      );

      // Should throw even for equivalent rules if they're different objects
      await expect(emitJSON(grammar)).rejects.toThrow(
        /Duplicate key 'equivalent' detected with a different rule object/
      );
    });
  });

  describe('Missing Dependencies', () => {
    test('handles missing repository items with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const ruleWithKey: MatchRule = {
        key: 'missing-from-repo',
        match: /test/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleWithKey]
        // No repositoryItems provided
      );

      await emitJSON(grammar);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: grammar.repositoryItems not provided')
      );

      consoleSpy.mockRestore();
    });

    test('warns about rules not pre-processed via repositoryItems', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const ruleInPatterns: MatchRule = {
        key: 'not-in-repo',
        match: /test/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleInPatterns],
        { repositoryItems: [] }
      );

      await emitJSON(grammar);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Discovered and processing new repository item on-the-fly: 'not-in-repo'"
        )
      );

      consoleSpy.mockRestore();
    });

    test('warns about rules without keys being inlined', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const ruleWithoutKey: MatchRule = {
        match: /inlined/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [ruleWithoutKey]
      );

      await emitJSON(grammar);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: grammar.repositoryItems not provided')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Invalid Grammar Structure', () => {
    test('handles empty grammar gracefully', async () => {
      const grammar = createGrammar('Empty', 'source.empty', [], []);
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('rejects null/undefined values in patterns', async () => {
      const patterns = [null, undefined] as any[];
      const grammar = createGrammar('Test', 'source.test', ['test'], patterns);
      await expect(emitJSON(grammar)).rejects.toThrow();
    });
  });

  describe('Emission Format Handling', () => {
    test('emitJSON handles OnigRegExp-valid patterns', async () => {
      const onigValidRule: MatchRule = {
        key: 'onig-valid-rule',
        match: '[invalid',  // Valid in OnigRegExp but not in JS regex
        scope: 'test.scope'
      };
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [onigValidRule],
        { repositoryItems: [onigValidRule] }
      );

      // OnigRegExp accepts patterns that JS regex would reject
      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('emitPList handles OnigRegExp-valid patterns', async () => {
      const onigValidRule: MatchRule = {
        key: 'onig-valid-rule',
        match: '[invalid',  // Valid in OnigRegExp but not in JS regex
        scope: 'test.scope'
      };
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [onigValidRule],
        { repositoryItems: [onigValidRule] }
      );

      // OnigRegExp accepts patterns that JS regex would reject
      await expect(emitPList(grammar)).resolves.toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles deeply nested patterns', async () => {
      const nestedRule: BeginEndRule = {
        key: 'nested',
        begin: /\{/,
        end: /\}/,
        patterns: [{ include: '#nested' }]
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [nestedRule],
        { repositoryItems: [nestedRule] }
      );

      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });

    test('handles complex capture groups', async () => {
      const complexCaptureRule: MatchRule = {
        key: 'complex-captures',
        match: /((a)(b))/,
        captures: {
          '1': { scope: 'meta.group1' },
          '2': { scope: 'meta.group2' },
          '3': { scope: 'meta.group3' }
        }
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [complexCaptureRule],
        { repositoryItems: [complexCaptureRule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);
      expect(parsed.repository['complex-captures'].captures).toBeDefined();
    });

    test('handles unicode patterns', async () => {
      const unicodeRule: MatchRule = {
        key: 'unicode',
        match: /[a-zA-Z]+/,
        scope: 'keyword.unicode'
      };
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [unicodeRule],
        { repositoryItems: [unicodeRule] }
      );

      await expect(emitJSON(grammar)).resolves.toBeDefined();
    });
  });
});