// ======== Agent Schema Interfaces and Types ========
// This file contains the core agent definition interfaces and types
// that map to the RCS agent specification

import "../data-types/primitives";
import "./config-schema";
import "./defaults-schema";
import "./flow-schema";
import "./message-schema";

// ======== AST Interface Definitions ========
interface AgentDefinition {
    name: ProperNoun;
    elements: AgentProperty[];
}

// ======== Main Agent Section Elements & Definition ========

AgentProperty:
    ('displayName' ':' description=STRING)
    | ('brandName' ':' brandName=STRING)
    | config=ConfigDefinition
    | defaults=DefaultsDefinition
    | flow=FlowDefinition
    | messages=MessagesDefinition;

AgentDefinition returns AgentDefinition:
    'agent' name=ProperNoun
    INDENT
        (elements+=AgentProperty)+
    DEDENT;
