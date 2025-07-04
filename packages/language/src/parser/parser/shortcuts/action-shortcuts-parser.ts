/**
 * Action Shortcuts Parser
 * 
 * Parses suggestion action shortcuts according to the formal specification.
 * Handles reply, dial, openUrl, shareLocation, viewLocation, saveEvent shortcuts.
 */

import type { TokenStream } from '../core/token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import type {
  SuggestionShortcut,
  ReplyShortcut,
  DialShortcut,
  OpenUrlShortcut,
  ShareLocationShortcut,
  ViewLocationShortcut,
  SaveEventShortcut
} from '../../ast/shortcuts/suggestion-types.js';
import type { Suggestion } from '../../ast/sections/message-types.js';
import type { Location } from '../../ast/core/base-types.js';

export class ActionShortcutsParser {
  
  /**
   * Parse a suggestion based on leading keyword
   */
  parseSuggestion(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): Suggestion {
    const shortcut = this.parseActionShortcut(tokenStream, getPosition);
    
    // Convert shortcut to full suggestion structure
    return this.convertShortcutToSuggestion(shortcut);
  }

  /**
   * Parse an action shortcut based on the leading keyword
   */
  parseActionShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): SuggestionShortcut {
    if (tokenStream.check(RclTokens.REPLY_KW)) {
      return this.parseReplyShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.DIAL_KW)) {
      return this.parseDialShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.OPEN_URL_KW)) {
      return this.parseOpenUrlShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.SHARE_LOCATION_KW)) {
      return this.parseShareLocationShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.VIEW_LOCATION_KW)) {
      return this.parseViewLocationShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.SAVE_EVENT_KW)) {
      return this.parseSaveEventShortcut(tokenStream, getPosition);
    }
    
    throw new Error(`Unknown action shortcut: ${tokenStream.peek()?.image}`);
  }

  /**
   * Parse reply shortcut: reply "text"
   */
  private parseReplyShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): ReplyShortcut {
    const start = getPosition();
    
    // Consume 'reply' keyword
    tokenStream.consume(RclTokens.REPLY_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after reply keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    // Parse optional postback data (typically embedded expression)
    let postbackData: string | undefined;
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.EMBEDDED_CODE)) {
      const codeToken = tokenStream.advance();
      postbackData = codeToken.image;
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'ReplyShortcut',
      type: 'ReplyShortcut',
      text,
      postbackData,
      location
    };
  }

  /**
   * Parse dial shortcut: dial "text" <phone>
   */
  private parseDialShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): DialShortcut {
    const start = getPosition();
    
    // Consume 'dial' keyword
    tokenStream.consume(RclTokens.DIAL_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after dial keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    this.skipWhitespace(tokenStream);
    
    // Parse phone number type tag
    const phoneTag = this.parseTypeTag(tokenStream);
    if (phoneTag.typeName !== 'phone') {
      throw new Error('Expected <phone> type tag after dial text');
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'DialShortcut',
      type: 'DialShortcut',
      text,
      phoneNumber: phoneTag.value,
      location
    };
  }

  /**
   * Parse openUrl shortcut: openUrl "text" <url>
   */
  private parseOpenUrlShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): OpenUrlShortcut {
    const start = getPosition();
    
    // Consume 'openUrl' keyword
    tokenStream.consume(RclTokens.OPEN_URL_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after openUrl keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    this.skipWhitespace(tokenStream);
    
    // Parse URL type tag
    const urlTag = this.parseTypeTag(tokenStream);
    if (urlTag.typeName !== 'url') {
      throw new Error('Expected <url> type tag after openUrl text');
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'OpenUrlShortcut',
      type: 'OpenUrlShortcut',
      text,
      url: urlTag.value,
      location
    };
  }

  /**
   * Parse shareLocation shortcut: shareLocation "text"
   */
  private parseShareLocationShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): ShareLocationShortcut {
    const start = getPosition();
    
    // Consume 'shareLocation' keyword
    tokenStream.consume(RclTokens.SHARE_LOCATION_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after shareLocation keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'ShareLocationShortcut',
      type: 'ShareLocationShortcut',
      text,
      location
    };
  }

  /**
   * Parse viewLocation shortcut: viewLocation "text" <coordinate>
   */
  private parseViewLocationShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): ViewLocationShortcut {
    const start = getPosition();
    
    // Consume 'viewLocation' keyword
    tokenStream.consume(RclTokens.VIEW_LOCATION_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after viewLocation keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    this.skipWhitespace(tokenStream);
    
    // Parse optional coordinate type tag
    let latitude: number | undefined;
    let longitude: number | undefined;
    let label: string | undefined;
    
    if (tokenStream.check(RclTokens.LT)) {
      // Parse coordinate or location type tag
      const locationTag = this.parseTypeTag(tokenStream);
      
      if (locationTag.typeName === 'coordinate') {
        // Parse "lat,lng" format
        const coords = locationTag.value.split(',');
        if (coords.length === 2) {
          latitude = parseFloat(coords[0].trim());
          longitude = parseFloat(coords[1].trim());
        }
      } else if (locationTag.typeName === 'location') {
        label = locationTag.value;
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'ViewLocationShortcut',
      type: 'ViewLocationShortcut',
      text,
      latitude,
      longitude,
      label,
      location
    };
  }

  /**
   * Parse saveEvent shortcut: saveEvent "text"
   */
  private parseSaveEventShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): SaveEventShortcut {
    const start = getPosition();
    
    // Consume 'saveEvent' keyword
    tokenStream.consume(RclTokens.SAVE_EVENT_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse display text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after saveEvent keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    // Parse optional event details (typically in an indented block)
    let title: string | undefined;
    let description: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;
    
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.COLON)) {
      tokenStream.advance();
      this.consumeNewlineOrEnd(tokenStream);
      
      if (tokenStream.check(RclTokens.INDENT)) {
        tokenStream.advance();
        
        // Parse event properties
        while (!tokenStream.check(RclTokens.DEDENT) && !tokenStream.isAtEnd()) {
          if (this.checkAttributeKey(tokenStream, 'title')) {
            title = this.parseStringAttribute(tokenStream, 'title');
          } else if (this.checkAttributeKey(tokenStream, 'description')) {
            description = this.parseStringAttribute(tokenStream, 'description');
          } else if (this.checkAttributeKey(tokenStream, 'startTime')) {
            startTime = this.parseStringAttribute(tokenStream, 'startTime');
          } else if (this.checkAttributeKey(tokenStream, 'endTime')) {
            endTime = this.parseStringAttribute(tokenStream, 'endTime');
          } else {
            tokenStream.advance(); // Skip unknown tokens
          }
        }
        
        if (tokenStream.check(RclTokens.DEDENT)) {
          tokenStream.advance();
        }
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'SaveEventShortcut',
      type: 'SaveEventShortcut',
      text,
      title,
      description,
      startTime,
      endTime,
      location
    };
  }

  /**
   * Convert a shortcut to a full Suggestion AST node
   */
  private convertShortcutToSuggestion(shortcut: SuggestionShortcut): Suggestion {
    // This would generate the full RCS-compliant suggestion structure
    // For now, return a simplified structure
    return {
      type: 'Suggestion',
      // TODO: Implement full conversion based on shortcut type
      location: shortcut.location
    } as Suggestion;
  }

  // Helper methods

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

  private parseTypeTag(tokenStream: TokenStream): { typeName: string; value: string } {
    tokenStream.consume(RclTokens.LT);
    
    // Parse type name
    let typeName = '';
    if (tokenStream.check(RclTokens.PHONE_TYPE)) {
      typeName = tokenStream.advance().image;
    } else if (tokenStream.check(RclTokens.URL_TYPE)) {
      typeName = tokenStream.advance().image;
    } else if (tokenStream.check(RclTokens.EMAIL_TYPE)) {
      typeName = tokenStream.advance().image;
    } else {
      // Handle generic type names
      if (tokenStream.check(RclTokens.IDENTIFIER)) {
        typeName = tokenStream.advance().image.toLowerCase();
      } else {
        throw new Error('Expected type name in type tag');
      }
    }
    
    this.skipWhitespace(tokenStream);
    
    // Parse value - collect all tokens until >
    let value = '';
    while (!tokenStream.check(RclTokens.GT) && !tokenStream.isAtEnd()) {
      const token = tokenStream.advance();
      value += token.image;
    }
    
    tokenStream.consume(RclTokens.GT);
    
    return { typeName, value: value.trim() };
  }

  private checkAttributeKey(tokenStream: TokenStream, key: string): boolean {
    const token = tokenStream.peek();
    return !!(token && token.image === key && 
             tokenStream.peek(1)?.tokenType === RclTokens.COLON);
  }

  private parseStringAttribute(tokenStream: TokenStream, key: string): string {
    // Consume key
    tokenStream.advance();
    tokenStream.consume(RclTokens.COLON);
    this.skipWhitespace(tokenStream);
    
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error(`Expected string value for ${key}`);
    }
    
    const stringToken = tokenStream.advance();
    const value = stringToken.image.slice(1, -1); // Remove quotes
    
    this.consumeNewlineOrEnd(tokenStream);
    return value;
  }
}