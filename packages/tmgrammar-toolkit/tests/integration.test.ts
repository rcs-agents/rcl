import { describe, test, expect, beforeAll } from 'vitest';
import { createGrammar, emitJSON, emitPList } from '../src/index.js';
import { scopes } from '../src/scopes/index.js';
import { regex } from '../src/helpers/index.js';
import type { MatchRule, BeginEndRule, IncludeRule } from '../src/types.js';

describe('Integration Tests', () => {
  describe('Complete Grammar Workflows', () => {
    test('creates a complete simple language grammar', async () => {
      // Define rules for a simple language
      const keywordRule: MatchRule = {
        key: 'keywords',
        match: regex.keywords('if', 'else', 'while', 'for', 'function', 'return'),
        scope: scopes.keyword.control
      };

      const numberRule: MatchRule = {
        key: 'numbers',
        match: /\b\d+(\.\d+)?\b/,
        scope: scopes.constant.numeric
      };

      const stringRule: BeginEndRule = {
        key: 'strings',
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

      const commentRule: MatchRule = {
        key: 'comments',
        match: /\/\/.*$/,
        scope: scopes.comment.line.double_slash
      };

      const identifierRule: MatchRule = {
        key: 'identifiers',
        match: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
        scope: scopes.variable.other
      };

      const grammar = createGrammar(
        'Simple Language',
        'source.simple',
        ['simple'],
        [keywordRule, numberRule, stringRule, commentRule, identifierRule],
        {
          repositoryItems: [keywordRule, numberRule, stringRule, commentRule, identifierRule],
          variables: {
            identifier: '[a-zA-Z_][a-zA-Z0-9_]*'
          }
        }
      );

      // Test JSON emission
      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      // Verify grammar structure
      expect(parsed.name).toBe('Simple Language');
      expect(parsed.scopeName).toBe('source.simple');
      expect(parsed.fileTypes).toEqual(['simple']);
      expect(parsed.patterns).toHaveLength(5);
      expect(Object.keys(parsed.repository)).toHaveLength(5);

      // Verify patterns are includes
      expect(parsed.patterns[0].include).toBe('#keywords');
      expect(parsed.patterns[1].include).toBe('#numbers');
      expect(parsed.patterns[2].include).toBe('#strings');
      expect(parsed.patterns[3].include).toBe('#comments');
      expect(parsed.patterns[4].include).toBe('#identifiers');

      // Verify repository entries
      expect(parsed.repository.keywords.match).toBe('\\b(if|else|while|for|function|return)\\b');
      expect(parsed.repository.keywords.name).toBe('keyword.control');
      
      expect(parsed.repository.numbers.match).toBe('\\b\\d+(\\.\\d+)?\\b');
      expect(parsed.repository.numbers.name).toBe('constant.numeric');
      
      expect(parsed.repository.strings.begin).toBe('"');
      expect(parsed.repository.strings.end).toBe('"');
      expect(parsed.repository.strings.name).toBe('string.quoted.double');
      expect(parsed.repository.strings.patterns).toHaveLength(1);
      
      expect(parsed.repository.comments.match).toBe('\\/\\/.*$');
      expect(parsed.repository.comments.name).toBe('comment.line.double-slash');

      // Verify variables
      expect(parsed.variables).toEqual({
        identifier: '[a-zA-Z_][a-zA-Z0-9_]*'
      });

      // Test PList emission
      const plist = await emitPList(grammar);
      expect(plist).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(plist).toContain('<plist version="1.0">');
      expect(plist).toContain('Simple Language');
    });

    test('creates grammar with nested structures and complex patterns', async () => {
      const functionRule: BeginEndRule = {
        key: 'function',
        begin: /(function)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(\()/,
        end: /\)/,
        scope: scopes.meta.function,
        beginCaptures: {
          1: { scope: scopes.keyword.other },
          2: { scope: scopes.entity.name.function },
          3: { scope: scopes.punctuation.section.parens.begin }
        },
        endCaptures: {
          0: { scope: scopes.punctuation.section.parens.end }
        },
        patterns: [
          {
            match: /([a-zA-Z_][a-zA-Z0-9_]*)/,
            scope: scopes.variable.parameter
          },
          {
            match: /,/,
            scope: scopes.punctuation.separator.comma
          }
        ]
      };

      const blockRule: BeginEndRule = {
        key: 'block',
        begin: /\{/,
        end: /\}/,
        scope: scopes.meta.block,
        beginCaptures: {
          0: { scope: scopes.punctuation.section.block.begin }
        },
        endCaptures: {
          0: { scope: scopes.punctuation.section.block.end }
        },
        patterns: [
          { include: '#function' },
          { include: '#statement' }
        ]
      };

      const statementRule: MatchRule = {
        key: 'statement',
        match: /[^{}]+/,
        scope: scopes.meta.statement
      };

      const grammar = createGrammar(
        'Complex Language',
        'source.complex',
        ['complex'],
        [functionRule, blockRule],
        {
          repositoryItems: [functionRule, blockRule, statementRule]
        }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      // Verify complex patterns work
      expect(parsed.repository.function.begin).toBe('(function)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*(\\()');
      expect(parsed.repository.function.beginCaptures).toBeDefined();
      expect(parsed.repository.function.patterns).toHaveLength(2);

      expect(parsed.repository.block.patterns).toHaveLength(2);
      expect(parsed.repository.block.patterns[0].include).toBe('#function');
      expect(parsed.repository.block.patterns[1].include).toBe('#statement');
    });

    test('handles self-referencing patterns correctly', async () => {
      const recursiveRule: BeginEndRule = {
        key: 'expression',
        begin: /\(/,
        end: /\)/,
        scope: scopes.meta.expression,
        patterns: [
          { include: '#expression' }, // Self-reference
          {
            match: /[^()]+/,
            scope: scopes.variable.other
          }
        ]
      };

      const grammar = createGrammar(
        'Recursive Language',
        'source.recursive',
        ['recursive'],
        [recursiveRule],
        { repositoryItems: [recursiveRule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository.expression.patterns[0].include).toBe('#expression');
      expect(parsed.repository.expression.patterns).toHaveLength(2);
    });
  });

  describe('Real-world Use Cases', () => {
    test('creates JSON-like language grammar', async () => {
      const valueRule: IncludeRule = {
        key: 'value',
        patterns: [
          { include: '#string' },
          { include: '#number' },
          { include: '#boolean' },
          { include: '#null' },
          { include: '#array' },
          { include: '#object' }
        ]
      };

      const stringRule: BeginEndRule = {
        key: 'string',
        begin: /"/,
        end: /"/,
        scope: scopes.string.quoted.double.json,
        patterns: [
          {
            match: /\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/,
            scope: scopes.constant.character.escape.json
          }
        ]
      };

      const numberRule: MatchRule = {
        key: 'number',
        match: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
        scope: scopes.constant.numeric.json
      };

      const booleanRule: MatchRule = {
        key: 'boolean',
        match: /\b(true|false)\b/,
        scope: scopes.constant.language.boolean
      };

      const nullRule: MatchRule = {
        key: 'null',
        match: /\bnull\b/,
        scope: scopes.constant.language.null
      };

      const arrayRule: BeginEndRule = {
        key: 'array',
        begin: /\[/,
        end: /\]/,
        scope: scopes.meta.array,
        patterns: [
          { include: '#value' },
          {
            match: /,/,
            name: scopes.punctuation.separator.comma
          }
        ]
      };

      const objectRule: BeginEndRule = {
        key: 'object',
        begin: /\{/,
        end: /\}/,
        scope: scopes.meta.dictionary,
        patterns: [
          { include: '#string' },
          {
            match: /:/,
            name: scopes.punctuation.separator
          },
          { include: '#value' },
          {
            match: /,/,
            name: scopes.punctuation.separator
          }
        ]
      };

      const grammar = createGrammar(
        'JSON',
        'source.json',
        ['json'],
        [valueRule],
        {
          repositoryItems: [
            valueRule,
            stringRule,
            numberRule,
            booleanRule,
            nullRule,
            arrayRule,
            objectRule
          ]
        }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      // Verify the grammar structure is correct
      expect(parsed.name).toBe('JSON');
      expect(parsed.patterns[0].include).toBe('#value');
      expect(Object.keys(parsed.repository)).toHaveLength(7);

      // Test specific patterns
      expect(parsed.repository.number.match).toBe('-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?');
      expect(parsed.repository.boolean.match).toBe('\\b(true|false)\\b');
      expect(parsed.repository.array.begin).toBe('\\[');
      expect(parsed.repository.array.end).toBe('\\]');
    });

    test('creates CSS-like language grammar', async () => {
      const selectorRule: MatchRule = {
        key: 'selector',
        match: /[.#]?[a-zA-Z][\w-]*/,
        scope: scopes.entity.name.tag
      };

      const propertyRule: MatchRule = {
        key: 'property',
        match: /[a-zA-Z-]+(?=\s*:)/,
        scope: scopes.support.type.property_name
      };

      const valueRule: MatchRule = {
        key: 'property-value',
        match: /[^;]+/,
        scope: scopes.string.unquoted
      };

      const rulesetRule: BeginEndRule = {
        key: 'ruleset',
        begin: /\{/,
        end: /\}/,
        scope: scopes.meta.property_list,
        patterns: [
          { include: '#property' },
          {
            match: /:/,
            scope: scopes.punctuation.separator
          },
          { include: '#property-value' },
          {
            match: /;/,
            scope: scopes.punctuation.terminator.statement
          }
        ]
      };

      const grammar = createGrammar(
        'CSS-like',
        'source.css-like',
        ['css-like'],
        [selectorRule, rulesetRule],
        {
          repositoryItems: [selectorRule, propertyRule, valueRule, rulesetRule]
        }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.repository.selector.match).toBe('[.#]?[a-zA-Z][\\w-]*');
      expect(parsed.repository.property.match).toBe('[a-zA-Z-]+(?=\\s*:)');
      expect(parsed.repository.ruleset.patterns).toHaveLength(4);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('handles grammar with all optional elements', async () => {
      const grammar = createGrammar(
        'Minimal',
        'source.minimal',
        ['minimal'],
        []
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      expect(parsed.patterns).toEqual([]);
      expect(parsed.repository).toEqual({});
    });

    test('handles very large grammar with many rules', async () => {
      const rules: MatchRule[] = [];
      for (let i = 0; i < 100; i++) {
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
      const parsed = JSON.parse(json);

      expect(parsed.patterns).toHaveLength(100);
      expect(Object.keys(parsed.repository)).toHaveLength(100);
    });

    test('processes grammar with complex capture groups', async () => {
      const complexCaptureRule: MatchRule = {
        key: 'complex-captures',
        match: /((a+)(b+)((c+)(d+)))/,
        scope: scopes.meta.complex,
        captures: {
          1: { scope: scopes.meta.group },
          2: { scope: scopes.meta.block },
          3: { scope: scopes.meta.block },
          4: { scope: scopes.meta.group },
          5: { scope: scopes.meta.block },
          6: { scope: scopes.meta.block }
        }
      };

      const grammar = createGrammar(
        'Complex Captures',
        'source.complex-captures',
        ['complex'],
        [complexCaptureRule],
        { repositoryItems: [complexCaptureRule] }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      const captures = parsed.repository['complex-captures'].captures;
      expect(Object.keys(captures)).toHaveLength(6);
      expect(captures['1'].name).toBe('meta.group');
      expect(captures['6'].name).toBe('meta.block');
    });
  });

  describe('TextMate Compatibility', () => {
    test('generates valid TextMate JSON structure', async () => {
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        [],
        {
          firstLineMatch: /^#!/,
          foldingStartMarker: /\{/,
          foldingStopMarker: /\}/
        }
      );

      const json = await emitJSON(grammar);
      const parsed = JSON.parse(json);

      // Check required TextMate fields
      expect(parsed).toHaveProperty('$schema');
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('scopeName');
      expect(parsed).toHaveProperty('fileTypes');
      expect(parsed).toHaveProperty('patterns');
      expect(parsed).toHaveProperty('repository');

      // Check optional fields
      expect(parsed).toHaveProperty('firstLineMatch');
      expect(parsed).toHaveProperty('foldingStartMarker');
      expect(parsed).toHaveProperty('foldingStopMarker');

      expect(parsed.firstLineMatch).toBe('^#!');
      expect(parsed.foldingStartMarker).toBe('\\{');
      expect(parsed.foldingStopMarker).toBe('\\}');
    });

    test('generates valid PList XML structure', async () => {
      const grammar = createGrammar(
        'Test',
        'source.test',
        ['test'],
        []
      );

      const plist = await emitPList(grammar);

      // Check basic XML structure
      expect(plist).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(plist).toContain('<plist version="1.0">');
      expect(plist).toContain('<dict>');
      expect(plist).toContain('</dict>');
      expect(plist).toContain('</plist>');

      // Check required keys
      expect(plist).toContain('<key>name</key>');
      expect(plist).toContain('<key>scopeName</key>');
      expect(plist).toContain('<key>fileTypes</key>');
      expect(plist).toContain('<key>patterns</key>');
    });
  });
});