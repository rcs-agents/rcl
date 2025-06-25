export enum KW {
  // Section Types (from SECTION_TYPE terminal and MessageSectionType rule)
  Agent = 'agent',
  AgentConfig = 'agentConfig',
  AgentDefaults = 'agentDefaults',
  AgentMessage = 'agentMessage', // Section type
  Flow = 'flow',
  Messages = 'messages', // Section type
  Message = 'message',
  AuthenticationMessage = 'authentication message', 
  TransactionMessage = 'transaction message',
  PromotionMessage = 'promotion message',
  ServiceRequestMessage = 'servicerequest message',
  AcknowledgeMessage = 'acknowledge message',

  // Reserved Section Names
  Config = 'Config', // Reserved name, implies agentConfig
  Defaults = 'Defaults', // Reserved name, implies agentDefaults
  MessagesReserved = 'Messages', // Reserved name, implies messages section type

  // Boolean Literals (from TRUE_KW, FALSE_KW)
  True = 'True',
  On = 'On',
  Yes = 'Yes',
  Active = 'Active',
  Enabled = 'Enabled',
  False = 'False',
  Off = 'Off',
  No = 'No',
  Inactive = 'Inactive',
  Disabled = 'Disabled',

  // Null Literal
  Null = 'Null',

  // Import Statement Keywords
  Import = 'import',
  As = 'as',
  ApostropheS = "'s", // for "import X's Y"

  // Mapped Type Keywords
  ListOf = 'list of', // Not a single keyword, but a phrase. Included for completeness if used as such.
                      // More commonly 'list' and 'of' would be separate.
  List = 'list',
  Of = 'of',

  // Type Tag Names (from TYPE_TAG_NAME terminal)
  Date = 'date',
  Datetime = 'datetime',
  Time = 'time',
  Email = 'email',
  Phone = 'phone',
  MSISDN = 'msisdn',
  Url = 'url',
  Zipcode = 'zipcode',
  Zip = 'zip',

  // Expression Keywords
  IsNot = 'is not',
  Or = 'or',
  And = 'and',
  Is = 'is',
  Not = 'not',

  // Operators (can be represented as keywords if needed for logic, otherwise TK might be better)
  Eq = '==',
  Neq = '!=',
  Lt = '<',
  Lte = '<=',
  Gt = '>',
  Gte = '>=',
  Plus = '+',
  Minus = '-',
  Mul = '*',
  Div = '/',
  Mod = '%',

  // Embedded Code Markers
  JsPrefix = '$js>',
  TsPrefix = '$ts>',
  GenericPrefix = '$>',
  JsMultiLinePrefix = '$js>>>',
  TsMultiLinePrefix = '$ts>>>',
  GenericMultiLinePrefix = '$>>>',

  // Multi-line String Markers (from MULTILINE_STR_* terminals)
  TrimLeadOneNlEnd = '|',
  TrimLeadNoNlEnd = '|-',
  KeepLeadOneNlEnd = '+|',
  KeepAll = '+|+',

  // Flow Rule Arrow
  Arrow = '->',

  // Indented List Item Marker
  Dash = '-',

  // General Keywords from rcl-custom-token-builder
  Authentication = 'authentication', // Often part of "authentication message"
  ServiceRequest = 'servicerequest', // Often part of "servicerequest message"
  Transaction = 'transaction',       // Often part of "transaction message"
  Acknowledge = 'acknowledge',         // Often part of "acknowledge message"
  Promotion = 'promotion',             // Often part of "promotion message"

  // Flow Symbols (ATOMs)
  Start = ':start',
  End = ':end',
}

export enum TK {
  // Core Terminals from primitives.langium
  ATOM = 'ATOM',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  NL = 'NL', // Newline
  END = 'End', // Alias for NL in some contexts

  // Indentation Terminals
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  WS = 'WS', // Whitespace

  // Comment Terminals
  SL_COMMENT = 'SL_COMMENT', // Single-line comment

  // Punctuation & Operator Terminals
  LT = 'LT', // <
  GT = 'GT', // >
  SLASH = 'SLASH', // /
  COLON = 'COLON', // : (implicitly defined by usage like key:value)
  COMMA = 'COMMA', // , (implicitly defined)
  DOT = 'DOT',   // . (implicitly defined)
  LPAREN = 'LPAREN', // ( (implicitly defined)
  RPAREN = 'RPAREN', // ) (implicitly defined)
  LBRACE = 'LBRACE', // { (implicitly defined)
  RBRACE = 'RBRACE', // } (implicitly defined)
  PERCENT = 'PERCENT', // % (for ExplicitMap key)
  PIPE = 'PIPE',     // | (for type conversion modifier or multiline string)
  DASH = 'DASH',   // - (for list items or unary minus)

  // Keyword Terminals
  TRUE_KW = 'TRUE_KW',
  FALSE_KW = 'FALSE_KW',

  // Identifier Terminals
  PROPER_WORD = 'PROPER_WORD', // For ProperNoun
  COMMON_NOUN = 'COMMON_NOUN', // For common_noun identifiers/keys

  // Type System Terminals
  TYPE_TAG_NAME = 'TYPE_TAG_NAME', // Terminal for date, time, etc.
  TYPE_TAG_VALUE_CONTENT = 'TYPE_TAG_VALUE_CONTENT',
  TYPE_TAG_MODIFIER_CONTENT = 'TYPE_TAG_MODIFIER_CONTENT',

  // Expression Terminals
  IS_NOT = 'IS_NOT', // Terminal for "is not"

  // Embedded Code Terminals
  SINGLE_LINE_EMBEDDED_CODE_BLOCK = 'SINGLE_LINE_EMBEDDED_CODE_BLOCK',
  MULTI_LINE_EMBEDDED_CODE_BLOCK_START = 'MULTI_LINE_EMBEDDED_CODE_BLOCK_START',

  // Multi-line String Terminals
  MULTILINE_STR_TRIM_LEAD_ONE_NL_END = 'MULTILINE_STR_TRIM_LEAD_ONE_NL_END',
  MULTILINE_STR_TRIM_LEAD_NO_NL_END = 'MULTILINE_STR_TRIM_LEAD_NO_NL_END',
  MULTILINE_STR_KEEP_LEAD_ONE_NL_END = 'MULTILINE_STR_KEEP_LEAD_ONE_NL_END',
  MULTILINE_STR_KEEP_ALL = 'MULTILINE_STR_KEEP_ALL',

  // Section-related Terminals (as defined in sections.langium)
  SECTION_TYPE = 'SECTION_TYPE', // Terminal for agent, agentConfig, etc.
  MessageSectionType = 'MessageSectionType', // Terminal for 'authentication message', etc.
                                           // Note: Langium might generate a token name like MessageSectionTypeKeyword or similar.
                                           // The exact name depends on how it's used and if it's a direct terminal.
                                           // For now, using the rule name as a placeholder.
  ReservedSectionName = 'ReservedSectionName', // For 'Config', 'Defaults', 'Messages'
  SectionName = 'SectionName', // For ProperNoun as section name
  AttributeKey = 'AttributeKey', // Typically COMMON_NOUN
  EmptyLine = 'EmptyLine',

  // Prefix Terminals (if explicitly defined or needed)
  AGENT_CONFIG_PREFIX = 'AGENT_CONFIG_PREFIX',
  AGENT_DEFAULTS_TYPE = 'AGENT_DEFAULTS_TYPE', // Note: Name seems to imply type not prefix
  AGENT_MESSAGES_TYPE = 'AGENT_MESSAGES_TYPE', // Note: Name seems to imply type not prefix

  // Placeholder for other implicitly used tokens by Langium based on grammar rules
  // e.g., for specific keywords not defined as terminals but used directly in rules.
  // Langium generates token types for these, often like 'KeywordToken_keyword_value'.
  // We'll add them as identified.
  Keyword = 'Keyword', // Generic keyword type
  Identifier = 'Identifier', // Generic identifier type
}

export const KwGroups = {
  MessageSection: [KW.Message, KW.AuthenticationMessage, KW.TransactionMessage, KW.PromotionMessage, KW.ServiceRequestMessage, KW.AcknowledgeMessage],
  AgentSubsection: [KW.AgentConfig, KW.AgentDefaults, KW.Flow, KW.Messages],
  ReservedSectionName: [KW.Config, KW.Defaults, KW.MessagesReserved],
  BooleanTrue: [KW.True, KW.On, KW.Yes, KW.Active, KW.Enabled],
  BooleanFalse: [KW.False, KW.Off, KW.No, KW.Inactive, KW.Disabled],
  TypeTag: [KW.Date, KW.Datetime, KW.Time, KW.Email, KW.Phone, KW.MSISDN, KW.Url, KW.Zipcode, KW.Zip],
  Indentation: [TK.INDENT, TK.DEDENT],
  Section: [] as KW[],
  Boolean: [] as KW[],
};

KwGroups.Section.push(
  ...KwGroups.AgentSubsection,
  ...KwGroups.MessageSection,
);

KwGroups.Boolean.push(
  ...KwGroups.BooleanTrue,
  ...KwGroups.BooleanFalse,
);