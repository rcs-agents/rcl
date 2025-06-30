import type { IToken, TokenType, ILexingError, IMultiModeLexerDefinition } from 'chevrotain';
import { createToken, Lexer } from 'chevrotain';

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
  static readonly IMPORT = createToken({ name: 'import', pattern: /import\b/ });
  static readonly AS = createToken({ name: 'as', pattern: /as\b/ });
  static readonly FROM = createToken({ name: 'from', pattern: /from\b/ });

  // Section type keywords
  static readonly AGENT_KW = createToken({ name: 'AGENT_KW', pattern: /agent\b/ });
  static readonly AGENT_DEFAULTS = createToken({ name: 'agentDefaults', pattern: /agentDefaults\b/ });
  static readonly AGENT_CONFIG = createToken({ name: 'agentConfig', pattern: /agentConfig\b/ });
  static readonly FLOW = createToken({ name: 'flow', pattern: /flow\b/ });
  static readonly FLOWS = createToken({ name: 'flows', pattern: /flows\b/ });
  static readonly MESSAGES = createToken({ name: 'messages', pattern: /messages\b/ });

  // Message keywords
  static readonly AGENT_MESSAGE = createToken({ name: 'agentMessage', pattern: /agentMessage\b/ });
  static readonly MESSAGE = createToken({ name: 'message', pattern: /message\b/ });
  static readonly CONTENT_MESSAGE = createToken({ name: 'contentMessage', pattern: /contentMessage\b/ });
  static readonly SUGGESTION = createToken({ name: 'suggestion', pattern: /suggestion\b/ });
  static readonly SUGGESTIONS = createToken({ name: 'suggestions', pattern: /suggestions\b/ });

  // Message type keywords
  static readonly TEXT = createToken({ name: 'text', pattern: /text\b/ });
  static readonly RICH_CARD = createToken({ name: 'richCard', pattern: /richCard\b/ });
  static readonly CAROUSEL = createToken({ name: 'carousel', pattern: /carousel\b/ });
  static readonly RBM_FILE = createToken({ name: 'rbmFile', pattern: /rbmFile\b/ });
  static readonly FILE = createToken({ name: 'file', pattern: /file\b/ });

  // Action keywords
  static readonly REPLY = createToken({ name: 'reply', pattern: /reply\b/ });
  static readonly ACTION = createToken({ name: 'action', pattern: /action\b/ });
  static readonly DIAL = createToken({ name: 'dial', pattern: /dial\b/ });
  static readonly DIAL_ACTION = createToken({ name: 'dialAction', pattern: /dialAction\b/ });
  static readonly OPEN_URL = createToken({ name: 'openUrl', pattern: /openUrl\b/ });
  static readonly OPEN_URL_ACTION = createToken({ name: 'openUrlAction', pattern: /openUrlAction\b/ });
  static readonly SHARE_LOCATION = createToken({ name: 'shareLocation', pattern: /shareLocation\b/ });
  static readonly SHARE_LOCATION_ACTION = createToken({ name: 'shareLocationAction', pattern: /shareLocationAction\b/ });
  static readonly VIEW_LOCATION = createToken({ name: 'viewLocation', pattern: /viewLocation\b/ });
  static readonly VIEW_LOCATION_ACTION = createToken({ name: 'viewLocationAction', pattern: /viewLocationAction\b/ });
  static readonly SAVE_EVENT = createToken({ name: 'saveEvent', pattern: /saveEvent\b/ });
  static readonly CREATE_CALENDAR_EVENT_ACTION = createToken({ name: 'createCalendarEventAction', pattern: /createCalendarEventAction\b/ });
  static readonly COMPOSE_ACTION = createToken({ name: 'composeAction', pattern: /composeAction\b/ });

  // Flow keywords
  static readonly START = createToken({ name: 'start', pattern: /start\b/ });
  static readonly WITH = createToken({ name: 'with', pattern: /with\b/ });
  static readonly WHEN = createToken({ name: 'when', pattern: /when\b/ });
  static readonly IF = createToken({ name: 'if', pattern: /if\b/ });
  static readonly THEN = createToken({ name: 'then', pattern: /then\b/ });
  static readonly ELSE = createToken({ name: 'else', pattern: /else\b/ });
  static readonly UNLESS = createToken({ name: 'unless', pattern: /unless\b/ });
  static readonly AND = createToken({ name: 'and', pattern: /and\b/ });
  static readonly OR = createToken({ name: 'or', pattern: /or\b/ });
  static readonly NOT = createToken({ name: 'not', pattern: /not\b/ });
  static readonly IS = createToken({ name: 'is', pattern: /is\b/ });
  static readonly DO = createToken({ name: 'do', pattern: /do\b/ });
  static readonly END = createToken({ name: 'end', pattern: /end\b/ });

  // Collection keywords
  static readonly LIST = createToken({ name: 'list', pattern: /list\b/ });
  static readonly OF = createToken({ name: 'of', pattern: /of\b/ });

  // Message traffic type keywords
  static readonly TRANSACTIONAL = createToken({ name: 'transactional', pattern: /transactional\b/ });
  static readonly PROMOTIONAL = createToken({ name: 'promotional', pattern: /promotional\b/ });
  static readonly TRANSACTION = createToken({ name: 'transaction', pattern: /transaction\b/ });
  static readonly PROMOTION = createToken({ name: 'promotion', pattern: /promotion\b/ });
  static readonly ACKNOWLEDGEMENT = createToken({ name: 'acknowledgement', pattern: /acknowledgement\b/ });

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
    pattern: /[A-Za-z]([A-Za-z0-9_-]|(\s(?=[A-Z0-9])))*\b/,
    line_breaks: false
  });
  static readonly ATTRIBUTE_KEY = createToken({ 
    name: 'ATTRIBUTE_KEY', 
    pattern: /[a-z][a-zA-Z0-9_]*(?=\s*:)/  // Only match if followed by optional whitespace and colon
  });
  static readonly SECTION_TYPE = createToken({ 
    name: 'SECTION_TYPE', 
    pattern: /[a-z][a-zA-Z0-9]*\b/
  });

  // Literals (ISO Duration before NUMBER to avoid conflicts)
  static readonly ISO_DURATION_LITERAL = createToken({
    name: 'ISO_DURATION_LITERAL',
    pattern: /P(?:(?:\d+Y)?(?:\d+M)?(?:\d+D)?)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?/,
    line_breaks: false
  });
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

  // Embedded expressions (multi-line before single-line to avoid conflicts)
  static readonly MULTI_LINE_EXPRESSION_START = createToken({
    name: 'MULTI_LINE_EXPRESSION_START',
    pattern: /\$((js|ts)?)>>>|\$\{\{/
  });
  static readonly SINGLE_LINE_EXPRESSION = createToken({
    name: 'SINGLE_LINE_EXPRESSION',
    pattern: /\$((js|ts)>)[^\r\n]*|\$\{[^}]*\}/
  });
  static readonly MULTI_LINE_EXPRESSION_CONTENT = createToken({
    name: 'MULTI_LINE_EXPRESSION_CONTENT',
    pattern: Lexer.NA
  });

  // Multi-line string markers (after PIPE to avoid conflicts)
  static readonly MULTILINE_STR_PRESERVE_ALL = createToken({
    name: 'MULTILINE_STR_PRESERVE_ALL',
    pattern: /\|\|\|/
  });
  static readonly MULTILINE_STR_PRESERVE = createToken({
    name: 'MULTILINE_STR_PRESERVE',
    pattern: /\|\+/
  });
  static readonly MULTILINE_STR_TRIM = createToken({
    name: 'MULTILINE_STR_TRIM',
    pattern: /\|-/
  });
  static readonly MULTILINE_STR_CLEAN = createToken({
    name: 'MULTILINE_STR_CLEAN',
    pattern: /\|(?=\s*[\r\n]|$)/  // Match | followed by optional whitespace and newline or end of input
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
  private static readonly allTokens = [
    // Synthetic tokens
    RclCustomLexer.INDENT,
    RclCustomLexer.DEDENT,
    
    // Whitespace and comments
    RclCustomLexer.WS,
    RclCustomLexer.NL,
    RclCustomLexer.SL_COMMENT,

    // Import keywords
    RclCustomLexer.IMPORT,
    RclCustomLexer.AS,
    RclCustomLexer.FROM,

    // Section keywords
    RclCustomLexer.AGENT_DEFAULTS,
    RclCustomLexer.AGENT_CONFIG,
    RclCustomLexer.AGENT_KW,
    RclCustomLexer.FLOWS,
    RclCustomLexer.FLOW,
    RclCustomLexer.MESSAGES,

    // Message keywords
    RclCustomLexer.AGENT_MESSAGE,
    RclCustomLexer.CONTENT_MESSAGE,
    RclCustomLexer.MESSAGE,
    RclCustomLexer.SUGGESTIONS,
    RclCustomLexer.SUGGESTION,

    // Message type keywords
    RclCustomLexer.RICH_CARD,
    RclCustomLexer.CAROUSEL,
    RclCustomLexer.RBM_FILE,
    RclCustomLexer.TEXT,
    RclCustomLexer.FILE,

    // Action keywords (longer ones first)
    RclCustomLexer.CREATE_CALENDAR_EVENT_ACTION,
    RclCustomLexer.SHARE_LOCATION_ACTION,
    RclCustomLexer.VIEW_LOCATION_ACTION,
    RclCustomLexer.OPEN_URL_ACTION,
    RclCustomLexer.DIAL_ACTION,
    RclCustomLexer.COMPOSE_ACTION,
    RclCustomLexer.SHARE_LOCATION,
    RclCustomLexer.VIEW_LOCATION,
    RclCustomLexer.SAVE_EVENT,
    RclCustomLexer.OPEN_URL,
    RclCustomLexer.ACTION,
    RclCustomLexer.REPLY,
    RclCustomLexer.DIAL,

    // Flow keywords
    RclCustomLexer.START,
    RclCustomLexer.WITH,
    RclCustomLexer.WHEN,
    RclCustomLexer.UNLESS,
    RclCustomLexer.THEN,
    RclCustomLexer.ELSE,
    RclCustomLexer.AND,
    RclCustomLexer.OR,
    RclCustomLexer.NOT,
    RclCustomLexer.IF,
    RclCustomLexer.IS,
    RclCustomLexer.DO,
    RclCustomLexer.END,

    // Collection keywords
    RclCustomLexer.LIST,
    RclCustomLexer.OF,

    // Message traffic type keywords
    RclCustomLexer.TRANSACTIONAL,
    RclCustomLexer.PROMOTIONAL,
    RclCustomLexer.TRANSACTION,
    RclCustomLexer.PROMOTION,
    RclCustomLexer.ACKNOWLEDGEMENT,

    // Boolean keywords
    RclCustomLexer.ENABLED,
    RclCustomLexer.DISABLED,
    RclCustomLexer.INACTIVE,
    RclCustomLexer.ACTIVE,
    RclCustomLexer.TRUE,
    RclCustomLexer.FALSE,
    RclCustomLexer.YES,
    RclCustomLexer.NO,
    RclCustomLexer.ON,
    RclCustomLexer.OFF,

    // Null keywords
    RclCustomLexer.NULL,
    RclCustomLexer.NONE,
    RclCustomLexer.VOID,

    // Reserved names
    RclCustomLexer.DEFAULTS,
    RclCustomLexer.CONFIG,
    RclCustomLexer.MESSAGES_RESERVED,

    // Type tag names
    RclCustomLexer.DATETIME_TYPE,
    RclCustomLexer.ZIPCODE_TYPE,
    RclCustomLexer.DURATION_TYPE,
    RclCustomLexer.EMAIL_TYPE,
    RclCustomLexer.PHONE_TYPE,
    RclCustomLexer.MSISDN_TYPE,
    RclCustomLexer.URL_TYPE,
    RclCustomLexer.TIME_TYPE,
    RclCustomLexer.DATE_TYPE,
    RclCustomLexer.ZIP_TYPE,
    RclCustomLexer.TTL_TYPE,
    RclCustomLexer.DT_TYPE,
    RclCustomLexer.T_TYPE,

    // Literals (specific patterns before general identifiers)
    RclCustomLexer.ISO_DURATION_LITERAL,
    RclCustomLexer.STRING,
    RclCustomLexer.NUMBER,
    RclCustomLexer.ATOM,

    // Identifiers (after keywords and literals)
    RclCustomLexer.IDENTIFIER,
    RclCustomLexer.ATTRIBUTE_KEY,
    RclCustomLexer.SECTION_TYPE,

    // Embedded expressions
    RclCustomLexer.MULTI_LINE_EXPRESSION_START,
    RclCustomLexer.SINGLE_LINE_EXPRESSION,
    RclCustomLexer.MULTI_LINE_EXPRESSION_CONTENT,

    // Multi-line string markers (specific before general)
    RclCustomLexer.MULTILINE_STR_PRESERVE_ALL,
    RclCustomLexer.MULTILINE_STR_PRESERVE,
    RclCustomLexer.MULTILINE_STR_TRIM,
    RclCustomLexer.MULTILINE_STR_CLEAN,
    RclCustomLexer.STRING_CONTENT,

    // Type tag content
    RclCustomLexer.TYPE_TAG_VALUE_CONTENT,
    RclCustomLexer.TYPE_TAG_MODIFIER_CONTENT,

    // Punctuation (longer patterns first)
    RclCustomLexer.ARROW,
    RclCustomLexer.APOSTROPHE_S,
    RclCustomLexer.PIPE,
    RclCustomLexer.COLON,
    RclCustomLexer.COMMA,
    RclCustomLexer.DOT,
    RclCustomLexer.SLASH,
    RclCustomLexer.HYPHEN,
    RclCustomLexer.DOLLAR,
    RclCustomLexer.PERCENT,
    RclCustomLexer.AT,
    RclCustomLexer.CARET,

    // Brackets and braces
    RclCustomLexer.LPAREN,
    RclCustomLexer.RPAREN,
    RclCustomLexer.LBRACE,
    RclCustomLexer.RBRACE,
    RclCustomLexer.LBRACKET,
    RclCustomLexer.RBRACKET,
    RclCustomLexer.LT,
    RclCustomLexer.GT,
  ];

  /**
   * Tokenize the input text and return tokens with errors
   */
  tokenize(text: string): { tokens: IToken[]; errors: ILexingError[] } {
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
    for (const tokenType of RclCustomLexer.allTokens) {
      if (tokenType === RclCustomLexer.INDENT || 
          tokenType === RclCustomLexer.DEDENT ||
          tokenType === RclCustomLexer.MULTI_LINE_EXPRESSION_CONTENT ||
          tokenType === RclCustomLexer.STRING_CONTENT ||
          tokenType === RclCustomLexer.TYPE_TAG_VALUE_CONTENT ||
          tokenType === RclCustomLexer.TYPE_TAG_MODIFIER_CONTENT) {
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

    if (!match) return false;

    // Handle mode transitions
    this.handleModeTransition(tokenType, match[0]);

    // Create token
    const token = this.createToken(tokenType, match[0], this.offset);
    
    // Skip hidden tokens but track position
    if (!this.isHiddenToken(tokenType)) {
      this.tokens.push(token);
    }

    // Advance position
    this.advance(match[0].length);

    // Handle special multi-line constructs
    if (tokenType === RclCustomLexer.MULTI_LINE_EXPRESSION_START) {
      this.startMultiLineBlock('expression');
    } else if (this.isMultiLineStringMarker(tokenType)) {
      this.startMultiLineBlock('string');
    }

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

      // Check for indentation error (be tolerant of mixed indentation)
      const currentLevel = this.indentationStack[this.indentationStack.length - 1];
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
    if (tokenType === RclCustomLexer.LT) {
      this.pushMode('type_tag');
    } else if (tokenType === RclCustomLexer.GT && this.currentMode === 'type_tag') {
      this.popMode();
    } else if (tokenType === RclCustomLexer.PIPE && this.currentMode === 'type_tag') {
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
        ? RclCustomLexer.MULTI_LINE_EXPRESSION_CONTENT
        : RclCustomLexer.STRING_CONTENT;
      
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
    return tokenType === RclCustomLexer.MULTILINE_STR_CLEAN ||
           tokenType === RclCustomLexer.MULTILINE_STR_TRIM ||
           tokenType === RclCustomLexer.MULTILINE_STR_PRESERVE ||
           tokenType === RclCustomLexer.MULTILINE_STR_PRESERVE_ALL;
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
    const typeTagModeTokens = [...RclCustomLexer.allTokens].sort((a, b) => {
      // Prioritize type tag names in type tag mode
      const aIsTypeTag = [
        RclCustomLexer.EMAIL_TYPE, RclCustomLexer.PHONE_TYPE, RclCustomLexer.MSISDN_TYPE,
        RclCustomLexer.URL_TYPE, RclCustomLexer.TIME_TYPE, RclCustomLexer.T_TYPE,
        RclCustomLexer.DATETIME_TYPE, RclCustomLexer.DATE_TYPE, RclCustomLexer.DT_TYPE,
        RclCustomLexer.ZIPCODE_TYPE, RclCustomLexer.ZIP_TYPE, RclCustomLexer.DURATION_TYPE,
        RclCustomLexer.TTL_TYPE
      ].includes(a);
      
      const bIsTypeTag = [
        RclCustomLexer.EMAIL_TYPE, RclCustomLexer.PHONE_TYPE, RclCustomLexer.MSISDN_TYPE,
        RclCustomLexer.URL_TYPE, RclCustomLexer.TIME_TYPE, RclCustomLexer.T_TYPE,
        RclCustomLexer.DATETIME_TYPE, RclCustomLexer.DATE_TYPE, RclCustomLexer.DT_TYPE,
        RclCustomLexer.ZIPCODE_TYPE, RclCustomLexer.ZIP_TYPE, RclCustomLexer.DURATION_TYPE,
        RclCustomLexer.TTL_TYPE
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
  INDENT: RclCustomLexer.INDENT,
  DEDENT: RclCustomLexer.DEDENT,
  WS: RclCustomLexer.WS,
  NL: RclCustomLexer.NL,
  SL_COMMENT: RclCustomLexer.SL_COMMENT,

  // Keywords - Import
  IMPORT_KW: RclCustomLexer.IMPORT,
  AS_KW: RclCustomLexer.AS,
  FROM_KW: RclCustomLexer.FROM,

  // Keywords - Sections
  AGENT_KW: RclCustomLexer.AGENT_KW,
  AGENT_DEFAULTS_KW: RclCustomLexer.AGENT_DEFAULTS,
  AGENT_CONFIG_KW: RclCustomLexer.AGENT_CONFIG,
  FLOW_KW: RclCustomLexer.FLOW,
  FLOWS_KW: RclCustomLexer.FLOWS,
  MESSAGES_KW: RclCustomLexer.MESSAGES,

  // Keywords - Messages
  AGENT_MESSAGE_KW: RclCustomLexer.AGENT_MESSAGE,
  MESSAGE_KW: RclCustomLexer.MESSAGE,
  CONTENT_MESSAGE_KW: RclCustomLexer.CONTENT_MESSAGE,
  SUGGESTION_KW: RclCustomLexer.SUGGESTION,
  SUGGESTIONS_KW: RclCustomLexer.SUGGESTIONS,

  // Keywords - Shortcuts
  TEXT_KW: RclCustomLexer.TEXT,
  RICH_CARD_KW: RclCustomLexer.RICH_CARD,
  CAROUSEL_KW: RclCustomLexer.CAROUSEL,
  RBM_FILE_KW: RclCustomLexer.RBM_FILE,
  FILE_KW: RclCustomLexer.FILE,

  // Keywords - Actions
  REPLY_KW: RclCustomLexer.REPLY,
  ACTION_KW: RclCustomLexer.ACTION,
  DIAL_KW: RclCustomLexer.DIAL,
  DIAL_ACTION_KW: RclCustomLexer.DIAL_ACTION,
  OPEN_URL_KW: RclCustomLexer.OPEN_URL,
  OPEN_URL_ACTION_KW: RclCustomLexer.OPEN_URL_ACTION,
  SHARE_LOCATION_KW: RclCustomLexer.SHARE_LOCATION,
  SHARE_LOCATION_ACTION_KW: RclCustomLexer.SHARE_LOCATION_ACTION,
  VIEW_LOCATION_KW: RclCustomLexer.VIEW_LOCATION,
  VIEW_LOCATION_ACTION_KW: RclCustomLexer.VIEW_LOCATION_ACTION,
  SAVE_EVENT_KW: RclCustomLexer.SAVE_EVENT,
  CREATE_CALENDAR_EVENT_ACTION_KW: RclCustomLexer.CREATE_CALENDAR_EVENT_ACTION,
  COMPOSE_ACTION_KW: RclCustomLexer.COMPOSE_ACTION,

  // Keywords - Flow control
  START_KW: RclCustomLexer.START,
  WITH_KW: RclCustomLexer.WITH,
  WHEN_KW: RclCustomLexer.WHEN,
  IF_KW: RclCustomLexer.IF,
  THEN_KW: RclCustomLexer.THEN,
  ELSE_KW: RclCustomLexer.ELSE,
  UNLESS_KW: RclCustomLexer.UNLESS,
  AND_KW: RclCustomLexer.AND,
  OR_KW: RclCustomLexer.OR,
  NOT_KW: RclCustomLexer.NOT,
  IS_KW: RclCustomLexer.IS,
  DO_KW: RclCustomLexer.DO,
  END_KW: RclCustomLexer.END,

  // Keywords - Collections
  LIST_KW: RclCustomLexer.LIST,
  OF_KW: RclCustomLexer.OF,

  // Keywords - Message types
  TRANSACTIONAL_KW: RclCustomLexer.TRANSACTIONAL,
  PROMOTIONAL_KW: RclCustomLexer.PROMOTIONAL,
  TRANSACTION_KW: RclCustomLexer.TRANSACTION,
  PROMOTION_KW: RclCustomLexer.PROMOTION,
  ACKNOWLEDGEMENT_KW: RclCustomLexer.ACKNOWLEDGEMENT,

  // Boolean literals
  TRUE_KW: RclCustomLexer.TRUE,
  YES_KW: RclCustomLexer.YES,
  ON_KW: RclCustomLexer.ON,
  ENABLED_KW: RclCustomLexer.ENABLED,
  ACTIVE_KW: RclCustomLexer.ACTIVE,
  FALSE_KW: RclCustomLexer.FALSE,
  NO_KW: RclCustomLexer.NO,
  OFF_KW: RclCustomLexer.OFF,
  DISABLED_KW: RclCustomLexer.DISABLED,
  INACTIVE_KW: RclCustomLexer.INACTIVE,

  // Null literals
  NULL_KW: RclCustomLexer.NULL,
  NONE_KW: RclCustomLexer.NONE,
  VOID_KW: RclCustomLexer.VOID,

  // Special keywords
  DEFAULTS_KW: RclCustomLexer.DEFAULTS,
  CONFIG_KW: RclCustomLexer.CONFIG,
  MESSAGES_RESERVED_KW: RclCustomLexer.MESSAGES_RESERVED,

  // Type names
  EMAIL_TYPE: RclCustomLexer.EMAIL_TYPE,
  PHONE_TYPE: RclCustomLexer.PHONE_TYPE,
  MSISDN_TYPE: RclCustomLexer.MSISDN_TYPE,
  URL_TYPE: RclCustomLexer.URL_TYPE,
  TIME_TYPE: RclCustomLexer.TIME_TYPE,
  T_TYPE: RclCustomLexer.T_TYPE,
  DATETIME_TYPE: RclCustomLexer.DATETIME_TYPE,
  DATE_TYPE: RclCustomLexer.DATE_TYPE,
  DT_TYPE: RclCustomLexer.DT_TYPE,
  ZIPCODE_TYPE: RclCustomLexer.ZIPCODE_TYPE,
  ZIP_TYPE: RclCustomLexer.ZIP_TYPE,
  DURATION_TYPE: RclCustomLexer.DURATION_TYPE,
  TTL_TYPE: RclCustomLexer.TTL_TYPE,

  // Identifiers and literals
  IDENTIFIER: RclCustomLexer.IDENTIFIER,
  ATTRIBUTE_KEY: RclCustomLexer.ATTRIBUTE_KEY,
  SECTION_TYPE: RclCustomLexer.SECTION_TYPE,
  STRING: RclCustomLexer.STRING,
  NUMBER: RclCustomLexer.NUMBER,
  ATOM: RclCustomLexer.ATOM,

  // Expressions
  MULTI_LINE_EXPRESSION_START: RclCustomLexer.MULTI_LINE_EXPRESSION_START,
  SINGLE_LINE_EXPRESSION: RclCustomLexer.SINGLE_LINE_EXPRESSION,
  MULTI_LINE_EXPRESSION_CONTENT: RclCustomLexer.MULTI_LINE_EXPRESSION_CONTENT,

  // Multi-line strings
  MULTILINE_STR_PRESERVE_ALL: RclCustomLexer.MULTILINE_STR_PRESERVE_ALL,
  MULTILINE_STR_PRESERVE: RclCustomLexer.MULTILINE_STR_PRESERVE,
  MULTILINE_STR_TRIM: RclCustomLexer.MULTILINE_STR_TRIM,
  MULTILINE_STR_CLEAN: RclCustomLexer.MULTILINE_STR_CLEAN,
  STRING_CONTENT: RclCustomLexer.STRING_CONTENT,

  // Punctuation
  ARROW: RclCustomLexer.ARROW,
  APOSTROPHE_S: RclCustomLexer.APOSTROPHE_S,
  PIPE: RclCustomLexer.PIPE,
  COLON: RclCustomLexer.COLON,
  COMMA: RclCustomLexer.COMMA,
  DOT: RclCustomLexer.DOT,
  SLASH: RclCustomLexer.SLASH,
  HYPHEN: RclCustomLexer.HYPHEN,
  DOLLAR: RclCustomLexer.DOLLAR,
  PERCENT: RclCustomLexer.PERCENT,
  AT: RclCustomLexer.AT,
  CARET: RclCustomLexer.CARET,

  // Brackets and braces
  LPAREN: RclCustomLexer.LPAREN,
  RPAREN: RclCustomLexer.RPAREN,
  LBRACE: RclCustomLexer.LBRACE,
  RBRACE: RclCustomLexer.RBRACE,
  LBRACKET: RclCustomLexer.LBRACKET,
  RBRACKET: RclCustomLexer.RBRACKET,
  LT: RclCustomLexer.LT,
  GT: RclCustomLexer.GT,

  // Literals
  ISO_DURATION_LITERAL: RclCustomLexer.ISO_DURATION_LITERAL,
  TYPE_TAG_VALUE_CONTENT: RclCustomLexer.TYPE_TAG_VALUE_CONTENT,
  TYPE_TAG_MODIFIER_CONTENT: RclCustomLexer.TYPE_TAG_MODIFIER_CONTENT,
  
  // Convenience aliases
  TYPE_TAG_NAME: RclCustomLexer.EMAIL_TYPE, // We'll use this for any type name
  PROPER_NOUN: RclCustomLexer.IDENTIFIER, // We'll use identifier for proper nouns for now
  EMBEDDED_CODE_START: RclCustomLexer.MULTI_LINE_EXPRESSION_START,
  CODE_BLOCK_START: RclCustomLexer.MULTI_LINE_EXPRESSION_START,
  CODE_LINE: RclCustomLexer.MULTI_LINE_EXPRESSION_CONTENT,
  EQUALS: RclCustomLexer.COLON, // We'll use colon for equals for now
} as const; 