// ======== Flow Rules Grammar ========
// This file contains grammar rules for flow definitions

import "../data-types/primitives";
import "../expressions/expression-types";

// ======== Flow Rule Grammar ========

// Flow content that can appear inside flow sections
FlowContent infers FlowContent:
    FlowRule;

// A flow rule like ":start -> Welcome" or "checkUser -> when condition -> result"
// Enhanced to be more specific about what constitutes flow operands
FlowRule infers FlowRule:
    source=FlowOperand __ '->' __ target=FlowOperand __? (End | EOF);

// Flow operands can be symbols, proper nouns (variables), common nouns (attributes), or strings
// This provides better semantic distinction for syntax highlighting
FlowOperand infers FlowOperand:
    symbol=ATOM                    // Flow symbols like :start, :end
    | variable=ProperNoun          // Flow variables (proper nouns) 
    | attribute=COMMON_NOUN        // Flow attributes (common nouns)
    | string=STRING;               // String literals