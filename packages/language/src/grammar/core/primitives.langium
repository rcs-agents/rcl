// ======== Basic Primitive Types and Terminals ========
// This file contains basic primitive types and literals


// ======== Hidden Terminals ========
hidden terminal SL_COMMENT: /#[^\r\n]*/;
hidden terminal WS: /[ \t]+/;

// ==== Required space ====
// This is intentionally not hidden, as it's used explicitly in some parser rules.
terminal __: /[ ]+/;

// ======== Core Terminals ========
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
terminal NL: /[\r\n]+/;

// ======== Indentation Terminals ========
// These terminals are REQUIRED by Langium for indentation-aware parsing
terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';

// ======== Boolean and Null Keywords ========
terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;
terminal NULL_KW: /\b(Null|None|Void)\b/;

// ======== Identifiers ========
// Title/Proper Noun: Starts with an uppercase letter, allows spaces between words.
terminal PROPER_NOUN: /[A-Z][a-zA-Z0-9-]*(?:\s+[A-Z0-9][a-zA-Z0-9-]*)*\b/;

// Common Noun/Attribute Key: Starts with a lowercase letter.
// Excludes all known keywords to prevent ambiguity.
terminal COMMON_NOUN: /(?!import\b|as\b|agent\b|agentConfig\b|agentDefaults\b|flow\b|messages\b|authentication\b|transaction\b|promotion\b|servicerequest\b|acknowledge\b|message\b|or\b|and\b|is\b|not\b|date\b|datetime\b|time\b|email\b|phone\b|msisdn\b|url\b|zipcode\b|zip\b|True\b|On\b|Yes\b|Active\b|Enabled\b|False\b|Off\b|No\b|Inactive\b|Disabled\b|Null\b|None\b|Void\b|list\b|of\b|with\b|start\b|text\b|reply\b|dial\b|openUrl\b|shareLocation\b|viewLocation\b|saveEvent\b|richCard\b|carousel\b|rbmFile\b|file\b)[a-z][a-zA-Z0-9_]*/;

// ======== Data Type Rules ========
// These are datatype rules that return primitive values
EmptyLine returns string: __* NL;
ImportPath returns string: PROPER_NOUN ('/' PROPER_NOUN)*;
