// ======== Basic Primitive Types and Terminals ========
// This file contains basic primitive types and literals


// ======== Hidden Terminals ========
hidden terminal SL_COMMENT: /#[^\r\n]*/;
terminal WS: /[ \t]+/;

// ==== Required space ====
// This is intentionally not hidden, as it's used explicitly in some parser rules.
terminal __: /[ ]+/;

// ======== Core Pattern Terminals ========
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
terminal NL: /[\r\n]+/;

terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';

// ======== Boolean/Null Pattern Terminals ========
terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;
terminal NULL_KW: /\b(Null|None|Void|null)\b/;

// ======== Special Value Pattern Terminals ========
// terminal CARD_HEIGHT: /\b(SHORT|MEDIUM|TALL)\b/;
// terminal CARD_ORIENTATION: /\b(HORIZONTAL|VERTICAL)\b/;

// ======== Identifier Terminals ========
// Must start with uppercase letter per RCL spec, allow hyphens and underscores
terminal IDENTIFIER: /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*\b/;

// Attribute keys start with lowercase
terminal ATTRIBUTE_KEY: /[a-z][a-zA-Z0-9_]*(?=\s*:)/;

// Section types start with lowercase
terminal SECTION_TYPE: /[a-z][a-zA-Z0-9_]*\b/;

// ======== Keywords ========
// Section keywords
terminal AGENT_KW: 'agent';
terminal AGENT_CONFIG_KW: 'agentConfig';
terminal AGENT_DEFAULTS_KW: 'agentDefaults';
terminal FLOW_KW: 'flow';
terminal FLOWS_KW: 'flows';
terminal MESSAGES_KW: 'messages';

// Flow keywords
terminal START_KW: 'start';
terminal WITH_KW: 'with';
terminal WHEN_KW: 'when';
terminal IF_KW: 'if';
terminal THEN_KW: 'then';
terminal ELSE_KW: 'else';
terminal UNLESS_KW: 'unless';
terminal AND_KW: 'and';
terminal OR_KW: 'or';
terminal NOT_KW: 'not';
terminal IS_KW: 'is';
terminal DO_KW: 'do';
terminal END_KW: 'end';

// Import keywords
terminal IMPORT_KW: 'import';
terminal AS_KW: 'as';
terminal FROM_KW: 'from';

// ======== Primitive Parser Rules ========
BooleanLiteral returns string: TRUE_KW | FALSE_KW;

NullLiteral returns string:
    NULL_KW;

EmptyLine returns string: __* NL;


// ======== Multi-line String Handling ========

// These markers must be followed by a newline to trigger a multi-line block.
terminal MULTILINE_STR_CLEAN: /\|(?=\s*(?:\r?\n|$))/;            // |
terminal MULTILINE_STR_TRIM: /\|-(?=\s*(?:\r?\n|$))/;            // |-
terminal MULTILINE_STR_PRESERVE: /\+\|(?=\s*(?:\r?\n|$))/;       // +|
terminal MULTILINE_STR_PRESERVE_ALL: /\+\|\+(?=\s*(?:\r?\n|$))/; // +|+

// ======== Embedded Expressions ========
terminal EMBEDDED_CODE: /\$((js|ts)?>)\s*[^\r\n]*/;
terminal MULTI_LINE_EXPRESSION_START: /\$((js|ts)?)>>>/;
terminal CODE_LINE: /[^\r\n]*/;

// ======== Parser Rules ========
// A multi-line string with various whitespace handling modes.
MultiLineString returns MultiLineString:
    marker=(MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
    has_block_content='true';

// ======== Value System ========
Value returns Value:
    StringValue | NumberValue | BooleanValue | NullValue | IdentifierValue | EmbeddedExpression | EmbeddedCodeBlock;

StringValue returns StringValue:
    value=STRING;

NumberValue returns NumberValue:
    value=NUMBER;

BooleanValue returns BooleanValue:
    value=(TRUE_KW | FALSE_KW);

NullValue returns NullValue:
    NULL_KW;

IdentifierValue returns IdentifierValue:
    value=IDENTIFIER;

// Embedded expressions
EmbeddedExpression returns EmbeddedExpression:
    EMBEDDED_CODE;

EmbeddedCodeBlock returns EmbeddedCodeBlock:
    MULTI_LINE_EXPRESSION_START
    INDENT
    content+=(CODE_LINE | EmptyLine)*
    DEDENT;
