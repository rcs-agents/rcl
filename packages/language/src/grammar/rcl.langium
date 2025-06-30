grammar RclLanguage

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
import "./data-types/type-tag";

// Import specialized grammar rules
import "./core/embedded-code";
import "./specialized/flow-rules";
// import "./specialized/messages";
// import "./specialized/rich-cards";
// import "./specialized/suggestions";
// import "./specialized/shortcuts";
import "./specialized/configuration";

// ======== Entry Point ========
// An RCL file consists of zero or more import statements and empty lines,
// followed by a single top-level section.
entry RclFile:
    (imports+=ImportStatement | emptyLines+=EmptyLine)*
    agentSection=Section;

// NOTE: ImportStatement is defined in ./core/import.langium

  