// ======== Defaults Schema Interfaces and Types ========
// This file contains defaults section interfaces and types

import "../data-types/primitives";
import "../specialized/embedded-code";

// ======== AST Interface Definitions ========
interface DefaultsDefinition {
    elements: DefaultsElement[];
}

interface ExpressionsDefinition {
    elements: ExpressionsElement[];
}

// ======== Individual Defaults Property Block Definitions ========

DefaultsElement:
    ('timezone' ':' timezone=ATOM)
    | ('currency' ':' currency=ATOM)
    | ('locale' ':' locale=ATOM)
    | ('authentication' ':' authentication=ATOM)
    | ('oauth' ':' oauth=ATOM)
    | ('webhook' ':' webhook=STRING)
    | expressions=ExpressionsDefinition;

ExpressionsElement:
    ('allowedLanguages' ':' allowedLanguages=ATOM)
    | ('suggestions' ':' suggestions=ATOM)
    | ('rich' ':' rich=ATOM)
    | ('templates' ':' templates=ATOM)
    | ('clientLib' ':' clientLib=ATOM);

ExpressionsDefinition returns ExpressionsDefinition:
    'expressions'
    INDENT
        (elements+=ExpressionsElement)+
    DEDENT;

DefaultsDefinition returns DefaultsDefinition:
    'defaults'
    INDENT
        (elements+=DefaultsElement)+
    DEDENT; 