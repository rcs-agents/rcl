import type { IToken, TokenType, ILexingError, IMultiModeLexerDefinition } from 'chevrotain';
import { createToken, Lexer } from 'chevrotain';
import * as T from './lexer/tokens/token-definitions.js';

/**
 * Enhanced RCL Custom Lexer
 * 
 * Handles indentation-sensitive parsing with space-separated identifiers,
 * embedded expressions, type tags, and multi-mode lexing for the Rich Communication Language.
 * 
 * Key Features:
 * - Indentation-aware tokenization (INDENT/DEDENT)
 * - Multi-mode lexing for resolving token conflicts
 * - Embedded expressions (single-line and multi-line)
 * - Multi-line strings with chomping markers
 * - Proper keyword vs identifier precedence
 * - Space-separated identifiers (Title Case)
 * - Comprehensive error handling and recovery
 */
export class RclLexer {
  private indentationStack: number[] = [0];
  private currentMode: string = 'default';
  private modeStack: string[] = [];
  private tokens: IToken[] = [];
  private errors: ILexingError[] = [];
  private text: string = '';
  private offset: number = 0;
  private line: number = 1;
  private column: number = 1;
  private inMultiLineBlock: boolean = false;
  private multiLineBlockType: string | null = null;
  private multiLineBlockIndent: number = 0;

  // Synthetic tokens for indentation
  static readonly INDENT = createToken({ name: 'INDENT', pattern: Lexer.NA });
  static readonly DEDENT = createToken({ name: 'DEDENT', pattern: Lexer.NA });
  
  // Whitespace and comments (not hidden for indentation sensitivity)
  static readonly WS = createToken({ 
    name: 'WS', 
    pattern: /[ \t]+/, 
    group: 'whitespace' 
  });
  static readonly NL = createToken({ 
    name: 'NL', 
    pattern: /\r?\n/, 
    group: 'whitespace' 
  });
  static readonly SL_COMMENT = createToken({ 
    name: 'SL_COMMENT', 
    pattern: /#[^\r\n]*/ 
  });

  // Import and module keywords
  static readonly IMPORT_KW = createToken({ name: 'import', pattern: /import\b/ });
  static readonly AS_KW = createToken({ name: 'as', pattern: /as\b/ });
  static readonly FROM_KW = createToken({ name: 'from', pattern: /from\b/ });

  // Section type keywords
  static readonly AGENT_KW = createToken({ name: 'agent', pattern: /agent\b/ });
  static readonly AGENT_DEFAULTS_KW = createToken({ name: 'agentDefaults', pattern: /agentDefaults\b/ });
  static readonly AGENT_CONFIG_KW = createToken({ name: 'agentConfig', pattern: /agentConfig\b/ });
  static readonly FLOW_KW = createToken({ name: 'flow', pattern: /flow\b/ });
  static readonly FLOWS_KW = createToken({ name: 'flows', pattern: /flows\b/ });
  static readonly MESSAGES_KW = createToken({ name: 'messages', pattern: /messages\b/ });

  // Message keywords
  static readonly AGENT_MESSAGE_KW = createToken({ name: 'agentMessage', pattern: /agentMessage\b/ });
  static readonly CONTENT_MESSAGE_KW = createToken({ name: 'contentMessage', pattern: /contentMessage\b/ });
  static readonly SUGGESTION_KW = createToken({ name: 'suggestion', pattern: /suggestion\b/ });

  // Message type keywords
  static readonly TEXT_KW = createToken({ name: 'text', pattern: /text\b/ });
  static readonly RICH_CARD_KW = createToken({ name: 'richCard', pattern: /richCard\b/ });
  static readonly CAROUSEL_KW = createToken({ name: 'carousel', pattern: /carousel\b/ });
  static readonly RBM_FILE_KW = createToken({ name: 'rbmFile', pattern: /rbmFile\b/ });
  static readonly FILE_KW = createToken({ name: 'file', pattern: /file\b/ });

  // Action keywords
  static readonly REPLY_KW = createToken({ name: 'reply', pattern: /reply\b/ });
  static readonly ACTION_KW = createToken({ name: 'action', pattern: /action\b/ });
  static readonly DIAL_KW = createToken({ name: 'dial', pattern: /dial\b/ });
  static readonly DIAL_ACTION_KW = createToken({ name: 'dialAction', pattern: /dialAction\b/ });
  static readonly OPEN_URL_KW = createToken({ name: 'openUrl', pattern: /openUrl\b/ });
  static readonly OPEN_URL_ACTION_KW = createToken({ name: 'openUrlAction', pattern: /openUrlAction\b/ });
  static readonly SHARE_LOCATION_KW = createToken({ name: 'shareLocation', pattern: /shareLocation\b/ });
  static readonly SHARE_LOCATION_ACTION_KW = createToken({ name: 'shareLocationAction', pattern: /shareLocationAction\b/ });
  static readonly VIEW_LOCATION_KW = createToken({ name: 'viewLocation', pattern: /viewLocation\b/ });
  static readonly VIEW_LOCATION_ACTION_KW = createToken({ name: 'viewLocationAction', pattern: /viewLocationAction\b/ });
  static readonly SAVE_EVENT_KW = createToken({ name: 'saveEvent', pattern: /saveEvent\b/ });
  static readonly CREATE_CALENDAR_EVENT_ACTION_KW = createToken({ name: 'createCalendarEventAction', pattern: /createCalendarEventAction\b/ });
  static readonly COMPOSE_ACTION_KW = createToken({ name: 'composeAction', pattern: /composeAction\b/ });

  // Flow keywords
  static readonly START_KW = createToken({ name: 'start', pattern: /start\b/ });
  static readonly WITH_KW = createToken({ name: 'with', pattern: /with\b/ });
  static readonly WHEN_KW = createToken({ name: 'when', pattern: /when\b/ });
  static readonly IF_KW = createToken({ name: 'if', pattern: /if\b/ });
  static readonly THEN_KW = createToken({ name: 'then', pattern: /then\b/ });
  static readonly ELSE_KW = createToken({ name: 'else', pattern: /else\b/ });
  static readonly UNLESS_KW = createToken({ name: 'unless', pattern: /unless\b/ });
  static readonly AND_KW = createToken({ name: 'and', pattern: /and\b/ });
  static readonly OR_KW = createToken({ name: 'or', pattern: /or\b/ });
  static readonly NOT_KW = createToken({ name: 'not', pattern: /not\b/ });
  static readonly IS_KW = createToken({ name: 'is', pattern: /is\b/ });
  static readonly DO_KW = createToken({ name: 'do', pattern: /do\b/ });
  static readonly END_KW = createToken({ name: 'end', pattern: /end\b/ });

  // Collection keywords
  static readonly LIST_KW = createToken({ name: 'list', pattern: /list\b/ });
  static readonly OF_KW = createToken({ name: 'of', pattern: /of\b/ });

  // Message traffic type keywords (only the ones specified in the formal spec)
  static readonly TRANSACTIONAL_KW = createToken({ name: 'transactional', pattern: /transactional\b/ });
  static readonly PROMOTIONAL_KW = createToken({ name: 'promotional', pattern: /promotional\b/ });

  // Boolean keywords (only the ones specified in the formal spec)
  static readonly TRUE_KW = createToken({ name: 'True', pattern: /True\b/ });
  static readonly YES_KW = createToken({ name: 'Yes', pattern: /Yes\b/ });
  static readonly ON_KW = createToken({ name: 'On', pattern: /On\b/ });
  static readonly ENABLED_KW = createToken({ name: 'Enabled', pattern: /Enabled\b/ });
  static readonly ACTIVE_KW = createToken({ name: 'Active', pattern: /Active\b/ });
  static readonly FALSE_KW = createToken({ name: 'False', pattern: /False\b/ });
  static readonly NO_KW = createToken({ name: 'No', pattern: /No\b/ });
  static readonly OFF_KW = createToken({ name: 'Off', pattern: /Off\b/ });
  static readonly DISABLED_KW = createToken({ name: 'Disabled', pattern: /Disabled\b/ });
  static readonly INACTIVE_KW = createToken({ name: 'Inactive', pattern: /Inactive\b/ });

  // Null keywords (both capitalized per spec and lowercase for usability)
  static readonly NULL_KW = createToken({ name: 'Null', pattern: /Null\b/ });
  static readonly NULL_LOWERCASE_KW = createToken({ name: 'null', pattern: /null\b/ });
  static readonly NONE_KW = createToken({ name: 'None', pattern: /None\b/ });
  static readonly VOID_KW = createToken({ name: 'Void', pattern: /Void\b/ });

  // Reserved names
  static readonly DEFAULTS_KW = createToken({ name: 'Defaults', pattern: /Defaults\b/ });
  static readonly CONFIG_KW = createToken({ name: 'Config', pattern: /Config\b/ });
  static readonly MESSAGES_RESERVED_KW = createToken({ name: 'Messages', pattern: /Messages\b/ });

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

  // Identifiers (after keywords to avoid conflicts) - Must start with uppercase per formal spec
  static readonly IDENTIFIER = createToken({ 
    name: 'IDENTIFIER', 
    pattern: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*\b/,  // Must start with uppercase letter, allow hyphens and underscores
    line_breaks: false
  });
  static readonly ATTRIBUTE_KEY = createToken({ 
    name: 'ATTRIBUTE_KEY', 
    pattern: /[a-z][a-zA-Z0-9_]*(?=\s*:)/  // Only match if followed by optional whitespace and colon
  });
  static readonly SECTION_TYPE = createToken({ 
    name: 'SECTION_TYPE', 
    pattern: /[a-z][a-zA-Z0-9_]*\b/
  });

  // Literals (ISO Duration before NUMBER to avoid conflicts)
  static readonly ISO_DURATION_LITERAL = createToken({
    name: 'ISO_DURATION_LITERAL',
    pattern: /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,
    line_breaks: false
  });
  static readonly STRING = createToken({ 
    name: 'STRING', 
    pattern: /"(\\.|[^"\\])*"/
  });
  static readonly NUMBER = createToken({ 
    name: 'NUMBER', 
    pattern: /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/
  });
  static readonly ATOM = createToken({ 
    name: 'ATOM', 
    pattern: /:([_a-zA-Z][\w_]*|"[^"\\]*")/
  });

  // Embedded expressions (fixed to match formal spec exactly)
  static readonly MULTI_LINE_EXPRESSION_START = createToken({
    name: 'MULTI_LINE_EXPRESSION_START',
    pattern: /\$((js|ts)?)>>>\s*\{[\s\S]*?\}/
  });
  
  static readonly EMBEDDED_CODE = createToken({
    name: 'EMBEDDED_CODE',
    pattern: /\$((js|ts)?>)\s*[^\r\n]*/
  });

  // Multi-line string markers (fixed to match formal spec exactly)
  static readonly MULTILINE_STR_PRESERVE_ALL = createToken({
    name: 'MULTILINE_STR_PRESERVE_ALL',
    pattern: /\+\|\+(?=\s*(?:\r?\n|$))/
  });
  static readonly MULTILINE_STR_PRESERVE = createToken({
    name: 'MULTILINE_STR_PRESERVE',
    pattern: /\+\|(?=\s*(?:\r?\n|$))/
  });
  static readonly MULTILINE_STR_TRIM = createToken({
    name: 'MULTILINE_STR_TRIM',
    pattern: /\|-(?=\s*(?:\r?\n|$))/
  });
  static readonly MULTILINE_STR_CLEAN = createToken({
    name: 'MULTILINE_STR_CLEAN',
    pattern: /\|(?=\s*(?:\r?\n|$))/
  });
  static readonly STRING_CONTENT = createToken({
    name: 'STRING_CONTENT',
    pattern: Lexer.NA
  });

  // Punctuation (longer patterns first)
  static readonly ARROW = createToken({ name: 'ARROW', pattern: /->/ });
  static readonly APOSTROPHE_S = createToken({ name: 'APOSTROPHE_S', pattern: /'s/ });
  static readonly PIPE = createToken({ name: 'PIPE', pattern: /\|/ });
  static readonly COLON = createToken({ name: 'COLON', pattern: /:/ });
  static readonly COMMA = createToken({ name: 'COMMA', pattern: /,/ });
  static readonly DOT = createToken({ name: 'DOT', pattern: /\./ });
  static readonly SLASH = createToken({ name: 'SLASH', pattern: /\// });
  static readonly HYPHEN = createToken({ name: 'HYPHEN', pattern: /-/ });
  static readonly DOLLAR = createToken({ name: 'DOLLAR', pattern: /\$/ });
  static readonly PERCENT = createToken({ name: 'PERCENT', pattern: /%/ });
  static readonly AT = createToken({ name: 'AT', pattern: /@/ });
  static readonly CARET = createToken({ name: 'CARET', pattern: /\^/ });

  // Brackets and braces
  static readonly LPAREN = createToken({ name: 'LPAREN', pattern: /\(/ });
  static readonly RPAREN = createToken({ name: 'RPAREN', pattern: /\)/ });
  static readonly LBRACE = createToken({ name: 'LBRACE', pattern: /\{/ });
  static readonly RBRACE = createToken({ name: 'RBRACE', pattern: /\}/ });
  static readonly LBRACKET = createToken({ name: 'LBRACKET', pattern: /\[/ });
  static readonly RBRACKET = createToken({ name: 'RBRACKET', pattern: /\]/ });
  static readonly LT = createToken({ name: 'LT', pattern: /</ });
  static readonly GT = createToken({ name: 'GT', pattern: />/ });

  // Type tag value content (for inside <type value> constructs)
  static readonly TYPE_TAG_VALUE_CONTENT = createToken({
    name: 'TYPE_TAG_VALUE_CONTENT',
    pattern: Lexer.NA
  });
  static readonly TYPE_TAG_MODIFIER_CONTENT = createToken({
    name: 'TYPE_TAG_MODIFIER_CONTENT',
    pattern: Lexer.NA
  });

  // All tokens in order (most specific first)
  private static readonly allTokens = T.allTokens;

  /**
   * Tokenize the input text and return tokens with errors
   */
  tokenize(text: string): { tokens: IToken[]; errors: ILexingError[]; hidden: IToken[] } {
    this.reset();
    this.text = text;

    while (this.offset < this.text.length) {
      try {
        const matched = this.tryMatchToken();
        if (!matched) {
          this.handleUnexpectedCharacter();
        }
      } catch (error) {
        this.addError(`Internal lexer error: ${error instanceof Error ? error.message : String(error)}`);
        this.advance(1); // Skip problematic character and continue
      }
    }

    // Add remaining dedents at end of file
    this.flushRemainingDedents();

    // Separate hidden tokens from visible tokens
    const hiddenTokens = this.tokens.filter(token => this.isHiddenToken(token.tokenType));
    const visibleTokens = this.tokens.filter(token => !this.isHiddenToken(token.tokenType));

    return {
      tokens: visibleTokens,
      errors: this.errors,
      hidden: hiddenTokens
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
    this.inMultiLineBlock = false;
    this.multiLineBlockType = null;
    this.multiLineBlockIndent = 0;
  }

  private tryMatchToken(): boolean {
    // Handle multi-line blocks first
    if (this.inMultiLineBlock) {
      return this.handleMultiLineBlockContent();
    }

    // Skip whitespace and handle indentation at start of line
    if (this.isStartOfLine()) {
      const handled = this.handleIndentation();
      if (handled) return true;
    }

    // Try to match each token type in order
    for (const tokenType of RclLexer.allTokens) {
      if (tokenType === T.INDENT || 
          tokenType === T.DEDENT ||
          tokenType === T.STRING_CONTENT ||
          tokenType === T.TYPE_TAG_VALUE_CONTENT ||
          tokenType === T.TYPE_TAG_MODIFIER_CONTENT) {
        continue; // These are handled by special logic
      }

      if (this.tryMatchTokenType(tokenType)) {
        return true;
      }
    }

    return false;
  }

  private tryMatchTokenType(tokenType: TokenType): boolean {
    const pattern = tokenType.PATTERN;
    if (!(pattern instanceof RegExp)) return false;

    // Create sticky regex for current position
    const regex = new RegExp(pattern.source, 'y');
    regex.lastIndex = this.offset;
    const match = regex.exec(this.text);

    if (!match) {
      // Special handling for unterminated strings
      if (tokenType === T.STRING && this.text[this.offset] === '"') {
        return this.handleUnterminatedString();
      }
      return false;
    }

    // Handle mode transitions
    this.handleModeTransition(tokenType, match[0]);

    // Create token
    const token = this.createToken(tokenType, match[0], this.offset);
    
    // Collect all tokens (we'll separate hidden/visible at the end)
    this.tokens.push(token);

    // Advance position
    this.advance(match[0].length);

    // Handle special multi-line constructs
    if (this.isMultiLineStringMarker(tokenType)) {
      this.startMultiLineBlock('string');
    }

    return true;
  }

  private handleUnterminatedString(): boolean {
    let endOffset = this.offset + 1; // Skip opening quote
    
    // Find end of line or file
    while (endOffset < this.text.length && 
           this.text[endOffset] !== '\n' && 
           this.text[endOffset] !== '\r') {
      endOffset++;
    }
    
    const content = this.text.slice(this.offset, endOffset);
    this.addError(`Unterminated string literal: ${content}`);
    
    // Create a token for the partial string to help with recovery
    const token = this.createToken(T.STRING, content + '"', this.offset);
    this.tokens.push(token);
    
    this.advance(endOffset - this.offset);
    return true;
  }

  private isStartOfLine(): boolean {
    return this.offset === 0 || this.text[this.offset - 1] === '\n';
  }

  private handleIndentation(): boolean {
    const startOffset = this.offset;
    let indentLevel = 0;
    let hasContent = false;

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
        hasContent = true;
        break;
      }
    }

    // If we hit a newline, comment, or end of file, this is not significant indentation
    if (!hasContent || 
        this.offset >= this.text.length || 
        this.text[this.offset] === '\n' || 
        this.text[this.offset] === '\r' || 
        this.text[this.offset] === '#') {
      // Reset offset to before we consumed the whitespace since it wasn't significant
      this.offset = startOffset;
      return false;
    }

    const prevIndentLevel = this.indentationStack[this.indentationStack.length - 1];

    if (indentLevel > prevIndentLevel) {
      // Increased indentation - emit INDENT
      this.indentationStack.push(indentLevel);
      const token = this.createToken(T.INDENT, '', startOffset);
      this.tokens.push(token);
      this.column += indentLevel;
      return true;
    } else if (indentLevel < prevIndentLevel) {
      // Decreased indentation - emit DEDENT(s)
      let dedendsEmitted = 0;
      while (this.indentationStack.length > 1 && 
             this.indentationStack[this.indentationStack.length - 1] > indentLevel) {
        this.indentationStack.pop();
        const token = this.createToken(T.DEDENT, '', startOffset);
        this.tokens.push(token);
        dedendsEmitted++;
      }

      // Check for indentation error (be tolerant of mixed indentation)
      const hasReasonableMatch = this.indentationStack.some(level => Math.abs(level - indentLevel) <= 4);
      if (!hasReasonableMatch) {
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
    if (tokenType === T.LT) {
      this.pushMode('type_tag');
    } else if (tokenType === T.GT && this.currentMode === 'type_tag') {
      this.popMode();
    } else if (tokenType === T.PIPE && this.currentMode === 'type_tag') {
      this.pushMode('type_tag_modifier');
    }
  }

  private pushMode(mode: string): void {
    this.modeStack.push(this.currentMode);
    this.currentMode = mode;
  }

  private popMode(): void {
    if (this.modeStack.length > 0) {
      this.currentMode = this.modeStack.pop()!;
    } else {
      this.currentMode = 'default';
    }
  }

  private startMultiLineBlock(type: 'expression' | 'string'): void {
    this.inMultiLineBlock = true;
    this.multiLineBlockType = type;
    
    // Find the indentation level of the next line
    let nextLineOffset = this.offset;
    while (nextLineOffset < this.text.length && this.text[nextLineOffset] !== '\n') {
      nextLineOffset++;
    }
    if (nextLineOffset < this.text.length) {
      nextLineOffset++; // Skip the newline
    }

    this.multiLineBlockIndent = this.getIndentationLevel(nextLineOffset);
  }

  private handleMultiLineBlockContent(): boolean {
    const content = this.extractIndentedBlock(this.offset, this.multiLineBlockIndent);
    
    if (content) {
      // Create appropriate token for the content
      const tokenType = this.multiLineBlockType === 'expression' 
        ? T.MULTI_LINE_EXPRESSION_START
        : T.STRING_CONTENT;
      
      const token = this.createToken(tokenType, content.text, content.startOffset);
      this.tokens.push(token);
      
      this.offset = content.endOffset;
      this.updatePosition(content.text);
    }

    // Exit multi-line block mode
    this.inMultiLineBlock = false;
    this.multiLineBlockType = null;
    this.multiLineBlockIndent = 0;

    return content !== null;
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
    const blockStartOffset = startOffset;

    while (currentOffset < this.text.length) {
      const lineStart = currentOffset;
      
      // Get indentation of current line
      const indentLevel = this.getIndentationLevel(currentOffset);
      currentOffset += indentLevel;

      // If we hit end of file or a line with less indentation, we're done
      if (currentOffset >= this.text.length || 
          (indentLevel < minIndentLevel && 
           this.text[currentOffset] !== '\n' && 
           this.text[currentOffset] !== '\r' &&
           this.text[currentOffset] !== '#')) {
        break;
      }

      // Find end of line
      let lineEnd = currentOffset;
      while (lineEnd < this.text.length && 
             this.text[lineEnd] !== '\n' && 
             this.text[lineEnd] !== '\r') {
        lineEnd++;
      }

      // Include the line in the block
      blockText += this.text.substring(lineStart, lineEnd);
      
      // Include newline if present
      if (lineEnd < this.text.length && 
          (this.text[lineEnd] === '\n' || this.text[lineEnd] === '\r')) {
        if (this.text[lineEnd] === '\r' && 
            lineEnd + 1 < this.text.length && 
            this.text[lineEnd + 1] === '\n') {
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
    return tokenType === T.MULTILINE_STR_CLEAN ||
           tokenType === T.MULTILINE_STR_TRIM ||
           tokenType === T.MULTILINE_STR_PRESERVE ||
           tokenType === T.MULTILINE_STR_PRESERVE_ALL;
  }

  private isHiddenToken(tokenType: TokenType): boolean {
    // For indentation-sensitive parsing, we need whitespace tokens to be visible
    // But we still group them for potential filtering by consumers
    return false;
  }

  private createToken(tokenType: TokenType, image: string, offset: number): IToken {
    const endOffset = offset + image.length;
    const startLine = this.line;
    const startColumn = this.column;
    
    // Calculate end position
    let endLine = startLine;
    let endColumn = startColumn + image.length;
    
    for (const char of image) {
      if (char === '\n') {
        endLine++;
        endColumn = 1;
      } else if (char === '\r') {
        endLine++;
        endColumn = 1;
      }
    }

    return {
      image,
      startOffset: offset,
      endOffset,
      startLine,
      endLine,
      startColumn,
      endColumn,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      tokenType
    };
  }

  private advance(length: number): void {
    for (let i = 0; i < length; i++) {
      if (this.offset >= this.text.length) break;
      
      const char = this.text[this.offset];
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else if (char === '\r') {
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

  private handleUnexpectedCharacter(): void {
    const char = this.text[this.offset];
    this.addError(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    this.advance(1);
  }

  private flushRemainingDedents(): void {
    while (this.indentationStack.length > 1) {
      this.indentationStack.pop();
      const token = this.createToken(T.DEDENT, '', this.offset);
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
    return RclLexer.allTokens;
  }

  /**
   * Create a multi-mode lexer definition for Chevrotain integration
   */
  static createMultiModeLexerDefinition(): IMultiModeLexerDefinition {
    const defaultModeTokens = RclLexer.allTokens;
    
    // Type tag mode - prioritize type tag names over general identifiers
    const typeTagModeTokens = [...RclLexer.allTokens].sort((a, b) => {
      // Prioritize type tag names in type tag mode
      const aIsTypeTag = [
        T.EMAIL_TYPE, T.PHONE_TYPE, T.MSISDN_TYPE,
        T.URL_TYPE, T.TIME_TYPE, T.T_TYPE,
        T.DATETIME_TYPE, T.DATE_TYPE, T.DT_TYPE,
        T.ZIPCODE_TYPE, T.ZIP_TYPE, T.DURATION_TYPE,
        T.TTL_TYPE
      ].includes(a);
      
      const bIsTypeTag = [
        T.EMAIL_TYPE, T.PHONE_TYPE, T.MSISDN_TYPE,
        T.URL_TYPE, T.TIME_TYPE, T.T_TYPE,
        T.DATETIME_TYPE, T.DATE_TYPE, T.DT_TYPE,
        T.ZIPCODE_TYPE, T.ZIP_TYPE, T.DURATION_TYPE,
        T.TTL_TYPE
      ].includes(b);
      
      if (aIsTypeTag && !bIsTypeTag) return -1;
      if (!aIsTypeTag && bIsTypeTag) return 1;
      return 0;
    });

    return {
      modes: {
        default: defaultModeTokens,
        type_tag: typeTagModeTokens,
        type_tag_modifier: typeTagModeTokens
      },
      defaultMode: 'default'
    };
  }
}

/**
 * Token types for easy reference in parser
 */
export const RclToken = {
  // Structure tokens
  INDENT: T.INDENT,
  DEDENT: T.DEDENT,
  WS: T.WS,
  NL: T.NL,
  SL_COMMENT: T.SL_COMMENT,

  // Keywords - Import
  IMPORT_KW: T.IMPORT_KW,
  AS_KW: T.AS_KW,
  FROM_KW: T.FROM_KW,

  // Keywords - Sections
  AGENT_KW: T.AGENT_KW,
  AGENT_DEFAULTS_KW: T.AGENT_DEFAULTS_KW,
  AGENT_CONFIG_KW: T.AGENT_CONFIG_KW,
  FLOW_KW: T.FLOW_KW,
  FLOWS_KW: T.FLOWS_KW,
  MESSAGES_KW: T.MESSAGES_KW,

  // Keywords - Messages
  AGENT_MESSAGE_KW: T.AGENT_MESSAGE_KW,
  CONTENT_MESSAGE_KW: T.CONTENT_MESSAGE_KW,
  SUGGESTION_KW: T.SUGGESTION_KW,

  // Keywords - Shortcuts
  TEXT_KW: T.TEXT_KW,
  RICH_CARD_KW: T.RICH_CARD_KW,
  CAROUSEL_KW: T.CAROUSEL_KW,
  RBM_FILE_KW: T.RBM_FILE_KW,
  FILE_KW: T.FILE_KW,

  // Keywords - Actions
  REPLY_KW: T.REPLY_KW,
  ACTION_KW: T.ACTION_KW,
  DIAL_KW: T.DIAL_KW,
  DIAL_ACTION_KW: T.DIAL_ACTION_KW,
  OPEN_URL_KW: T.OPEN_URL_KW,
  OPEN_URL_ACTION_KW: T.OPEN_URL_ACTION_KW,
  SHARE_LOCATION_KW: T.SHARE_LOCATION_KW,
  SHARE_LOCATION_ACTION_KW: T.SHARE_LOCATION_ACTION_KW,
  VIEW_LOCATION_KW: T.VIEW_LOCATION_KW,
  VIEW_LOCATION_ACTION_KW: T.VIEW_LOCATION_ACTION_KW,
  SAVE_EVENT_KW: T.SAVE_EVENT_KW,
  CREATE_CALENDAR_EVENT_ACTION_KW: T.CREATE_CALENDAR_EVENT_ACTION_KW,
  COMPOSE_ACTION_KW: T.COMPOSE_ACTION_KW,

  // Keywords - Flow control
  START_KW: T.START_KW,
  WITH_KW: T.WITH_KW,
  WHEN_KW: T.WHEN_KW,
  IF_KW: T.IF_KW,
  THEN_KW: T.THEN_KW,
  ELSE_KW: T.ELSE_KW,
  UNLESS_KW: T.UNLESS_KW,
  AND_KW: T.AND_KW,
  OR_KW: T.OR_KW,
  NOT_KW: T.NOT_KW,
  IS_KW: T.IS_KW,
  DO_KW: T.DO_KW,
  END_KW: T.END_KW,

  // Keywords - Collections
  LIST_KW: T.LIST_KW,
  OF_KW: T.OF_KW,

  // Keywords - Message types
  TRANSACTIONAL_KW: T.TRANSACTIONAL_KW,
  PROMOTIONAL_KW: T.PROMOTIONAL_KW,

  // Boolean literals
  TRUE_KW: T.TRUE_KW,
  YES_KW: T.YES_KW,
  ON_KW: T.ON_KW,
  ENABLED_KW: T.ENABLED_KW,
  ACTIVE_KW: T.ACTIVE_KW,
  FALSE_KW: T.FALSE_KW,
  NO_KW: T.NO_KW,
  OFF_KW: T.OFF_KW,
  DISABLED_KW: T.DISABLED_KW,
  INACTIVE_KW: T.INACTIVE_KW,

  // Null literals
  NULL_KW: T.NULL_KW,
  NONE_KW: T.NONE_KW,
  VOID_KW: T.VOID_KW,

  // Special keywords
  DEFAULTS_KW: T.DEFAULTS_KW,
  CONFIG_KW: T.CONFIG_KW,
  MESSAGES_RESERVED_KW: T.MESSAGES_RESERVED_KW,

  // Type names
  EMAIL_TYPE: T.EMAIL_TYPE,
  PHONE_TYPE: T.PHONE_TYPE,
  MSISDN_TYPE: T.MSISDN_TYPE,
  URL_TYPE: T.URL_TYPE,
  TIME_TYPE: T.TIME_TYPE,
  T_TYPE: T.T_TYPE,
  DATETIME_TYPE: T.DATETIME_TYPE,
  DATE_TYPE: T.DATE_TYPE,
  DT_TYPE: T.DT_TYPE,
  ZIPCODE_TYPE: T.ZIPCODE_TYPE,
  ZIP_TYPE: T.ZIP_TYPE,
  DURATION_TYPE: T.DURATION_TYPE,
  TTL_TYPE: T.TTL_TYPE,

  // Identifiers and literals
  IDENTIFIER: T.IDENTIFIER,
  ATTRIBUTE_KEY: T.ATTRIBUTE_KEY,
  SECTION_TYPE: T.SECTION_TYPE,
  STRING: T.STRING,
  NUMBER: T.NUMBER,
  ATOM: T.ATOM,

  // Expressions
  MULTI_LINE_EXPRESSION_START: T.MULTI_LINE_EXPRESSION_START,
  EMBEDDED_CODE: T.EMBEDDED_CODE,

  // Multi-line strings
  MULTILINE_STR_PRESERVE_ALL: T.MULTILINE_STR_PRESERVE_ALL,
  MULTILINE_STR_PRESERVE: T.MULTILINE_STR_PRESERVE,
  MULTILINE_STR_TRIM: T.MULTILINE_STR_TRIM,
  MULTILINE_STR_CLEAN: T.MULTILINE_STR_CLEAN,
  STRING_CONTENT: T.STRING_CONTENT,

  // Punctuation
  ARROW: T.ARROW,
  APOSTROPHE_S: T.APOSTROPHE_S,
  PIPE: T.PIPE,
  COLON: T.COLON,
  COMMA: T.COMMA,
  DOT: T.DOT,
  SLASH: T.SLASH,
  HYPHEN: T.HYPHEN,
  DOLLAR: T.DOLLAR,
  PERCENT: T.PERCENT,
  AT: T.AT,
  CARET: T.CARET,

  // Brackets and braces
  LPAREN: T.LPAREN,
  RPAREN: T.RPAREN,
  LBRACE: T.LBRACE,
  RBRACE: T.RBRACE,
  LBRACKET: T.LBRACKET,
  RBRACKET: T.RBRACKET,
  LT: T.LT,
  GT: T.GT,

  // Literals
  ISO_DURATION_LITERAL: T.ISO_DURATION_LITERAL,
  TYPE_TAG_VALUE_CONTENT: T.TYPE_TAG_VALUE_CONTENT,
  TYPE_TAG_MODIFIER_CONTENT: T.TYPE_TAG_MODIFIER_CONTENT,
  
  // Convenience aliases
  TYPE_TAG_NAME: T.EMAIL_TYPE, // We'll use this for any type name
  PROPER_NOUN: T.IDENTIFIER, // We'll use identifier for proper nouns for now
  EMBEDDED_CODE_START: T.MULTI_LINE_EXPRESSION_START,
  CODE_BLOCK_START: T.MULTI_LINE_EXPRESSION_START,
  CODE_LINE: T.MULTI_LINE_EXPRESSION_START,
  EQUALS: T.COLON, // We'll use colon for equals for now
} as const; 