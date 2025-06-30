grammar Rcl

// ======== Main Grammar Entry Point ========
// This file orchestrates the entire RCL grammar by importing all modular components.

// Import core grammar components
import "./core/ast-nodes";
import "./core/primitives";
import "./core/import";
import "./core/sections";

// Import data type definitions
import "./data-types/collections";
import "./data-types/parameters";
import "./data-types/type-system";

// Import specialized grammar rules
import "./specialized/embedded-code";
import "./specialized/flow-rules";
import "./specialized/strings";

// Import expression definitions
import "./expressions/expression-types";

// ======== Entry Point ========
// An RCL file consists of zero or more import statements, followed by
// optional empty lines, and finally a single top-level 'agent' section.
entry RclFile:
    (imports+=ImportStatement)*
    (emptyLines+=EmptyLine)*
    agentSection=Section;

  