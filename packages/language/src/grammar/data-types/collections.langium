// ======== Collection and Reference Types ========
// This file contains all collection types including lists and dictionaries

import "../core/ast-nodes";
import "../core/primitives";
import "../data-types/type-system";
import "../specialized/embedded-code";
import "../specialized/strings";

// ======== Core Value Types ========
// NOTE: Interfaces are defined in ast-nodes.langium
// SimpleValue represents a basic value that can appear in various contexts
SimpleValue returns SimpleValue:
    value=STRING | value=NUMBER | value=ATOM | value=BooleanLiteral | value=NullLiteral | value=PROPER_NOUN | value=COMMON_NOUN 
    | TypeTag 
    | SingleLineEmbeddedExpression 
    | MultiLineString
    | ParenthesesList
    | InlineList 
    | IndentedList
    | BraceObject
    | IndentedObject;

// ======== List Collections ========
// Parentheses list: (item1, item2, item3)
ParenthesesList returns ParenthesesList:
    '(' (items+=SimpleValue (',' items+=SimpleValue)*)? ')';

// Inline list: - item1, item2, item3
InlineList returns InlineList:
    '-' items+=SimpleValue;

// Indented list with line breaks
IndentedList returns IndentedList:
    NL?
    INDENT
    (
        '-' items+=SimpleValue NL?
        | emptyLines+=EmptyLine
    )+
    DEDENT;

// ======== Dictionary Collections ========
// Brace object: { key1: value1, key2: value2 }
BraceObject returns BraceObject:
    '{' (pairs+=ObjectPair (',' pairs+=ObjectPair)*)? '}';

// Indented object with key-value pairs
IndentedObject returns IndentedObject:
    NL?
    INDENT
    (pairs+=ObjectPair | emptyLines+=EmptyLine)*
    DEDENT;

// Object pair: key: value
ObjectPair returns ObjectPair:
    key=SimpleValue ':' __ value=SimpleValue;