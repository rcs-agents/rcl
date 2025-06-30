// ======== Embedded Code Support ========
// This file contains support for embedded code expressions

import "../core/primitives"; // For basic terminals and types

// ======== Embedded Code Terminals ========
terminal SINGLE_LINE_EXPRESSION: /\$((js|ts)?>)\s*[^\r\n]*/;
terminal MULTI_LINE_EXPRESSION_START: /\$((js|ts)?)>>>/;

// ======== Embedded Expression Interface ========
interface SingleLineEmbeddedExpression {
    content: string;
}

// ======== Parser Rules ========
SingleLineEmbeddedExpression returns SingleLineEmbeddedExpression:
    content=SINGLE_LINE_EXPRESSION;