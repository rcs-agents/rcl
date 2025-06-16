// ======== Basic Primitive Types and Terminals ========
// This file contains basic primitive types and literals


// ======== Hidden Terminals ========
hidden terminal SL_COMMENT: /#.*/;                     // Single-line comments

// ======== Core Terminals ========
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER returns number: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
terminal REGEXP_LITERAL: /\/([^\/\\]|\\\\.)*\/[gimyusv]*/;

// ======== Basic Shared Types & Rules ========

// Simplified Boolean and Null types
BooleanValue infers BooleanValue:
    value=('True' | 'False' | 'On' | 'Off' | 'Yes' | 'No' | 'Active' | 'Inactive' | 'Enabled' | 'Disabled');

NullValue infers NullValue:
    value='Null';

LiteralValue infers LiteralValue:
    val_str=STRING
    | val_num=NUMBER
    | val_atom=ATOM
    | val_bool=BooleanValue
    | val_null=NullValue
    | val_regexp=REGEXP_LITERAL;


// ======== Native Schema Terminals ========
terminal AGENT_CONFIG_PREFIX: /agentConfig\s+/;
terminal AGENT_DEFAULTS_TYPE: /agentDefaults\s+/;
terminal AGENT_MESSAGES_TYPE: /agentMessages\s+/;

// ======== Indentation Terminals ========
terminal INDENT: 'synthetic:indent';                 // Indentation increase (will be overridden)
terminal DEDENT: 'synthetic:dedent';                 // Indentation decrease (will be overridden)
hidden terminal WS: /[\t ]+/;                          // Whitespace (tabs and spaces only)
// hidden terminal HNL: /[\r\n]+/;                         // Newlines

terminal __: /[ ]+/;                          // Whitespace (tabs and spaces only)
terminal NL: /[\r\n$]+/;                         // Newlines
// terminal EOF: /$/;
// ======== Identifiers ========

terminal PROPER_WORD: /\b[A-Z](?:[a-zA-Z0-9]*|(?<=\w)-(?=\w))*\b/;
terminal COMMON_NOUN: /[a-z][a-zA-Z0-9_]*/;

interface ProperNoun {
    words: string[];
}

interface QualifiedName {
    path: ProperNoun[];
    property?: string[];
}

ProperNoun returns ProperNoun:
    words+=PROPER_WORD (words+=PROPER_WORD)*;

Identifier: ProperNoun | COMMON_NOUN;

QualifiedName returns QualifiedName:
    path+=ProperNoun ('/' path+=ProperNoun)+; //* ('.' property+=COMMON_NOUN)*;

// ======== Import Management ========

interface ImportStatement {
    source: QualifiedName;
    alias?: ProperNoun;
}

ImportStatement returns ImportStatement:
    'import' source=QualifiedName ('as' alias=ProperNoun)? (NL | EOF);