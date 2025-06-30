// ======== Basic Primitive Types and Terminals ========
// This file contains basic primitive types and literals


// ======== Hidden Terminals ========
hidden terminal SL_COMMENT: /#[^\r\n]*/;

// ==== Required space ====
terminal __: /[ ]+/;

// ======== Core Terminals ========
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER returns number: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
// terminal REGEXP_LITERAL: /\/([^\/\\]|\\\\.)*\/[gimyusv]*/;
terminal NL: /[\r\n]+/;                         // Newlines (removed $)

// ======== Native Schema Terminals ========
terminal AGENT_CONFIG_KEYWORD: 'agentConfig';
terminal AGENT_DEFAULTS_KEYWORD: 'agentDefaults';
terminal AGENT_MESSAGES_KEYWORD: 'agentMessages';

// ======== Indentation Terminals ========
// These terminals are REQUIRED by Langium 
// DO NOT REMOVE OR CHANGE THEM TERMINAL
terminal INDENT: 'synthetic:indent';                 // Indentation increase (will be overridden)
terminal DEDENT: 'synthetic:dedent';                 // Indentation decrease (will be overridden)
terminal LT: '<';
terminal GT: '>';
terminal SLASH: '/';

terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;

EmptyLine returns string: __* NL;

// ======== Basic Shared Types & Rules ========

// Simplified Boolean and Null types
BooleanLiteral infers BooleanValue:
    value=(TRUE_KW | FALSE_KW);

NullValue infers NullValue:
    value='Null';

LiteralValue infers LiteralValue:
    val_str=STRING
    | val_num=NUMBER
    | val_atom=ATOM
    | val_bool=BooleanLiteral
    | val_null=NullValue;
//    | val_regexp=REGEXP_LITERAL;

// ======== Identifiers & Qualified Names ========

// Moved from type-system.langium to resolve ordering issues
terminal TYPE_TAG_NAME: /(date|datetime|time|email|phone|msisdn|url|zipcode|zip)/;

terminal COMMON_NOUN: /(?!import\b|as\b|agent\b|agentConfig\b|agentDefaults\b|flow\b|messages\b|authentication\b|transaction\b|promotion\b|servicerequest\b|acknowledge\b|message\b|or\b|and\b|is\b|not\b|date\b|datetime\b|time\b|email\b|phone\b|msisdn\b|url\b|zipcode\b|zip\b)[a-z][a-zA-Z0-9_-]*/;

// Multi-word proper noun - stops at word boundaries to avoid consuming keywords
terminal PROPER_NOUN: /\b[A-Z][\w-]*(?:[ \t]+[A-Z][\w-]*)*\b/;

// Identifier can be a PROPER_NOUN or a COMMON_NOUN
Identifier infers Identifier:
    value=(PROPER_NOUN | COMMON_NOUN);

interface AttributePath {
    parts: string[];
}

// Rule for attribute access path like attName or attName.subAttName
AttributePath returns AttributePath:
    parts+=COMMON_NOUN (__? '.' __? parts+=COMMON_NOUN)*;

// Qualified name for import paths
QualifiedName returns string:
    PROPER_NOUN (__? '/' __? PROPER_NOUN)*;
