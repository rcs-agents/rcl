import type { IToken, ILexingError } from 'chevrotain';
import { RclCustomLexer, RclToken } from './rcl-custom-lexer.js';
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
  SourceLocation
} from './rcl-simple-ast.js';

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
    while (this.match(RclToken.IMPORT_KW)) {
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
          // Skip unexpected tokens
          this.advance();
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
    this.consume(RclToken.IMPORT_KW);
    
    const importedNames: string[] = [];
    
    // Parse import name(s)
    if (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN)) {
      importedNames.push(this.advance().image);
    }
    
    // Handle 'as' alias
    let alias: string | undefined;
    if (this.match(RclToken.AS_KW)) {
      if (this.check(RclToken.IDENTIFIER)) {
        alias = this.advance().image;
      }
    }
    
    // Handle 'from' source
    let source: string | undefined;
    if (this.match(RclToken.FROM_KW)) {
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
    } else if (this.match(RclToken.FLOWS_KW)) {
      sectionType = 'flows';  
    } else if (this.match(RclToken.MESSAGES_KW)) {
      sectionType = 'messages';
    } else if (this.match(RclToken.AGENT_CONFIG_KW)) {
      sectionType = 'agentConfig';
    } else if (this.match(RclToken.AGENT_DEFAULTS_KW)) {
      sectionType = 'agentDefaults';
    }

    // Parse section name (space-separated identifiers)
    name = this.parseSpaceSeparatedIdentifier();

    this.consume(RclToken.COLON);
    this.consumeNewlineOrEnd();

    // Parse section body
    const attributes: Attribute[] = [];
    const subSections: Section[] = [];
    const flowRules: FlowRule[] = [];
    const messages: MessageDefinition[] = [];

    if (this.match(RclToken.INDENT)) {
      while (!this.check(RclToken.DEDENT) && !this.isAtEnd()) {
        try {
          if (this.isNextSectionStart()) {
            // Parse nested section
            const subSection = this.parseSection();
            subSections.push(subSection);
          } else if (this.isFlowRule()) {
            // Parse flow rule
            const flowRule = this.parseFlowRule();
            flowRules.push(flowRule);
          } else if (this.isMessageDefinition()) {
            // Parse message definition
            const message = this.parseMessageDefinition();
            messages.push(message);
          } else if (this.isAttribute()) {
            // Parse attribute
            const attr = this.parseAttribute();
            attributes.push(attr);
          } else {
            // Skip unknown content
            this.advance();
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
    
    // For now, create a simple flow rule
    // TODO: Parse nested flow content and arrows
    const end = this.getPosition();

    return {
      type: 'FlowRule',
      name,
      nestedRules: [],
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
    
    if (this.check(RclToken.TRUE_KW)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: true,
        rawValue: token.image,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.FALSE_KW)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'BooleanValue',
        value: false,
        rawValue: token.image,
        location: { start, end }
      } as BooleanValue;
    }
    
    if (this.check(RclToken.NULL_KW)) {
      const token = this.advance();
      const end = this.getPosition();
      return {
        type: 'NullValue',
        rawValue: token.image,
        location: { start, end }
      } as NullValue;
    }
    
    // Default to identifier
    if (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN)) {
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
    
    // Collect identifiers separated by spaces
    while (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN)) {
      parts.push(this.advance().image);
      
      // Check for space between identifiers
      if (this.check(RclToken.WS)) {
        const nextToken = this.tokens[this.current + 1];
        if (nextToken && (nextToken.tokenType === RclToken.IDENTIFIER || nextToken.tokenType === RclToken.PROPER_NOUN)) {
          this.advance(); // consume space
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return parts.join(' ');
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
           this.check(RclToken.FLOWS_KW) || 
           this.check(RclToken.MESSAGES_KW) ||
           this.check(RclToken.AGENT_CONFIG_KW) ||
           this.check(RclToken.AGENT_DEFAULTS_KW);
  }

  private isFlowRule(): boolean {
    // Simple heuristic: if we see an identifier followed by colon in a flows section
    return (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN));
  }

  private isMessageDefinition(): boolean {
    // Similar to flow rule, but in messages section
    return (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN));
  }

  private isAttribute(): boolean {
    return (this.check(RclToken.IDENTIFIER) || this.check(RclToken.PROPER_NOUN)) &&
           this.tokens.slice(this.current).some((token, i) => 
             i < 5 && token.tokenType === RclToken.COLON);
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
        case RclToken.FLOWS_KW:
        case RclToken.MESSAGES_KW:
        case RclToken.AGENT_CONFIG_KW:
        case RclToken.AGENT_DEFAULTS_KW:
          return;
      }

      this.advance();
    }
  }
} 