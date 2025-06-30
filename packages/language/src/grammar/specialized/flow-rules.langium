// ======== Flow Rules Grammar ========
// This file contains flow control and transition rules

import "../core/primitives";
import "../core/embedded-code";
import "../data-types/collections";

import "../data-types/parameters";

// ======== Parser Rules ========
// NOTE: Interfaces are defined in ast-nodes.langium
FlowContent returns FlowContent:
    rules+=FlowRule+;

FlowRule returns FlowRule:
    source=(ATOM | PROPER_NOUN | STRING) '->' (
      destinationIsFlow?='start' destination=[AbstractNamedSection:PROPER_NOUN] (withClause=WithClause)?
      | code=(EmbeddedCodeExpression | EmbeddedCodeBlock)
      | rules+=FlowRule
    );

WithClause returns WithClause:
    'with' parameters+=Parameter (',' parameters+=Parameter)*;
