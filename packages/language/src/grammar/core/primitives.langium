// ======== Basic Primitive Types and Terminals ========
// This file contains basic primitive types and literals


// ======== Hidden Terminals ========
hidden terminal SL_COMMENT: /#[^\r\n]*/;
terminal WS: /[ \t]+/;

// ==== Required space ====
// This is intentionally not hidden, as it's used explicitly in some parser rules.
terminal __: /[ ]+/;

// ======== Core Pattern Terminals ========
terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
terminal NL: /[\r\n]+/;

terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';

// ======== Boolean/Null Pattern Terminals ========
terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;
terminal NULL_KW: /\b(Null|None|Void)\b/;

// ======== Special Value Pattern Terminals ========
// terminal CARD_HEIGHT: /\b(SHORT|MEDIUM|TALL)\b/;
// terminal CARD_ORIENTATION: /\b(HORIZONTAL|VERTICAL)\b/;

// ======== Identifier Terminals ========
terminal PROPER_NOUN: /[A-Z0-9][a-zA-Z0-9-]*(?:\s+[A-Z0-9][a-zA-Z0-9-]*)*/;

terminal COMMON_NOUN: /(?!import\b|as\b|agent\b|agentConfig\b|agentDefaults\b|flow\b|messages\b|authentication\b|transaction\b|promotion\b|servicerequest\b|acknowledge\b|message\b|or\b|and\b|is\b|not\b|date\b|datetime\b|time\b|email\b|phone\b|msisdn\b|url\b|zipcode\b|zip\b|True\b|On\b|Yes\b|Active\b|Enabled\b|False\b|Off\b|No\b|Inactive\b|Disabled\b|Null\b|None\b|Void\b|list\b|of\b|with\b|start\b|text\b|reply\b|dial\b|openUrl\b|shareLocation\b|viewLocation\b|saveEvent\b|richCard\b|carousel\b|rbmFile\b|file\b|displayName\b|brandName\b|Config\b|Defaults\b|Messages\b|agentMessage\b|contentMessage\b|composeTextMessage\b|composeRecordingMessage\b|cardContent\b|contentInfo\b|media\b|standaloneCard\b|carouselCard\b|cardSuggestion\b|title\b|description\b|thumbnail\b|height\b|orientation\b|suggestion\b|suggestedReply\b|suggestedAction\b|action\b|createCalendarEvent\b|replyShortcut\b|suggestionShortcut\b|messageShortcut\b|filename\b|thumbnailUrl\b|fileUrl\b|logoUri\b|heroUri\b|color\b|agentUseCase\b|hostingRegion\b|phoneNumberEntry\b|emailEntry\b|websiteEntry\b|privacy\b|termsConditions\b|billingConfig\b|billingCategory\b|number\b|address\b|url\b|label\b|fallback_message\b|messageTrafficType\b|ttl\b|postbackData\b|expressions\b|language\b)[a-z][a-zA-Z0-9_]*/;

// ======== Primitive Parser Rules ========
BooleanLiteral returns string: TRUE_KW | FALSE_KW;

NullLiteral returns string:
    NULL_KW;

EmptyLine returns string: __* NL;


// ======== Multi-line String Handling ========

// These markers must be followed by a newline to trigger a multi-line block.
terminal MULTILINE_STR_CLEAN: /\|(?=\s*#|\s*[\r\n])/;            // |
terminal MULTILINE_STR_TRIM: /\|-(?=\s*#|\s*[\r\n])/;            // |-
terminal MULTILINE_STR_PRESERVE: /\+\|(?=\s*#|\s*[\r\n])/;       // +|
terminal MULTILINE_STR_PRESERVE_ALL: /\+\|\+(?=\s*#|\s*[\r\n])/; // +|+

// ======== Parser Rules ========
// A multi-line string with various whitespace handling modes.
MultiLineString returns MultiLineString:
    marker=(MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
    has_block_content='true';
