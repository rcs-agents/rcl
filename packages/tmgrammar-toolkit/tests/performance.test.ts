import { describe, test, expect } from 'vitest';
import { createGrammar, emitJSON, emitPList } from '../src/index.js';
import { scopes } from '../src/scopes/index.js';
import type { MatchRule, BeginEndRule } from '../src/types.js';

describe('Performance Tests', () => {
  describe('Grammar Generation Performance', () => {
    test('handles large number of rules efficiently', async () => {
      const startTime = performance.now();
      
      // Create 1000 rules
      const rules: MatchRule[] = [];
      for (let i = 0; i < 1000; i++) {
        rules.push({
          key: `rule${i}`,
          match: new RegExp(`pattern${i}`),
          scope: scopes.variable.other
        });
      }

      const grammar = createGrammar(
        'Large Grammar',
        'source.large',
        ['large'],
        rules,
        { repositoryItems: rules }
      );

      const json = await emitJSON(grammar);
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(generationTime).toBeLessThan(5000);
      
      const parsed = JSON.parse(json);
      expect(parsed.patterns).toHaveLength(1000);
      expect(Object.keys(parsed.repository)).toHaveLength(1000);
      
      console.log(`Generated grammar with 1000 rules in ${generationTime.toFixed(2)}ms`);
    });

    test('handles complex nested patterns efficiently', async () => {
      const startTime = performance.now();
      
      // Create deeply nested structure
      const createNestedRule = (depth: number): BeginEndRule => ({
        key: `nested${depth}`,
        begin: /\{/,
        end: /\}/,
        scope: scopes.meta.block,
        patterns: depth > 0 ? [
          { include: `#nested${depth - 1}` },
          {
            match: /\w+/,
            scope: scopes.variable.other
          }
        ] : [
          {
            match: /\w+/,
            scope: scopes.variable.other
          }
        ]
      });

      const rules: BeginEndRule[] = [];
      for (let i = 0; i < 50; i++) {
        rules.push(createNestedRule(i));
      }

      const grammar = createGrammar(
        'Nested Grammar',
        'source.nested',
        ['nested'],
        [rules[49]], // Start with deepest nesting
        { repositoryItems: rules }
      );

      const json = await emitJSON(grammar);
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      
      // Should handle deep nesting without significant performance issues
      expect(generationTime).toBeLessThan(3000);
      
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed.repository)).toHaveLength(50);
      
      console.log(`Generated deeply nested grammar in ${generationTime.toFixed(2)}ms`);
    });

    test('handles complex regex patterns efficiently', async () => {
      const startTime = performance.now();
      
      const complexRegexRule: MatchRule = {
        key: 'complex-regex',
        match: /(?:(?:[a-zA-Z]|(?:\\u[0-9a-fA-F]{4}))+(?:[a-zA-Z0-9_]|(?:\\u[0-9a-fA-F]{4}))*)\s*:\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|\[(?:[^\[\]\\]|\\.)*\]|\{(?:[^{}\\]|\\.)*\})/,
        scope: scopes.meta.property_value
      };

      const rules: MatchRule[] = [];
      for (let i = 0; i < 100; i++) {
        rules.push({
          ...complexRegexRule,
          key: `complex-regex-${i}`
        });
      }

      const grammar = createGrammar(
        'Complex Regex Grammar',
        'source.complex-regex',
        ['complex'],
        rules,
        { repositoryItems: rules }
      );

      const json = await emitJSON(grammar);
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      
      // Complex regex validation should still be reasonably fast
      expect(generationTime).toBeLessThan(10000);
      
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed.repository)).toHaveLength(100);
      
      console.log(`Generated grammar with 100 complex regex patterns in ${generationTime.toFixed(2)}ms`);
    });
  });

  describe('Emission Format Performance', () => {
    test('JSON emission is reasonably fast', async () => {
      const rules: MatchRule[] = [];
      for (let i = 0; i < 500; i++) {
        rules.push({
          key: `rule${i}`,
          match: new RegExp(`\\b${i}\\b`),
          scope: scopes.constant.numeric
        });
      }

      const grammar = createGrammar(
        'JSON Perf Test',
        'source.json-perf',
        ['json-perf'],
        rules,
        { repositoryItems: rules }
      );

      const startTime = performance.now();
      const json = await emitJSON(grammar);
      const endTime = performance.now();
      
      const emissionTime = endTime - startTime;
      
      expect(emissionTime).toBeLessThan(2000);
      expect(json.length).toBeGreaterThan(1000); // Should produce substantial output
      
      console.log(`JSON emission took ${emissionTime.toFixed(2)}ms for ${json.length} characters`);
    });

    test('PList emission is reasonably fast', async () => {
      const rules: MatchRule[] = [];
      for (let i = 0; i < 200; i++) {
        rules.push({
          key: `rule${i}`,
          match: new RegExp(`\\b${i}\\b`),
          scope: scopes.constant.numeric
        });
      }

      const grammar = createGrammar(
        'PList Perf Test',
        'source.plist-perf',
        ['plist-perf'],
        rules,
        { repositoryItems: rules }
      );

      const startTime = performance.now();
      const plist = await emitPList(grammar);
      const endTime = performance.now();
      
      const emissionTime = endTime - startTime;
      
      expect(emissionTime).toBeLessThan(3000);
      expect(plist.length).toBeGreaterThan(1000);
      
      console.log(`PList emission took ${emissionTime.toFixed(2)}ms for ${plist.length} characters`);
    });
  });

  describe('Memory Usage', () => {
    test('does not create excessive memory usage with large grammars', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create many grammar instances
      const grammars = [];
      for (let i = 0; i < 50; i++) {
        const rules: MatchRule[] = [];
        for (let j = 0; j < 100; j++) {
          rules.push({
            key: `rule${i}_${j}`,
            match: new RegExp(`pattern${i}_${j}`),
            scope: scopes.variable.other
          });
        }

        const grammar = createGrammar(
          `Grammar ${i}`,
          `source.grammar${i}`,
          [`ext${i}`],
          rules,
          { repositoryItems: rules }
        );
        
        grammars.push(grammar);
      }

      // Generate JSON for all grammars
      for (const grammar of grammars) {
        await emitJSON(grammar);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 100MB)
      const memoryIncreaseInMB = memoryIncrease / (1024 * 1024);
      expect(memoryIncreaseInMB).toBeLessThan(100);
      
      console.log(`Memory increase: ${memoryIncreaseInMB.toFixed(2)}MB for 50 grammars with 100 rules each`);
    });
  });

  describe('Regex Validation Performance', () => {
    test('validates many regex patterns efficiently', async () => {
      const regexPatterns = [
        /\b\w+\b/,
        /\d+(\.\d+)?/,
        /[a-zA-Z_][a-zA-Z0-9_]*/,
        /"(?:[^"\\]|\\.)*"/,
        /\/\*[\s\S]*?\*\//,
        /\/\/.*$/,
        /\b(?:if|else|while|for|function|return)\b/,
        /[+\-*/%=<>!&|]+/,
        /\(\)/,
        /\[\]/,
        /\{\}/,
        /(?:[a-zA-Z]|(?:\\u[0-9a-fA-F]{4}))+/,
        /(?<=\w)\s+(?=\w)/,
        /(?<!\w)\d+(?!\w)/,
        /^[#]{1,6}\s+.+$/
      ];

      const startTime = performance.now();
      
      const rules: MatchRule[] = [];
      for (let i = 0; i < 1000; i++) {
        const pattern = regexPatterns[i % regexPatterns.length];
        rules.push({
          key: `regex${i}`,
          match: pattern,
          scope: scopes.variable.other
        });
      }

      const grammar = createGrammar(
        'Regex Validation Test',
        'source.regex-validation',
        ['regex-test'],
        rules,
        { repositoryItems: rules }
      );

      await emitJSON(grammar);
      const endTime = performance.now();
      
      const validationTime = endTime - startTime;
      
      // Should validate 1000 regex patterns in reasonable time
      expect(validationTime).toBeLessThan(5000);
      
      console.log(`Validated 1000 regex patterns in ${validationTime.toFixed(2)}ms`);
    });
  });

  describe('Stress Tests', () => {
    test('handles extremely large single rule', async () => {
      // Create a rule with a very long alternation
      const alternatives: string[] = [];
      for (let i = 0; i < 10000; i++) {
        alternatives.push(`keyword${i}`);
      }
      
      const startTime = performance.now();
      
      const hugKeywordRule: MatchRule = {
        key: 'huge-keywords',
        match: new RegExp(`\\b(${alternatives.join('|')})\\b`),
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Huge Rule Grammar',
        'source.huge-rule',
        ['huge'],
        [hugKeywordRule],
        { repositoryItems: [hugKeywordRule] }
      );

      const json = await emitJSON(grammar);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      
      // Should handle even extremely large rules
      expect(processingTime).toBeLessThan(15000);
      
      const parsed = JSON.parse(json);
      expect(parsed.repository['huge-keywords'].match).toContain('keyword0');
      expect(parsed.repository['huge-keywords'].match).toContain('keyword9999');
      
      console.log(`Processed rule with 10,000 alternatives in ${processingTime.toFixed(2)}ms`);
    });
  });
});