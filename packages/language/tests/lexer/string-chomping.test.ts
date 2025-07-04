import { describe, test, expect } from 'vitest';
import { StringChomper, type ChompingMarker } from '../../src/parser/lexer/utils/string-chomper.js';

describe('StringChomper', () => {
  
  describe('Chomping Marker Detection', () => {
    test('should detect chomping markers correctly', () => {
      expect(StringChomper.getChompingMarker('|')).toBe('clean');
      expect(StringChomper.getChompingMarker('|-')).toBe('trim');
      expect(StringChomper.getChompingMarker('+|')).toBe('preserve');
      expect(StringChomper.getChompingMarker('+|+')).toBe('preserve_all');
      expect(StringChomper.getChompingMarker('invalid')).toBe('clean'); // Default
    });
  });

  describe('Clean Chomping (|)', () => {
    test('should apply clean chomping correctly', () => {
      const input = `    Hello World
    This is a test
        With indentation
    Final line`;
      
      const expected = `Hello World
This is a test
    With indentation
Final line\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });

    test('should handle empty lines in clean chomping', () => {
      const input = `    Hello

    World`;
      
      const expected = `Hello

World\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });

    test('should ensure exactly one trailing newline in clean chomping', () => {
      const input = `    Hello World`;
      const expected = `Hello World\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });
  });

  describe('Trim Chomping (|-)', () => {
    test('should apply trim chomping correctly', () => {
      const input = `    Hello World
    This is a test
        With indentation
    Final line`;
      
      const expected = `Hello World
This is a test
    With indentation
Final line`;
      
      const result = StringChomper.processStringContent(input, 'trim');
      expect(result).toBe(expected);
    });

    test('should remove all trailing newlines in trim chomping', () => {
      const input = `    Hello World\n\n`;
      const expected = `Hello World`;
      
      const result = StringChomper.processStringContent(input, 'trim');
      expect(result).toBe(expected);
    });
  });

  describe('Preserve Chomping (+|)', () => {
    test('should apply preserve chomping correctly', () => {
      const input = `    Hello World
    This is indented
  Less indented`;
      
      const expected = `    Hello World
    This is indented
  Less indented\n`;
      
      const result = StringChomper.processStringContent(input, 'preserve');
      expect(result).toBe(expected);
    });

    test('should preserve all whitespace but ensure one trailing newline', () => {
      const input = `  Spaced content  
   More spaces   `;
      const expected = `  Spaced content  
   More spaces   \n`;
      
      const result = StringChomper.processStringContent(input, 'preserve');
      expect(result).toBe(expected);
    });
  });

  describe('Preserve All Chomping (+|+)', () => {
    test('should preserve everything exactly as-is', () => {
      const input = `    Hello World
    This is indented
  Less indented\n\n`;
      
      const result = StringChomper.processStringContent(input, 'preserve_all');
      expect(result).toBe(input); // Should be exactly the same
    });

    test('should not modify any whitespace in preserve all', () => {
      const input = `  Leading spaces  
\t\tTabs and spaces\t  
No changes at all   `;
      
      const result = StringChomper.processStringContent(input, 'preserve_all');
      expect(result).toBe(input);
    });
  });

  describe('Complex Examples', () => {
    test('should handle mixed indentation correctly', () => {
      const input = `        First line (8 spaces)
    Second line (4 spaces)
        Third line (8 spaces)
      Fourth line (6 spaces)`;
      
      // Clean chomping should remove 4 spaces (minimum) from each line
      const expected = `    First line (8 spaces)
Second line (4 spaces)
    Third line (8 spaces)
  Fourth line (6 spaces)\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });

    test('should handle tabs correctly', () => {
      const input = `\t\tTabbed content
\t\tMore tabs
\t\t\tExtra tab`;
      
      // Minimum indentation is 2 tabs (16 spaces equivalent)
      const expected = `Tabbed content
More tabs
\tExtra tab\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });

    test('should handle empty input', () => {
      expect(StringChomper.processStringContent('', 'clean')).toBe('');
      expect(StringChomper.processStringContent('', 'trim')).toBe('');
      expect(StringChomper.processStringContent('', 'preserve')).toBe('');
      expect(StringChomper.processStringContent('', 'preserve_all')).toBe('');
    });

    test('should handle single line input', () => {
      const input = '    Single line';
      
      expect(StringChomper.processStringContent(input, 'clean')).toBe('Single line\n');
      expect(StringChomper.processStringContent(input, 'trim')).toBe('Single line');
      expect(StringChomper.processStringContent(input, 'preserve')).toBe('    Single line\n');
      expect(StringChomper.processStringContent(input, 'preserve_all')).toBe('    Single line');
    });
  });

  describe('Validation', () => {
    test('should validate chomped strings correctly', () => {
      // Clean chomping should end with exactly one newline
      expect(StringChomper.validateChompedString('Hello\n', 'clean')).toBe(true);
      expect(StringChomper.validateChompedString('Hello\n\n', 'clean')).toBe(false);
      expect(StringChomper.validateChompedString('Hello', 'clean')).toBe(false);

      // Trim chomping should not end with newlines
      expect(StringChomper.validateChompedString('Hello', 'trim')).toBe(true);
      expect(StringChomper.validateChompedString('Hello\n', 'trim')).toBe(false);

      // Preserve chomping should end with exactly one newline
      expect(StringChomper.validateChompedString('Hello\n', 'preserve')).toBe(true);
      expect(StringChomper.validateChompedString('Hello\n\n', 'preserve')).toBe(false);

      // Preserve all accepts any ending
      expect(StringChomper.validateChompedString('Hello', 'preserve_all')).toBe(true);
      expect(StringChomper.validateChompedString('Hello\n', 'preserve_all')).toBe(true);
      expect(StringChomper.validateChompedString('Hello\n\n', 'preserve_all')).toBe(true);
    });
  });

  describe('Real-world Examples', () => {
    test('should handle YAML-like content with clean chomping', () => {
      const input = `    key1: value1
    key2: value2
    nested:
      subkey: subvalue
    final: done`;
      
      const expected = `key1: value1
key2: value2
nested:
  subkey: subvalue
final: done\n`;
      
      const result = StringChomper.processStringContent(input, 'clean');
      expect(result).toBe(expected);
    });

    test('should handle code block with preserve chomping', () => {
      const input = `  function hello() {
    console.log("Hello World");
    return true;
  }`;
      
      const expected = `  function hello() {
    console.log("Hello World");
    return true;
  }\n`;
      
      const result = StringChomper.processStringContent(input, 'preserve');
      expect(result).toBe(expected);
    });

    test('should handle precise formatting with preserve all', () => {
      const input = `Line 1
Line 2

Line 4 with gaps above

`;
      
      const result = StringChomper.processStringContent(input, 'preserve_all');
      expect(result).toBe(input); // Exactly preserved
    });
  });
});