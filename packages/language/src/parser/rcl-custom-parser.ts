import type { IToken } from 'chevrotain';
import { RclCustomLexer } from './rcl-custom-lexer.js';
import type {
  RclFile,
  Section,
  ImportStatement,
  Attribute,
  FlowRule,
  MessageDefinition,
  Value,
  StringValue,
  NumberValue,
  BooleanValue,
  NullValue,
  IdentifierValue,
  Position
} from './rcl-simple-ast.js';

// Import tokens from lexer
const RclToken = RclCustomLexer;

/**
 * Custom Recursive Descent Parser for RCL
 * 
 * Produces AST nodes that match the simplified RCL AST interfaces.
 * The structure follows a flat approach where sections can contain
 * attributes, sub-sections, flow rules, and message definitions.
 */
export class RclCustomParser {
  private lexer: RclCustomLexer;
  private tokens: IToken[] = [];
  private current = 0;
  private errors: string[] = [];

  constructor() {
    this.lexer = new RclCustomLexer();
  }

  /**
   * Parse RCL source code into an AST
   */
  parse(input: string): { ast: RclFile | null; errors: string[] } {
    try {
      const lexResult = this.lexer.tokenize(input);
      this.tokens = lexResult.tokens;
      this.current = 0;
      this.errors = [...lexResult.errors.map(e => e.message)];

      if (this.tokens.length === 0) {
        return {
          ast: this.createRclFile([]),
          errors: this.errors
        };
      }

      const ast = this.parseRclFile();

      // If there are errors and no sections or imports were parsed, treat as fatal
      if (this.errors.length > 0 && ast.sections.length === 0 && ast.imports.length === 0) {
        return { ast: null, errors: this.errors };
      }
      return { ast, errors: this.errors };
    } catch (error) {
      this.errors.push(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
      return { ast: null, errors: this.errors };
    }
  }

  private parseRclFile(): RclFile {
    const imports: ImportStatement[] = [];
    const sections: Section[] = [];
    
    // Parse imports at the top
    while (this.check(RclToken.IMPORT)) {
      try {
        const importStmt = this.parseImportStatement();
        imports.push(importStmt);
      } catch (error) {
        this.errors.push(`Import parsing error: ${error}`);
        this.synchronize();
      }
    }

    // Parse sections
    while (!this.isAtEnd()) {
      try {
        if (this.isNextSectionStart()) {
          const section = this.parseSection();
          sections.push(section);
        } else {
          // Skip whitespace tokens and empty tokens - they're valid between sections
          if (this.check(RclToken.WS) || this.check(RclToken.NL) || this.isEmptyToken()) {
            this.advance();
          } else {
            // Generate error for unexpected content in section body
            const unexpectedToken = this.peek();
            if (unexpectedToken) {
              this.errors.push(`Unexpected token '${unexpectedToken.image}' at line ${unexpectedToken.startLine}, column ${unexpectedToken.startColumn}`);
            }
            this.advance();
          }
        }
      } catch (error) {
        this.errors.push(`Section parsing error: ${error}`);
        this.synchronize();
      }
    }

    return this.createRclFile(imports, sections);
  }

  private parseImportStatement(): ImportStatement {
    const start = this.getPosition();
    this.consume(RclToken.IMPORT);
    
    // Skip whitespace before import name
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    const importedNames: string[] = [];
    
    // Parse import name(s)
    if (this.check(RclToken.IDENTIFIER)) {
      importedNames.push(this.advance().image);
    }
    
    // Handle 'as' alias
    let alias: string | undefined;
    // Skip whitespace before 'as'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    if (this.match(RclToken.AS)) {
      // Skip whitespace before alias identifier
      while (this.check(RclToken.WS)) {
        this.advance();
      }
      if (this.check(RclToken.IDENTIFIER)) {
        alias = this.advance().image;
      }
    }
    
    // Handle 'from' source
    let source: string | undefined;
    // Skip whitespace before 'from'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    if (this.match(RclToken.FROM)) {
      // Skip whitespace before source string
      while (this.check(RclToken.WS)) {
        this.advance();
      }
      if (this.check(RclToken.STRING)) {
        const sourceStr = this.advance().image;
        source = sourceStr.slice(1, -1); // Remove quotes
      }
    }
    
    this.consumeNewlineOrEnd();
    const end = this.getPosition();

    return {
      type: 'ImportStatement',
      importedNames,
      alias,
      source,
      location: { start, end }
    };
  }

  private parseSection(): Section {
    const start = this.getPosition();
    
    // Parse section type and name
    let sectionType: string | undefined;
    let name: string;

    // Check for section type keywords
    if (this.match(RclToken.AGENT_KW)) {
      sectionType = 'agent';
    } else if (this.match(RclToken.FLOWS)) {
      sectionType = 'flows';  
    } else if (this.match(RclToken.MESSAGES)) {
      sectionType = 'messages';
    } else if (this.match(RclToken.AGENT_CONFIG)) {
      sectionType = 'agentConfig';
    } else if (this.match(RclToken.AGENT_DEFAULTS)) {
      sectionType = 'agentDefaults';
    }

    // Skip whitespace before section name or colon
    while (this.check(RclToken.WS)) {
      this.advance();
    }

    // Parse section name if present (some sections like 'flows:' have no name)
    if (this.check(RclToken.COLON)) {
      // No name provided, colon comes directly after keyword
      name = '';
    } else {
      // Parse section name (space-separated identifiers)
      name = this.parseSpaceSeparatedIdentifier();
    }

    this.consume(RclToken.COLON);
    this.consumeNewlineOrEnd();

    // Parse section body
    const attributes: Attribute[] = [];
    const subSections: Section[] = [];
    const flowRules: FlowRule[] = [];
    const messages: MessageDefinition[] = [];

    if (this.match(RclToken.INDENT)) {
      let loopCount = 0;
      const MAX_LOOPS = 1000; // Safety limit
      
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        loopCount++;
        if (loopCount > MAX_LOOPS) {
          this.errors.push(`Infinite loop detected in section parsing at token ${this.current}`);
          break;
        }
        
        const currentToken = this.current;
        
        try {
          if (this.isNextSectionStart()) {
            const subSection = this.parseSection();
            subSections.push(subSection);
          } else if (sectionType === 'flows' && this.isFlowRule()) {
            const flowRule = this.parseFlowRule();
            flowRules.push(flowRule);
          } else if (sectionType === 'messages' && this.isMessageDefinition()) {
            const message = this.parseMessageDefinition();
            messages.push(message);
          } else if (this.isAttribute()) {
            const attr = this.parseAttribute();
            attributes.push(attr);
          } else {
            // Skip whitespace tokens and empty tokens - they're valid between sections
            if (this.check(RclToken.WS) || this.check(RclToken.NL) || this.isEmptyToken()) {
              this.advance();
            } else {
              // Generate error for unexpected content in section body
              const unexpectedToken = this.peek();
              if (unexpectedToken) {
                this.errors.push(`Unexpected token '${unexpectedToken.image}' at line ${unexpectedToken.startLine}, column ${unexpectedToken.startColumn}`);
              }
              this.advance();
            }
          }
          
          if (this.current === currentToken) {
            this.advance(); // Force progress to avoid infinite loop
          }
        } catch (error) {
          this.errors.push(`Section content parsing error: ${error}`);
          this.synchronize();
        }
      }
      
      if (this.check(RclToken.DEDENT)) {
        this.advance(); // consume DEDENT
      }
    }

    const end = this.getPosition();

    return {
      type: 'Section',
      sectionType,
      name,
      attributes,
      subSections,
      flowRules,
      messages,
      location: { start, end }
    };
  }

  private parseAttribute(): Attribute {
    const start = this.getPosition();
    const key = this.advance().image;
    this.consume(RclToken.COLON);
    
    // Skip optional whitespace
    if (this.check(RclToken.WS)) {
      this.advance();
    }
    
    const value = this.parseValue();
    this.consumeNewlineOrEnd();
    const end = this.getPosition();

    return {
      type: 'Attribute',
      key,
      value,
      location: { start, end }
    };
  }

  private parseFlowRule(): FlowRule {
    const start = this.getPosition();
    
    // Parse flow rule name
    const name = this.parseSpaceSeparatedIdentifier();
    
    this.consume(RclToken.COLON);
    this.consumeNewlineOrEnd();
    
    const attributes: Attribute[] = [];
    const nestedRules: FlowRule[] = [];
    
    // Parse flow rule content if indented
    if (this.match(RclToken.INDENT)) {
      let loopCount = 0;
      const MAX_LOOPS = 1000; // Safety limit
      
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        loopCount++;
        if (loopCount > MAX_LOOPS) {
          this.errors.push(`Infinite loop detected in flow rule parsing at token ${this.current}`);
          break;
        }
        
        const currentToken = this.current;
        
        try {
          if (this.isAttribute()) {
            const attr = this.parseAttribute();
            attributes.push(attr);
          } else if (this.isFlowRule()) {
            const nestedRule = this.parseFlowRule();
            nestedRules.push(nestedRule);
          } else {
            this.advance();
          }
          
          if (this.current === currentToken) {
            this.advance(); // Force progress to avoid infinite loop
          }
        } catch (error) {
          this.errors.push(`Flow rule content parsing error: ${error}`);
          this.synchronize();
        }
      }
      
      if (this.check(RclToken.DEDENT)) {
        this.advance(); // consume DEDENT
      }
    }
    
    const end = this.getPosition();

    return {
      type: 'FlowRule',
      name,
      nestedRules,
      attributes, // Add attributes to flow rule
      location: { start, end }
    };
  }

  private parseMessageDefinition(): MessageDefinition {
    const start = this.getPosition();
    
    // Parse message name
    const name = this.parseSpaceSeparatedIdentifier();
    
    this.consume(RclToken.COLON);
    this.consumeNewlineOrEnd();
    
    const attributes: Attribute[] = [];
    
    // Parse message attributes if indented
    if (this.match(RclToken.INDENT)) {
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        try {
          if (this.isAttribute()) {
            const attr = this.parseAttribute();
            attributes.push(attr);
          } else {
            this.advance();
          }
        } catch (error) {
          this.errors.push(`Message attribute parsing error: ${error}`);
          this.synchronize();
        }
      }
      
      if (this.check(RclToken.DEDENT)) {
        this.advance();
      }
    }
    
    const end = this.getPosition();

    return {
      type: 'MessageDefinition',
      name,
      attributes,
      location: { start, end }
    };
  }

  private parseValue(): Value {
    const start = this.getPosition();
    
    if (this.check(RclToken.STRING)) {
      const token = this.advance();
      const value = token.image.slice(1, -1); // Remove quotes
      const end = this.getPosition();
      return {
        type: 'StringValue',
        value,
        location: { start, end }
      } as StringValue;
    }
    
    if (this.check(RclToken.NUMBER)) {
      const token = this.advance();
      const rawValue = token.image;
      const value = parseFloat(rawValue);
      const end = this.getPosition();
      return {
        type: 'NumberValue',
        value,
        rawValue,
        location: { start, end }
      } as NumberValue;
    }
    
    if (this.check(RclToken.TRUE)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: true,
        rawValue: token.image,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.FALSE)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: false,
        rawValue: token.image,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.NULL)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    if (this.check(RclToken.NULL_LOWER)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    if (this.check(RclToken.NONE)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    if (this.check(RclToken.NONE_LOWER)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    if (this.check(RclToken.VOID)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    if (this.check(RclToken.VOID_LOWER)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    // Check for identifier-like tokens (including space-separated)
    const currentToken = this.peek();
    if (currentToken && this.isIdentifierLikeToken(currentToken)) {
      const value = this.parseSpaceSeparatedIdentifier();
      const end = this.getPosition();
      return {
        type: 'IdentifierValue',
        value,
        isSpaceSeparated: value.includes(' '),
        location: { start, end }
      } as IdentifierValue;
    }
    
    throw new Error('Expected value');
  }

  private parseSpaceSeparatedIdentifier(): string {
    const parts: string[] = [];
    
    // Parse first identifier part - can be IDENTIFIER or reserved words
    const firstToken = this.peek();
    if (firstToken && this.isIdentifierLikeToken(firstToken)) {
      const firstPart = this.advance().image;
      parts.push(firstPart);
    }
    
    // If we didn't get any parts, return empty string
    if (parts.length === 0) {
      return '';
    }
    
    // Continue while we have space followed by identifier-like token
    let loopCount = 0;
    const MAX_LOOPS = 50; // Safety limit for space-separated identifiers
    
    while (loopCount < MAX_LOOPS) {
      loopCount++;
      
      // Check if next token is whitespace
      if (!this.check(RclToken.WS)) {
        break;
      }
      
      // Look ahead past whitespace to see if there's an identifier-like token
      let lookAheadIdx = this.current + 1;
      
      // Skip multiple whitespace tokens
      while (lookAheadIdx < this.tokens.length && 
             this.tokens[lookAheadIdx].tokenType === RclToken.WS) {
        lookAheadIdx++;
      }
      
      // Check if the next non-whitespace token is identifier-like
      if (lookAheadIdx < this.tokens.length && 
          this.isIdentifierLikeToken(this.tokens[lookAheadIdx])) {
        
        // Consume the whitespace
        this.advance();
        
        // Consume the identifier token
        const nextPart = this.advance().image;
        parts.push(nextPart);
      } else {
        // No more identifier-like tokens, stop
        break;
      }
    }
    
    if (loopCount >= MAX_LOOPS) {
      console.error(`[ERROR] Infinite loop detected in parseSpaceSeparatedIdentifier`);
    }
    
    return parts.join(' ');
  }

  private isIdentifierLikeToken(token: IToken): boolean {
    if (!token || !token.tokenType) return false;
    
    const tokenName = token.tokenType.name;
    
    return tokenName === 'IDENTIFIER' ||
           tokenName === 'Config' ||
           tokenName === 'DEFAULTS' ||
           tokenName === 'MESSAGES_RESERVED' ||
           tokenName === 'AGENT_MESSAGE' ||
           tokenName === 'MESSAGE' ||
           tokenName === 'CONTENT_MESSAGE' ||
           tokenName === 'FLOW' ||
           tokenName === 'TEXT' ||
           tokenName === 'RICH_CARD' ||
           tokenName === 'CAROUSEL' ||
           tokenName === 'ACTION' ||
           tokenName === 'REPLY' ||
           tokenName === 'DIAL' ||
           tokenName === 'OPEN_URL' ||
           tokenName === 'SHARE_LOCATION' ||
           tokenName === 'start' ||  // lowercase as defined in token
           tokenName === 'end' ||   // lowercase as defined in token
           // Add more valid token types that could be part of identifiers
           tokenName === 'AGENT_KW' ||
           tokenName === 'FLOWS' ||
           tokenName === 'MESSAGES' ||
           tokenName === 'AGENT_DEFAULTS' ||
           tokenName === 'agentConfig' ||
           tokenName === 'TRANSACTIONAL' ||
           tokenName === 'PROMOTIONAL';
  }

  // Helper methods
  private createRclFile(imports: ImportStatement[], sections: Section[] = []): RclFile {
    return {
      type: 'RclFile',
      imports,
      sections
    };
  }

  private isNextSectionStart(): boolean {
    return this.check(RclToken.AGENT_KW) || 
           this.check(RclToken.FLOWS) || 
           this.check(RclToken.MESSAGES) ||
           this.check(RclToken.AGENT_CONFIG) ||
           this.check(RclToken.AGENT_DEFAULTS);
  }

  private isFlowRule(): boolean {
    // Check if current token pattern matches: identifier(s) : newline
    const currentToken = this.peek();
    if (!currentToken || !this.isIdentifierLikeToken(currentToken)) {
      return false;
    }
    
    // Look ahead for colon
    let idx = this.current;
    let foundColon = false;
    let searchCount = 0;
    const MAX_SEARCH = 10; // Limit lookahead
    
    // Skip identifier-like tokens and spaces (for space-separated identifiers)
    while (idx < this.tokens.length && searchCount < MAX_SEARCH) {
      searchCount++;
      const token = this.tokens[idx];
      
      if (token.tokenType === RclToken.COLON) {
        foundColon = true;
        idx++;
        break;
      } else if (token.tokenType === RclToken.WS) {
        idx++;
        continue;
      } else if (this.isIdentifierLikeToken(token)) {
        idx++;
        continue;
      } else {
        break;
      }
    }
    
    if (!foundColon || searchCount >= MAX_SEARCH) {
      return false;
    }
    
    // Check if colon is followed by newline (possibly with whitespace)
    while (idx < this.tokens.length && this.tokens[idx].tokenType === RclToken.WS) {
      idx++;
    }
    
    if (idx < this.tokens.length && this.tokens[idx].tokenType === RclToken.NL) {
      return true;
    }
    
    return false;
  }

  private isMessageDefinition(): boolean {
    // Similar to isAttribute but for message definitions in messages section
    const currentToken = this.peek();
    return !!(currentToken && this.isIdentifierLikeToken(currentToken) && 
           this.tokens[this.current + 1]?.tokenType === RclToken.COLON);
  }

  private isAttribute(): boolean {
    // An attribute starts with an identifier-like token followed by a colon
    const currentToken = this.peek();
    if (!currentToken || !this.isIdentifierLikeToken(currentToken)) {
      return false;
    }
    
    // Look ahead for colon
    let idx = this.current + 1;
    let foundColon = false;
    let searchCount = 0;
    const MAX_SEARCH = 10; // Limit lookahead
    
    // Skip spaces and identifier-like tokens (for space-separated keys)
    while (idx < this.tokens.length && searchCount < MAX_SEARCH) {
      searchCount++;
      const token = this.tokens[idx];
      
      if (token.tokenType === RclToken.COLON) {
        foundColon = true;
        break;
      } else if (token.tokenType === RclToken.WS) {
        idx++;
        continue;
      } else if (this.isIdentifierLikeToken(token)) {
        idx++;
        continue;
      } else {
        break;
      }
    }
    
    if (searchCount >= MAX_SEARCH) {
      return false;
    }
    
    return foundColon;
  }

  private match(...types: any[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: any): boolean {
    if (this.isAtEnd()) return false;
    return this.peek()?.tokenType === type;
  }

  private advance(): IToken {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): IToken | undefined {
    return this.tokens[this.current];
  }

  private previous(): IToken {
    return this.tokens[this.current - 1];
  }

  private consume(type: any): IToken {
    if (this.check(type)) return this.advance();
    
    const current = this.peek();
    throw new Error(`Expected ${type.name} but got ${current?.tokenType?.name || 'EOF'}`);
  }

  private consumeNewlineOrEnd(): void {
    if (this.check(RclToken.NL)) {
      this.advance();
    }
    // Allow end of input without newline
  }

  private getPosition(): Position {
    const token = this.peek() || this.previous();
    return {
      line: token?.startLine || 1,
      column: token?.startColumn || 1,
      offset: token?.startOffset || 0
    };
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().tokenType === RclToken.NL) return;

      switch (this.peek()?.tokenType) {
        case RclToken.AGENT_KW:
        case RclToken.FLOWS:
        case RclToken.MESSAGES:
        case RclToken.AGENT_CONFIG:
        case RclToken.AGENT_DEFAULTS:
          return;
      }

      this.advance();
    }
  }

  private isEmptyToken(): boolean {
    const token = this.peek();
    return !!(token && token.image === '');
  }
} 