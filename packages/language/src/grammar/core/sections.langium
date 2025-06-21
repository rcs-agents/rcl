// ======== Core Section Infrastructure ========
// This file contains the base section grammar that all RCL sections follow

import "../data-types/primitives";
import "../data-types/type-system";
import "../data-types/collections";
import "../specialized/flow-rules";

// ======== Core Section Grammar ========

// Base section structure - unified for all sections
// Supports both explicit section types and implicit reserved section names
Section:
    (sectionType=SectionType __ sectionName=SectionName | sectionType=SectionType? __ reservedName=ReservedSectionName) __? sectionParam=SectionParameter? __? (End | EOF)
    INDENT
        (attributes+=Attribute | nestedAttributes+=NestedBlockAttribute | subSections+=Section | flowContent+=FlowContent | emptyLines+=EmptyLine)*
    DEDENT;

terminal SECTION_TYPE: /\b(agent|agentConfig|agentDefaults|flow|messages|message)\b/;

terminal MessageSectionType returns string:
    /\b(authentication|transaction|promotion|servicerequest|acknowledge) message\b/;

SectionType returns string:
    SECTION_TYPE |
    MessageSectionType;


SectionName returns string:
    ProperNoun; // Optional name for sections - MUST remain ProperNoun (allows spaces and hyphens)

// Reserved section names that have implicit types
ReservedSectionName returns string:
    'Config' | 'Defaults' | 'Messages';

SectionParameter:
    // Only for message sections - expiration parameter
    TypedValue; // Either timestamp or duration string

Attribute:
    key=COMMON_NOUN __? ':' __? value=(Value | NestedBlockAttribute) __? (End | EOF);

// Attribute with a nested block of attributes (e.g., 'expressions')
NestedBlockAttribute:
    key=COMMON_NOUN __? (End | EOF)
    INDENT
        (attributes+=Attribute)+
    DEDENT;// Rule to handle empty lines within indented blocks
EmptyLine returns string:
    End;

