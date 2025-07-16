import { describe, test, expect } from 'vitest';
import { createGrammar, emitJSON, isOk, isError } from '../src/index.js';

describe('Core Functionality', () => {
  test('createGrammar works with Result pattern', () => {
    const result = createGrammar(
      'Test Language',
      'source.test',
      ['test'],
      [
        {
          key: 'string',
          match: /"[^"]*"/,
          scope: 'string.quoted.double.test'
        }
      ]
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.isValid).toBe(true);
      expect(result.value.grammar.name).toBe('Test Language');
      expect(Object.keys(result.value.repository)).toContain('string');
    }
  });

  test('emit functions work with processed grammar', async () => {
    const grammarResult = createGrammar(
      'Test Language',
      'source.test', 
      ['test'],
      [
        {
          key: 'number',
          match: /\d+/,
          scope: 'constant.numeric.test'
        }
      ]
    );

    expect(isOk(grammarResult)).toBe(true);
    if (isOk(grammarResult)) {
      const jsonResult = await emitJSON(grammarResult.value);
      expect(isOk(jsonResult)).toBe(true);
      
      if (isOk(jsonResult)) {
        const json = JSON.parse(jsonResult.value);
        expect(json.name).toBe('Test Language');
        expect(json.scopeName).toBe('source.test');
        expect(json.repository.number).toMatchObject({
          match: '\\d+',
          name: 'constant.numeric.test'
        });
      }
    }
  });

  test('error handling works correctly', () => {
    const result = createGrammar(
      'Invalid Grammar',
      'source.invalid',
      ['invalid'],
      [
        {
          key: 'duplicate',
          match: /test/,
          scope: 'test.scope'
        },
        {
          key: 'duplicate', // Duplicate key should cause error
          match: /other/,
          scope: 'other.scope'  
        }
      ]
    );

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toContain('Duplicate key found');
    }
  });
});