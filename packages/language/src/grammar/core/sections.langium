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
  'agent'
  | 'agentConfig'
  | 'agentDefaults'
  | 'flow'
  | 'messages'
  | ((
      'authentication'
      | 'transaction'
      | 'promotion'
      | 'servicerequest'
      | 'acknowledge'
    ) __ 'message');

// ======== Section Content Rules ========
// Section is the main section rule that matches all section types.
// It handles both explicit type declarations and implicit reserved names.
Section returns Section:
    (type=SectionType)? name=PROPER_NOUN
    NL?
    INDENT
    (
        attributes+=Attribute 
        | agentAttributes+=AgentAttribute
        | configProperties+=ConfigProperty
        | defaultProperties+=DefaultProperty
        | subSections+=Section
        | flowContent+=FlowContent 
        | emptyLines+=EmptyLine
    )*
    DEDENT;

// ======== Attribute System ========
// The attribute system provides key-value properties for sections

// Attribute represents a general key-value pair for any section
Attribute returns Attribute:
    key=COMMON_NOUN ':' (__? | WS | NL)? value=SimpleValue;

// Agent-specific attributes (for agent sections only)
AgentAttribute returns AgentAttribute:
    key=('displayName' | 'brandName') ':' __? value=SimpleValue
    | key=COMMON_NOUN ':' __? value=SimpleValue;

