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
  Position,
  FlowTransition,
  FlowOperand,
  WithClause,
  WhenClause,
  Parameter,
  EmbeddedExpression,
  EmbeddedCodeBlock
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
    
    // Parse namespace-style import names separated by '/'
    // e.g., "My Brand / Samples" or "Shared / Common Flows / Support"
    do {
      // Parse space-separated identifier for each namespace part
      const namespacePart = this.parseSpaceSeparatedIdentifier();
      importedNames.push(namespacePart);
      
      // Skip whitespace around '/'
      while (this.check(RclToken.WS)) {
        this.advance();
      }
      
      // Check for slash separator
      if (this.check(RclToken.SLASH)) {
        this.advance(); // consume '/'
        // Skip whitespace after '/'
        while (this.check(RclToken.WS)) {
          this.advance();
        }
      } else {
        break; // No more namespace parts
      }
    } while (!this.isAtEnd() && !this.check(RclToken.AS) && !this.check(RclToken.FROM));
    
    // Handle 'as' alias (with space-separated identifiers)
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
      // Parse space-separated alias (e.g., "Sample One", "Customer Support")
      alias = this.parseSpaceSeparatedIdentifier();
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
    const transitions: FlowTransition[] = [];
    const whenClauses: WhenClause[] = [];
    
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
          if (this.isFlowTransition()) {
            const transition = this.parseFlowTransition();
            transitions.push(transition);
          } else if (this.isWhenClause()) {
            const whenClause = this.parseWhenClause();
            whenClauses.push(whenClause);
          } else if (this.isAttribute()) {
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
      attributes,
      transitions,
      whenClauses,
      location: { start, end }
    };
  }

  /**
   * Parse a flow transition: source -> destination
   */
  private parseFlowTransition(): FlowTransition {
    const start = this.getPosition();
    
    // Parse source operand
    const source = this.parseFlowOperand();
    
    // Skip whitespace before arrow
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    // Consume arrow
    this.consume(RclToken.ARROW);
    
    // Skip whitespace after arrow
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    // Parse destination operand
    const destination = this.parseFlowOperand();
    
    // Parse optional with clause
    let withClause: WithClause | undefined;
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    if (this.check(RclToken.WITH)) {
      withClause = this.parseWithClause();
    }
    
    this.consumeNewlineOrEnd();
    const end = this.getPosition();
    
    return {
      type: 'FlowTransition',
      source,
      destination,
      withClause,
      location: { start, end }
    };
  }

  /**
   * Parse a flow operand (atom, identifier, or string)
   */
  private parseFlowOperand(): FlowOperand {
    const start = this.getPosition();
    
    if (this.check(RclToken.ATOM)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'FlowOperand',
        operandType: 'atom',
        value: token.image,
        location: { start, end }
      };
    }
    
    if (this.check(RclToken.STRING)) {
      const token = this.advance();
      const value = token.image.slice(1, -1); // Remove quotes
      const end = this.getPosition();
      return {
        type: 'FlowOperand',
        operandType: 'string',
        value,
        location: { start, end }
      };
    }
    
    // Parse space-separated identifier
    const value = this.parseSpaceSeparatedIdentifier();
    const end = this.getPosition();
    
    return {
      type: 'FlowOperand',
      operandType: 'identifier',
      value,
      location: { start, end }
    };
  }

  /**
   * Parse a with clause: with param: value, param2: value2
   */
  private parseWithClause(): WithClause {
    const start = this.getPosition();
    
    this.consume(RclToken.WITH);
    
    // Skip whitespace after 'with'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    const parameters: Parameter[] = [];
    
    // Parse first parameter
    if (this.isParameterStart()) {
      parameters.push(this.parseParameter());
    }
    
    // Parse additional parameters separated by commas
    while (this.check(RclToken.COMMA)) {
      this.advance(); // consume comma
      
      // Skip whitespace after comma
      while (this.check(RclToken.WS)) {
        this.advance();
      }
      
      if (this.isParameterStart()) {
        parameters.push(this.parseParameter());
      }
    }
    
    const end = this.getPosition();
    
    return {
      type: 'WithClause',
      parameters,
      location: { start, end }
    };
  }

  /**
   * Parse a when clause for conditional flow rules
   */
  private parseWhenClause(): WhenClause {
    const start = this.getPosition();
    
    this.consume(RclToken.WHEN);
    
    // Skip whitespace after 'when'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    // Parse condition (for now, just store as embedded expression placeholder)
    // TODO: Implement proper condition parsing
    const condition: EmbeddedExpression = {
      type: 'EmbeddedExpression',
      language: 'rcl',
      content: 'placeholder condition',
      isMultiline: false,
      location: { start: this.getPosition(), end: this.getPosition() }
    };
    
    this.consumeNewlineOrEnd();
    
    const transitions: FlowTransition[] = [];
    
    // Parse indented transitions
    if (this.match(RclToken.INDENT)) {
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        if (this.isFlowTransition()) {
          transitions.push(this.parseFlowTransition());
        } else {
          this.advance();
        }
      }
      
      if (this.check(RclToken.DEDENT)) {
        this.advance();
      }
    }
    
    const end = this.getPosition();
    
    return {
      type: 'WhenClause',
      condition,
      transitions,
      location: { start, end }
    };
  }

  /**
   * Parse a parameter: name: value
   */
  private parseParameter(): Parameter {
    const start = this.getPosition();
    
    // Parse parameter name
    let name: string;
    const currentToken = this.peek();
    
    if (this.check(RclToken.ATTRIBUTE_KEY)) {
      name = this.advance().image;
    } else if (this.check(RclToken.IDENTIFIER)) {
      name = this.advance().image;
    } else if (currentToken && this.isKeywordValidAsParameterName(currentToken)) {
      // Handle keywords that can be parameter names (like "time", "date", etc.)
      name = this.advance().image;
    } else {
      throw new Error(`Expected parameter name, got ${this.peek()?.image}`);
    }
    
    // Skip whitespace before colon
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    this.consume(RclToken.COLON);
    
    // Skip whitespace after colon
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    // Parse parameter value
    const defaultValue = this.parseValue();
    
    const end = this.getPosition();
    
    return {
      type: 'Parameter',
      name,
      defaultValue,
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
    
    // Handle embedded expressions first (before other tokens)
    if (this.check(RclToken.SINGLE_LINE_EXPRESSION)) {
      return this.parseEmbeddedExpression();
    }
    
    if (this.check(RclToken.MULTI_LINE_EXPRESSION)) {
      return this.parseEmbeddedCodeBlock();
    }
    
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
      const value = rawValue.includes('.') ? parseFloat(rawValue) : parseInt(rawValue);
      const end = this.getPosition();
      return {
        type: 'NumberValue',
        value,
        location: { start, end }
      } as NumberValue;
    }
    
    if (this.check(RclToken.TRUE) || this.check(RclToken.YES) || this.check(RclToken.ON) || this.check(RclToken.ENABLED) || this.check(RclToken.ACTIVE)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: true,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.FALSE) || this.check(RclToken.NO) || this.check(RclToken.OFF) || this.check(RclToken.DISABLED) || this.check(RclToken.INACTIVE)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: false,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.NULL) || this.check(RclToken.NULL_LOWER) || this.check(RclToken.NONE) || this.check(RclToken.NONE_LOWER) || this.check(RclToken.VOID) || this.check(RclToken.VOID_LOWER)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        location: { start, end }
      } as NullValue;
    }
    
    // Identifier or space-separated identifier
    if (this.check(RclToken.IDENTIFIER) || this.isIdentifierLikeToken(this.peek())) {
      const identifier = this.parseSpaceSeparatedIdentifier();
      const end = this.getPosition();
      return {
        type: 'IdentifierValue',
        value: identifier,
        isSpaceSeparated: identifier.includes(' '),
        location: { start, end }
      } as IdentifierValue;
    }
    
    throw new Error(`Unexpected token: ${this.peek()?.image}`);
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
    // Check if current token sequence looks like a flow rule
    // Flow rules can start with:
    // 1. IDENTIFIER followed by COLON (named flow)
    // 2. ATOM, STRING, or IDENTIFIER followed by ARROW (transition)
    
    const currentPos = this.current;
    
    // Skip whitespace
    while (this.check(RclToken.WS) && !this.isAtEnd()) {
      this.advance();
    }
    
    // Check for named flow rule (IDENTIFIER : ...)
    if (this.check(RclToken.IDENTIFIER)) {
      this.advance();
      // Skip whitespace
      while (this.check(RclToken.WS) && !this.isAtEnd()) {
        this.advance();
      }
      const isNamedRule = this.check(RclToken.COLON);
      this.current = currentPos; // Reset position
      return isNamedRule;
    }
    
    this.current = currentPos; // Reset position
    return false;
  }

  /**
   * Check if current position is a flow transition (operand -> operand)
   */
  private isFlowTransition(): boolean {
    const currentPos = this.current;
    
    try {
      // Skip whitespace
      while (this.check(RclToken.WS) && !this.isAtEnd()) {
        this.advance();
      }
      
      // Check for flow operand (atom, string, or identifier)
      if (this.isFlowOperandStart()) {
        // Skip the operand
        this.skipFlowOperand();
        
        // Skip whitespace
        while (this.check(RclToken.WS) && !this.isAtEnd()) {
          this.advance();
        }
        
        // Check for arrow
        const hasArrow = this.check(RclToken.ARROW);
        this.current = currentPos; // Reset position
        return hasArrow;
      }
      
      this.current = currentPos; // Reset position
      return false;
    } catch {
      this.current = currentPos; // Reset position on error
      return false;
    }
  }

  /**
   * Check if current position is the start of a flow operand
   */
  private isFlowOperandStart(): boolean {
    return this.check(RclToken.ATOM) || 
           this.check(RclToken.STRING) || 
           this.check(RclToken.IDENTIFIER);
  }

  /**
   * Skip a flow operand (for lookahead)
   */
  private skipFlowOperand(): void {
    if (this.check(RclToken.ATOM) || this.check(RclToken.STRING)) {
      this.advance();
    } else if (this.check(RclToken.IDENTIFIER)) {
      // Skip space-separated identifier
      this.advance();
      while (this.check(RclToken.WS) && !this.isAtEnd()) {
        this.advance();
        if (this.check(RclToken.IDENTIFIER)) {
          this.advance();
        } else {
          break;
        }
      }
    }
  }

  /**
   * Check if current position is a when clause
   */
  private isWhenClause(): boolean {
    // Skip whitespace
    const currentPos = this.current;
    while (this.check(RclToken.WS) && !this.isAtEnd()) {
      this.advance();
    }
    
    const isWhen = this.check(RclToken.WHEN);
    this.current = currentPos; // Reset position
    return isWhen;
  }

  /**
   * Check if current position is the start of a parameter
   */
  private isParameterStart(): boolean {
    const currentToken = this.peek();
    if (!currentToken) {
      return false;
    }
    
    // Basic parameter tokens
    if (this.check(RclToken.ATTRIBUTE_KEY) || this.check(RclToken.IDENTIFIER)) {
      return true;
    }
    
    // Allow certain keywords to be used as parameter names
    // This handles cases like "with time: value" where "time" is a reserved keyword
    return this.isKeywordValidAsParameterName(currentToken);
  }
  
  /**
   * Check if a keyword token can be used as a parameter name
   */
  private isKeywordValidAsParameterName(token: IToken): boolean {
    if (!token || !token.tokenType) return false;
    
    const tokenName = token.tokenType.name;
    
    // Allow type keywords that are commonly used as parameter names
    return tokenName === 'time' ||
           tokenName === 'date' ||
           tokenName === 'url' ||
           tokenName === 'email' ||
           tokenName === 'phone' ||
           tokenName === 'text' ||
           tokenName === 'message' ||
           tokenName === 'action' ||
           tokenName === 'file' ||
           tokenName === 'duration' ||
           tokenName === 'start' ||
           tokenName === 'end';
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

  /**
   * Parse embedded expression value: $js> code, $template> code, etc.
   */
  private parseEmbeddedExpression(): EmbeddedExpression {
    const start = this.getPosition();
    
    if (!this.check(RclToken.SINGLE_LINE_EXPRESSION)) {
      throw new Error(`Expected embedded expression, got ${this.peek()?.image}`);
    }
    
    const token = this.advance();
    const fullContent = token.image;
    
    // Extract language and content from patterns like "$js> code" or "$template> code"
    const languageMatch = fullContent.match(/^\$((js|ts|template|rcl)>)/);
    if (!languageMatch) {
      // Handle ${...} style expressions
      if (fullContent.startsWith('${') && fullContent.endsWith('}')) {
        return {
          type: 'EmbeddedExpression',
          language: 'js', // Default to js for ${} expressions
          content: fullContent.slice(2, -1), // Remove ${ and }
          isMultiline: false,
          location: { start, end: this.getPosition() }
        };
      }
      throw new Error(`Invalid embedded expression format: ${fullContent}`);
    }
    
    const language = languageMatch[2] as 'js' | 'ts' | 'template' | 'rcl';
    // Extract content after the full matched pattern (e.g., after "$js>")
    const content = fullContent.substring(languageMatch[0].length).trim();
    
    return {
      type: 'EmbeddedExpression',
      language,
      content,
      isMultiline: false,
      location: { start, end: this.getPosition() }
    };
  }
  
  /**
   * Parse embedded code block: $js>>> { code }
   */
  private parseEmbeddedCodeBlock(): EmbeddedCodeBlock {
    const start = this.getPosition();
    
    if (!this.check(RclToken.MULTI_LINE_EXPRESSION)) {
      throw new Error(`Expected multi-line expression, got ${this.peek()?.image}`);
    }
    
    const token = this.advance();
    const fullContent = token.image;
    
    // Extract language and content from patterns like "$js>>> { code }"
    const languageMatch = fullContent.match(/^\$((js|ts|template|rcl)?)>>>/);
    if (!languageMatch) {
      throw new Error(`Invalid multi-line expression format: ${fullContent}`);
    }
    
    const language = (languageMatch[2] || 'js') as 'js' | 'ts' | 'template' | 'rcl';
    
    // Extract content between { and }
    const contentMatch = fullContent.match(/\{([^}]*)\}/s);
    if (!contentMatch) {
      throw new Error(`Invalid multi-line expression format - no braces found: ${fullContent}`);
    }
    
    const rawContent = contentMatch[1];
    // Split into lines and trim each line
    const contentLines = rawContent.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    
    return {
      type: 'EmbeddedCodeBlock',
      language,
      content: contentLines,
      location: { start, end: this.getPosition() }
    };
  }
} 