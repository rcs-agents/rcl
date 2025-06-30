// ======== Type Conversion and Tagging System ========
// This file contains type conversion and tagging mechanisms

import "../core/primitives";
import "../expressions/expression-types";

// ======== Type Tag Terminals ========
// terminal TYPE_TAG_NAME: /(date|datetime|time|email|phone|msisdn|url|zipcode|zip)/; // Specific type keywords
// terminal TYPE_TAG_VALUE_CONTENT: /[^\|>]+/;             // Raw string content of tag's value
// terminal TYPE_TAG_MODIFIER_CONTENT: /[^>]+/;            // Raw string content of tag's modifier

// ======== Type Conversion ========
TypeConversionValue infers TypeConversionValue:
    LiteralValue | Identifier;

TypeConversion infers TypeConversion:
    LT __? type=TYPE_TAG_NAME __ value=TypeConversionValue (__? '|' __? modifier=STRING)? __? GT;

// ======== Type Tag Rules ========
TypeTag infers TypeTag:
    LT __? type=TYPE_TAG_NAME __ value=TYPE_TAG_VALUE_CONTENT (__? '|' __? modifier=TYPE_TAG_MODIFIER_CONTENT)? __? GT;

TypedValue infers TypedValue:
    TypeConversion | LiteralValue; 