// ======== Flow Rules Grammar ========
// This file contains grammar rules for flow definitions

import "../data-types/primitives";
import "../expressions/expression-types";

// ======== Flow Rule Grammar ========

// Flow content that can appear inside flow sections
FlowContent infers FlowContent:
    FlowRule;

// A flow rule like ":start -> Welcome" or "checkUser -> when condition -> result"
FlowRule infers FlowRule:
    source=FlowOperand '->' target=FlowOperand (End | EOF);

// Flow operands can be symbols, identifiers, or strings
FlowOperand infers FlowOperand:
    symbol=ATOM | identifier=Identifier | string=STRING;