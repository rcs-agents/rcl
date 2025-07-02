/**
 * This file contains all the regular expressions used in the RCL TextMate grammar.
 * They are intentionally left empty as per the instructions.
 * You should fill in the actual regular expressions here.
 */
export const R = {
	// Comments
	SL_COMMENT: /#[^\r\n]*/,

	// Whitespace
	REQUIRED_WHITESPACE: /[ \t]+/,
	WS: /[ \t]+/,
	NL: /\r?\n/,

	// Literals
	ATOM: /:([_a-zA-Z][\w_]*|"[^"\\]*")/,
	STRING: /"(\\.|[^"\\])*"/,
	NUMBER: /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
	ISO_DURATION_LITERAL: /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,
	TRUE_KW: /\b(True|Yes|On|Enabled|Active)\b/,
	FALSE_KW: /\b(False|No|Off|Disabled|Inactive)\b/,
	NULL_KW: /\b(Null|None|Void|null)\b/,

	// Identifiers - Must start with uppercase letter, allow spaces between words
	PROPER_NOUN: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,
	IDENTIFIER: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/,
	COMMON_NOUN: /[a-z][a-zA-Z0-9_]*/,
	ATTRIBUTE_KEY: /[a-z][a-zA-Z0-9_]*(?=\s*:)/,
	SECTION_TYPE: /[a-z][a-zA-Z0-9_]*\b/,

	// Import keywords
	IMPORT_KW: /\bimport\b/,
	AS_KW: /\bas\b/,
	FROM_KW: /\bfrom\b/,

	// Section keywords
	AGENT_KW: /\bagent\b/,
	AGENT_DEFAULTS_KW: /\bagentDefaults\b/,
	AGENT_CONFIG_KW: /\bagentConfig\b/,
	FLOW_KW: /\bflow\b/,
	FLOWS_KW: /\bflows\b/,
	MESSAGES_KW: /\bmessages\b/,

	// Message keywords
	AGENT_MESSAGE_KW: /\bagentMessage\b/,
	CONTENT_MESSAGE_KW: /\bcontentMessage\b/,
	SUGGESTION_KW: /\bsuggestion\b/,

	// Message type keywords
	TEXT_KW: /\btext\b/,
	RICH_CARD_KW: /\brichCard\b/,
	CAROUSEL_KW: /\bcarousel\b/,
	RBM_FILE_KW: /\brbmFile\b/,
	FILE_KW: /\bfile\b/,

	// Action keywords
	REPLY_KW: /\breply\b/,
	ACTION_KW: /\baction\b/,
	DIAL_KW: /\bdial\b/,
	DIAL_ACTION_KW: /\bdialAction\b/,
	OPEN_URL_KW: /\bopenUrl\b/,
	OPEN_URL_ACTION_KW: /\bopenUrlAction\b/,
	SHARE_LOCATION_KW: /\bshareLocation\b/,
	SHARE_LOCATION_ACTION_KW: /\bshareLocationAction\b/,
	VIEW_LOCATION_KW: /\bviewLocation\b/,
	VIEW_LOCATION_ACTION_KW: /\bviewLocationAction\b/,
	SAVE_EVENT_KW: /\bsaveEvent\b/,
	CREATE_CALENDAR_EVENT_ACTION_KW: /\bcreateCalendarEventAction\b/,
	COMPOSE_ACTION_KW: /\bcomposeAction\b/,

	// Flow keywords
	START_KW: /\bstart\b/,
	WITH_KW: /\bwith\b/,
	WHEN_KW: /\bwhen\b/,
	IF_KW: /\bif\b/,
	THEN_KW: /\bthen\b/,
	ELSE_KW: /\belse\b/,
	UNLESS_KW: /\bunless\b/,
	AND_KW: /\band\b/,
	OR_KW: /\bor\b/,
	NOT_KW: /\bnot\b/,
	IS_KW: /\bis\b/,
	DO_KW: /\bdo\b/,
	END_KW: /\bend\b/,

	// Collection keywords
	LIST_KW: /\blist\b/,
	OF_KW: /\bof\b/,

	// Message traffic type keywords
	TRANSACTIONAL_KW: /\btransactional\b/,
	PROMOTIONAL_KW: /\bpromotional\b/,

	// Reserved names
	DEFAULTS_KW: /\bDefaults\b/,
	CONFIG_KW: /\bConfig\b/,
	MESSAGES_RESERVED_KW: /\bMessages\b/,

	// Type tag names
	EMAIL_TYPE: /\bemail\b/,
	PHONE_TYPE: /\bphone\b/,
	MSISDN_TYPE: /\bmsisdn\b/,
	URL_TYPE: /\burl\b/,
	TIME_TYPE: /\btime\b/,
	T_TYPE: /\bt\b/,
	DATETIME_TYPE: /\bdatetime\b/,
	DATE_TYPE: /\bdate\b/,
	DT_TYPE: /\bdt\b/,
	ZIPCODE_TYPE: /\bzipcode\b/,
	ZIP_TYPE: /\bzip\b/,
	DURATION_TYPE: /\bduration\b/,
	TTL_TYPE: /\bttl\b/,

	// Embedded expressions
	EMBEDDED_CODE: /\$((js|ts)?>)\s*[^\r\n]*/,
	MULTI_LINE_EXPRESSION_START: /\$((js|ts)?)>>>/,

	// Multi-line string markers
	MULTILINE_STR_PRESERVE_ALL: /\+\|\+(?=\s*(?:\r?\n|$))/,
	MULTILINE_STR_PRESERVE: /\+\|(?=\s*(?:\r?\n|$))/,
	MULTILINE_STR_TRIM: /\|-(?=\s*(?:\r?\n|$))/,
	MULTILINE_STR_CLEAN: /\|(?=\s*(?:\r?\n|$))/,

	// Punctuation (longer patterns first)
	ARROW: /->/,
	APOSTROPHE_S: /'s/,
	PIPE: /\|/,
	COLON: /:/,
	COMMA: /,/,
	DOT: /\./,
	SLASH: /\//,
	HYPHEN: /-/,
	DOLLAR: /\$/,
	PERCENT: /%/,
	AT: /@/,
	CARET: /\^/,

	// Brackets and braces
	LPAREN: /\(/,
	RPAREN: /\)/,
	LBRACE: /\{/,
	RBRACE: /\}/,
	LBRACKET: /\[/,
	RBRACKET: /\]/,
	LT: /</,
	GT: />/,

	// Type tag content patterns
	TYPE_TAG_NAME: /[a-zA-Z]+/,
	TYPE_TAG_VALUE_CONTENT: /[^\|>]+/,
	TYPE_TAG_MODIFIER_CONTENT: /[^>]+/,

	// Legacy patterns for backward compatibility
	NEWLINE: /\r?\n/,
	SECTION_BEGIN: /:/,
	SECTION_END: /(?=\r?\n)/,
	RESERVED_SECTION_NAMES: /\b(Config|Defaults|Messages)\b/,
	MESSAGE_SECTION_TYPE: /\b(agentMessage|contentMessage)\b/,
	TYPE_CONVERSION_BEGIN: /</,
	OPERATORS: /(-|->|\+|\*|\/|%|==|!=|<=|>=|<|>|and|or|not|is)/,
	SINGLE_LINE_EXPRESSION_BEGIN: /\$((js|ts)?>)/,
	SINGLE_LINE_EXPRESSION_END: /(?=\r?\n)/,
	MULTI_LINE_EXPRESSION_BEGIN: /\$((js|ts)?)>>>/,
	MULTI_LINE_EXPRESSION_END: /(?=^[ \t]*(?:[^ \t\n\r]|$))/m,
	MULTILINE_STRING_END: /(?=^[ \t]*(?:[^ \t\n\r]|$))/m,
	EMBEDDED_CODE_BEGIN: /\$((js|ts)?>)/,
	EMBEDDED_CODE_END: /(?=\r?\n)/,
	EMBEDDED_CODE_CONTENT: /[^\r\n]*/,
	FLOW_RULE_BEGIN: /[A-Z][A-Za-z0-9\s]*\s*:/,
	FLOW_RULE_END: /(?=\r?\n)/,
	LSQUARE: /\[/,
	RSQUARE: /\]/,
	EXPLICIT_MAP_BEGIN: /\{/,
	EXPLICIT_MAP_END: /\}/,
	INDENTED_LIST_ITEM_PREFIX: /-/,
	IMPORT_STATEMENT: /import\s+[A-Z][A-Za-z0-9\s\/]*(\s+as\s+[A-Z][A-Za-z0-9\s]*)?/,
	OR_OP: /\bor\b/,
	AND_OP: /\band\b/,
	EQUALITY_OP: /(==|!=)/,
	COMPARISON_OP: /(<=|>=|<|>)/,
	ADDITIVE_OP: /[+\-]/,
	MULTIPLICATIVE_OP: /[*\/%]/,
	UNARY_OP: /[!\-]/,
	ATTRIBUTE_ACCESS: /\./,
	ARROW_OP: /->/,
}; 