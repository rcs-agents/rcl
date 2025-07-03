/**
 * Error Handler
 * 
 * Collects and manages lexical errors during tokenization.
 * Provides structured error reporting with position information.
 */

import type { LexingError } from './lexer-base.js';

export class ErrorHandler {
  private errors: LexingError[] = [];

  reset(): void {
    this.errors = [];
  }

  /**
   * Add a lexical error
   */
  addError(
    message: string,
    offset: number,
    length: number,
    line: number,
    column: number
  ): void {
    this.errors.push({
      message,
      offset,
      length,
      line,
      column
    });
  }

  /**
   * Get all collected errors
   */
  getErrors(): LexingError[] {
    return [...this.errors];
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors for a specific line
   */
  getErrorsForLine(line: number): LexingError[] {
    return this.errors.filter(error => error.line === line);
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.map(error => 
      `Line ${error.line}, Column ${error.column}: ${error.message}`
    );
  }
}