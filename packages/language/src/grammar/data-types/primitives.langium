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

// End-of-statement rule - matches newline or end of file
End returns string: NL;

// ======== Native Schema Terminals ========
terminal AGENT_CONFIG_KEYWORD: 'agentConfig';
terminal AGENT_DEFAULTS_KEYWORD: 'agentDefaults';
terminal AGENT_MESSAGES_KEYWORD: 'agentMessages';

// ======== Indentation Terminals ========
// These terminals are REQUIRED by Langium 
// DO NOT REMOVE OR CHANGE THEM TERMINAL
terminal INDENT: 'synthetic:indent';                 // Indentation increase (will be overridden)
terminal DEDENT: 'synthetic:dedent';                 // Indentation decrease (will be overridden)
terminal WS: /[ \t]+/;                               // Newlines - keep WS for this

terminal LT: '<';
terminal GT: '>';
terminal SLASH: '/';

terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;

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

terminal PROPER_WORD: /\b[A-Z](?:[a-zA-Z0-9]*|(?<=\w)-(?=\w))*\b/;
terminal COMMON_NOUN: /[a-z][a-zA-Z0-9_]*/;

ProperNoun returns string:
    PROPER_WORD (__ PROPER_WORD)*;

// Identifier can be a ProperNoun or a COMMON_NOUN
Identifier infers Identifier:
    value=(ProperNoun | COMMON_NOUN);

interface AttributePath {
    parts: string[];
}

// Rule for attribute access path like attName or attName.subAttName
AttributePath returns AttributePath:
    parts+=COMMON_NOUN (__? '.' __? parts+=COMMON_NOUN)*;

QualifiedName returns string:
    PROPER_WORD (__? '/' __? PROPER_WORD)*;

// ======== Import Management ========
interface ImportStatement {
    source: string;
    attribute?: AttributePath;
    alias?: string;
}

ImportStatement returns ImportStatement:
    'import' __ source=QualifiedName (__ "'s" __ attribute=AttributePath)? (__ 'as' __ alias=ProperNoun)? (__? (End | EOF));