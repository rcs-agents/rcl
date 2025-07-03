import { describe, test, expect, beforeAll, vi } from 'vitest';
import { createGrammar, emitJSON } from '../src/index.js';
import { scopes } from '../src/scopes/index.js';
import type { Grammar, MatchRule, BeginEndRule, IncludeRule } from '../src/types.js';

describe('Grammar Rules', () => {
  describe('createGrammar', () => {
    test('creates valid grammar structure', () => {
      const grammar = createGrammar(
        'Test Language',
        'source.test',
        ['test'],
        []
      );

      expect(grammar.name).toBe('Test Language');
      expect(grammar.scopeName).toBe('source.test');
      expect(grammar.fileTypes).toEqual(['test']);
      expect(grammar.patterns).toEqual([]);
      expect(grammar.$schema).toBeDefined();
    });

    test('handles optional parameters', () => {
      const grammar = createGrammar(
        'Test Language',
        'source.test',
        ['test'],
        [],
        {
          variables: { identifier: '[a-zA-Z_][a-zA-Z0-9_]*' },
          firstLineMatch: /^#!/,
          foldingStartMarker: /\{/,
          foldingStopMarker: /\}/
        }
      );

      expect(grammar.variables).toEqual({ identifier: '[a-zA-Z_][a-zA-Z0-9_]*' });
      expect(grammar.firstLineMatch).toEqual(/^#!/);
      expect(grammar.foldingStartMarker).toEqual(/\{/);
      expect(grammar.foldingStopMarker).toEqual(/\}/);
    });

    test('handles repository items', () => {
      const keywordRule: MatchRule = {
        key: 'keyword',
        match: /\b(if|else|while)\b/,
        scope: scopes.keyword.control.conditional
      };

      const grammar = createGrammar(
        'Test Language',
        'source.test',
        ['test'],
        [keywordRule],
        {
          repositoryItems: [keywordRule]
        }
      );

      expect(grammar.repositoryItems).toEqual([keywordRule]);
    });
  });

  describe('Rule Types', () => {
    describe('MatchRule', () => {
      test('creates simple match rule', async () => {
        const matchRule: MatchRule = {
          key: 'number',
          match: /\b\d+\b/,
          scope: scopes.constant.numeric.integer
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [matchRule],
          { repositoryItems: [matchRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository.number).toBeDefined();
        expect(parsed.repository.number.match).toBe('\\b\\d+\\b');
        expect(parsed.repository.number.name).toBe('constant.numeric.integer');
      });

      test('creates match rule with captures', async () => {
        const matchRule: MatchRule = {
          key: 'function-call',
          match: /(\w+)\s*(\()/,
          scope: scopes.meta.function_call,
          captures: {
            1: { scope: scopes.entity.name.function },
            2: { scope: scopes.punctuation.section.parens.begin }
          }
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [matchRule],
          { repositoryItems: [matchRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository['function-call'].captures).toBeDefined();
        expect(parsed.repository['function-call'].captures['1'].name).toBe('entity.name.function');
        expect(parsed.repository['function-call'].captures['2'].name).toBe('punctuation.section.parens.begin');
      });
    });

    describe('BeginEndRule', () => {
      test('creates begin-end rule', async () => {
        const beginEndRule: BeginEndRule = {
          key: 'string',
          begin: /"/,
          end: /"/,
          scope: scopes.string.quoted.double,
          patterns: [
            {
              match: /\\./,
              scope: scopes.constant.character.escape
            }
          ]
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [beginEndRule],
          { repositoryItems: [beginEndRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository.string.begin).toBe('"');
        expect(parsed.repository.string.end).toBe('"');
        expect(parsed.repository.string.name).toBe('string.quoted.double');
        expect(parsed.repository.string.patterns).toHaveLength(1);
        expect(parsed.repository.string.patterns[0].match).toBe('\\\\.');
      });

      test('creates begin-end rule with captures', async () => {
        const beginEndRule: BeginEndRule = {
          key: 'block-comment',
          begin: /(\/\*)/,
          end: /(\*\/)/,
          scope: scopes.comment.block,
          beginCaptures: {
            1: { scope: 'punctuation.definition.comment.begin' }
          },
          endCaptures: {
            1: { scope: 'punctuation.definition.comment.end' }
          }
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [beginEndRule],
          { repositoryItems: [beginEndRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository['block-comment'].beginCaptures).toBeDefined();
        expect(parsed.repository['block-comment'].endCaptures).toBeDefined();
        expect(parsed.repository['block-comment'].beginCaptures['1'].name).toBe('punctuation.definition.comment.begin');
        expect(parsed.repository['block-comment'].endCaptures['1'].name).toBe('punctuation.definition.comment.end');
      });
    });

    describe('IncludeRule', () => {
      test('creates include rule referencing another rule', async () => {
        const keywordRule: MatchRule = {
          key: 'keyword',
          match: /\b(if|else)\b/,
          scope: scopes.keyword.control.conditional
        };

        const includeRule: IncludeRule = {
          key: 'expression',
          patterns: [
            { include: '#keyword' }
          ]
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [includeRule],
          { repositoryItems: [keywordRule, includeRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository.expression.patterns).toHaveLength(1);
        expect(parsed.repository.expression.patterns[0].include).toBe('#keyword');
      });

      test('creates include rule with external reference', async () => {
        const includeRule: IncludeRule = {
          key: 'embedded-js',
          patterns: [
            { include: 'source.js' }
          ]
        };

        const grammar = createGrammar(
          'Test',
          'source.test',
          ['test'],
          [includeRule],
          { repositoryItems: [includeRule] }
        );

        const json = await emitJSON(grammar);
        const parsed = JSON.parse(json);

        expect(parsed.repository['embedded-js'].patterns[0].include).toBe('source.js');
      });
    });
  });

  describe('Pattern Processing', () => {
    test('converts keyed rules to include references in patterns', async () => {
      const keywordRule: MatchRule = {
        key: 'keyword',
        match: /\b(if|else)\b/,
        scope: scopes.keyword.control.conditional
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [keywordRule],
        { repositoryItems: [keywordRule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.patterns).toHaveLength(1);
      expect(parsed.patterns[0].include).toBe('#keyword');
    });

    test('inlines rules without keys', async () => {
      const inlineRule: MatchRule = {
        match: /\b\d+\b/,
        scope: scopes.constant.numeric.integer
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [inlineRule]
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.patterns).toHaveLength(1);
      expect(parsed.patterns[0].match).toBe('\\b\\d+\\b');
      expect(parsed.patterns[0].name).toBe('constant.numeric.integer');
      expect(parsed.repository).toEqual({});
    });
  });

  describe('Repository Management', () => {
    test('prevents duplicate keys', async () => {
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

    test('allows same rule object with same key', async () => {
      const rule: MatchRule = {
        key: 'test-rule',
        match: /test/,
        scope: 'test.scope'
      };
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule, rule], // Same rule object can appear multiple times
        { repositoryItems: [rule] }
      );
      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);
      expect(parsed.patterns).toHaveLength(2); // Both references become includes
      expect(parsed.patterns[0].include).toBe('#test-rule');
      expect(parsed.patterns[1].include).toBe('#test-rule');
    });

    test('handles missing repositoryItems with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const keywordRule: MatchRule = {
        key: 'keyword',
        match: /\b(if|else)\b/,
        scope: scopes.keyword.control.conditional
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [keywordRule]
        // No repositoryItems provided
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: grammar.repositoryItems not provided')
      );
      expect(parsed.repository.keyword).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Regex Handling', () => {
    test('converts RegExp objects to strings', async () => {
      const rule: MatchRule = {
        key: 'regex-test',
        match: /\b(test)\b/,
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule],
        { repositoryItems: [rule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository['regex-test'].match).toBe('\\b(test)\\b');
    });

    test('handles string patterns as-is', async () => {
      const rule: MatchRule = {
        key: 'string-test',
        match: '\\b(test)\\b',
        scope: scopes.keyword.control
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule],
        { repositoryItems: [rule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository['string-test'].match).toBe('\\b(test)\\b');
    });
  });

  describe('Scope Processing', () => {
    test('processes scope names correctly', async () => {
      const rule: MatchRule = {
        key: 'scope-test',
        scope: scopes.keyword.control.conditional,
        match: /test/
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule],
        { repositoryItems: [rule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository['scope-test'].name).toBe('keyword.control.conditional');
    });

    test('handles meta scope generation', async () => {
      const { meta } = await import('../src/types.js');
      const rule: MatchRule = {
        key: 'meta-test',
        scope: meta,
        match: /test/
      };

      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [rule],
        { repositoryItems: [rule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository['meta-test'].name).toBe('meta.meta-test.test');
    });
  });
});