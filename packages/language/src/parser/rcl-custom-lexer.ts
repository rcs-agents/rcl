import type { IToken, TokenType, ILexingError, IMultiModeLexerDefinition } from 'chevrotain';
import { createToken, Lexer } from 'chevrotain';

/**
 * Custom RCL Lexer built from scratch to handle:
 * - Indentation-aware tokenization (INDENT/DEDENT)
 * - Multi-mode lexing for resolving token conflicts
 * - Embedded expressions (single-line and multi-line)
 * - Multi-line strings with chomping markers
 * - Proper keyword vs identifier precedence
 * - Space-separated identifiers (Title Case)
 */
export class RclCustomLexer {
  private indentationStack: number[] = [0];
  private currentMode: string = 'default';
  private modeStack: string[] = [];
  private tokens: IToken[] = [];
  private errors: ILexingError[] = [];
  private text: string = '';
  private offset: number = 0;
  private line: number = 1;
  private column: number = 1;

  // Token Types
  static readonly INDENT = createToken({ name: 'INDENT', pattern: Lexer.NA });
  static readonly DEDENT = createToken({ name: 'DEDENT', pattern: Lexer.NA });
  static readonly WS = createToken({ name: 'WS', pattern: /[ \t]+/, group: Lexer.SKIPPED });
  static readonly NL = createToken({ name: 'NL', pattern: /\r?\n/, group: Lexer.SKIPPED });
  static readonly SL_COMMENT = createToken({ name: 'SL_COMMENT', pattern: /#.*/, group: Lexer.SKIPPED });

  // Keywords (must come before general identifiers)
  static readonly IMPORT = createToken({ name: 'import', pattern: /import\b/ });
  static readonly AS = createToken({ name: 'as', pattern: /as\b/ });
  static readonly AGENT = createToken({ name: 'agent', pattern: /agent\b/ });
  static readonly AGENT_DEFAULTS = createToken({ name: 'agentDefaults', pattern: /agentDefaults\b/ });
  static readonly AGENT_CONFIG = createToken({ name: 'agentConfig', pattern: /agentConfig\b/ });
  static readonly FLOW = createToken({ name: 'flow', pattern: /flow\b/ });
  static readonly MESSAGES = createToken({ name: 'messages', pattern: /messages\b/ });
  static readonly AGENT_MESSAGE = createToken({ name: 'agentMessage', pattern: /agentMessage\b/ });
  static readonly CONTENT_MESSAGE = createToken({ name: 'contentMessage', pattern: /contentMessage\b/ });
  static readonly TEXT = createToken({ name: 'text', pattern: /text\b/ });
  static readonly RICH_CARD = createToken({ name: 'richCard', pattern: /richCard\b/ });
  static readonly CAROUSEL = createToken({ name: 'carousel', pattern: /carousel\b/ });
  static readonly RBM_FILE = createToken({ name: 'rbmFile', pattern: /rbmFile\b/ });
  static readonly FILE = createToken({ name: 'file', pattern: /file\b/ });
  static readonly REPLY = createToken({ name: 'reply', pattern: /reply\b/ });
  static readonly DIAL = createToken({ name: 'dial', pattern: /dial\b/ });
  static readonly OPEN_URL = createToken({ name: 'openUrl', pattern: /openUrl\b/ });
  static readonly SHARE_LOCATION = createToken({ name: 'shareLocation', pattern: /shareLocation\b/ });
  static readonly VIEW_LOCATION = createToken({ name: 'viewLocation', pattern: /viewLocation\b/ });
  static readonly SAVE_EVENT = createToken({ name: 'saveEvent', pattern: /saveEvent\b/ });
  static readonly START = createToken({ name: 'start', pattern: /start\b/ });
  static readonly WITH = createToken({ name: 'with', pattern: /with\b/ });
  static readonly LIST = createToken({ name: 'list', pattern: /list\b/ });
  static readonly OF = createToken({ name: 'of', pattern: /of\b/ });
  static readonly TRANSACTIONAL = createToken({ name: 'transactional', pattern: /transactional\b/ });
  static readonly PROMOTIONAL = createToken({ name: 'promotional', pattern: /promotional\b/ });

  // Boolean keywords
  static readonly TRUE = createToken({ name: 'True', pattern: /True\b/ });
  static readonly YES = createToken({ name: 'Yes', pattern: /Yes\b/ });
  static readonly ON = createToken({ name: 'On', pattern: /On\b/ });
  static readonly ENABLED = createToken({ name: 'Enabled', pattern: /Enabled\b/ });
  static readonly ACTIVE = createToken({ name: 'Active', pattern: /Active\b/ });
  static readonly FALSE = createToken({ name: 'False', pattern: /False\b/ });
  static readonly NO = createToken({ name: 'No', pattern: /No\b/ });
  static readonly OFF = createToken({ name: 'Off', pattern: /Off\b/ });
  static readonly DISABLED = createToken({ name: 'Disabled', pattern: /Disabled\b/ });
  static readonly INACTIVE = createToken({ name: 'Inactive', pattern: /Inactive\b/ });

  // Null keywords
  static readonly NULL = createToken({ name: 'Null', pattern: /Null\b/ });
  static readonly NONE = createToken({ name: 'None', pattern: /None\b/ });
  static readonly VOID = createToken({ name: 'Void', pattern: /Void\b/ });

  // Reserved names
  static readonly DEFAULTS = createToken({ name: 'Defaults', pattern: /Defaults\b/ });
  static readonly CONFIG = createToken({ name: 'Config', pattern: /Config\b/ });
  static readonly MESSAGES_RESERVED = createToken({ name: 'Messages', pattern: /Messages\b/ });

  // Type tag names (used in <type value> syntax)
  static readonly EMAIL_TYPE = createToken({ name: 'email', pattern: /email\b/ });
  static readonly PHONE_TYPE = createToken({ name: 'phone', pattern: /phone\b/ });
  static readonly MSISDN_TYPE = createToken({ name: 'msisdn', pattern: /msisdn\b/ });
  static readonly URL_TYPE = createToken({ name: 'url', pattern: /url\b/ });
  static readonly TIME_TYPE = createToken({ name: 'time', pattern: /time\b/ });
  static readonly T_TYPE = createToken({ name: 't', pattern: /t\b/ });
  static readonly DATETIME_TYPE = createToken({ name: 'datetime', pattern: /datetime\b/ });
  static readonly DATE_TYPE = createToken({ name: 'date', pattern: /date\b/ });
  static readonly DT_TYPE = createToken({ name: 'dt', pattern: /dt\b/ });
  static readonly ZIPCODE_TYPE = createToken({ name: 'zipcode', pattern: /zipcode\b/ });
  static readonly ZIP_TYPE = createToken({ name: 'zip', pattern: /zip\b/ });
  static readonly DURATION_TYPE = createToken({ name: 'duration', pattern: /duration\b/ });
  static readonly TTL_TYPE = createToken({ name: 'ttl', pattern: /ttl\b/ });

  // Identifiers (after keywords to avoid conflicts)
  static readonly IDENTIFIER = createToken({ 
    name: 'IDENTIFIER', 
    pattern: /[A-Z]([A-Za-z0-9-]|(\s(?=[A-Z0-9])))*/,
    line_breaks: false
  });
  static readonly ATTRIBUTE_KEY = createToken({ 
    name: 'ATTRIBUTE_KEY', 
    pattern: /[a-z][a-zA-Z0-9_]*/
  });
  static readonly SECTION_TYPE = createToken({ 
    name: 'SECTION_TYPE', 
    pattern: /[a-z][a-zA-Z0-9]*/
  });

  // Literals
  static readonly STRING = createToken({ 
    name: 'STRING', 
    pattern: /"(\\.|[^"\\])*"/
  });
  static readonly NUMBER = createToken({ 
    name: 'NUMBER', 
    pattern: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/
  });
  static readonly ATOM = createToken({ 
    name: 'ATOM', 
    pattern: /:([_a-zA-Z][\w_]*|"[^"\\]*")/
  });

  // Embedded expressions
  static readonly SINGLE_LINE_EXPRESSION = createToken({
    name: 'SINGLE_LINE_EXPRESSION',
    pattern: /\$((js|ts)?>)\s*[^\r\n]*/
  });
  static readonly MULTI_LINE_EXPRESSION_START = createToken({
    name: 'MULTI_LINE_EXPRESSION_START',
    pattern: /\$((js|ts)?)>>>/
  });

  // Multi-line string markers
  static readonly MULTILINE_STR_CLEAN = createToken({
    name: 'MULTILINE_STR_CLEAN',
    pattern: /\|\s*$/
  });
  static readonly MULTILINE_STR_TRIM = createToken({
    name: 'MULTILINE_STR_TRIM',
    pattern: /\|-\s*$/
  });
  static readonly MULTILINE_STR_PRESERVE = createToken({
    name: 'MULTILINE_STR_PRESERVE',
    pattern: /\+\|\s*$/
  });
  static readonly MULTILINE_STR_PRESERVE_ALL = createToken({
    name: 'MULTILINE_STR_PRESERVE_ALL',
    pattern: /\+\|\+\s*$/
  });

  // Punctuation
  static readonly ARROW = createToken({ name: 'ARROW', pattern: /->/ });
  static readonly COLON = createToken({ name: 'COLON', pattern: /:/ });
  static readonly COMMA = createToken({ name: 'COMMA', pattern: /,/ });
  static readonly DOT = createToken({ name: 'DOT', pattern: /\./ });
  static readonly SLASH = createToken({ name: 'SLASH', pattern: /\// });
  static readonly HYPHEN = createToken({ name: 'HYPHEN', pattern: /-/ });
  static readonly PIPE = createToken({ name: 'PIPE', pattern: /\|/ });
  static readonly APOSTROPHE_S = createToken({ name: 'APOSTROPHE_S', pattern: /'s/ });

  // Brackets and braces
  static readonly LPAREN = createToken({ name: 'LPAREN', pattern: /\(/ });
  static readonly RPAREN = createToken({ name: 'RPAREN', pattern: /\)/ });
  static readonly LBRACE = createToken({ name: 'LBRACE', pattern: /\{/ });
  static readonly RBRACE = createToken({ name: 'RBRACE', pattern: /\}/ });
  static readonly LT = createToken({ name: 'LT', pattern: /</ });
  static readonly GT = createToken({ name: 'GT', pattern: />/ });

  // ISO Duration
  static readonly ISO_DURATION_LITERAL = createToken({
    name: 'ISO_DURATION_LITERAL',
    pattern: /(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?)|([0-9]+(\.[0-9]+)?s)/
  });

  // Mode definitions for multi-mode lexing
  private static readonly allTokens = [
    // Indentation tokens
    RclCustomLexer.INDENT,
    RclCustomLexer.DEDENT,
    RclCustomLexer.WS,
    RclCustomLexer.NL,
    RclCustomLexer.SL_COMMENT,

    // Keywords (order matters - specific before general)
    RclCustomLexer.IMPORT,
    RclCustomLexer.AS,
    RclCustomLexer.AGENT,
    RclCustomLexer.AGENT_DEFAULTS,
    RclCustomLexer.AGENT_CONFIG,
    RclCustomLexer.FLOW,
    RclCustomLexer.MESSAGES,
    RclCustomLexer.AGENT_MESSAGE,
    RclCustomLexer.CONTENT_MESSAGE,
    RclCustomLexer.TEXT,
    RclCustomLexer.RICH_CARD,
    RclCustomLexer.CAROUSEL,
    RclCustomLexer.RBM_FILE,
    RclCustomLexer.FILE,
    RclCustomLexer.REPLY,
    RclCustomLexer.DIAL,
    RclCustomLexer.OPEN_URL,
    RclCustomLexer.SHARE_LOCATION,
    RclCustomLexer.VIEW_LOCATION,
    RclCustomLexer.SAVE_EVENT,
    RclCustomLexer.START,
    RclCustomLexer.WITH,
    RclCustomLexer.LIST,
    RclCustomLexer.OF,
    RclCustomLexer.TRANSACTIONAL,
    RclCustomLexer.PROMOTIONAL,

    // Boolean keywords
    RclCustomLexer.TRUE,
    RclCustomLexer.YES,
    RclCustomLexer.ON,
    RclCustomLexer.ENABLED,
    RclCustomLexer.ACTIVE,
    RclCustomLexer.FALSE,
    RclCustomLexer.NO,
    RclCustomLexer.OFF,
    RclCustomLexer.DISABLED,
    RclCustomLexer.INACTIVE,

    // Null keywords
    RclCustomLexer.NULL,
    RclCustomLexer.NONE,
    RclCustomLexer.VOID,

    // Reserved names
    RclCustomLexer.DEFAULTS,
    RclCustomLexer.CONFIG,
    RclCustomLexer.MESSAGES_RESERVED,

    // Type tag names
    RclCustomLexer.EMAIL_TYPE,
    RclCustomLexer.PHONE_TYPE,
    RclCustomLexer.MSISDN_TYPE,
    RclCustomLexer.URL_TYPE,
    RclCustomLexer.TIME_TYPE,
    RclCustomLexer.T_TYPE,
    RclCustomLexer.DATETIME_TYPE,
    RclCustomLexer.DATE_TYPE,
    RclCustomLexer.DT_TYPE,
    RclCustomLexer.ZIPCODE_TYPE,
    RclCustomLexer.ZIP_TYPE,
    RclCustomLexer.DURATION_TYPE,
    RclCustomLexer.TTL_TYPE,

    // Identifiers (after keywords)
    RclCustomLexer.IDENTIFIER,
    RclCustomLexer.ATTRIBUTE_KEY,
    RclCustomLexer.SECTION_TYPE,

    // Literals
    RclCustomLexer.STRING,
    RclCustomLexer.NUMBER,
    RclCustomLexer.ATOM,
    RclCustomLexer.ISO_DURATION_LITERAL,

    // Embedded expressions
    RclCustomLexer.SINGLE_LINE_EXPRESSION,
    RclCustomLexer.MULTI_LINE_EXPRESSION_START,

    // Multi-line string markers
    RclCustomLexer.MULTILINE_STR_PRESERVE_ALL,  // Must come before MULTILINE_STR_PRESERVE
    RclCustomLexer.MULTILINE_STR_PRESERVE,
    RclCustomLexer.MULTILINE_STR_TRIM,
    RclCustomLexer.MULTILINE_STR_CLEAN,

    // Punctuation (longer patterns first)
    RclCustomLexer.ARROW,
    RclCustomLexer.APOSTROPHE_S,
    RclCustomLexer.COLON,
    RclCustomLexer.COMMA,
    RclCustomLexer.DOT,
    RclCustomLexer.SLASH,
    RclCustomLexer.HYPHEN,
    RclCustomLexer.PIPE,

    // Brackets and braces
    RclCustomLexer.LPAREN,
    RclCustomLexer.RPAREN,
    RclCustomLexer.LBRACE,
    RclCustomLexer.RBRACE,
    RclCustomLexer.LT,
    RclCustomLexer.GT,
  ];

  /**
   * Tokenize the input text and return tokens with errors
   */
  tokenize(text: string): { tokens: IToken[]; errors: ILexingError[] } {
    this.reset();
    this.text = text;
    this.offset = 0;
    this.line = 1;
    this.column = 1;

    while (this.offset < this.text.length) {
      const matched = this.tryMatchToken();
      if (!matched) {
        // If no token matched, create an error and skip the character
        this.addError(`Unexpected character '${this.text[this.offset]}' at line ${this.line}, column ${this.column}`);
        this.advance(1);
      }
    }

    // Add remaining dedents at end of file
    this.flushRemainingDedents();

    return {
      tokens: this.tokens,
      errors: this.errors
    };
  }

  private reset(): void {
    this.indentationStack = [0];
    this.currentMode = 'default';
    this.modeStack = [];
    this.tokens = [];
    this.errors = [];
    this.text = '';
    this.offset = 0;
    this.line = 1;
    this.column = 1;
  }

  private tryMatchToken(): boolean {
    // Skip whitespace and handle indentation at start of line
    if (this.isStartOfLine()) {
      return this.handleIndentation();
    }

    // Try to match each token type in order
    for (const tokenType of RclCustomLexer.allTokens) {
      if (tokenType === RclCustomLexer.INDENT || tokenType === RclCustomLexer.DEDENT) {
        continue; // These are handled by indentation logic
      }

      const pattern = tokenType.PATTERN;
      if (pattern instanceof RegExp) {
        const regex = new RegExp(pattern.source, 'y'); // sticky flag
        regex.lastIndex = this.offset;
        const match = regex.exec(this.text);

        if (match) {
          // Handle mode transitions
          this.handleModeTransition(tokenType, match[0]);

          // Create token
          const token = this.createToken(tokenType, match[0], this.offset);
          
          // Skip hidden tokens
          if (!this.isHiddenToken(tokenType)) {
            this.tokens.push(token);
          }

          // Advance position
          this.advance(match[0].length);

          // Handle multi-line constructs
          if (tokenType === RclCustomLexer.MULTI_LINE_EXPRESSION_START) {
            this.handleMultiLineExpression();
          } else if (this.isMultiLineStringMarker(tokenType)) {
            this.handleMultiLineString();
          }

          return true;
        }
      }
    }

    return false;
  }

  private isStartOfLine(): boolean {
    return this.offset === 0 || '\r\n'.includes(this.text[this.offset - 1]);
  }

  private handleIndentation(): boolean {
    const startOffset = this.offset;
    let indentLevel = 0;

    // Count spaces and tabs
    while (this.offset < this.text.length) {
      const char = this.text[this.offset];
      if (char === ' ') {
        indentLevel++;
        this.offset++;
      } else if (char === '\t') {
        indentLevel += 8; // Treat tab as 8 spaces
        this.offset++;
      } else {
        break;
      }
    }

    // If we hit a newline or comment, this is not significant indentation
    if (this.offset >= this.text.length || 
        this.text[this.offset] === '\n' || 
        this.text[this.offset] === '\r' || 
        this.text[this.offset] === '#') {
      return false;
    }

    const prevIndentLevel = this.indentationStack[this.indentationStack.length - 1];

    if (indentLevel > prevIndentLevel) {
      // Increased indentation - emit INDENT
      this.indentationStack.push(indentLevel);
      const token = this.createToken(RclCustomLexer.INDENT, '', startOffset);
      this.tokens.push(token);
      this.column += indentLevel;
      return true;
    } else if (indentLevel < prevIndentLevel) {
      // Decreased indentation - emit DEDENT(s)
      let dedendsEmitted = 0;
      while (this.indentationStack.length > 1 && 
             this.indentationStack[this.indentationStack.length - 1] > indentLevel) {
        this.indentationStack.pop();
        const token = this.createToken(RclCustomLexer.DEDENT, '', startOffset);
        this.tokens.push(token);
        dedendsEmitted++;
      }

      // Check for indentation error
      if (this.indentationStack[this.indentationStack.length - 1] !== indentLevel) {
        this.addError(`Invalid dedent level ${indentLevel} at line ${this.line}. Expected one of: ${this.indentationStack.join(', ')}`);
      }

      this.column += indentLevel;
      return dedendsEmitted > 0;
    } else {
      // Same indentation level - just consume the whitespace
      this.column += indentLevel;
      return false;
    }
  }

  private handleModeTransition(tokenType: TokenType, tokenImage: string): void {
    // Handle mode transitions for type tags
    if (tokenType === RclCustomLexer.LT) {
      this.pushMode('type_tag');
    } else if (tokenType === RclCustomLexer.GT && this.currentMode === 'type_tag') {
      this.popMode();
    }
  }

  private pushMode(mode: string): void {
    this.modeStack.push(this.currentMode);
    this.currentMode = mode;
  }

  private popMode(): void {
    if (this.modeStack.length > 0) {
      this.currentMode = this.modeStack.pop()!;
    }
  }

  private handleMultiLineExpression(): void {
    // Find the indentation level of the next line
    let nextLineOffset = this.offset;
    while (nextLineOffset < this.text.length && this.text[nextLineOffset] !== '\n') {
      nextLineOffset++;
    }
    if (nextLineOffset < this.text.length) {
      nextLineOffset++; // Skip the newline
    }

    const blockIndentLevel = this.getIndentationLevel(nextLineOffset);
    const content = this.extractIndentedBlock(nextLineOffset, blockIndentLevel);
    
    if (content) {
      // Create a token for the multi-line content
      const token = this.createToken(
        createToken({ name: 'MULTI_LINE_EXPRESSION_CONTENT', pattern: Lexer.NA }),
        content.text,
        content.startOffset
      );
      this.tokens.push(token);
      this.offset = content.endOffset;
      this.updatePosition(content.text);
    }
  }

  private handleMultiLineString(): void {
    // Similar to handleMultiLineExpression but for string content
    let nextLineOffset = this.offset;
    while (nextLineOffset < this.text.length && this.text[nextLineOffset] !== '\n') {
      nextLineOffset++;
    }
    if (nextLineOffset < this.text.length) {
      nextLineOffset++; // Skip the newline
    }

    const blockIndentLevel = this.getIndentationLevel(nextLineOffset);
    const content = this.extractIndentedBlock(nextLineOffset, blockIndentLevel);
    
    if (content) {
      // Create a token for the string content
      const token = this.createToken(
        createToken({ name: 'STRING_CONTENT', pattern: Lexer.NA }),
        content.text,
        content.startOffset
      );
      this.tokens.push(token);
      this.offset = content.endOffset;
      this.updatePosition(content.text);
    }
  }

  private getIndentationLevel(offset: number): number {
    let level = 0;
    while (offset < this.text.length) {
      const char = this.text[offset];
      if (char === ' ') {
        level++;
        offset++;
      } else if (char === '\t') {
        level += 8;
        offset++;
      } else {
        break;
      }
    }
    return level;
  }

  private extractIndentedBlock(startOffset: number, minIndentLevel: number): { text: string; startOffset: number; endOffset: number } | null {
    let currentOffset = startOffset;
    let blockText = '';
    let blockStartOffset = startOffset;

    while (currentOffset < this.text.length) {
      const lineStart = currentOffset;
      
      // Get indentation of current line
      const indentLevel = this.getIndentationLevel(currentOffset);
      currentOffset += indentLevel;

      // If we hit end of file or a line with less indentation, we're done
      if (currentOffset >= this.text.length || 
          (indentLevel < minIndentLevel && this.text[currentOffset] !== '\n' && this.text[currentOffset] !== '\r')) {
        break;
      }

      // Find end of line
      let lineEnd = currentOffset;
      while (lineEnd < this.text.length && this.text[lineEnd] !== '\n' && this.text[lineEnd] !== '\r') {
        lineEnd++;
      }

      // Include the line in the block
      blockText += this.text.substring(lineStart, lineEnd);
      
      // Include newline if present
      if (lineEnd < this.text.length && (this.text[lineEnd] === '\n' || this.text[lineEnd] === '\r')) {
        if (this.text[lineEnd] === '\r' && lineEnd + 1 < this.text.length && this.text[lineEnd + 1] === '\n') {
          blockText += '\r\n';
          currentOffset = lineEnd + 2;
        } else {
          blockText += this.text[lineEnd];
          currentOffset = lineEnd + 1;
        }
      } else {
        currentOffset = lineEnd;
      }
    }

    return blockText ? { text: blockText, startOffset: blockStartOffset, endOffset: currentOffset } : null;
  }

  private isMultiLineStringMarker(tokenType: TokenType): boolean {
    return tokenType === RclCustomLexer.MULTILINE_STR_CLEAN ||
           tokenType === RclCustomLexer.MULTILINE_STR_TRIM ||
           tokenType === RclCustomLexer.MULTILINE_STR_PRESERVE ||
           tokenType === RclCustomLexer.MULTILINE_STR_PRESERVE_ALL;
  }

  private isHiddenToken(tokenType: TokenType): boolean {
    return tokenType === RclCustomLexer.WS ||
           tokenType === RclCustomLexer.NL ||
           tokenType === RclCustomLexer.SL_COMMENT;
  }

  private createToken(tokenType: TokenType, image: string, offset: number): IToken {
    const endOffset = offset + image.length;
    const endLine = this.line;
    const endColumn = this.column + image.length;

    return {
      image,
      startOffset: offset,
      endOffset,
      startLine: this.line,
      endLine,
      startColumn: this.column,
      endColumn,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      tokenType
    };
  }

  private advance(length: number): void {
    for (let i = 0; i < length; i++) {
      if (this.text[this.offset] === '\n') {
        this.line++;
        this.column = 1;
      } else if (this.text[this.offset] === '\r') {
        // Handle \r\n and standalone \r
        if (this.offset + 1 < this.text.length && this.text[this.offset + 1] === '\n') {
          // \r\n - advance past both characters
          this.offset++;
          i++;
        }
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.offset++;
    }
  }

  private updatePosition(text: string): void {
    for (const char of text) {
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else if (char === '\r') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }
  }

  private flushRemainingDedents(): void {
    while (this.indentationStack.length > 1) {
      this.indentationStack.pop();
      const token = this.createToken(RclCustomLexer.DEDENT, '', this.offset);
      this.tokens.push(token);
    }
  }

  private addError(message: string): void {
    this.errors.push({
      message,
      offset: this.offset,
      length: 1,
      line: this.line,
      column: this.column
    });
  }

  /**
   * Get all token types for integration with Langium
   */
  static getAllTokens(): TokenType[] {
    return RclCustomLexer.allTokens;
  }

  /**
   * Create a multi-mode lexer definition for Chevrotain integration
   */
  static createMultiModeLexerDefinition(): IMultiModeLexerDefinition {
    const defaultModeTokens = RclCustomLexer.allTokens;
    
    // Type tag mode - prioritize type tag names over general identifiers
    const typeTagModeTokens = RclCustomLexer.allTokens.filter(token => 
      token !== RclCustomLexer.ATTRIBUTE_KEY || 
      [
        RclCustomLexer.EMAIL_TYPE,
        RclCustomLexer.PHONE_TYPE,
        RclCustomLexer.MSISDN_TYPE,
        RclCustomLexer.URL_TYPE,
        RclCustomLexer.TIME_TYPE,
        RclCustomLexer.T_TYPE,
        RclCustomLexer.DATETIME_TYPE,
        RclCustomLexer.DATE_TYPE,
        RclCustomLexer.DT_TYPE,
        RclCustomLexer.ZIPCODE_TYPE,
        RclCustomLexer.ZIP_TYPE,
        RclCustomLexer.DURATION_TYPE,
        RclCustomLexer.TTL_TYPE
      ].includes(token)
    );

    return {
      modes: {
        default: defaultModeTokens,
        type_tag: typeTagModeTokens
      },
      defaultMode: 'default'
    };
  }
} 