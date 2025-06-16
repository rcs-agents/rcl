// ======== Flow Schema Interfaces and Types ========
// This file contains flow system interfaces and types
// Custom RCL flow concepts

import "../data-types/primitives";
import "../expressions/expression-types";

// ======== AST Interface Definitions ========
interface FlowDefinition {
    name: ProperNoun;
    elements: FlowRule[];
}

interface FlowRule {
    from: StateReference;
    to: StateReference;
}

interface AtomStateReference {
    value: string;
}

interface NameStateReference {
    value: string;
}

interface NextStateInput {
    input: StateInputParameter[];
}

interface StateInputParameter {
    name: string;
    value: RclExpression;
}

// ======== Flow Rule Definitions ========

FlowRule returns FlowRule:
    from=StateReference '->' to=StateReference;

StateReference:
    {AtomStateReference} value=ATOM | {NameStateReference} value=COMMON_NOUN;

StateInputParameter returns StateInputParameter:
    name=COMMON_NOUN ':' value=RclExpression;

NextStateInput returns NextStateInput:
    'inputs'
    INDENT
        (input+=StateInputParameter)+
    DEDENT;

FlowDefinition returns FlowDefinition:
    'flow' name=ProperNoun
    INDENT
        (elements+=FlowRule)+
    DEDENT; 