// ======== Embedded Code Support ========
// This file contains support for embedded code expressions

import "./ast-nodes";
import "./primitives"; // For basic terminals and types

// ======== Embedded Code Terminals ========
terminal EMBEDDED_CODE_START: /\$((js|ts)?)/;
terminal CODE_LINE: /(?:>\s)\s*[^\r\n]*/;
// Code blocks require a newline after the start marker
terminal CODE_BLOCK_START: />>>[\s\r\n]+/;

// ======== Embedded Expression Interface ========
EmbeddedCodeBlock returns EmbeddedCodeBlock:
    CODE_BLOCK_START 
    INDENT
    content+=(CODE_LINE | EmptyLine)*
    DEDENT;

// $js> ABCD ASDF eWE
// $ts> ABCD ASDF eWE
// ======== Parser Rules ========
EmbeddedCodeExpression returns EmbeddedCodeExpression:
    EMBEDDED_CODE_START content=CODE_LINE;

