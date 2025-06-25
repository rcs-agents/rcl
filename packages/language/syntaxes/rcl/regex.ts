/**
 * This file contains all the regular expressions used in the RCL TextMate grammar.
 * They are intentionally left empty as per the instructions.
 * You should fill in the actual regular expressions here.
 */
export const R = {
	// Comments
	SL_COMMENT: / /,

	// Whitespace
	REQUIRED_WHITESPACE: / /,

	// Literals
	ATOM: / /,
	STRING: / /,
	NUMBER: / /,
	NEWLINE: / /,
	TRUE_KW: / /,
	FALSE_KW: / /,

	// Identifiers
	COMMON_NOUN: / /,
	PROPER_NOUN: / /,
	IDENTIFIER: / /,

	// Imports
	IMPORT_KW: / /,

	// Sections
	SECTION_TYPE: / /,
	MESSAGE_SECTION_TYPE: / /,
	RESERVED_SECTION_NAMES: / /,
	SECTION_BEGIN: / /,
	SECTION_END: / /,

	// Types
	TYPE_CONVERSION_BEGIN: / /,

	// Expressions
	OPERATORS: / /,
	DOT: / /,
	SINGLE_LINE_EXPRESSION_BEGIN: / /,
	SINGLE_LINE_EXPRESSION_END: / /,
	MULTI_LINE_EXPRESSION_BEGIN: / /,
	MULTI_LINE_EXPRESSION_END: / /,

	// Strings
	MULTILINE_STR_TRIM_LEAD_ONE_NL_END: / /,
	MULTILINE_STR_TRIM_LEAD_NO_NL_END: / /,
	MULTILINE_STR_KEEP_LEAD_ONE_NL_END: / /,
	MULTILINE_STR_KEEP_ALL: / /,
	MULTILINE_STRING_END: / /,

	// Embedded Code
	EMBEDDED_CODE_BEGIN: / /,
	EMBEDDED_CODE_END: / /,
	EMBEDDED_CODE_CONTENT: / /,

	// Flows
	FLOW_RULE_BEGIN: / /,
	FLOW_RULE_END: / /,

	// Collections
	LSQUARE: / /,
	RSQUARE: / /,
	LBRACE: / /,
	RBRACE: / /,

	// Punctuation
	COLON: / /,

	// Type System
	TYPE_TAG_NAME: / /,
	TYPE_TAG_VALUE_CONTENT: / /,
	TYPE_TAG_MODIFIER_CONTENT: / /,

	// Keywords
	AS_KW: / /,
	IMPORT_STATEMENT: / /,

	// Expressions
	OR_OP: / /,
	AND_OP: / /,
	EQUALITY_OP: / /,
	COMPARISON_OP: / /,
	ADDITIVE_OP: / /,
	MULTIPLICATIVE_OP: / /,
	UNARY_OP: / /,
	ATTRIBUTE_ACCESS: / /,
	LPAREN: / /,
	RPAREN: / /,
	ARROW_OP: / /,

	// Collections
	EXPLICIT_MAP_BEGIN: / /,
	EXPLICIT_MAP_END: / /,
	INDENTED_LIST_ITEM_PREFIX: / /,
}; 