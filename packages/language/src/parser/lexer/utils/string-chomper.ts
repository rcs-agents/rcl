/**
 * String Chomper Utility
 * 
 * Implements multi-line string chomping behavior according to RCL specification.
 * Handles different chomping markers: |, |-, +|, +|+
 */

export type ChompingMarker = 'clean' | 'trim' | 'preserve' | 'preserve_all';

export interface ChompingResult {
  processedText: string;
  marker: ChompingMarker;
}

export class StringChomper {
  
  /**
   * Apply chomping rules to multi-line string content
   */
  static processStringContent(rawText: string, marker: ChompingMarker): string {
    switch (marker) {
      case 'clean':
        return this.applyCleanChomping(rawText);
      case 'trim':
        return this.applyTrimChomping(rawText);
      case 'preserve':
        return this.applyPreserveChomping(rawText);
      case 'preserve_all':
        return this.applyPreserveAllChomping(rawText);
      default:
        return rawText;
    }
  }

  /**
   * Determine chomping marker from token image
   */
  static getChompingMarker(markerText: string): ChompingMarker {
    switch (markerText.trim()) {
      case '|':
        return 'clean';
      case '|-':
        return 'trim';
      case '+|':
        return 'preserve';
      case '+|+':
        return 'preserve_all';
      default:
        return 'clean'; // Default fallback
    }
  }

  /**
   * Clean chomping (|): Trim leading spaces from each line, preserve structure, add one trailing newline
   */
  private static applyCleanChomping(text: string): string {
    // Handle empty input
    if (text === '' || text.trim() === '') {
      return '';
    }

    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return '';

    // Find the minimum indentation (excluding empty lines)
    const minIndentSpaces = this.findMinimumIndentation(lines);
    
    // Process each line
    const processedLines = lines.map(line => {
      if (line.trim() === '') {
        return ''; // Empty lines become truly empty
      }
      // Remove the common leading indentation by counting actual characters
      return this.removeLeadingIndentation(line, minIndentSpaces);
    });

    // Join with newlines and ensure exactly one trailing newline
    const result = processedLines.join('\n');
    return result.replace(/\n*$/, '\n');
  }

  /**
   * Trim chomping (|-): Trim leading spaces from each line, preserve structure, no trailing newline
   */
  private static applyTrimChomping(text: string): string {
    // Handle empty input
    if (text === '' || text.trim() === '') {
      return '';
    }

    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return '';

    // Find the minimum indentation (excluding empty lines)
    const minIndentSpaces = this.findMinimumIndentation(lines);
    
    // Process each line
    const processedLines = lines.map(line => {
      if (line.trim() === '') {
        return ''; // Empty lines become truly empty
      }
      // Remove the common leading indentation by counting actual characters
      return this.removeLeadingIndentation(line, minIndentSpaces);
    });

    // Join with newlines and remove all trailing newlines
    const result = processedLines.join('\n');
    return result.replace(/\n*$/, '');
  }

  /**
   * Preserve chomping (+|): Preserve leading spaces, preserve structure, add one trailing newline
   */
  private static applyPreserveChomping(text: string): string {
    // Handle empty input
    if (text === '') {
      return '';
    }
    // Preserve all whitespace as-is, but ensure exactly one trailing newline
    return text.replace(/\n*$/, '\n');
  }

  /**
   * Preserve all chomping (+|+): Preserve all whitespace exactly as written
   */
  private static applyPreserveAllChomping(text: string): string {
    // Return text exactly as it was, no modifications
    return text;
  }

  /**
   * Find the minimum indentation level among non-empty lines
   */
  private static findMinimumIndentation(lines: string[]): number {
    let minIndent = Infinity;
    let hasNonEmptyLines = false;

    for (const line of lines) {
      if (line.trim() === '') {
        continue; // Skip empty lines
      }

      hasNonEmptyLines = true;
      let indent = 0;
      for (const char of line) {
        if (char === ' ') {
          indent++;
        } else if (char === '\t') {
          indent += 8; // Tab counts as 8 spaces
        } else {
          break;
        }
      }

      minIndent = Math.min(minIndent, indent);
    }

    return hasNonEmptyLines ? minIndent : 0;
  }

  /**
   * Remove leading indentation from a line, accounting for tabs vs spaces
   */
  private static removeLeadingIndentation(line: string, spacesToRemove: number): string {
    let spacesRemoved = 0;
    let charIndex = 0;

    // Count characters to remove, accounting for tabs = 8 spaces
    while (charIndex < line.length && spacesRemoved < spacesToRemove) {
      const char = line[charIndex];
      if (char === ' ') {
        spacesRemoved++;
        charIndex++;
      } else if (char === '\t') {
        spacesRemoved += 8;
        charIndex++;
      } else {
        break;
      }
    }

    return line.substring(charIndex);
  }


  /**
   * Validate that a string conforms to chomping rules
   */
  static validateChompedString(text: string, marker: ChompingMarker): boolean {
    switch (marker) {
      case 'clean':
        // Should end with exactly one newline, no trailing whitespace
        return /[^\n]\n$|^$/.test(text);
      case 'trim':
        // Should not end with any newlines
        return !/\n$/.test(text);
      case 'preserve':
        // Should end with exactly one newline
        return /[^\n]\n$|^$/.test(text);
      case 'preserve_all':
        // No specific requirements - any ending is valid
        return true;
      default:
        return false;
    }
  }
}