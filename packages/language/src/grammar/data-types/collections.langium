// ======== Collection and Reference Types ========
// This file contains simplified collection types to avoid circular dependencies

import "../core/primitives";
import "../data-types/type-system";
import "../specialized/embedded-code";
import "../specialized/strings";

// ======== Core Value Types ========
// NOTE: Interfaces are defined in ast-nodes.langium
// SimpleValue represents a basic value that can appear in various contexts
SimpleValue returns SimpleValue:
    STRING | NUMBER | ATOM | TRUE_KW | FALSE_KW | NULL_KW | PROPER_NOUN | COMMON_NOUN 
    | TypeTag 
    | SingleLineEmbeddedExpression 
    | MultiLineString;