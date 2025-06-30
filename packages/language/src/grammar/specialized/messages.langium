// ======== Message System Core ========
// This file contains message structures for agent communication

import "../core/primitives";
import "../data-types/collections";
import "../specialized/embedded-code";
import "../specialized/strings";

// NOTE: Using literal keywords instead of terminals per Langium best practices

// ======== Message Parser Rules ========
// NOTE: Using terminal-first design due to Langium limitations
// All message structures use only terminals and literals

AgentMessage returns AgentMessage:
    'agentMessage' identifier=PROPER_NOUN?
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

ContentMessage returns ContentMessage:
    'contentMessage'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

ComposeTextMessage returns ComposeTextMessage:
    'composeTextMessage'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

ComposeRecordingMessage returns ComposeRecordingMessage:
    'composeRecordingMessage'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Content Structures ========
// Card content
CardContent returns CardContent:
    'cardContent'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Content info
ContentInfo returns ContentInfo:
    'contentInfo'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Media
Media returns Media:
    'media'
    NL?
    INDENT
    (attributes+=MessageAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Message Attributes ========
// Message-specific attribute that can handle both common attributes and message content
MessageAttribute returns MessageAttribute:
    key=COMMON_NOUN ':' __ value=SimpleValue; 