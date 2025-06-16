// ======== Parameter and Property Structures ========
// This file contains parameter structures used across schemas

import "./primitives";

// ======== Parameters ========
Parameter infers Parameter:
    name=COMMON_NOUN ':' value=LiteralValue;

InlineParameterList infers InlineParameterList:
    parameters+=Parameter (',' parameters+=Parameter)*; 