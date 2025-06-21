grammar Rcl

// ======== Common Terminals and Imports ========
// This file contains common terminals and imports all necessary data-types and core sections

// Import all data-types
import "./grammar/data-types/primitives";
import "./grammar/data-types/type-system";
import "./grammar/data-types/collections";
import "./grammar/data-types/parameters";

// Import core section infrastructure
import "./grammar/core/sections";

// Import expressions
import "./grammar/expressions/expression-types";

// Import specialized
import "./grammar/specialized/strings";
import "./grammar/specialized/embedded-code";

// ======== Entry Point ========
// RCL files start with imports and contain a single agent section
entry RclFile:
    (imports+=ImportStatement)*
    // THE RULE BELOW MUST USE WS instead of __ or the grammar will not work
    // This happens because Langium requires a WS terminal to be defined AND USED in indentation aware grammars
    ( (WS? NL) | WS )* // Allow blank lines (with or without spaces) or lines with only spaces, after imports or before agent section
    agentSection=Section;