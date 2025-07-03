/**
 * Position Tracker
 * 
 * Tracks line, column, and offset positions during lexing.
 * Handles different newline formats (\n, \r, \r\n) correctly.
 */

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export class PositionTracker {
  private line: number = 1;
  private column: number = 1;
  private offset: number = 0;

  reset(): void {
    this.line = 1;
    this.column = 1;
    this.offset = 0;
  }

  /**
   * Get current position
   */
  getPosition(): Position {
    return {
      line: this.line,
      column: this.column,
      offset: this.offset
    };
  }

  /**
   * Get current line number
   */
  getLine(): number {
    return this.line;
  }

  /**
   * Get current column number
   */
  getColumn(): number {
    return this.column;
  }

  /**
   * Get current offset
   */
  getOffset(): number {
    return this.offset;
  }

  /**
   * Advance position by the given length in the text
   */
  advance(text: string, startOffset: number, length: number): void {
    for (let i = 0; i < length; i++) {
      const currentOffset = startOffset + i;
      if (currentOffset >= text.length) break;
      
      const char = text[currentOffset];
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else if (char === '\r') {
        // Handle \r\n and standalone \r
        if (currentOffset + 1 < text.length && text[currentOffset + 1] === '\n') {
          // \r\n - advance past both characters
          i++; // Skip the \n in the next iteration
        }
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }
    
    this.offset = startOffset + length;
  }

  /**
   * Update position to match the given offset
   */
  updateFromOffset(text: string, newOffset: number): void {
    const oldOffset = this.offset;
    if (newOffset > oldOffset) {
      this.advance(text, oldOffset, newOffset - oldOffset);
    } else if (newOffset < oldOffset) {
      // Reset and recalculate - this should be rare
      this.reset();
      this.advance(text, 0, newOffset);
    }
  }

  /**
   * Calculate end position after processing the given text
   */
  calculateEndPosition(text: string): Position {
    let endLine = this.line;
    let endColumn = this.column;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '\n') {
        endLine++;
        endColumn = 1;
      } else if (char === '\r') {
        // Handle \r\n and standalone \r
        if (i + 1 < text.length && text[i + 1] === '\n') {
          i++; // Skip the \n
        }
        endLine++;
        endColumn = 1;
      } else {
        endColumn++;
      }
    }

    return {
      line: endLine,
      column: endColumn,
      offset: this.offset + text.length
    };
  }

  /**
   * Set position directly (useful for testing)
   */
  setPosition(line: number, column: number, offset: number): void {
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}