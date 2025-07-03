/**
 * Type Tag Parser
 * 
 * Parses type tag constructs like <email user@domain.com> according to the formal specification.
 * Handles type tag names, values, and optional modifiers.
 */

import type { TokenStream } from '../core/token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import type {
  TypeTag,
  TypedValue
} from '../../ast/values/type-tag-types.js';
import type { Location } from '../../ast/core/base-types.js';

export class TypeTagParser {
  
  /**
   * Parse a type tag according to specification:
   * TypeTag ::= '<' TYPE_TAG_NAME TypeTagValue ('|' TYPE_TAG_MODIFIER_CONTENT)? '>'
   */
  parseTypeTag(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): TypeTag {
    const start = getPosition();
    
    tokenStream.consume(RclTokens.LT);
    
    // Parse type name
    const typeName = this.parseTypeName(tokenStream);
    
    this.skipWhitespace(tokenStream);
    
    // Parse type value
    const value = this.parseTypeTagValue(tokenStream);
    
    // Parse optional modifier after |
    let modifier: string | undefined;
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.PIPE)) {
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
      modifier = this.parseTypeTagModifier(tokenStream);
    }
    
    tokenStream.consume(RclTokens.GT);
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      type: 'TypeTag',
      typeName,
      value,
      modifier,
      location
    };
  }

  /**
   * Parse a typed value - a regular value with an associated type tag
   */
  parseTypedValue(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): TypedValue {
    const start = getPosition();
    
    const typeTag = this.parseTypeTag(tokenStream, getPosition);
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      type: 'TypedValue',
      typeTag,
      location
    };
  }

  /**
   * Check if current position is a type tag
   */
  isTypeTag(tokenStream: TokenStream): boolean {
    return tokenStream.check(RclTokens.LT);
  }

  // Helper methods

  private parseTypeName(tokenStream: TokenStream): string {
    // Parse specific type tag names
    if (tokenStream.check(RclTokens.EMAIL_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.PHONE_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.MSISDN_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.URL_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.TIME_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.T_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.DATETIME_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.DATE_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.DT_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.ZIPCODE_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.ZIP_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.DURATION_TYPE)) {
      return tokenStream.advance().image;
    }
    if (tokenStream.check(RclTokens.TTL_TYPE)) {
      return tokenStream.advance().image;
    }
    
    // Allow generic identifiers as type names
    if (tokenStream.check(RclTokens.IDENTIFIER)) {
      return tokenStream.advance().image.toLowerCase();
    }
    
    throw new Error('Expected type name in type tag');
  }

  private parseTypeTagValue(tokenStream: TokenStream): string {
    let value = '';
    
    // Collect all content until > or |
    while (!tokenStream.check(RclTokens.GT) && 
           !tokenStream.check(RclTokens.PIPE) && 
           !tokenStream.isAtEnd()) {
      
      const token = tokenStream.advance();
      value += token.image;
    }
    
    return value.trim();
  }

  private parseTypeTagModifier(tokenStream: TokenStream): string {
    let modifier = '';
    
    // Collect all content until >
    while (!tokenStream.check(RclTokens.GT) && !tokenStream.isAtEnd()) {
      const token = tokenStream.advance();
      modifier += token.image;
    }
    
    return modifier.trim();
  }

  private skipWhitespace(tokenStream: TokenStream): void {
    while (tokenStream.check(RclTokens.WS)) {
      tokenStream.advance();
    }
  }

  /**
   * Get the expected type for a type tag name
   */
  getExpectedValueType(typeName: string): string {
    switch (typeName) {
      case 'email':
        return 'email address';
      case 'phone':
      case 'msisdn':
        return 'phone number';
      case 'url':
        return 'URL';
      case 'time':
      case 't':
      case 'datetime':
      case 'date':
      case 'dt':
        return 'date/time value';
      case 'zipcode':
      case 'zip':
        return 'postal code';
      case 'duration':
      case 'ttl':
        return 'duration value';
      default:
        return 'value';
    }
  }

  /**
   * Validate type tag value format
   */
  validateTypeTagValue(typeName: string, value: string): { valid: boolean; message?: string } {
    switch (typeName) {
      case 'email':
        if (!this.isValidEmail(value)) {
          return { valid: false, message: 'Invalid email format' };
        }
        break;
      case 'phone':
      case 'msisdn':
        if (!this.isValidPhoneNumber(value)) {
          return { valid: false, message: 'Invalid phone number format' };
        }
        break;
      case 'url':
        if (!this.isValidUrl(value)) {
          return { valid: false, message: 'Invalid URL format' };
        }
        break;
      // Add more validations as needed
    }
    
    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - allows various formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}