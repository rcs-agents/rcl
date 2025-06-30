// ======== Flow Rules Grammar ========
// This file contains flow control and transition rules

import "../core/primitives";
import "../data-types/parameters";
import "../specialized/embedded-code";
import "../specialized/strings";
import "../data-types/collections";

// ======== Data Type Rules ========
FlowOperand returns string: ATOM | PROPER_NOUN | STRING | NUMBER | SINGLE_LINE_EXPRESSION | MULTI_LINE_EXPRESSION_START | FlowTextAction | FlowStartAction;
FlowTextAction returns string: 'text' (STRING | MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL);
FlowStartAction returns string: 'start' PROPER_NOUN;

// ======== Parser Rules ========
// NOTE: Interfaces are defined in ast-nodes.langium
FlowContent returns FlowContent:
    rules+=FlowRule+;

FlowRule returns FlowRule:
    source=FlowOperand ('->' transitions+=FlowOperand)+
    (withClause=WithClause)?;

WithClause returns WithClause:
    'with' parameters+=Parameter (',' parameters+=Parameter)*;