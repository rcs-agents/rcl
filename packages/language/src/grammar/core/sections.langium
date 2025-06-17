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
    (sectionType=SectionType sectionName=SectionName | sectionType=SectionType? reservedName=ReservedSectionName) sectionParam=SectionParameter? (End | EOF)
    INDENT
        (attributes+=Attribute | nestedAttributes+=NestedBlockAttribute | subSections+=Section | flowContent+=FlowContent | emptyLines+=EmptyLine)*
    DEDENT;

SectionType returns string:
    'agent' | 'agentConfig' | 'agentDefaults' | 'flow' | 'messages' |
    MessageSectionType;

MessageSectionType returns string:
    'message' |
    'authentication' 'message' |
    'transaction' 'message' |
    'promotion' 'message' |
    'servicerequest' 'message' |
    'acknowledge' 'message';

SectionName returns string:
    ProperNoun; // Optional name for sections - MUST remain ProperNoun (allows spaces and hyphens)

// Reserved section names that have implicit types
ReservedSectionName returns string:
    'Config' | 'Defaults' | 'Messages';

SectionParameter:
    // Only for message sections - expiration parameter
    TypedValue; // Either timestamp or duration string

Attribute:
    key=COMMON_NOUN ':' value=(Value | NestedBlockAttribute) (End | EOF);

// Attribute with a nested block of attributes (e.g., 'expressions')
NestedBlockAttribute:
    key=COMMON_NOUN (End | EOF)
    INDENT
        (attributes+=Attribute)+
    DEDENT;// Rule to handle empty lines within indented blocks
EmptyLine returns string:
    End;

