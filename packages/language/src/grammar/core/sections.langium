// ======== Core Section Infrastructure ========
// This file contains the base section grammar that all RCL sections follow

import "./ast-nodes";
import "../core/primitives";
import "../data-types/collections";
import "../specialized/flow-rules";
import "../specialized/configuration";

// ======== Data Type Rules ========
// SectionType defines the valid keywords that can start a section block.
SectionType returns string:
  AGENT_KW
  | AGENT_CONFIG_KW
  | AGENT_DEFAULTS_KW
  | FLOW_KW
  | FLOWS_KW
  | MESSAGES_KW;

// ======== Section Content Rules ========
// Section is the main section rule that matches all section types.
// It handles both explicit type declarations and name declarations.
Section returns Section:
    sectionType=SectionType (name=IDENTIFIER)? ':'
    NL?
    INDENT?
    (
        attributes+=Attribute 
        | subSections+=Section
        | flowRules+=FlowRule
        | messages+=MessageDefinition
        | emptyLines+=EmptyLine
    )*
    DEDENT?;

// ======== Attribute System ========
// The attribute system provides key-value properties for sections

// Attribute represents a general key-value pair for any section
Attribute returns Attribute:
    key=ATTRIBUTE_KEY ':' (__? | WS)? value=Value;

// Message definition in messages sections
MessageDefinition returns MessageDefinition:
    name=IDENTIFIER ':' NL?
    INDENT?
    attributes+=Attribute*
    DEDENT?;

