/**
 * RCL Parser Base Implementation
 * 
 * Provides the core parsing functionality with improved architecture and specification compliance.
 * Implements recursive descent parsing following the formal RCL grammar specification.
 */

// import type { IToken } from 'chevrotain';
import { RclLexer } from '../../lexer/index.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import { TokenStream } from './token-stream.js';
import { ErrorRecovery } from './error-recovery.js';
import { AstFactory } from './ast-factory.js';

// Import specialized parsers (commented out until implemented)
// import { MessageShortcutsParser } from '../shortcuts/message-shortcuts-parser.js';
// import { ActionShortcutsParser } from '../shortcuts/action-shortcuts-parser.js';
// import { FlowTransitionsParser } from '../flow-system/flow-transitions-parser.js';
// import { TypeTagParser } from '../expressions/type-tag-parser.js';
// import { EmbeddedCodeParser } from '../expressions/embedded-code-parser.js';

// Import AST types
import type {
  RclFile,
  AgentDefinition,
  ImportStatement
} from '../../ast/index.js';

export interface ParseResult {
  ast: RclFile | null;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

/**
 * Main RCL Parser with modular architecture following the formal specification
 */
export class RclParser {
  private lexer: RclLexer;
  private tokenStream: TokenStream;
  private errorRecovery: ErrorRecovery;
  private astFactory: AstFactory;
  private errors: ParseError[] = [];
  
  // Specialized parsers (commented out until implemented)
  // private messageShortcutsParser: MessageShortcutsParser;
  // private actionShortcutsParser: ActionShortcutsParser;
  // private flowTransitionsParser: FlowTransitionsParser;
  // private typeTagParser: TypeTagParser;
  // private embeddedCodeParser: EmbeddedCodeParser;

  constructor() {
    this.lexer = new RclLexer();
    this.tokenStream = new TokenStream();
    this.errorRecovery = new ErrorRecovery();
    this.astFactory = new AstFactory();
    
    // this.messageShortcutsParser = new MessageShortcutsParser();
    // this.actionShortcutsParser = new ActionShortcutsParser();
    // this.flowTransitionsParser = new FlowTransitionsParser();
    // this.typeTagParser = new TypeTagParser();
    // this.embeddedCodeParser = new EmbeddedCodeParser();
  }

  /**
   * Parse RCL source code into an AST following the formal specification structure
   */
  parse(input: string): ParseResult {
    try {
      // Tokenize input
      const lexResult = this.lexer.tokenize(input);
      this.tokenStream.setTokens(lexResult.tokens);
      this.errors = lexResult.errors.map(e => ({
        message: e.message,
        line: e.line,
        column: e.column,
        offset: e.offset
      }));

      if (lexResult.tokens.length === 0) {
        return {
          ast: this.astFactory.createRclFile([], null),
          errors: this.errors
        };
      }

      // Parse according to formal specification: RclFile ::= (ImportStatement)* AgentDefinition
      const ast = this.parseRclFile();

      // If there are critical errors, return null AST
      if (this.errors.length > 0 && !ast.agentDefinition && ast.imports.length === 0) {
        return { ast: null, errors: this.errors };
      }

      return { ast, errors: this.errors };
    } catch (error) {
      this.addError(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
      return { ast: null, errors: this.errors };
    }
  }

  /**
   * Parse RclFile according to formal specification:
   * RclFile ::= (ImportStatement)* AgentDefinition
   */
  private parseRclFile(): RclFile {
    const imports: ImportStatement[] = [];
    
    // Skip leading whitespace and newlines
    this.skipWhitespaceAndNewlines();
    
    // Parse imports first
    while (this.tokenStream.check(RclTokens.IMPORT_KW)) {
      try {
        const importStmt = this.parseImportStatement();
        imports.push(importStmt);
        // Skip whitespace and newlines between imports
        this.skipWhitespaceAndNewlines();
      } catch (error) {
        this.addError(`Import parsing error: ${error}`);
        this.errorRecovery.synchronize(this.tokenStream);
      }
    }

    // Parse required agent definition
    this.skipWhitespaceAndNewlines();
    let agentDefinition: AgentDefinition | null = null;
    try {
      agentDefinition = this.parseAgentDefinition();
    } catch (error) {
      this.addError(`Agent definition parsing error: ${error}`);
      this.errorRecovery.synchronize(this.tokenStream);
    }

    return this.astFactory.createRclFile(imports, agentDefinition);
  }

  /**
   * Parse ImportStatement according to specification
   */
  private parseImportStatement(): ImportStatement {
    const start = this.getPosition();
    
    this.tokenStream.consume(RclTokens.IMPORT_KW);
    
    // Skip whitespace
    this.skipWhitespace();
    
    // Parse import path: IDENTIFIER ('/' IDENTIFIER)*
    const importPath: string[] = [];
    do {
      const identifier = this.parseIdentifier();
      importPath.push(identifier);
      
      this.skipWhitespace();
      
      if (this.tokenStream.check(RclTokens.SLASH)) {
        this.tokenStream.advance();
        this.skipWhitespace();
      } else {
        break;
      }
    } while (!this.tokenStream.isAtEnd());
    
    // Parse optional 'as' alias
    let alias: string | undefined;
    if (this.tokenStream.match(RclTokens.AS_KW)) {
      this.skipWhitespace();
      alias = this.parseSpaceSeparatedIdentifier();
    }
    
    // Parse optional 'from' source
    let source: string | undefined;
    if (this.tokenStream.match(RclTokens.FROM_KW)) {
      this.skipWhitespace();
      if (this.tokenStream.check(RclTokens.STRING)) {
        const sourceToken = this.tokenStream.advance();
        source = sourceToken.image.slice(1, -1); // Remove quotes
      }
    }
    
    this.consumeNewlineOrEnd();
    const end = this.getPosition();

    return this.astFactory.createImportStatement(importPath, alias, source, { start, end });
  }

  /**
   * Parse AgentDefinition according to specification:
   * AgentDefinition ::= 'agent' IDENTIFIER INDENT
   *   ('displayName' ':' STRING)
   *   ('brandName' ':' STRING)?
   *   (ConfigSection)?
   *   (DefaultsSection)?
   *   (FlowSection)+
   *   MessagesSection
   *   DEDENT
   */
  private parseAgentDefinition(): AgentDefinition {
    const start = this.getPosition();
    
    this.tokenStream.consume(RclTokens.AGENT_KW);
    this.skipWhitespace();
    
    const name = this.parseSpaceSeparatedIdentifier();
    this.tokenStream.consume(RclTokens.COLON);
    this.skipWhitespaceAndNewlines(); // Consume any whitespace and newlines after the colon

    // Parse required INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse required displayName
    let displayName: string | null = null;
    if (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY) && this.tokenStream.peek()?.image === 'displayName') {
      this.tokenStream.advance(); // Consume 'displayName' ATTRIBUTE_KEY
      displayName = this.parseStringAttribute('displayName');
    } else {
      throw new Error('Agent definition must have displayName');
    }
    
    // Parse optional brandName
    let brandName: string | null = null;
    if (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY) && this.tokenStream.peek()?.image === 'brandName') {
      this.tokenStream.advance(); // Consume 'brandName' ATTRIBUTE_KEY
      brandName = this.parseStringAttribute('brandName');
    }
    
    // Parse any additional properties and ignore them for now
    // This allows for forward compatibility and test flexibility
    while (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY) && 
           !this.tokenStream.check(RclTokens.AGENT_CONFIG_KW) &&
           !this.tokenStream.check(RclTokens.AGENT_DEFAULTS_KW) &&
           !this.tokenStream.check(RclTokens.FLOW_KW) &&
           !this.tokenStream.check(RclTokens.MESSAGES_KW)) {
      
      // Skip unknown attribute key
      this.tokenStream.advance(); // consume ATTRIBUTE_KEY
      if (this.tokenStream.check(RclTokens.COLON)) {
        this.tokenStream.advance(); // consume colon
        this.skipWhitespace();
        
        // Skip the value (could be string, number, boolean, atom, embedded code, etc.)
        if (this.tokenStream.check(RclTokens.STRING) ||
            this.tokenStream.check(RclTokens.NUMBER) ||
            this.tokenStream.check(RclTokens.TRUE_KW) ||
            this.tokenStream.check(RclTokens.FALSE_KW) ||
            this.tokenStream.check(RclTokens.NULL_KW) ||
            this.tokenStream.check(RclTokens.ATOM) ||
            this.tokenStream.check(RclTokens.EMBEDDED_CODE)) {
          this.tokenStream.advance(); // consume value
        }
        this.consumeNewlineOrEnd();
      }
    }
    
    // Parse optional config section
    this.skipWhitespaceAndNewlines();
    let config: any = null;
    if (this.tokenStream.check(RclTokens.CONFIG_KW)) {
      config = this.parseAgentConfig();
    }
    
    // Parse optional defaults section
    this.skipWhitespaceAndNewlines();
    let defaults: any = null;
    if (this.tokenStream.check(RclTokens.DEFAULTS_KW)) {
      defaults = this.parseAgentDefaults();
    }
    
    // Parse sections in any order (flows and messages)
    this.skipWhitespaceAndNewlines();
    const flows: any[] = [];
    let messages: any = null;
    
    // Continue parsing sections until we hit DEDENT
    while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
      if (this.tokenStream.check(RclTokens.FLOW_KW)) {
        flows.push(this.parseFlowSection());
        this.skipWhitespaceAndNewlines();
      } else if (this.tokenStream.check(RclTokens.MESSAGES_KW)) {
        if (messages !== null) {
          this.addError('Multiple messages sections not allowed');
        }
        messages = this.parseMessagesSection();
        this.skipWhitespaceAndNewlines();
      } else {
        // Unknown section or end of agent definition
        break;
      }
    }
    
    // Validate required sections
    if (flows.length === 0) {
      this.addError('Agent must have at least one flow section');
    }
    if (messages === null) {
      this.addError('Agent messages section is required');
    }
    
    // Consume DEDENT
    this.skipWhitespaceAndNewlines();
    this.tokenStream.consume(RclTokens.DEDENT);
    
    const end = this.getPosition();

    return this.astFactory.createAgentDefinition(
      name,
      displayName,
      brandName,
      config,
      defaults,
      flows,
      messages,
      { start, end }
    );
  }

  // Helper methods

  private parseIdentifier(): string {
    if (this.tokenStream.check(RclTokens.IDENTIFIER)) {
      return this.tokenStream.advance().image;
    }
    // Allow reserved words as identifiers in identifier contexts
    if (this.isReservedWordAsIdentifier()) {
      return this.tokenStream.advance().image;
    }
    throw new Error(`Expected identifier, got ${this.tokenStream.peek()?.image}`);
  }

  private isReservedWordAsIdentifier(): boolean {
    const token = this.tokenStream.peek();
    if (!token) return false;
    
    // Allow these reserved words to be used as identifiers
    return token.tokenType === RclTokens.MESSAGES_RESERVED_KW ||
           token.tokenType === RclTokens.CONFIG_KW ||
           token.tokenType === RclTokens.DEFAULTS_KW;
  }

  private parseSpaceSeparatedIdentifier(): string {
    const parts: string[] = [];
    
    // Parse first part
    if (this.tokenStream.check(RclTokens.IDENTIFIER)) {
      parts.push(this.tokenStream.advance().image);
    } else if (this.isReservedWordAsIdentifier()) {
      parts.push(this.tokenStream.advance().image);
    } else {
      throw new Error(`Expected identifier, got ${this.tokenStream.peek()?.image}`);
    }
    
    // Continue while we have space followed by identifier
    while (this.tokenStream.check(RclTokens.WS)) {
      const nextToken = this.tokenStream.peek(1);
      if (nextToken && (nextToken.tokenType === RclTokens.IDENTIFIER || 
                        nextToken.tokenType === RclTokens.MESSAGES_RESERVED_KW ||
                        nextToken.tokenType === RclTokens.CONFIG_KW ||
                        nextToken.tokenType === RclTokens.DEFAULTS_KW)) {
        this.tokenStream.advance(); // consume WS
        parts.push(this.tokenStream.advance().image); // consume IDENTIFIER or reserved word
      } else {
        break;
      }
    }
    
    return parts.join(' ');
  }

  

  private parseStringAttribute(key: string): string {
    // Now consume the colon that follows
    this.tokenStream.consume(RclTokens.COLON);
    this.skipWhitespace();
    
    if (!this.tokenStream.check(RclTokens.STRING)) {
      throw new Error(`Expected string value for ${key}`);
    }
    
    const stringToken = this.tokenStream.advance();
    const value = stringToken.image.slice(1, -1); // Remove quotes
    
    this.consumeNewlineOrEnd();
    return value;
  }

  private skipWhitespace(): void {
    while (this.tokenStream.check(RclTokens.WS)) {
      this.tokenStream.advance();
    }
  }

  private skipWhitespaceAndNewlines(): void {
    while (this.tokenStream.check(RclTokens.WS) || this.tokenStream.check(RclTokens.NL)) {
      this.tokenStream.advance();
    }
  }

  private consumeNewlineOrEnd(): void {
    if (this.tokenStream.check(RclTokens.NL)) {
      this.tokenStream.advance();
    }
    // Allow end of input without newline
  }

  private getPosition(): { line: number; column: number; offset: number } {
    const token = this.tokenStream.peek() || this.tokenStream.previous();
    return {
      line: token?.startLine || 1,
      column: token?.startColumn || 1,
      offset: token?.startOffset || 0
    };
  }

  private addError(message: string): void {
    const position = this.getPosition();
    this.errors.push({
      message,
      line: position.line,
      column: position.column,
      offset: position.offset
    });
  }

  /**
   * Skip tokens until we reach a newline or DEDENT
   */
  private skipToNextLineOrDedent(): void {
    while (!this.tokenStream.isAtEnd() && 
           !this.tokenStream.check(RclTokens.NL) && 
           !this.tokenStream.check(RclTokens.DEDENT)) {
      this.tokenStream.advance();
    }
    
    if (this.tokenStream.check(RclTokens.NL)) {
      this.tokenStream.advance();
    }
  }

  /**
   * Skip an entire nested block (INDENT ... DEDENT)
   */
  private skipNestedBlock(): void {
    if (!this.tokenStream.check(RclTokens.INDENT)) {
      return;
    }
    
    this.tokenStream.advance(); // consume INDENT
    
    let indentLevel = 1;
    while (!this.tokenStream.isAtEnd() && indentLevel > 0) {
      if (this.tokenStream.check(RclTokens.INDENT)) {
        indentLevel++;
      } else if (this.tokenStream.check(RclTokens.DEDENT)) {
        indentLevel--;
      }
      this.tokenStream.advance();
    }
  }

  /**
   * Parse agentConfig section
   */
  private parseAgentConfig(): any {
    this.tokenStream.consume(RclTokens.CONFIG_KW);
    this.consumeNewlineOrEnd();
    
    // Parse INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse properties (simple implementation for now)
    const properties: any[] = [];
    while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
      if (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY)) {
        const key = this.tokenStream.advance().image;
        this.tokenStream.consume(RclTokens.COLON);
        this.skipWhitespace();
        
        // Parse simple string value for now
        if (this.tokenStream.check(RclTokens.STRING)) {
          const value = this.tokenStream.advance().image.slice(1, -1);
          const property = this.astFactory.createConfigProperty(key, value);
          properties.push(property);
        }
        this.consumeNewlineOrEnd();
      } else {
        this.tokenStream.advance(); // skip unknown tokens
      }
    }
    
    this.tokenStream.consume(RclTokens.DEDENT);
    
    return this.astFactory.createAgentConfig('Config', properties);
  }

  /**
   * Parse agentDefaults section
   */
  private parseAgentDefaults(): any {
    this.tokenStream.consume(RclTokens.DEFAULTS_KW);
    this.consumeNewlineOrEnd();
    
    // Parse INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse properties (simple implementation for now)
    const properties: any[] = [];
    while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
      if (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY)) {
        const key = this.tokenStream.advance().image;
        this.tokenStream.consume(RclTokens.COLON);
        this.skipWhitespace();
        
        // Parse value (string or atom)
        let value: any = null;
        if (this.tokenStream.check(RclTokens.STRING)) {
          value = this.tokenStream.advance().image.slice(1, -1);
        } else if (this.tokenStream.check(RclTokens.ATOM)) {
          value = this.tokenStream.advance().image;
        }
        const property = this.astFactory.createDefaultProperty(key, value);
        properties.push(property);
        this.consumeNewlineOrEnd();
      } else {
        this.tokenStream.advance(); // skip unknown tokens
      }
    }
    
    this.tokenStream.consume(RclTokens.DEDENT);
    
    return this.astFactory.createAgentDefaults('Defaults', properties);
  }

  /**
   * Parse flow section
   */
  private parseFlowSection(): any {
    this.tokenStream.consume(RclTokens.FLOW_KW);
    this.skipWhitespace();
    
    // Parse flow name
    const name = this.parseSpaceSeparatedIdentifier();
    this.tokenStream.consume(RclTokens.COLON);
    this.consumeNewlineOrEnd();
    
    // Parse INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse flow rules (simple implementation for now)
    const rules: any[] = [];
    while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
      // Simple rule parsing - skip for now and just consume tokens
      if (this.tokenStream.check(RclTokens.ATOM)) {
        const from = this.tokenStream.advance().image;
        this.skipWhitespace();
        
        if (this.tokenStream.check(RclTokens.ARROW)) {
          this.tokenStream.advance(); // consume arrow
          this.skipWhitespace();
          
          let to: string = '';
          if (this.tokenStream.check(RclTokens.IDENTIFIER)) {
            to = this.parseSpaceSeparatedIdentifier();
          } else if (this.tokenStream.check(RclTokens.STRING)) {
            to = this.tokenStream.advance().image.slice(1, -1);
          }
          
          rules.push({ from, to });
        }
      }
      this.consumeNewlineOrEnd();
      
      // Handle advanced constructs
      if (this.tokenStream.check(RclTokens.WHEN_KW) || this.tokenStream.check(RclTokens.IDENTIFIER)) {
        // Skip the line and handle nested content if any
        this.skipToNextLineOrDedent();
        
        // If there's nested content (INDENT), skip it entirely
        if (this.tokenStream.check(RclTokens.INDENT)) {
          this.skipNestedBlock();
        }
      } else if (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.check(RclTokens.ATOM) && !this.tokenStream.isAtEnd()) {
        this.tokenStream.advance();
      }
    }
    
    this.tokenStream.consume(RclTokens.DEDENT);
    
    return this.astFactory.createFlowSection(name, rules);
  }

  /**
   * Parse messages section
   */
  private parseMessagesSection(): any {
    this.tokenStream.consume(RclTokens.MESSAGES_KW);
    this.skipWhitespace();
    
    // Parse section name (should be "Messages")
    const name = this.parseSpaceSeparatedIdentifier();
    this.tokenStream.consume(RclTokens.COLON);
    this.consumeNewlineOrEnd();
    
    // Parse INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse messages (enhanced to handle message and agentMessage keywords)
    const messages: any = {};
    while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      
      // Handle "message" keyword declarations
      if (this.tokenStream.check(RclTokens.MESSAGE_KW)) {
        this.tokenStream.advance(); // consume 'message'
        this.skipWhitespace();
        
        const messageName = this.parseSpaceSeparatedIdentifier();
        messages[messageName] = this.parseMessageDefinition('message');
      }
      // Handle "agentMessage" keyword declarations
      else if (this.tokenStream.check(RclTokens.AGENT_MESSAGE_KW)) {
        this.tokenStream.advance(); // consume 'agentMessage'
        this.skipWhitespace();
        
        const messageName = this.parseSpaceSeparatedIdentifier();
        messages[messageName] = this.parseMessageDefinition('agentMessage');
      }
      // Handle identifier-based messages (legacy or shortcut format)
      else if (this.tokenStream.check(RclTokens.IDENTIFIER)) {
        const messageName = this.parseSpaceSeparatedIdentifier();
        if (this.tokenStream.check(RclTokens.COLON)) {
          this.tokenStream.advance(); // consume colon
          this.consumeNewlineOrEnd();
          
          // Parse message content (simple text for now)
          if (this.tokenStream.check(RclTokens.INDENT)) {
            this.tokenStream.advance(); // consume indent
            
            // Look for text keyword
            if (this.tokenStream.check(RclTokens.TEXT_KW)) {
              this.tokenStream.advance(); // consume 'text'
              this.skipWhitespace();
              
              if (this.tokenStream.check(RclTokens.COLON)) {
                this.tokenStream.advance(); // consume colon
                this.skipWhitespace();
                
                if (this.tokenStream.check(RclTokens.STRING)) {
                  const text = this.tokenStream.advance().image.slice(1, -1);
                  messages[messageName] = { type: 'text', content: text };
                }
              }
            }
            
            // Consume any remaining tokens until DEDENT
            while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
              this.tokenStream.advance();
            }
            
            this.tokenStream.consume(RclTokens.DEDENT);
          }
        }
      }
      // Handle other message keywords like text, richCard, etc. (shortcuts)
      else if (this.tokenStream.check(RclTokens.TEXT_KW) ||
               this.tokenStream.check(RclTokens.RICH_CARD_KW) ||
               this.tokenStream.check(RclTokens.CAROUSEL_KW) ||
               this.tokenStream.check(RclTokens.RBM_FILE_KW) ||
               this.tokenStream.check(RclTokens.FILE_KW)) {
        
        // Parse message shortcuts - for now, skip until we have full implementation
        this.skipMessageShortcut();
      }
      else if (!this.tokenStream.check(RclTokens.DEDENT)) {
        this.tokenStream.advance(); // skip unknown tokens
      }
    }
    
    this.tokenStream.consume(RclTokens.DEDENT);
    
    return this.astFactory.createMessagesSection(name, messages);
  }

  /**
   * Parse a message definition (message or agentMessage)
   */
  private parseMessageDefinition(messageType: 'message' | 'agentMessage'): any {
    if (this.tokenStream.check(RclTokens.COLON)) {
      this.tokenStream.advance(); // consume colon
      this.consumeNewlineOrEnd();
      
      // Parse message content
      if (this.tokenStream.check(RclTokens.INDENT)) {
        this.tokenStream.advance(); // consume indent
        
        const messageContent: any = { type: messageType };
        
        // Parse message properties
        while (!this.tokenStream.check(RclTokens.DEDENT) && !this.tokenStream.isAtEnd()) {
          if (this.tokenStream.check(RclTokens.ATTRIBUTE_KEY)) {
            const key = this.tokenStream.advance().image;
            
            if (this.tokenStream.check(RclTokens.COLON)) {
              this.tokenStream.advance(); // consume colon
              this.skipWhitespace();
              
              // Parse value
              if (this.tokenStream.check(RclTokens.STRING)) {
                const value = this.tokenStream.advance().image.slice(1, -1);
                messageContent[key] = value;
              } else if (this.tokenStream.check(RclTokens.ATOM)) {
                const value = this.tokenStream.advance().image;
                messageContent[key] = value;
              }
              
              this.consumeNewlineOrEnd();
            }
          } else {
            this.tokenStream.advance(); // skip unknown tokens
          }
        }
        
        this.tokenStream.consume(RclTokens.DEDENT);
        return messageContent;
      }
    }
    
    return { type: messageType };
  }

  /**
   * Skip a message shortcut declaration (placeholder)
   */
  private skipMessageShortcut(): void {
    // Skip the shortcut keyword
    this.tokenStream.advance();
    
    // Skip until newline or dedent
    while (!this.tokenStream.isAtEnd() && 
           !this.tokenStream.check(RclTokens.NL) && 
           !this.tokenStream.check(RclTokens.DEDENT)) {
      this.tokenStream.advance();
    }
    
    if (this.tokenStream.check(RclTokens.NL)) {
      this.tokenStream.advance();
    }
  }
}