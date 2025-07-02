// ======== Flow Rules Grammar ========
// This file contains flow control and transition rules

import "../core/primitives";
import "../core/embedded-code";
import "../data-types/collections";

import "../data-types/parameters";

// ======== Parser Rules ========
// NOTE: Interfaces are defined in ast-nodes.langium

// Flow rule can be a named rule or a direct transition
FlowRule returns FlowRule:
    name=IDENTIFIER ':' NL?
    INDENT?
    (
        attributes+=Attribute
        | nestedRules+=FlowRule
        | transitions+=FlowTransition
        | whenClauses+=WhenClause
    )*
    DEDENT?;

// Flow transition: source -> destination
FlowTransition returns FlowTransition:
    source=FlowOperand '->' destination=FlowOperand (withClause=WithClause)?;

// Flow operand can be atom, string, or identifier
FlowOperand returns FlowOperand:
    ATOM | STRING | IDENTIFIER;

// When clause for conditional flow rules
WhenClause returns WhenClause:
    WHEN_KW condition=EmbeddedExpression NL?
    INDENT?
    transitions+=FlowTransition*
    DEDENT?;

WithClause returns WithClause:
    WITH_KW NL?
    INDENT?
    parameters+=Parameter*
    DEDENT?;
