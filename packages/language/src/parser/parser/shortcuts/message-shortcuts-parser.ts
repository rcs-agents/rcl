/**
 * Message Shortcuts Parser
 * 
 * Parses all RCS message shortcuts according to the formal specification.
 * This is one of the core missing features from the original implementation.
 */

import type { TokenStream } from '../core/token-stream.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import type {
  MessageShortcut,
  TextShortcut,
  RichCardShortcut,
  CarouselShortcut,
  RbmFileShortcut,
  FileShortcut
} from '../../ast/shortcuts/message-shortcut-types.js';
import type { Suggestion } from '../../ast/sections/message-types.js';
import type { Location } from '../../ast/core/base-types.js';

export class MessageShortcutsParser {
  
  /**
   * Parse a message shortcut based on the leading keyword
   */
  parseMessageShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): MessageShortcut {
    
    if (tokenStream.check(RclTokens.TEXT_KW)) {
      return this.parseTextShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.RICH_CARD_KW)) {
      return this.parseRichCardShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.CAROUSEL_KW)) {
      return this.parseCarouselShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.RBM_FILE_KW)) {
      return this.parseRbmFileShortcut(tokenStream, getPosition);
    }
    
    if (tokenStream.check(RclTokens.FILE_KW)) {
      return this.parseFileShortcut(tokenStream, getPosition);
    }
    
    throw new Error(`Unknown message shortcut: ${tokenStream.peek()?.image}`);
  }

  /**
   * Parse text shortcut: text "message content"
   * Optional: suggestions block, message traffic type prefix
   */
  private parseTextShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): TextShortcut {
    const start = getPosition();
    
    // Parse optional message traffic type prefix
    let messageTrafficType: 'transactional' | 'promotional' | undefined;
    if (tokenStream.check(RclTokens.TRANSACTIONAL_KW)) {
      messageTrafficType = 'transactional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    } else if (tokenStream.check(RclTokens.PROMOTIONAL_KW)) {
      messageTrafficType = 'promotional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    }
    
    // Consume 'text' keyword
    tokenStream.consume(RclTokens.TEXT_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse message text
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string after text keyword');
    }
    const textToken = tokenStream.advance();
    const text = textToken.image.slice(1, -1); // Remove quotes
    
    // Parse optional suggestions
    const suggestions = this.parseOptionalSuggestions(tokenStream, getPosition);
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'TextShortcut',
      type: 'TextShortcut',
      text,
      messageTrafficType,
      suggestions,
      location
    };
  }

  /**
   * Parse rich card shortcut: richCard "title" :orientation :alignment :size <url>
   */
  private parseRichCardShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): RichCardShortcut {
    const start = getPosition();
    
    // Parse optional message traffic type prefix
    let messageTrafficType: 'transactional' | 'promotional' | undefined;
    if (tokenStream.check(RclTokens.TRANSACTIONAL_KW)) {
      messageTrafficType = 'transactional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    } else if (tokenStream.check(RclTokens.PROMOTIONAL_KW)) {
      messageTrafficType = 'promotional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    }
    
    // Consume 'richCard' keyword
    tokenStream.consume(RclTokens.RICH_CARD_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse title
    if (!tokenStream.check(RclTokens.STRING)) {
      throw new Error('Expected string title after richCard keyword');
    }
    const titleToken = tokenStream.advance();
    const title = titleToken.image.slice(1, -1); // Remove quotes
    
    // Parse optional modifiers and image URL
    let orientation: 'horizontal' | 'vertical' | undefined;
    let alignment: 'left' | 'center' | 'right' | undefined;
    let size: 'small' | 'medium' | 'large' | undefined;
    let imageUrl: string | undefined;
    let description: string | undefined;
    
    // Parse atoms and type tags in sequence
    while (!tokenStream.isAtEnd() && !this.isEndOfStatement(tokenStream)) {
      this.skipWhitespace(tokenStream);
      
      if (tokenStream.check(RclTokens.ATOM)) {
        const atomToken = tokenStream.advance();
        const atomValue = atomToken.image.slice(1); // Remove :
        
        // Parse orientation atoms
        if (atomValue === 'horizontal' || atomValue === 'vertical') {
          orientation = atomValue as 'horizontal' | 'vertical';
        }
        // Parse alignment atoms  
        else if (atomValue === 'left' || atomValue === 'center' || atomValue === 'right') {
          alignment = atomValue as 'left' | 'center' | 'right';
        }
        // Parse size atoms
        else if (atomValue === 'small' || atomValue === 'medium' || atomValue === 'large') {
          size = atomValue as 'small' | 'medium' | 'large';
        }
      }
      // Parse type tag for image URL: <url ...>
      else if (tokenStream.check(RclTokens.LT)) {
        const typeTagResult = this.parseTypeTag(tokenStream);
        if (typeTagResult.typeName === 'url') {
          imageUrl = typeTagResult.value;
        }
      }
      // Parse colon for block content
      else if (tokenStream.check(RclTokens.COLON)) {
        tokenStream.advance();
        this.consumeNewlineOrEnd(tokenStream);
        
        // Parse indented block for description and suggestions
        if (tokenStream.check(RclTokens.INDENT)) {
          tokenStream.advance();
          
          // Parse description if present
          if (this.checkAttributeKey(tokenStream, 'description')) {
            description = this.parseStringAttribute(tokenStream, 'description');
          }
          
          // Parse suggestions if present
          this.parseOptionalSuggestions(tokenStream, getPosition);
          
          if (tokenStream.check(RclTokens.DEDENT)) {
            tokenStream.advance();
          }
        }
        break;
      }
      else {
        break;
      }
    }
    
    const suggestions = this.parseOptionalSuggestions(tokenStream, getPosition);
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'RichCardShortcut',
      type: 'RichCardShortcut',
      title,
      orientation,
      alignment,
      size,
      imageUrl,
      description,
      suggestions,
      messageTrafficType,
      location
    };
  }

  /**
   * Parse carousel shortcut: carousel :size
   */
  private parseCarouselShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): CarouselShortcut {
    const start = getPosition();
    
    // Parse optional message traffic type prefix
    let messageTrafficType: 'transactional' | 'promotional' | undefined;
    if (tokenStream.check(RclTokens.TRANSACTIONAL_KW)) {
      messageTrafficType = 'transactional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    } else if (tokenStream.check(RclTokens.PROMOTIONAL_KW)) {
      messageTrafficType = 'promotional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    }
    
    // Consume 'carousel' keyword
    tokenStream.consume(RclTokens.CAROUSEL_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse optional size atom
    let size: 'small' | 'medium' | undefined;
    if (tokenStream.check(RclTokens.ATOM)) {
      const atomToken = tokenStream.advance();
      const atomValue = atomToken.image.slice(1); // Remove :
      if (atomValue === 'small' || atomValue === 'medium') {
        size = atomValue as 'small' | 'medium';
      }
    }
    
    // Expect colon and indented block
    tokenStream.consume(RclTokens.COLON);
    this.consumeNewlineOrEnd(tokenStream);
    tokenStream.consume(RclTokens.INDENT);
    
    // Parse rich card shortcuts in the block
    const cards: RichCardShortcut[] = [];
    while (!tokenStream.check(RclTokens.DEDENT) && !tokenStream.isAtEnd()) {
      if (tokenStream.check(RclTokens.RICH_CARD_KW)) {
        const card = this.parseRichCardShortcut(tokenStream, getPosition);
        cards.push(card);
      } else {
        this.skipWhitespace(tokenStream);
        if (!tokenStream.check(RclTokens.DEDENT)) {
          tokenStream.advance(); // Skip unexpected tokens
        }
      }
    }
    
    if (tokenStream.check(RclTokens.DEDENT)) {
      tokenStream.advance();
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'CarouselShortcut',
      type: 'CarouselShortcut',
      size,
      cards,
      messageTrafficType,
      location
    };
  }

  /**
   * Parse RBM file shortcut: rbmFile <url>
   */
  private parseRbmFileShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): RbmFileShortcut {
    const start = getPosition();
    
    // Parse optional message traffic type prefix
    let messageTrafficType: 'transactional' | 'promotional' | undefined;
    if (tokenStream.check(RclTokens.TRANSACTIONAL_KW)) {
      messageTrafficType = 'transactional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    } else if (tokenStream.check(RclTokens.PROMOTIONAL_KW)) {
      messageTrafficType = 'promotional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    }
    
    // Consume 'rbmFile' keyword
    tokenStream.consume(RclTokens.RBM_FILE_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse file URL type tag
    const fileUrlTag = this.parseTypeTag(tokenStream);
    if (fileUrlTag.typeName !== 'url') {
      throw new Error('Expected <url> type tag after rbmFile');
    }
    
    // Parse optional thumbnail URL
    let thumbnailUrl: string | undefined;
    this.skipWhitespace(tokenStream);
    if (tokenStream.check(RclTokens.LT)) {
      const thumbnailTag = this.parseTypeTag(tokenStream);
      if (thumbnailTag.typeName === 'url') {
        thumbnailUrl = thumbnailTag.value;
      }
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'RbmFileShortcut',
      type: 'RbmFileShortcut',
      fileUrl: fileUrlTag.value,
      thumbnailUrl,
      messageTrafficType,
      location
    };
  }

  /**
   * Parse file shortcut: file <url>
   */
  private parseFileShortcut(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): FileShortcut {
    const start = getPosition();
    
    // Parse optional message traffic type prefix
    let messageTrafficType: 'transactional' | 'promotional' | undefined;
    if (tokenStream.check(RclTokens.TRANSACTIONAL_KW)) {
      messageTrafficType = 'transactional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    } else if (tokenStream.check(RclTokens.PROMOTIONAL_KW)) {
      messageTrafficType = 'promotional';
      tokenStream.advance();
      this.skipWhitespace(tokenStream);
    }
    
    // Consume 'file' keyword
    tokenStream.consume(RclTokens.FILE_KW);
    this.skipWhitespace(tokenStream);
    
    // Parse file URL type tag
    const fileUrlTag = this.parseTypeTag(tokenStream);
    if (fileUrlTag.typeName !== 'url') {
      throw new Error('Expected <url> type tag after file');
    }
    
    const end = getPosition();
    const location: Location = { start, end };

    return {
      $type: 'FileShortcut',
      type: 'FileShortcut',
      fileUrl: fileUrlTag.value,
      messageTrafficType,
      location
    };
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

  private isEndOfStatement(tokenStream: TokenStream): boolean {
    return tokenStream.check(RclTokens.NL) || 
           tokenStream.check(RclTokens.COLON) ||
           tokenStream.check(RclTokens.DEDENT) ||
           tokenStream.isAtEnd();
  }

  private parseTypeTag(tokenStream: TokenStream): { typeName: string; value: string } {
    tokenStream.consume(RclTokens.LT);
    
    // Parse type name
    let typeName = '';
    if (tokenStream.check(RclTokens.URL_TYPE)) {
      typeName = tokenStream.advance().image;
    } else if (tokenStream.check(RclTokens.EMAIL_TYPE)) {
      typeName = tokenStream.advance().image;
    } else if (tokenStream.check(RclTokens.PHONE_TYPE)) {
      typeName = tokenStream.advance().image;
    } else {
      throw new Error('Expected type name in type tag');
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

  private parseOptionalSuggestions(
    tokenStream: TokenStream,
    getPosition: () => { line: number; column: number; offset: number }
  ): Suggestion[] | undefined {
    // TODO: Implement suggestion parsing
    // This is a placeholder for now
    return undefined;
  }
}