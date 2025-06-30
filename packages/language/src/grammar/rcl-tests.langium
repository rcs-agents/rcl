grammar RclTestLanguage

// ======== Test Grammar Entry Point ========
// This grammar allows testing individual language constructs in isolation
// by permitting any section type at the root level, rather than requiring
// a full agent definition structure.

// Import all the same components as the main grammar
import "./core/ast-nodes";
import "./core/primitives";
import "./core/import";
import "./core/sections";
import "./data-types/collections";
import "./data-types/parameters";
import "./data-types/type-system";
import "./specialized/embedded-code";
import "./specialized/flow-rules";
import "./specialized/strings";
import "./specialized/messages";
import "./specialized/rich-cards";
import "./specialized/suggestions";
import "./specialized/shortcuts";
import "./specialized/configuration";
import "./expressions/expression-types";

hidden terminal SL_COMMENT: /\/\/[^\r\n]*/;

// ======== Test Entry Point ========
// For testing, allow any section at root level, with optional imports
entry RclTestFile:
    (imports+=ImportStatement | emptyLines+=EmptyLine | testSections+=TestSection)*;

// Define comment terminal for test files
terminal COMMENT: /\/\/[^\r\n]*/;

// Allow any section type for isolated testing
TestSection:
    Section |
    SimpleValue |
    MultiLineString |
    Parameter |
    ParenthesesList |
    InlineList |
    IndentedList |
    BraceObject |
    IndentedObject |
    ConfigProperty |
    DefaultProperty;

// NOTE: This enables testing of:
// - Individual sections (Config, Defaults, Messages, etc.)
// - Property assignments in isolation
// - Value types and expressions
// - Collections and parameters
// - Type conversions and complex structures 