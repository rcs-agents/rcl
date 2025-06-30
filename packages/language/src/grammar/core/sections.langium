// ======== Core Section Infrastructure ========
// This file contains the base section grammar that all RCL sections follow

import "./ast-nodes";
import "../core/primitives";
import "../data-types/collections";
import "../specialized/flow-rules";
// import "../data-types/type-system";

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

// Reserved section names have implicit types and must be used with the correct section keyword.
ReservedSectionName returns string:
    'Config' | 'Defaults' | 'Messages';

// ======== Parser Rules ========
// NOTE: Interfaces are defined in ast-nodes.langium
// A Section is a fundamental building block of an RCL file.
// It can be a standard section with a user-defined name or a reserved section.
Section returns Section:
    (sectionType=SectionType __ name=PROPER_NOUN | sectionType=SectionType? name=ReservedSectionName)
    (NL)?
    (
        INDENT
        (
            attributes+=Attribute
            | subSections+=Section
            | flowContent+=FlowContent
            | emptyLines+=EmptyLine
        )*
        DEDENT
    )?;

// An Attribute is a simple key-value pair within a section.
Attribute returns Attribute:
    key=COMMON_NOUN ':' __ value=SimpleValue;

