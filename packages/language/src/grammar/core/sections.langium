// ======== Core Section Infrastructure ========
// This file contains the base section grammar that all RCL sections follow

import "./primitives";
// import "../data-types/type-system";
// import "../data-types/collections";
// import "../specialized/flow-rules";

// ======== Core Section Grammar ========
// terminal SECTION_TYPE: /\b(agent|agentConfig|agentDefaults|flow|messages|(authentication|transaction|promotion|servicerequest|acknowledge) message)\b/;
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
    )
    __ 'message');

// Reserved section names that have implicit types
ReservedSectionName returns string:
    'Config' | 'Defaults' | 'Messages';


// Base section structure - unified for all sections
// Supports both explicit section types and implicit reserved section names
Section:
    (sectionType=SectionType __ sectionName=PROPER_NOUN | sectionType=SectionType? __ reservedName=ReservedSectionName) __? sectionParam=LiteralValue? __? (NL | EOF)
    // INDENT
    //     (attributes+=Attribute | nestedAttributes+=NestedBlockAttribute | subSections+=Section | flowContent+=FlowContent | emptyLines+=EmptyLine)*
    ;

// AgentSection:
//     'agent' __ sectionName=PROPER_NOUN __? sectionParam=SectionParameter? __? (NL | EOF)
//     INDENT
//         (attributes+=Attribute | nestedAttributes+=NestedBlockAttribute | subSections+=Section | flowContent+=FlowContent | emptyLines+=EmptyLine)*
//     DEDENT;


Attribute:
    key=COMMON_NOUN __? ':' __? value=(LiteralValue | NestedBlockAttribute) __? (NL | EOF);

// Attribute with a nested block of attributes (e.g., 'expressions')
NestedBlockAttribute:
    key=COMMON_NOUN __? (NL | EOF)
    INDENT
        (attributes+=Attribute)+
    DEDENT;// Rule to handle empty lines within indented blocks

