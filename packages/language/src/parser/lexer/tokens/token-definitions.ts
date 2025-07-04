import { createToken, Lexer } from 'chevrotain';

/**
 * Centralized Token Definitions for RCL
 *
 * This file contains all token definitions for the Rich Communication Language (RCL),
 * created using Chevrotain's `createToken` utility. These definitions are used by both
 * the custom `RclLexer` and the `RclTokenBuilder` to ensure consistency across the
 * language tooling.
 *
 * The tokens are organized by category for maintainability. The `allTokens` array
 * at the end defines the exact order for the lexer, which is critical for resolving
 * ambiguities (e.g., keywords before identifiers).
 */

// Synthetic tokens for indentation
export const INDENT = createToken({ name: 'INDENT', pattern: Lexer.NA });
export const DEDENT = createToken({ name: 'DEDENT', pattern: Lexer.NA });

// Whitespace and comments (not hidden for indentation sensitivity)
export const WS = createToken({
    name: 'WS',
    pattern: /[ \t]+/,
    group: 'whitespace'
});
export const NL = createToken({
    name: 'NL',
    pattern: /\r?\n/,
    group: 'whitespace'
});
export const SL_COMMENT = createToken({
    name: 'SL_COMMENT',
    pattern: /#[^\r\n]*/
});

// Import and module keywords
export const IMPORT_KW = createToken({ name: 'import', pattern: /import\b/ });
export const AS_KW = createToken({ name: 'as', pattern: /as\b/ });
export const FROM_KW = createToken({ name: 'from', pattern: /from\b/ });

// Section type keywords
export const AGENT_KW = createToken({ name: 'agent', pattern: /agent\b/ });
export const AGENT_DEFAULTS_KW = createToken({ name: 'agentDefaults', pattern: /agentDefaults\b/ });
export const AGENT_CONFIG_KW = createToken({ name: 'agentConfig', pattern: /agentConfig\b/ });
export const FLOW_KW = createToken({ name: 'flow', pattern: /flow\b/ });
export const FLOWS_KW = createToken({ name: 'flows', pattern: /flows\b/ });
export const MESSAGES_KW = createToken({ name: 'messages', pattern: /messages\b/ });

// Message keywords
export const AGENT_MESSAGE_KW = createToken({ name: 'agentMessage', pattern: /agentMessage\b/ });
export const CONTENT_MESSAGE_KW = createToken({ name: 'contentMessage', pattern: /contentMessage\b/ });
export const SUGGESTION_KW = createToken({ name: 'suggestion', pattern: /suggestion\b/ });

// Message type keywords
export const TEXT_KW = createToken({ name: 'text', pattern: /text\b/ });
export const RICH_CARD_KW = createToken({ name: 'richCard', pattern: /richCard\b/ });
export const CAROUSEL_KW = createToken({ name: 'carousel', pattern: /carousel\b/ });
export const RBM_FILE_KW = createToken({ name: 'rbmFile', pattern: /rbmFile\b/ });
export const FILE_KW = createToken({ name: 'file', pattern: /file\b/ });

// Action keywords
export const REPLY_KW = createToken({ name: 'reply', pattern: /reply\b/ });
export const ACTION_KW = createToken({ name: 'action', pattern: /action\b/ });
export const DIAL_KW = createToken({ name: 'dial', pattern: /dial\b/ });
export const DIAL_ACTION_KW = createToken({ name: 'dialAction', pattern: /dialAction\b/ });
export const OPEN_URL_KW = createToken({ name: 'openUrl', pattern: /openUrl\b/ });
export const OPEN_URL_ACTION_KW = createToken({ name: 'openUrlAction', pattern: /openUrlAction\b/ });
export const SHARE_LOCATION_KW = createToken({ name: 'shareLocation', pattern: /shareLocation\b/ });
export const SHARE_LOCATION_ACTION_KW = createToken({ name: 'shareLocationAction', pattern: /shareLocationAction\b/ });
export const VIEW_LOCATION_KW = createToken({ name: 'viewLocation', pattern: /viewLocation\b/ });
export const VIEW_LOCATION_ACTION_KW = createToken({ name: 'viewLocationAction', pattern: /viewLocationAction\b/ });
export const SAVE_EVENT_KW = createToken({ name: 'saveEvent', pattern: /saveEvent\b/ });
export const CREATE_CALENDAR_EVENT_ACTION_KW = createToken({ name: 'createCalendarEventAction', pattern: /createCalendarEventAction\b/ });
export const COMPOSE_ACTION_KW = createToken({ name: 'composeAction', pattern: /composeAction\b/ });

// Flow keywords
export const START_KW = createToken({ name: 'start', pattern: /start\b/ });
export const WITH_KW = createToken({ name: 'with', pattern: /with\b/ });
export const WHEN_KW = createToken({ name: 'when', pattern: /when\b/ });
export const IF_KW = createToken({ name: 'if', pattern: /if\b/ });
export const THEN_KW = createToken({ name: 'then', pattern: /then\b/ });
export const ELSE_KW = createToken({ name: 'else', pattern: /else\b/ });
export const UNLESS_KW = createToken({ name: 'unless', pattern: /unless\b/ });
export const AND_KW = createToken({ name: 'and', pattern: /and\b/ });
export const OR_KW = createToken({ name: 'or', pattern: /or\b/ });
export const NOT_KW = createToken({ name: 'not', pattern: /not\b/ });
export const IS_KW = createToken({ name: 'is', pattern: /is\b/ });
export const DO_KW = createToken({ name: 'do', pattern: /do\b/ });
export const END_KW = createToken({ name: 'end', pattern: /end\b/ });

// Collection keywords
export const LIST_KW = createToken({ name: 'list', pattern: /list\b/ });
export const OF_KW = createToken({ name: 'of', pattern: /of\b/ });

// Message traffic type keywords (only the ones specified in the formal spec)
export const TRANSACTIONAL_KW = createToken({ name: 'transactional', pattern: /transactional\b/ });
export const PROMOTIONAL_KW = createToken({ name: 'promotional', pattern: /promotional\b/ });

// Boolean keywords (only the ones specified in the formal spec)
export const TRUE_KW = createToken({ name: 'True', pattern: /True\b/ });
export const YES_KW = createToken({ name: 'Yes', pattern: /Yes\b/ });
export const ON_KW = createToken({ name: 'On', pattern: /On\b/ });
export const ENABLED_KW = createToken({ name: 'Enabled', pattern: /Enabled\b/ });
export const ACTIVE_KW = createToken({ name: 'Active', pattern: /Active\b/ });
export const FALSE_KW = createToken({ name: 'False', pattern: /False\b/ });
export const NO_KW = createToken({ name: 'No', pattern: /No\b/ });
export const OFF_KW = createToken({ name: 'Off', pattern: /Off\b/ });
export const DISABLED_KW = createToken({ name: 'Disabled', pattern: /Disabled\b/ });
export const INACTIVE_KW = createToken({ name: 'Inactive', pattern: /Inactive\b/ });

// Null keywords (both capitalized per spec and lowercase for usability)
export const NULL_KW = createToken({ name: 'Null', pattern: /Null\b/ });
export const NULL_LOWERCASE_KW = createToken({ name: 'null', pattern: /null\b/ });
export const NONE_KW = createToken({ name: 'None', pattern: /None\b/ });
export const VOID_KW = createToken({ name: 'Void', pattern: /Void\b/ });

// Reserved names
export const DEFAULTS_KW = createToken({ name: 'Defaults', pattern: /Defaults\b/ });
export const CONFIG_KW = createToken({ name: 'Config', pattern: /Config\b/ });
export const MESSAGES_RESERVED_KW = createToken({ name: 'Messages', pattern: /Messages\b/ });

// Type tag names (used in <type value> syntax)
export const EMAIL_TYPE = createToken({ name: 'email', pattern: /email\b/ });
export const PHONE_TYPE = createToken({ name: 'phone', pattern: /phone\b/ });
export const MSISDN_TYPE = createToken({ name: 'msisdn', pattern: /msisdn\b/ });
export const URL_TYPE = createToken({ name: 'url', pattern: /url\b/ });
export const TIME_TYPE = createToken({ name: 'time', pattern: /time\b/ });
export const T_TYPE = createToken({ name: 't', pattern: /t\b/ });
export const DATETIME_TYPE = createToken({ name: 'datetime', pattern: /datetime\b/ });
export const DATE_TYPE = createToken({ name: 'date', pattern: /date\b/ });
export const DT_TYPE = createToken({ name: 'dt', pattern: /dt\b/ });
export const ZIPCODE_TYPE = createToken({ name: 'zipcode', pattern: /zipcode\b/ });
export const ZIP_TYPE = createToken({ name: 'zip', pattern: /zip\b/ });
export const DURATION_TYPE = createToken({ name: 'duration', pattern: /duration\b/ });
export const TTL_TYPE = createToken({ name: 'ttl', pattern: /ttl\b/ });

// Identifiers (after keywords to avoid conflicts) - Must start with uppercase per formal spec
export const IDENTIFIER = createToken({
    name: 'IDENTIFIER',
    pattern: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,  // Must start with uppercase letter, allow hyphens and underscores
    line_breaks: false
});
export const ATTRIBUTE_KEY = createToken({
    name: 'ATTRIBUTE_KEY',
    pattern: /[a-z][a-zA-Z0-9_]*(?=\s*:)/  // Only match if followed by optional whitespace and colon
});
export const SECTION_TYPE = createToken({
    name: 'SECTION_TYPE',
    pattern: /[a-z][a-zA-Z0-9_]*\b/
});

// Literals (ISO Duration before NUMBER to avoid conflicts)
export const ISO_DURATION_LITERAL = createToken({
    name: 'ISO_DURATION_LITERAL',
    pattern: /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,
    line_breaks: false
});
export const STRING = createToken({
    name: 'STRING',
    pattern: /"(\\.|[^"\\])*"/
});
export const NUMBER = createToken({
    name: 'NUMBER',
    pattern: /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/
});
export const ATOM = createToken({
    name: 'ATOM',
    pattern: /:([_a-zA-Z][\w_]*|"[^"\\]*")/
});

// Embedded expressions (fixed to match formal spec exactly)
export const MULTI_LINE_EXPRESSION_START = createToken({
    name: 'MULTI_LINE_EXPRESSION_START',
    pattern: /\$((js|ts)?)>>>/
});

export const EMBEDDED_CODE = createToken({
    name: 'EMBEDDED_CODE',
    pattern: /\$((js|ts)?>)(?!>)\s*[^\r\n]*/
});

// Multi-line expression content (for indented content after >>>)
export const MULTI_LINE_EXPRESSION_CONTENT = createToken({
    name: 'MULTI_LINE_EXPRESSION_CONTENT',
    pattern: Lexer.NA
});

// Multi-line string markers (fixed to match formal spec exactly)
export const MULTILINE_STR_PRESERVE_ALL = createToken({
    name: 'MULTILINE_STR_PRESERVE_ALL',
    pattern: /\+\|\+(?=\s*(?:\r?\n|$))/
});
export const MULTILINE_STR_PRESERVE = createToken({
    name: 'MULTILINE_STR_PRESERVE',
    pattern: /\+\|(?=\s*(?:\r?\n|$))/
});
export const MULTILINE_STR_TRIM = createToken({
    name: 'MULTILINE_STR_TRIM',
    pattern: /\|-(?=\s*(?:\r?\n|$))/
});
export const MULTILINE_STR_CLEAN = createToken({
    name: 'MULTILINE_STR_CLEAN',
    pattern: /\|(?=\s*(?:\r?\n|$))/
});
export const STRING_CONTENT = createToken({
    name: 'STRING_CONTENT',
    pattern: Lexer.NA
});

// Punctuation (longer patterns first)
export const ARROW = createToken({ name: 'ARROW', pattern: /->/ });
export const APOSTROPHE_S = createToken({ name: 'APOSTROPHE_S', pattern: /'s/ });
export const PIPE = createToken({ name: 'PIPE', pattern: /\|/ });
export const COLON = createToken({ name: 'COLON', pattern: /:/ });
export const COMMA = createToken({ name: 'COMMA', pattern: /,/ });
export const DOT = createToken({ name: 'DOT', pattern: /\./ });
export const SLASH = createToken({ name: 'SLASH', pattern: /\// });
export const HYPHEN = createToken({ name: 'HYPHEN', pattern: /-/ });
export const DOLLAR = createToken({ name: 'DOLLAR', pattern: /\$/ });
export const PERCENT = createToken({ name: 'PERCENT', pattern: /%/ });
export const AT = createToken({ name: 'AT', pattern: /@/ });
export const CARET = createToken({ name: 'CARET', pattern: /\^/ });

// Brackets and braces
export const LPAREN = createToken({ name: 'LPAREN', pattern: /\(/ });
export const RPAREN = createToken({ name: 'RPAREN', pattern: /\)/ });
export const LBRACE = createToken({ name: 'LBRACE', pattern: /\{/ });
export const RBRACE = createToken({ name: 'RBRACE', pattern: /\}/ });
export const LBRACKET = createToken({ name: 'LBRACKET', pattern: /\[/ });
export const RBRACKET = createToken({ name: 'RBRACKET', pattern: /\]/ });
export const LT = createToken({ name: 'LT', pattern: /</ });
export const GT = createToken({ name: 'GT', pattern: />/ });

// Type tag value content (for inside <type value> constructs)
export const TYPE_TAG_VALUE_CONTENT = createToken({
    name: 'TYPE_TAG_VALUE_CONTENT',
    pattern: Lexer.NA
});
export const TYPE_TAG_MODIFIER_CONTENT = createToken({
    name: 'TYPE_TAG_MODIFIER_CONTENT',
    pattern: Lexer.NA
});

export const allTokens = [
    // Synthetic tokens
    INDENT,
    DEDENT,

    // Whitespace and comments
    WS,
    NL,
    SL_COMMENT,

    // Import keywords
    IMPORT_KW,
    AS_KW,
    FROM_KW,

    // Section keywords
    AGENT_DEFAULTS_KW,
    AGENT_CONFIG_KW,
    AGENT_KW,
    FLOWS_KW,
    FLOW_KW,
    MESSAGES_KW,

    // Message keywords
    AGENT_MESSAGE_KW,
    CONTENT_MESSAGE_KW,
    SUGGESTION_KW,

    // Message type keywords
    RICH_CARD_KW,
    CAROUSEL_KW,
    RBM_FILE_KW,
    TEXT_KW,
    FILE_KW,

    // Action keywords (longer ones first)
    CREATE_CALENDAR_EVENT_ACTION_KW,
    SHARE_LOCATION_ACTION_KW,
    VIEW_LOCATION_ACTION_KW,
    OPEN_URL_ACTION_KW,
    DIAL_ACTION_KW,
    COMPOSE_ACTION_KW,
    SHARE_LOCATION_KW,
    VIEW_LOCATION_KW,
    SAVE_EVENT_KW,
    OPEN_URL_KW,
    ACTION_KW,
    REPLY_KW,
    DIAL_KW,

    // Flow keywords
    START_KW,
    WITH_KW,
    WHEN_KW,
    UNLESS_KW,
    THEN_KW,
    ELSE_KW,
    AND_KW,
    OR_KW,
    NOT_KW,
    IF_KW,
    IS_KW,
    DO_KW,
    END_KW,

    // Collection keywords
    LIST_KW,
    OF_KW,

    // Message traffic type keywords
    TRANSACTIONAL_KW,
    PROMOTIONAL_KW,

    // Boolean keywords
    ENABLED_KW,
    DISABLED_KW,
    INACTIVE_KW,
    ACTIVE_KW,
    TRUE_KW,
    FALSE_KW,
    YES_KW,
    NO_KW,
    ON_KW,
    OFF_KW,

    // Null keywords
    NULL_KW,
    NULL_LOWERCASE_KW,
    NONE_KW,
    VOID_KW,

    // Reserved names
    DEFAULTS_KW,
    CONFIG_KW,
    MESSAGES_RESERVED_KW,

    // Type tag names
    DATETIME_TYPE,
    ZIPCODE_TYPE,
    DURATION_TYPE,
    EMAIL_TYPE,
    PHONE_TYPE,
    MSISDN_TYPE,
    URL_TYPE,
    TIME_TYPE,
    DATE_TYPE,
    ZIP_TYPE,
    TTL_TYPE,
    DT_TYPE,
    T_TYPE,

    // Literals (specific patterns before general identifiers)
    ISO_DURATION_LITERAL,
    STRING,
    NUMBER,
    ATOM,

    // Identifiers (after keywords and literals)
    IDENTIFIER,
    ATTRIBUTE_KEY,
    SECTION_TYPE,

    // Embedded expressions
    MULTI_LINE_EXPRESSION_START,
    EMBEDDED_CODE,
    MULTI_LINE_EXPRESSION_CONTENT,

    // Multi-line string markers (specific before general PIPE token)
    MULTILINE_STR_PRESERVE_ALL,
    MULTILINE_STR_PRESERVE,
    MULTILINE_STR_TRIM,
    MULTILINE_STR_CLEAN,
    STRING_CONTENT,

    // Type tag content
    TYPE_TAG_VALUE_CONTENT,
    TYPE_TAG_MODIFIER_CONTENT,

    // Punctuation (longer patterns first)
    ARROW,
    APOSTROPHE_S,
    PIPE,
    COLON,
    COMMA,
    DOT,
    SLASH,
    HYPHEN,
    DOLLAR,
    PERCENT,
    AT,
    CARET,

    // Brackets and braces
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    LBRACKET,
    RBRACKET,
    LT,
    GT,
];

/**
 * Object containing all token definitions organized by category.
 * This is used by various parts of the system that need to reference specific tokens.
 */
export const RclTokens = {
    // Synthetic tokens
    INDENT,
    DEDENT,

    // Whitespace and comments
    WS,
    NL,
    SL_COMMENT,

    // Import keywords
    IMPORT_KW,
    AS_KW,
    FROM_KW,

    // Section keywords
    AGENT_KW,
    AGENT_DEFAULTS_KW,
    AGENT_CONFIG_KW,
    FLOW_KW,
    FLOWS_KW,
    MESSAGES_KW,

    // Message keywords
    AGENT_MESSAGE_KW,
    CONTENT_MESSAGE_KW,
    SUGGESTION_KW,

    // Message type keywords
    TEXT_KW,
    RICH_CARD_KW,
    CAROUSEL_KW,
    RBM_FILE_KW,
    FILE_KW,

    // Action keywords
    REPLY_KW,
    ACTION_KW,
    DIAL_KW,
    DIAL_ACTION_KW,
    OPEN_URL_KW,
    OPEN_URL_ACTION_KW,
    SHARE_LOCATION_KW,
    SHARE_LOCATION_ACTION_KW,
    VIEW_LOCATION_KW,
    VIEW_LOCATION_ACTION_KW,
    SAVE_EVENT_KW,
    CREATE_CALENDAR_EVENT_ACTION_KW,
    COMPOSE_ACTION_KW,

    // Flow keywords
    START_KW,
    WITH_KW,
    WHEN_KW,
    IF_KW,
    THEN_KW,
    ELSE_KW,
    UNLESS_KW,
    AND_KW,
    OR_KW,
    NOT_KW,
    IS_KW,
    DO_KW,
    END_KW,

    // Collection keywords
    LIST_KW,
    OF_KW,

    // Message traffic type keywords
    TRANSACTIONAL_KW,
    PROMOTIONAL_KW,

    // Boolean keywords
    TRUE_KW,
    YES_KW,
    ON_KW,
    ENABLED_KW,
    ACTIVE_KW,
    FALSE_KW,
    NO_KW,
    OFF_KW,
    DISABLED_KW,
    INACTIVE_KW,

    // Null keywords
    NULL_KW,
    NULL_LOWERCASE_KW,
    NONE_KW,
    VOID_KW,

    // Reserved names
    DEFAULTS_KW,
    CONFIG_KW,
    MESSAGES_RESERVED_KW,

    // Type tag names
    EMAIL_TYPE,
    PHONE_TYPE,
    MSISDN_TYPE,
    URL_TYPE,
    TIME_TYPE,
    T_TYPE,
    DATETIME_TYPE,
    DATE_TYPE,
    DT_TYPE,
    ZIPCODE_TYPE,
    ZIP_TYPE,
    DURATION_TYPE,
    TTL_TYPE,

    // Identifiers
    IDENTIFIER,
    ATTRIBUTE_KEY,
    SECTION_TYPE,

    // Literals
    ISO_DURATION_LITERAL,
    STRING,
    NUMBER,
    ATOM,

    // Embedded expressions
    MULTI_LINE_EXPRESSION_START,
    EMBEDDED_CODE,
    MULTI_LINE_EXPRESSION_CONTENT,

    // Multi-line string markers
    MULTILINE_STR_PRESERVE_ALL,
    MULTILINE_STR_PRESERVE,
    MULTILINE_STR_TRIM,
    MULTILINE_STR_CLEAN,
    STRING_CONTENT,

    // Type tag content
    TYPE_TAG_VALUE_CONTENT,
    TYPE_TAG_MODIFIER_CONTENT,

    // Punctuation
    ARROW,
    APOSTROPHE_S,
    PIPE,
    COLON,
    COMMA,
    DOT,
    SLASH,
    HYPHEN,
    DOLLAR,
    PERCENT,
    AT,
    CARET,

    // Brackets and braces
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    LBRACKET,
    RBRACKET,
    LT,
    GT,

    // Utility methods
    getAllTokens: () => allTokens,
    getTypeTagTokens: () => [
        TYPE_TAG_VALUE_CONTENT,
        TYPE_TAG_MODIFIER_CONTENT,
        EMAIL_TYPE,
        PHONE_TYPE,
        MSISDN_TYPE,
        URL_TYPE,
        TIME_TYPE,
        T_TYPE,
        DATETIME_TYPE,
        DATE_TYPE,
        DT_TYPE,
        ZIPCODE_TYPE,
        ZIP_TYPE,
        DURATION_TYPE,
        TTL_TYPE,
        // Include other tokens that might be needed in type tag context
        STRING,
        NUMBER,
        IDENTIFIER,
        PIPE,
        LT,
        GT,
    ],
}; 