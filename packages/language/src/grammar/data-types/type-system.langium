// ======== Type Conversion and Tagging System ========
// This file contains type conversion and tagging mechanisms

import "./primitives";
import "../expressions/expression-types";

// ======== Type Tag Terminals ========
terminal TYPE_TAG_NAME: /(date|datetime|time|email|phone|msisdn|url|zipcode|zip)/; // Specific type keywords
terminal TYPE_TAG_VALUE_CONTENT: /[^\|>]+/;             // Raw string content of tag's value
terminal TYPE_TAG_MODIFIER_CONTENT: /[^>]+/;            // Raw string content of tag's modifier

// ======== Type Conversion ========
TypeConversionValue infers TypeConversionValue:
    LiteralValue | Identifier;

TypeConversion infers TypeConversion:
    '<' type=TYPE_TAG_NAME value=TypeConversionValue ('|' modifier=STRING)? '>';

// ======== Type Tag Rules ========
TypeTag infers TypeTag:
    '<' type=TYPE_TAG_NAME value=TYPE_TAG_VALUE_CONTENT ('|' modifier=TYPE_TAG_MODIFIER_CONTENT)? '>';

TypedValue infers TypedValue:
    TypeConversion | LiteralValue; 