grammar Rcl

// ======== Common Terminals and Imports ========
// This file contains common terminals and imports all necessary data-types and core sections

import "./core/import";
// import "./core/sections";
// import "./core/primitives";

// // Import all data-types
// import "./data-types/collections";
// import "./data-types/parameters";

// // Import core section infrastructure

// // Import expressions
// import "./expressions/expression-types";

// // Import specialized
// import "./specialized/strings";
// import "./specialized/embedded-code";

import "./core/primitives";
import "./core/sections";

// ======== Core Section Grammar ========
// import "./core/primitives";
// import "./data-types/type-system";

// terminal SECTION_TYPE: 
//   'agent'
//   | 'agentConfig'
//   | 'agentDefaults'
//   | 'flow'
//   | 'messages'
//   | ((
//       'authentication'
//       | 'transaction'
//       | 'promotion'
//       | 'servicerequest'
//       | 'acknowledge'
//     )
//     __ 'message');

// // Reserved section names that have implicit types
// ReservedSectionName returns string:
//     'Config' | 'Defaults' | 'Messages';

// SectionParameter:
//     // Only for message sections - expiration parameter
//     TypedValue; // Either timestamp or duration string

// Section:
//     (sectionType=SECTION_TYPE __ sectionName=PROPER_NOUN | sectionType=SECTION_TYPE? __ reservedName=ReservedSectionName) __? sectionParam=SectionParameter? __? (NL | EOF)?;

// ======== Entry Point ========
// RCL files start with imports and contain a single agent section
entry RclFile:
    (imports+=ImportStatement)*
    // // THE RULE BELOW MUST USE WS instead of __ or the grammar will not work
    // // This happens because Langium requires a WS terminal to be defined AND USED in indentation aware grammars
    // | EmptyLine* // Allow blank lines (with or without spaces) or lines with only spaces, after imports or before agent section
    (INDENT? __? NL DEDENT?)*
    agentSection=(Section);

  