// ======== Core Section Infrastructure ========
// This file contains the base section grammar that all RCL sections follow

import "./ast-nodes";
import "../core/primitives";
import "../data-types/collections";
import "../specialized/flow-rules";
import "../specialized/configuration";

// ======== Agent Definition Rule ========
// AgentDefinition follows the formal specification:
// AgentDefinition ::= 'agent' IDENTIFIER INDENT
//   ('displayName' ':' STRING)
//   ('brandName' ':' STRING)?
//   (ConfigSection)?
//   (DefaultsSection)?
//   (FlowSection)+
//   MessagesSection
//   DEDENT
AgentDefinition returns AgentDefinition:
    'agent' name=IDENTIFIER ':'
    NL? INDENT
    'displayName' ':' displayName=STRING NL?
    ('brandName' ':' brandName=STRING NL?)?
    (config=ConfigSection)?
    (defaults=DefaultsSection)?
    (flows+=FlowSection)+
    messages=MessagesSection
    DEDENT;

// Config section: 'agentConfig' 'Config' ':' ...
ConfigSection returns ConfigSection:
    'agentConfig' name=IDENTIFIER ':'
    NL? INDENT
    attributes+=Attribute*
    DEDENT;

// Defaults section: 'agentDefaults' 'Defaults' ':' ...
DefaultsSection returns DefaultsSection:
    'agentDefaults' name=IDENTIFIER ':'
    NL? INDENT
    attributes+=Attribute*
    DEDENT;

// Flow section: 'flow' IDENTIFIER ':' ...
FlowSection returns FlowSection:
    'flow' name=IDENTIFIER ':'
    NL? INDENT
    rules+=FlowRule*
    DEDENT;

// Messages section: 'messages' IDENTIFIER ':' ...
MessagesSection returns MessagesSection:
    'messages' name=IDENTIFIER ':'
    NL? INDENT
    messages+=MessageDefinition*
    DEDENT;

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

