parser grammar RclParser;

options {
    tokenVocab = RclLexer;
}

// Top-level file structure
rcl_file: (import_statement | section | NEWLINE)* EOF;

// Import statements
import_statement: IMPORT import_path (AS alias=IDENTIFIER)? NEWLINE;
import_path: IDENTIFIER (SLASH IDENTIFIER)*;

// Section definition
section: section_header section_body?;

section_header: 
    SECTION_TYPE IDENTIFIER? parameter_list? NEWLINE                   // section [name] [params]
    | SECTION_TYPE STRING (COLON ATOM)? parameter_list? NEWLINE        // flow "name" :atom (params)
    ;

identifier: IDENTIFIER;

section_body: INDENT section_content+ DEDENT;

section_content:
    spread_directive
    | attribute_assignment
    | section
    | match_block
    | simple_transition
    | state_reference
    | message_definition
    | NEWLINE
    ;

// Simple state reference (for unconditional transitions)
state_reference: (IDENTIFIER | variable_access) NEWLINE;

// Message definitions (for messages section)
message_definition: 
    SECTION_TYPE IDENTIFIER (STRING | triple_quote_string) (COLON ATOM)? parameter_list? NEWLINE
    (INDENT section_content+ DEDENT)?
    ;

// Spread operator
spread_directive: SPREAD IDENTIFIER NEWLINE;

// Attribute assignment
attribute_assignment: 
    ATTRIBUTE_NAME value NEWLINE          // attribute: value
    | ATTRIBUTE_NAME COMMA value NEWLINE  // attribute:, value  
    | ATTRIBUTE_NAME NEWLINE              // attribute: (no value)
    ;

// Match blocks
match_block: MATCH value NEWLINE INDENT match_case+ DEDENT;

match_case: 
    (STRING | NUMBER | ATOM | REGEX | DEFAULT_CASE) ARROW contextualized_value NEWLINE;

// Simple transition (arrow without match)
simple_transition: ARROW contextualized_value NEWLINE;

// Values and expressions
contextualized_value: value (WITH parameter_list)?;

parameter_list: parameter (COMMA parameter)*;

parameter: 
    ATTRIBUTE_NAME value         // Named parameter (includes colon)
    | ATTRIBUTE_KEY COLON value  // Named parameter (separate tokens)
    | value                      // Positional parameter
    ;

value:
    | primitive_value  // Invalid!
    | IDENTIFIER
    | variable_access
    | parentheses_list
    | dictionary
    | embedded_code
    | multi_line_string
    ;

primitive_value:
    STRING
    | triple_quote_string
    | REGEX
    | NUMBER
    | BOOLEAN
    | NULL
    | ATOM
    | type_tag
    ;

// Triple-quoted strings with interpolation
triple_quote_string: 
    TRIPLE_QUOTE (TS_CONTENT | interpolation)* TS_TRIPLE_QUOTE_END;

triple_string_content:
    TS_CONTENT
    | interpolation
    ;

interpolation: 
    TS_INTERPOLATION_START interpolation_expr INT_RBRACE;

interpolation_expr:
    INT_VARIABLE (INT_DOT INT_LOWER_NAME)*  // @var.property
    | value  // Any value expression
    ;

// Variable access
variable_access: VARIABLE (DOT (ATTRIBUTE_KEY | SECTION_TYPE))*;

// Type tags
type_tag: LANGLE TT_TYPE_NAME TT_CONTENT? (TT_PIPE TT_CONTENT)? TT_RANGLE;

// Collections
list:
    parentheses_list
    | block_list
    ;

parentheses_list: LPAREN list_elements? RPAREN;

list_elements: value (COMMA value)*;

block_list: INDENT block_list_item+ DEDENT;

block_list_item: HYPHEN value NEWLINE;

dictionary:
    brace_dictionary
    | block_dictionary
    ;

brace_dictionary: LBRACE (dict_entry (COMMA dict_entry)*)? RBRACE;

block_dictionary: INDENT dict_entry+ DEDENT;

dict_entry: (ATTRIBUTE_KEY | STRING) COLON value;

// Embedded code
embedded_code:
    EMBEDDED_CODE
    | multi_line_code
    ;

multi_line_code: 
    MULTI_LINE_CODE_START MC_CONTENT* MC_END;

// Multi-line strings
multi_line_string:
    (MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
    multiline_content*
    ML_END;

multiline_content: ML_CONTENT ML_NEWLINE?;

