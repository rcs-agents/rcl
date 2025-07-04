import type { IToken } from 'chevrotain';
import { RclLexer } from './lexer.js';
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
import { resolveImportPath, findProjectRoot } from '../utils/filesystem.js';

// Import tokens from lexer
const RclToken = RclLexer;

/**
 * Custom Recursive Descent Parser for RCL
 * 
 * Produces AST nodes that match the simplified RCL AST interfaces.
 * The structure follows a flat approach where sections can contain
 * attributes, sub-sections, flow rules, and message definitions.
 */
interface ParseError {
  message: string;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

export class RclParser {
  private lexer: RclLexer;
  private tokens: IToken[] = [];
  private current = 0;
  private errors: ParseError[] = [];
  private line = 1;
  private column = 1;

  constructor() {
    this.lexer = new RclLexer();
  }

  private addParseError(message: string): void {
    const token = this.peek();
    this.errors.push({
      message,
      range: token ? {
        start: { line: (token.startLine || this.line) - 1, character: (token.startColumn || this.column) - 1 },
        end: { line: (token.endLine || token.startLine || this.line) - 1, character: (token.endColumn || token.startColumn || this.column) - 1 }
      } : undefined
    });
  }

  /**
   * Parse RCL source code into an AST
   */
  parse(input: string): { ast: RclFile | null; errors: ParseError[] } {
    try {
      const lexResult = this.lexer.tokenize(input);
      this.tokens = lexResult.tokens;
      this.current = 0;
      this.errors = [...lexResult.errors.map(e => ({
        message: e.message,
        range: {
          start: { line: (e.line || 1) - 1, character: (e.column || 1) - 1 },
          end: { line: (e.line || 1) - 1, character: (e.column || 1) + (e.length || 0) - 1 }
        }
      }))];

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
      this.addParseError(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
      return { ast: null, errors: this.errors };
    }
  }

  private parseRclFile(): RclFile {
    const imports: ImportStatement[] = [];
    const sections: Section[] = [];
    
    // Parse imports at the top
    while (this.check(RclToken.IMPORT_KW)) {
      try {
        const importStmt = this.parseImportStatement();
        imports.push(importStmt);
      } catch (error) {
        this.addParseError(`Import parsing error: ${error}`);
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
              this.errors.push({
                message: `Unexpected token '${unexpectedToken.image}' at line ${unexpectedToken.startLine}, column ${unexpectedToken.startColumn}`,
                range: {
                  start: { line: (unexpectedToken.startLine || 1) - 1, character: (unexpectedToken.startColumn || 1) - 1 },
                  end: { line: (unexpectedToken.endLine || unexpectedToken.startLine || 1) - 1, character: (unexpectedToken.endColumn || unexpectedToken.startColumn || 1) - 1 }
                }
              });
            }
            this.advance();
          }
        }
      } catch (error) {
        this.errors.push({
          message: `Section parsing error: ${(error as any).message || String(error)}`,
          range: {
            start: { line: this.line, character: this.column },
            end: { line: this.line, character: this.column }
          }
        });
        this.synchronize();
      }
    }

    return this.createRclFile(imports, sections);
  }

  /**
   * Parses an import statement, supporting multi-level namespace paths and space-separated aliases.
   *
   * Example supported syntax:
   *   import My Brand / Samples as Sample One
   *   import Shared / Common Flows / Support
   *
   * - Each namespace segment (e.g., "My Brand") is parsed as a space-separated identifier and added to `importedNames`.
   * - The optional alias (after `as`) is parsed as a space-separated identifier.
   * - The optional source (after `from`) is parsed as a quoted string (reserved for future use).
   *
   * Returns an ImportStatement AST node with the parsed path and alias.
   */
  private parseImportStatement(): ImportStatement {
    const start = this.getPosition();
    this.consume(RclToken.IMPORT_KW);
    
    // Skip whitespace before import name
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    const importedNames: string[] = [];
    
    // According to formal spec: ImportPath ::= IDENTIFIER ('/' IDENTIFIER)*
    // Parse namespace-style import names separated by '/'
    // e.g., "My Brand / Samples" or "Shared / Common Flows / Support"
    
    // First identifier is required
    if (!this.check(RclToken.IDENTIFIER)) {
      this.addParseError(`Expected identifier after 'import'`);
      return {
        type: 'ImportStatement',
        importedNames: [],
        alias: undefined,
        source: undefined,
        location: { start, end: this.getPosition() }
      };
    }
    
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
        
        // Slash must be followed by another identifier
        if (!this.check(RclToken.IDENTIFIER)) {
          this.addParseError(`Expected identifier after '/' in import path`);
          break;
        }
      } else {
        break; // No more namespace parts
      }
    } while (!this.isAtEnd() && !this.check(RclToken.AS_KW) && !this.check(RclToken.FROM_KW));
    
    // Validate import structure - must have at least one identifier
    if (importedNames.length === 0) {
      this.addParseError(`Invalid import statement: no identifiers found`);
    }
    
    // Handle 'as' alias (with space-separated identifiers)
    let alias: string | undefined;
    // Skip whitespace before 'as'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    if (this.match(RclToken.AS_KW)) {
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
    if (this.match(RclToken.FROM_KW)) {
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
    // Infer section type from keyword
    let sectionType: string | undefined;
    if (this.match(RclToken.AGENT_KW)) {
      sectionType = 'agent';
    } else if (this.match(RclToken.FLOW_KW)) {
      sectionType = 'flow';
    } else if (this.match(RclToken.FLOWS_KW)) {
      sectionType = 'flows';
    } else if (this.match(RclToken.MESSAGES_KW)) {
      sectionType = 'messages';
    } else if (this.match(RclToken.AGENT_CONFIG_KW)) {
      sectionType = 'agentConfig';
    } else if (this.match(RclToken.AGENT_DEFAULTS_KW)) {
      sectionType = 'agentDefaults';
    }
    // Skip whitespace before section name or colon
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    // Parse section name if present (some sections like 'flows:' have no name)
    let name: string;
    if (this.check(RclToken.COLON)) {
      name = '';
      // According to formal spec, agent sections require names
      if (sectionType === 'agent') {
        this.addParseError(`Agent section requires a name`);
      }
    } else {
      name = this.parseSpaceSeparatedIdentifier();
    }
    this.consume(RclToken.COLON);
    this.consumeNewlineOrEnd();
    const attributes: Attribute[] = [];
    const subSections: Section[] = [];
    const flowRules: FlowRule[] = [];
    const messageDefinitions: MessageDefinition[] = [];
    if (this.match(RclToken.INDENT)) {
      let loopCount = 0;
      const MAX_LOOPS = 1000;
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        loopCount++;
        if (loopCount > MAX_LOOPS) {
          this.addParseError(`Infinite loop detected in section parsing at token ${this.current}`);
          break;
        }
        try {
          if (this.isNextSectionStart()) {
            const subSection = this.parseSection();
            subSections.push(subSection);
          } else if (this.isFlowRule()) {
            const flowRule = this.parseFlowRule();
            flowRules.push(flowRule);
          } else if (sectionType === 'flow' && this.isFlowTransition()) {
            // Handle direct transitions in flow sections
            if (flowRules.length === 0) {
              // Create an implicit flow rule for direct transitions using the section name
              const implicitFlowRule: FlowRule = {
                type: 'FlowRule',
                name: name, // Use the section name as the flow rule name
                attributes: [],
                nestedRules: [],
                transitions: [],
                whenClauses: [],
                location: { start: this.getPosition(), end: this.getPosition() }
              };
              flowRules.push(implicitFlowRule);
            }
            const transition = this.parseFlowTransition();
            flowRules[0].transitions.push(transition);
          } else if (this.isMessageDefinition(sectionType)) {
            const msgDef = this.parseMessageDefinition();
            messageDefinitions.push(msgDef);
          } else if (this.isAttribute()) {
            const attr = this.parseAttribute();
            attributes.push(attr);
          } else {
            this.advance();
          }
        } catch (error) {
          this.addParseError(`Section content parsing error: ${error}`);
          this.synchronize();
        }
      }
      if (this.check(RclToken.DEDENT)) {
        this.advance();
      }
    }
    const end = this.getPosition();
    const sectionObj = {
      type: 'Section' as const,
      sectionType,
      name,
      attributes,
      subSections,
      flowRules,
      messages: messageDefinitions,
      location: { start, end }
    };
    return sectionObj;
  }

  private parseAttribute(): Attribute {
    const start = this.getPosition();
    const keyToken = this.advance();
    this.consume(RclToken.COLON);
    // Skip optional whitespace
    if (this.check(RclToken.WS)) {
      this.advance();
    }
    const value = this.parseValue();
    this.consumeNewlineOrEnd();
    const end = this.getPosition();
    const attr = {
      type: 'Attribute' as const,
      key: keyToken.image,
      value,
      location: { start, end }
    };
    return attr;
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
          this.errors.push({
            message: `Infinite loop detected in flow rule parsing at token ${this.current}`,
            range: {
              start: { line: this.line, character: this.column },
              end: { line: this.line, character: this.column }
            }
          });
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
          this.errors.push({
            message: `Flow rule content parsing error: ${(error as any).message || String(error)}`,
            range: {
              start: { line: this.line, character: this.column },
              end: { line: this.line, character: this.column }
            }
          });
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
    
    if (this.check(RclToken.WITH_KW)) {
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
   * Parse a with clause as an indented block:
   * with
   *   param1: value1
   *   param2: value2
   */
  private parseWithClause(): WithClause {
    const start = this.getPosition();
    
    this.consume(RclToken.WITH_KW);
    this.consumeNewlineOrEnd();
    
    const parameters: Parameter[] = [];
    
    // Parse indented parameter block
    if (this.match(RclToken.INDENT)) {
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        if (this.isParameterStart()) {
          parameters.push(this.parseParameter());
          this.consumeNewlineOrEnd();
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
    
    this.consume(RclToken.WHEN_KW);
    
    // Skip whitespace after 'when'
    while (this.check(RclToken.WS)) {
      this.advance();
    }
    
    // Parse condition (for now, just store as embedded expression placeholder)
    // TODO: Implement proper condition parsing
    const condition: EmbeddedExpression = {
      type: 'EmbeddedExpression',
      language: 'js',
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
          this.errors.push({
            message: `Message attribute parsing error: ${(error as any).message || String(error)}`,
            range: {
              start: { line: this.line, character: this.column },
              end: { line: this.line, character: this.column }
            }
          });
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
    if (this.check(RclToken.EMBEDDED_CODE)) {
      return this.parseEmbeddedExpression();
    }
    
    if (this.check(RclToken.MULTI_LINE_EXPRESSION_START)) {
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
      const value = rawValue.includes('.') ? Number.parseFloat(rawValue) : Number.parseInt(rawValue);
      const end = this.getPosition();
      return {
        type: 'NumberValue',
        value,
        location: { start, end }
      } as NumberValue;
    }
    
    if (this.check(RclToken.TRUE_KW) || this.check(RclToken.YES_KW) || this.check(RclToken.ON_KW) || this.check(RclToken.ENABLED_KW) || this.check(RclToken.ACTIVE_KW)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: true,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.FALSE_KW) || this.check(RclToken.NO_KW) || this.check(RclToken.OFF_KW) || this.check(RclToken.DISABLED_KW) || this.check(RclToken.INACTIVE_KW)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: false,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.NULL_KW) || this.check(RclToken.NULL_LOWERCASE_KW) || this.check(RclToken.NONE_KW) || this.check(RclToken.VOID_KW)) {
      this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        location: { start, end }
      } as NullValue;
    }
    
    // Identifier or space-separated identifier
    if (this.check(RclToken.IDENTIFIER) || (this.peek() && this.isIdentifierLikeToken(this.peek()))) {
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
           tokenName === 'ATTRIBUTE_KEY' ||
           tokenName === 'SECTION_TYPE' ||
           tokenName === 'Config' ||
           tokenName === 'DEFAULTS' ||
           tokenName === 'Messages' ||
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
           tokenName === 'start' ||
           tokenName === 'end' ||
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
    return       this.check(RclToken.AGENT_KW) ||
      this.check(RclToken.FLOW_KW) ||
      this.check(RclToken.FLOWS_KW) ||
      this.check(RclToken.MESSAGES_KW) ||
           this.check(RclToken.AGENT_CONFIG_KW) ||
           this.check(RclToken.AGENT_DEFAULTS_KW);
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
    
    const isWhen = this.check(RclToken.WHEN_KW);
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

  private isMessageDefinition(sectionType?: string): boolean {
    // Message definitions should only be recognized in messages sections
    const currentToken = this.peek();
    if (!currentToken) return false;
    
    // Only consider this a message definition if:
    // 1. We have an identifier-like token followed by a colon 
    // 2. AND we're in a messages section context
    if (sectionType !== 'messages') {
      return false;
    }
    
    return !!(currentToken && this.isIdentifierLikeToken(currentToken) && 
           this.tokens[this.current + 1]?.tokenType === RclToken.COLON);
  }

  private isAttribute(): boolean {
    // An attribute starts with an identifier-like token (IDENTIFIER or ATTRIBUTE_KEY) followed by a colon
    const currentToken = this.peek();
    if (!currentToken) return false;
    const tokenName = currentToken.tokenType.name;
    if (tokenName !== 'IDENTIFIER' && tokenName !== 'ATTRIBUTE_KEY') {
      return false;
    }
    // Look ahead for colon, skipping only whitespace
    let idx = this.current + 1;
    const lookaheadTokens: string[] = [];
    while (idx < this.tokens.length) {
      const token = this.tokens[idx];
      lookaheadTokens.push(`${token.tokenType.name}:${JSON.stringify(token.image)}`);
      
      if (token.tokenType === RclToken.COLON) {
        return true;
      }
      
      if (token.tokenType === RclToken.WS) {
        idx++;
        continue;
      }

      break;
    }
    return false;
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
    if (!this.isAtEnd()) {
      this.current++;
      // Update line and column from current token position
      const token = this.previous();
      if (token && token.startLine !== undefined && token.startColumn !== undefined) {
        this.line = token.startLine;
        this.column = token.startColumn;
      }
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): IToken {
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
        case RclToken.FLOW_KW:
        case RclToken.FLOWS_KW:
        case RclToken.MESSAGES_KW:
        case RclToken.AGENT_CONFIG_KW:
        case RclToken.AGENT_DEFAULTS_KW:
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
   * Parse embedded expression value: $js> code, $ts> code
   */
  private parseEmbeddedExpression(): EmbeddedExpression {
    const start = this.getPosition();
    if (!this.check(RclToken.EMBEDDED_CODE)) {
      throw new Error(`Expected embedded expression, got ${this.peek()?.image}`);
    }
    const token = this.advance();
    const fullContent = token.image;
    // Extract language and content from patterns like "$js> code", "$ts> code", or "$> code"
    const languageMatch = fullContent.match(/^\$((js|ts)?>)/);
    if (!languageMatch) {
      throw new Error(`Unknown embedded expression format: ${fullContent}`);
    }
    // Handle the language extraction: if it's just ">", default to "js"
    let language: 'js' | 'ts';
    if (languageMatch[1] === '>') {
      language = 'js'; // Default language for $> syntax
    } else {
      language = languageMatch[1].slice(0, -1) as 'js' | 'ts'; // Remove the '>' and use 'js' or 'ts'
    }
    const content = fullContent.slice(languageMatch[0].length).trim();
    return {
      type: 'EmbeddedExpression',
      language,
      content,
      isMultiline: false,
      location: { start, end: start }
    };
  }
  
  /**
   * Parse embedded code block: $js>>> { code }, $ts>>> { code }
   */
  private parseEmbeddedCodeBlock(): EmbeddedCodeBlock {
    const start = this.getPosition();
    
    if (!this.check(RclToken.MULTI_LINE_EXPRESSION_START)) {
      throw new Error(`Expected multi-line expression, got ${this.peek()?.image}`);
    }
    
    const token = this.advance();
    const fullContent = token.image;
    
    // Extract language and content from patterns like "$js>>> { code }", "$ts>>> { code }", or "$>>> { code }"
    const languageMatch = fullContent.match(/^\$((js|ts)?)>>>/);
    if (!languageMatch) {
      throw new Error(`Invalid multi-line expression format: ${fullContent}`);
    }
    
    const language = (languageMatch[2] || 'js') as 'js' | 'ts';
    
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

  /**
   * Static access to import resolution utilities
   * @deprecated Use the functions directly from '../utils/filesystem.js' instead
   */
  static resolveImportPath = resolveImportPath;
  static findProjectRoot = findProjectRoot;
} 