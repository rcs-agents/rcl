/**
 * RCL Parser Base Implementation
 * 
 * Provides the core parsing functionality with improved architecture and specification compliance.
 * Implements recursive descent parsing following the formal RCL grammar specification.
 */

import type { IToken } from 'chevrotain';
import { RclLexer } from '../../lexer/index.js';
import { RclTokens } from '../../lexer/tokens/token-definitions.js';
import { TokenStream } from './token-stream.js';
import { ErrorRecovery } from './error-recovery.js';
import { AstFactory } from './ast-factory.js';

// Import specialized parsers
import { MessageShortcutsParser } from '../shortcuts/message-shortcuts-parser.js';
import { ActionShortcutsParser } from '../shortcuts/action-shortcuts-parser.js';
import { FlowTransitionsParser } from '../flow-system/flow-transitions-parser.js';
import { TypeTagParser } from '../expressions/type-tag-parser.js';
import { EmbeddedCodeParser } from '../expressions/embedded-code-parser.js';

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
  
  // Specialized parsers
  private messageShortcutsParser: MessageShortcutsParser;
  private actionShortcutsParser: ActionShortcutsParser;
  private flowTransitionsParser: FlowTransitionsParser;
  private typeTagParser: TypeTagParser;
  private embeddedCodeParser: EmbeddedCodeParser;

  constructor() {
    this.lexer = new RclLexer();
    this.tokenStream = new TokenStream();
    this.errorRecovery = new ErrorRecovery();
    this.astFactory = new AstFactory();
    
    this.messageShortcutsParser = new MessageShortcutsParser();
    this.actionShortcutsParser = new ActionShortcutsParser();
    this.flowTransitionsParser = new FlowTransitionsParser();
    this.typeTagParser = new TypeTagParser();
    this.embeddedCodeParser = new EmbeddedCodeParser();
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
    
    // Parse imports first
    while (this.tokenStream.check(RclTokens.IMPORT_KW)) {
      try {
        const importStmt = this.parseImportStatement();
        imports.push(importStmt);
      } catch (error) {
        this.addError(`Import parsing error: ${error}`);
        this.errorRecovery.synchronize(this.tokenStream);
      }
    }

    // Parse required agent definition
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
    this.consumeNewlineOrEnd();
    
    // Parse required INDENT
    this.tokenStream.consume(RclTokens.INDENT);
    
    // Parse required displayName
    let displayName: string | null = null;
    if (this.checkAttributeKey('displayName')) {
      displayName = this.parseStringAttribute('displayName');
    } else {
      this.addError('Agent displayName is required');
    }
    
    // Parse optional brandName
    let brandName: string | null = null;
    if (this.checkAttributeKey('brandName')) {
      brandName = this.parseStringAttribute('brandName');
    }
    
    // Parse optional config section
    let config: any = null; // TODO: Implement config parsing
    
    // Parse optional defaults section
    let defaults: any = null; // TODO: Implement defaults parsing
    
    // Parse flow sections (at least one required)
    const flows: any[] = []; // TODO: Implement flow parsing
    
    // Parse required messages section
    let messages: any = null; // TODO: Implement messages parsing
    
    // Consume DEDENT
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
    throw new Error(`Expected identifier, got ${this.tokenStream.peek()?.image}`);
  }

  private parseSpaceSeparatedIdentifier(): string {
    const parts: string[] = [];
    
    // Parse first part
    if (this.tokenStream.check(RclTokens.IDENTIFIER)) {
      parts.push(this.tokenStream.advance().image);
    } else {
      throw new Error(`Expected identifier, got ${this.tokenStream.peek()?.image}`);
    }
    
    // Continue while we have space followed by identifier
    while (this.tokenStream.check(RclTokens.WS)) {
      const nextToken = this.tokenStream.peek(1);
      if (nextToken && nextToken.tokenType === RclTokens.IDENTIFIER) {
        this.tokenStream.advance(); // consume WS
        parts.push(this.tokenStream.advance().image); // consume IDENTIFIER
      } else {
        break;
      }
    }
    
    return parts.join(' ');
  }

  private checkAttributeKey(key: string): boolean {
    const token = this.tokenStream.peek();
    return !!(token && token.image === key && 
             this.tokenStream.peek(1)?.tokenType === RclTokens.COLON);
  }

  private parseStringAttribute(key: string): string {
    // Consume key
    this.tokenStream.advance();
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
}