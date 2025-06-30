// ======== Type Conversion and Tagging System ========
// This file contains type conversion and tagging mechanisms

import "../core/primitives";

// ======== Type Tag Terminals ========
terminal TYPE_TAG_NAME: /(date|datetime|dt|time|t|email|phone|msisdn|url|zipcode|zip|duration|ttl)/;
terminal ISO_DURATION_LITERAL: /P(\d+[YMWD])*T?(\d+[HMS])*|(\d+(\.\d+)?s)/;

// ======== Type Tag Data Type Rules ========
// Using datatype rules for values that return primitive types
TypeTagValue returns string: STRING | NUMBER | TRUE_KW | FALSE_KW | NULL_KW | ATOM | PROPER_NOUN | COMMON_NOUN | ISO_DURATION_LITERAL;

// ======== Type Tag Parser Rules ========
// NOTE: Interface is defined in ast-nodes.langium
// A TypeTag applies a specific type to a value, with an optional modifier.
// e.g., <time "4pm" | "Z"> or <zip "94103">
TypeTag returns TypeTag:
    '<' type=TYPE_TAG_NAME value=TypeTagValue ('|' modifier=STRING)? '>'; 