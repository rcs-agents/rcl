/**
 * Flow Transitions Parser
 * 
 * Parses flow rules and transitions according to the formal specification.
 * Handles multi-arrow sequences (A -> B -> C) and with/when clauses.
 */

import type { TokenStream } from '../core/token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import type {
  FlowRule,
  FlowTransition
} from '../../ast/sections/flow-types.js';
import type { 
  FlowOperand,
  WithClause,
  WhenClause
} from '../../ast/flow-system/flow-control-types.js';
import type { Location } from '../../ast/core/base-types.js';

export class FlowTransitionsParser {
  
  /**
   * Parse a flow rule according to specification:
   * FlowRule ::= FlowOperandOrExpression ('->' FlowOperandOrExpression)+ (WithClause)?
   */
  parseFlowRule(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): FlowRule {
    const start = getPosition();
    
    const operands: FlowOperand[] = [];
    
    // Parse first operand
    operands.push(this.parseFlowOperand(tokenStream, getPosition));
    
    // Parse sequence of arrows and operands: -> B -> C -> D
    while (!tokenStream.isAtEnd() && !this.isEndOfRule(tokenStream)) {
      this.skipWhitespace(tokenStream);
      
      if (tokenStream.check(RclTokens.ARROW)) {
        tokenStream.advance(); // consume ->
        this.skipWhitespace(tokenStream);
        
        // Parse next operand
        operands.push(this.parseFlowOperand(tokenStream, getPosition));
      } else {
        break;
      }
    }
    
    // Parse optional with clause
    let withClause: WithClause | undefined;
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.WITH_KW)) {
      withClause = this.parseWithClause(tokenStream, getPosition);
    }
    
    // Parse optional when clauses
    const whenClauses: WhenClause[] = [];
    while (tokenStream.check(RclTokens.WHEN_KW)) {
      whenClauses.push(this.parseWhenClause(tokenStream, getPosition));
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'FlowRule',
      type: 'FlowRule',
      operands,
      withClause,
      whenClauses,
      location
    };
  }

  /**
   * Parse a flow operand (atom, string, or identifier)
   */
  parseFlowOperand(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): FlowOperand {
    const start = getPosition();
    
    if (tokenStream.check(RclTokens.ATOM)) {
      const token = tokenStream.advance();
      const end = getPosition();
      return {
        $type: 'FlowOperand',
        type: 'FlowOperand',
        operandType: 'atom',
        value: token.image,
        location: { start, end }
      };
    }
    
    if (tokenStream.check(RclTokens.STRING)) {
      const token = tokenStream.advance();
      const value = token.image.slice(1, -1); // Remove quotes
      const end = getPosition();
      return {
        $type: 'FlowOperand',
        type: 'FlowOperand',
        operandType: 'string',
        value,
        location: { start, end }
      };
    }
    
    // Parse space-separated identifier
    const value = this.parseSpaceSeparatedIdentifier(tokenStream);
    const end = getPosition();
    
    return {
      $type: 'FlowOperand',
      type: 'FlowOperand',
      operandType: 'identifier',
      value,
      location: { start, end }
    };
  }

  /**
   * Parse a with clause for parameter passing:
   * with
   *   param1: value1
   *   param2: value2
   */
  parseWithClause(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): WithClause {
    const start = getPosition();
    
    tokenStream.consume(RclTokens.WITH_KW);
    this.consumeNewlineOrEnd(tokenStream);
    
    const parameters: any[] = []; // TODO: Import Parameter type
    
    // Parse indented parameter block
    if (tokenStream.check(RclTokens.INDENT)) {
      tokenStream.advance();
      
      while (!tokenStream.check(RclTokens.DEDENT) && !tokenStream.isAtEnd()) {
        if (this.isParameterStart(tokenStream)) {
          parameters.push(this.parseParameter(tokenStream, getPosition));
        } else {
          this.skipWhitespace(tokenStream);
          if (!tokenStream.check(RclTokens.DEDENT)) {
            tokenStream.advance();
          }
        }
      }
      
      if (tokenStream.check(RclTokens.DEDENT)) {
        tokenStream.advance();
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };
    
    return {
      $type: 'WithClause',
      type: 'WithClause',
      parameters,
      location
    };
  }

  /**
   * Parse a when clause for conditional flow rules:
   * when condition:
   *   A -> B
   *   C -> D
   */
  parseWhenClause(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): WhenClause {
    const start = getPosition();
    
    tokenStream.consume(RclTokens.WHEN_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse condition (embedded expression or simple expression)
    const condition = this.parseCondition(tokenStream, getPosition);
    
    this.consumeNewlineOrEnd(tokenStream);
    
    const transitions: FlowTransition[] = [];
    
    // Parse indented transitions
    if (tokenStream.check(RclTokens.INDENT)) {
      tokenStream.advance();
      
      while (!tokenStream.check(RclTokens.DEDENT) && !tokenStream.isAtEnd()) {
        if (this.isFlowTransition(tokenStream)) {
          transitions.push(this.parseFlowTransition(tokenStream, getPosition));
        } else {
          this.skipWhitespace(tokenStream);
          if (!tokenStream.check(RclTokens.DEDENT)) {
            tokenStream.advance();
          }
        }
      }
      
      if (tokenStream.check(RclTokens.DEDENT)) {
        tokenStream.advance();
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };
    
    return {
      $type: 'WhenClause',
      type: 'WhenClause',
      condition,
      transitions,
      location
    };
  }

  /**
   * Parse a single flow transition: A -> B
   */
  parseFlowTransition(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): FlowTransition {
    const start = getPosition();
    
    // Parse source operand
    const source = this.parseFlowOperand(tokenStream, getPosition);
    
    this.skipWhitespace(tokenStream);
    tokenStream.consume(RclTokens.ARROW);
    this.skipWhitespace(tokenStream);
    
    // Parse destination operand
    const destination = this.parseFlowOperand(tokenStream, getPosition);
    
    // Parse optional with clause
    let withClause: WithClause | undefined;
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.WITH_KW)) {
      withClause = this.parseWithClause(tokenStream, getPosition);
    }
    
    this.consumeNewlineOrEnd(tokenStream);
    const end = getPosition();
    const location: Location = { start, end };
    
    return {
      $type: 'FlowTransition',
      type: 'FlowTransition',
      source,
      destination,
      withClause,
      location
    };
  }

  // Helper methods

  private parseSpaceSeparatedIdentifier(tokenStream: TokenStream): string {
    const parts: string[] = [];
    
    // Parse first part
    if (tokenStream.check(RclTokens.IDENTIFIER)) {
      parts.push(tokenStream.advance().image);
    } else {
      throw new Error(`Expected identifier, got ${tokenStream.peek()?.image}`);
    }
    
    // Continue while we have space followed by identifier
    while (tokenStream.check(RclTokens.WS)) {
      const nextToken = tokenStream.peek(1);
      if (nextToken && nextToken.tokenType === RclTokens.IDENTIFIER) {
        tokenStream.advance(); // consume WS
        parts.push(tokenStream.advance().image); // consume IDENTIFIER
      } else {
        break;
      }
    }
    
    return parts.join(' ');
  }

  private parseCondition(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): any { // TODO: Import EmbeddedExpression type
    const start = getPosition();
    
    // For now, parse as a simple expression placeholder
    // TODO: Implement proper condition parsing with embedded expressions
    let conditionText = '';
    
    // Collect tokens until colon or newline
    while (!tokenStream.check(RclTokens.COLON) && 
           !tokenStream.check(RclTokens.NL) && 
           !tokenStream.isAtEnd()) {
      const token = tokenStream.advance();
      conditionText += token.image;
    }
    
    const end = getPosition();
    
    return {
      type: 'EmbeddedExpression',
      language: 'js',
      content: conditionText.trim(),
      isMultiline: false,
      location: { start, end }
    };
  }

  private parseParameter(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): any { // TODO: Import Parameter type
    const start = getPosition();
    
    // Parse parameter name
    let name: string;
    if (tokenStream.check(RclTokens.IDENTIFIER)) {
      name = tokenStream.advance().image;
    } else {
      throw new Error(`Expected parameter name, got ${tokenStream.peek()?.image}`);
    }
    
    this.skipWhitespace(tokenStream);
    tokenStream.consume(RclTokens.COLON);
    this.skipWhitespace(tokenStream);
    
    // Parse parameter value (simplified for now)
    let defaultValue: any = null;
    if (tokenStream.check(RclTokens.STRING)) {
      const token = tokenStream.advance();
      defaultValue = token.image.slice(1, -1); // Remove quotes
    } else if (tokenStream.check(RclTokens.NUMBER)) {
      const token = tokenStream.advance();
      defaultValue = parseFloat(token.image);
    } else if (tokenStream.check(RclTokens.EMBEDDED_CODE)) {
      const token = tokenStream.advance();
      defaultValue = token.image;
    }
    
    this.consumeNewlineOrEnd(tokenStream);
    const end = getPosition();
    
    return {
      type: 'Parameter',
      name,
      defaultValue,
      location: { start, end }
    };
  }

  private skipWhitespace(tokenStream: TokenStream): void {
    while (tokenStream.check(RclTokens.WS)) {
      tokenStream.advance();
    }
  }

  private consumeNewlineOrEnd(tokenStream: TokenStream): void {
    if (tokenStream.check(RclTokens.NL)) {
      tokenStream.advance();
    }
  }

  private isEndOfRule(tokenStream: TokenStream): boolean {
    return tokenStream.check(RclTokens.NL) || 
           tokenStream.check(RclTokens.WITH_KW) ||
           tokenStream.check(RclTokens.WHEN_KW) ||
           tokenStream.check(RclTokens.DEDENT) ||
           tokenStream.isAtEnd();
  }

  private isParameterStart(tokenStream: TokenStream): boolean {
    const token = tokenStream.peek();
    return !!(token && 
             tokenStream.check(RclTokens.IDENTIFIER) &&
             tokenStream.peek(1)?.tokenType === RclTokens.COLON);
  }

  private isFlowTransition(tokenStream: TokenStream): boolean {
    // Look ahead to see if we have operand -> operand pattern
    const currentPos = tokenStream.getCurrentPosition();
    
    try {
      // Skip whitespace
      while (tokenStream.check(RclTokens.WS)) {
        tokenStream.advance();
      }
      
      // Check for flow operand
      if (this.isFlowOperandStart(tokenStream)) {
        this.skipFlowOperand(tokenStream);
        
        // Skip whitespace
        while (tokenStream.check(RclTokens.WS)) {
          tokenStream.advance();
        }
        
        // Check for arrow
        const hasArrow = tokenStream.check(RclTokens.ARROW);
        tokenStream.setCurrentPosition(currentPos);
        return hasArrow;
      }
      
      tokenStream.setCurrentPosition(currentPos);
      return false;
    } catch {
      tokenStream.setCurrentPosition(currentPos);
      return false;
    }
  }

  private isFlowOperandStart(tokenStream: TokenStream): boolean {
    return tokenStream.check(RclTokens.ATOM) || 
           tokenStream.check(RclTokens.STRING) || 
           tokenStream.check(RclTokens.IDENTIFIER);
  }

  private skipFlowOperand(tokenStream: TokenStream): void {
    if (tokenStream.check(RclTokens.ATOM) || tokenStream.check(RclTokens.STRING)) {
      tokenStream.advance();
    } else if (tokenStream.check(RclTokens.IDENTIFIER)) {
      // Skip space-separated identifier
      tokenStream.advance();
      while (tokenStream.check(RclTokens.WS) && !tokenStream.isAtEnd()) {
        const nextToken = tokenStream.peek(1);
        if (nextToken && nextToken.tokenType === RclTokens.IDENTIFIER) {
          tokenStream.advance(); // consume WS
          tokenStream.advance(); // consume IDENTIFIER
        } else {
          break;
        }
      }
    }
  }
}