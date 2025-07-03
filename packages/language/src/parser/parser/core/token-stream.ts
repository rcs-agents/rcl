/**
 * Token Stream
 * 
 * Manages token consumption and lookahead for the parser.
 * Provides utilities for navigating through the token stream.
 */

import type { IToken, TokenType } from 'chevrotain';

export class TokenStream {
  private tokens: IToken[] = [];
  private current: number = 0;

  /**
   * Set the tokens for this stream
   */
  setTokens(tokens: IToken[]): void {
    this.tokens = tokens;
    this.current = 0;
  }

  /**
   * Check if current token matches the given type
   */
  check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek()?.tokenType === type;
  }

  /**
   * Try to match and consume the given token type
   */
  match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  /**
   * Consume a token of the given type or throw error
   */
  consume(type: TokenType): IToken {
    if (this.check(type)) {
      return this.advance();
    }
    
    const current = this.peek();
    throw new Error(`Expected ${type.name} but got ${current?.tokenType?.name || 'EOF'}`);
  }

  /**
   * Advance to the next token
   */
  advance(): IToken {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * Check if we're at the end of the token stream
   */
  isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  /**
   * Peek at the current token (or lookahead)
   */
  peek(lookahead: number = 0): IToken | undefined {
    const index = this.current + lookahead;
    return index < this.tokens.length ? this.tokens[index] : undefined;
  }

  /**
   * Get the previous token
   */
  previous(): IToken {
    return this.tokens[this.current - 1];
  }

  /**
   * Get current position in token stream
   */
  getCurrentPosition(): number {
    return this.current;
  }

  /**
   * Set current position in token stream
   */
  setCurrentPosition(position: number): void {
    this.current = Math.max(0, Math.min(position, this.tokens.length));
  }

  /**
   * Reset to beginning of stream
   */
  reset(): void {
    this.current = 0;
  }

  /**
   * Get all tokens
   */
  getAllTokens(): readonly IToken[] {
    return this.tokens;
  }

  /**
   * Get tokens from current position to end
   */
  getRemainingTokens(): IToken[] {
    return this.tokens.slice(this.current);
  }

  /**
   * Skip tokens until we find one that matches the predicate
   */
  skipUntil(predicate: (token: IToken) => boolean): void {
    while (!this.isAtEnd() && !predicate(this.peek()!)) {
      this.advance();
    }
  }

  /**
   * Skip tokens while they match the predicate
   */
  skipWhile(predicate: (token: IToken) => boolean): void {
    while (!this.isAtEnd() && predicate(this.peek()!)) {
      this.advance();
    }
  }
}