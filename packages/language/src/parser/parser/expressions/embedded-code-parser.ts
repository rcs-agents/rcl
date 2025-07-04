/**
 * Embedded Code Parser
 * 
 * Parses embedded JavaScript/TypeScript expressions according to the formal specification.
 * Handles both single-line ($js> code) and multi-line (indentation-based) embedded expressions.
 */

import type { TokenStream } from '../core/token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import type {
  EmbeddedExpression,
  EmbeddedCodeBlock
} from '../../ast/values/embedded-types.js';
import type { Location } from '../../ast/core/base-types.js';

export class EmbeddedCodeParser {
  
  /**
   * Parse a single-line embedded expression: $js> code, $ts> code, $> code
   */
  parseEmbeddedExpression(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): EmbeddedExpression {
    const start = getPosition();
    
    if (!tokenStream.check(RclTokens.EMBEDDED_CODE)) {
      throw new Error(`Expected embedded expression, got ${tokenStream.peek()?.image}`);
    }
    
    const token = tokenStream.advance();
    const fullContent = token.image;
    
    // Extract language and content from patterns like "$js> code", "$ts> code", or "$> code"
    const languageMatch = fullContent.match(/^\$((js|ts)?>)/);
    if (!languageMatch) {
      throw new Error(`Invalid embedded expression format: ${fullContent}`);
    }
    
    // Handle the language extraction: if it's just ">", default to "js"
    let language: 'js' | 'ts';
    if (languageMatch[1] === '>') {
      language = 'js'; // Default language for $> syntax
    } else {
      language = languageMatch[1].slice(0, -1) as 'js' | 'ts'; // Remove the '>' and use 'js' or 'ts'
    }
    
    const content = fullContent.slice(languageMatch[0].length).trim();
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'EmbeddedExpression',
      type: 'EmbeddedExpression',
      language,
      content,
      isMultiline: false,
      location
    };
  }
  
  /**
   * Parse a multi-line embedded expression block (fixed per specification):
   * $js>>>
   *   code here
   *   more code
   * 
   * Note: Fixed to use indentation instead of braces
   */
  parseEmbeddedCodeBlock(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): EmbeddedCodeBlock {
    const start = getPosition();
    
    if (!tokenStream.check(RclTokens.MULTI_LINE_EXPRESSION_START)) {
      throw new Error(`Expected multi-line expression, got ${tokenStream.peek()?.image}`);
    }
    
    const token = tokenStream.advance();
    const startMarker = token.image;
    
    // Extract language from patterns like "$js>>>", "$ts>>>", or "$>>>"
    const languageMatch = startMarker.match(/^\$((js|ts)?)>>>/);
    if (!languageMatch) {
      throw new Error(`Invalid multi-line expression format: ${startMarker}`);
    }
    
    const language = (languageMatch[2] || 'js') as 'js' | 'ts';
    
    this.consumeNewlineOrEnd(tokenStream);
    
    // Parse indented content block
    const contentLines: string[] = [];
    
    if (tokenStream.check(RclTokens.MULTI_LINE_EXPRESSION_CONTENT)) {
      // Content was extracted by the lexer in special mode
      const contentToken = tokenStream.advance();
      const rawContent = contentToken.image;
      
      // Split into lines and process indentation
      contentLines.push(...this.processIndentedContent(rawContent));
    } else {
      // Fallback: manually parse indented block
      if (tokenStream.check(RclTokens.INDENT)) {
        tokenStream.advance();
        
        while (!tokenStream.check(RclTokens.DEDENT) && !tokenStream.isAtEnd()) {
          const line = this.parseCodeLine(tokenStream);
          if (line.trim()) {
            contentLines.push(line);
          }
          this.consumeNewlineOrEnd(tokenStream);
        }
        
        if (tokenStream.check(RclTokens.DEDENT)) {
          tokenStream.advance();
        }
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'EmbeddedCodeBlock',
      type: 'EmbeddedCodeBlock',
      language,
      content: contentLines,
      isMultiline: true,
      location
    };
  }

  /**
   * Check if current position is an embedded expression
   */
  isEmbeddedExpression(tokenStream: TokenStream): boolean {
    return tokenStream.check(RclTokens.EMBEDDED_CODE) ||
           tokenStream.check(RclTokens.MULTI_LINE_EXPRESSION_START);
  }

  /**
   * Parse any embedded expression (single or multi-line)
   */
  parseAnyEmbeddedExpression(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): EmbeddedExpression | EmbeddedCodeBlock {
    if (tokenStream.check(RclTokens.EMBEDDED_CODE)) {
      return this.parseEmbeddedExpression(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.MULTI_LINE_EXPRESSION_START)) {
      return this.parseEmbeddedCodeBlock(tokenStream, getPosition);
    }
    
    throw new Error('Expected embedded expression');
  }

  // Helper methods

  private consumeNewlineOrEnd(tokenStream: TokenStream): void {
    if (tokenStream.check(RclTokens.NL)) {
      tokenStream.advance();
    }
  }

  private parseCodeLine(tokenStream: TokenStream): string {
    let line = '';
    
    // Collect all tokens until newline or dedent
    while (!tokenStream.check(RclTokens.NL) && 
           !tokenStream.check(RclTokens.DEDENT) && 
           !tokenStream.isAtEnd()) {
      const token = tokenStream.advance();
      line += token.image;
    }
    
    return line;
  }

  private processIndentedContent(rawContent: string): string[] {
    const lines = rawContent.split(/\r?\n/);
    const processedLines: string[] = [];
    
    // Find the minimum indentation level (excluding empty lines)
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    if (nonEmptyLines.length === 0) {
      return [];
    }
    
    const minIndent = Math.min(...nonEmptyLines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }));
    
    // Remove the common indentation from all lines
    for (const line of lines) {
      if (line.trim().length === 0) {
        processedLines.push(''); // Preserve empty lines
      } else {
        processedLines.push(line.slice(minIndent));
      }
    }
    
    // Remove leading and trailing empty lines
    while (processedLines.length > 0 && processedLines[0].trim() === '') {
      processedLines.shift();
    }
    while (processedLines.length > 0 && processedLines[processedLines.length - 1].trim() === '') {
      processedLines.pop();
    }
    
    return processedLines;
  }

  /**
   * Validate embedded code syntax (basic validation)
   */
  validateEmbeddedCode(language: 'js' | 'ts', content: string): { valid: boolean; message?: string } {
    // Basic syntax validation
    if (!content.trim()) {
      return { valid: false, message: 'Empty embedded expression' };
    }
    
    // Check for balanced braces, brackets, parentheses
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    
    for (const char of content) {
      if (char in brackets) {
        stack.push(brackets[char as keyof typeof brackets]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.length === 0 || stack.pop() !== char) {
          return { valid: false, message: 'Unbalanced brackets' };
        }
      }
    }
    
    if (stack.length > 0) {
      return { valid: false, message: 'Unclosed brackets' };
    }
    
    // Language-specific validation could be added here
    // For now, we'll do basic checks
    
    if (language === 'ts') {
      // TypeScript-specific checks could go here
    }
    
    return { valid: true };
  }

  /**
   * Extract embedded expressions from a text value
   */
  extractEmbeddedExpressions(text: string): Array<{ start: number; end: number; expression: string; language: 'js' | 'ts' }> {
    const expressions: Array<{ start: number; end: number; expression: string; language: 'js' | 'ts' }> = [];
    
    // Pattern to match embedded expressions in strings
    const pattern = /\$((js|ts)?>)\s*([^\r\n]*)/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const language = match[1] === '>' ? 'js' : (match[1].slice(0, -1) as 'js' | 'ts');
      expressions.push({
        start: match.index,
        end: match.index + match[0].length,
        expression: match[3].trim(),
        language
      });
    }
    
    return expressions;
  }
}