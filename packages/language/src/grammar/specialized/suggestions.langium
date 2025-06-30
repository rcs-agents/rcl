// ======== Suggestion System Grammar ========
// This file implements the complete suggestion and action structures for interactive elements

import "../core/ast-nodes";
import "../core/primitives";
import "../data-types/collections";
import "../core/embedded-code";

// NOTE: Using literal keywords instead of terminals per Langium best practices

// ======== Suggestion Parser Rules ========
// NOTE: Using terminal-first design due to Langium limitations
// All suggestion structures use only terminals and literals

Suggestion returns Suggestion:
    'suggestion'
    NL?
    INDENT
    (replyType=SuggestedReply | actionType=SuggestedAction)
    DEDENT;

SuggestedReply returns SuggestedReply:
    'reply' __ 'suggestedReply'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

SuggestedAction returns SuggestedAction:
    'action' __ 'suggestedAction'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | actions+=ActionType | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Action Types ========
// Dial action
DialAction returns DialAction:
    'dial'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Open URL action
OpenUrlAction returns OpenUrlAction:
    'openUrl'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Share location action
ShareLocationAction returns ShareLocationAction:
    'shareLocation'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// View location action
ViewLocationAction returns ViewLocationAction:
    'viewLocation'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Save event action
SaveEventAction returns SaveEventAction:
    'saveEvent'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// Create calendar event action
CreateCalendarEventAction returns CreateCalendarEventAction:
    'createCalendarEvent'
    NL?
    INDENT
    (attributes+=SuggestionAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Action Type Union ========
ActionType returns ActionType:
    DialAction | OpenUrlAction | ShareLocationAction | ViewLocationAction | SaveEventAction | CreateCalendarEventAction;

// ======== Suggestion Attributes ========
// Suggestion-specific attributes
SuggestionAttribute returns SuggestionAttribute:
    key=COMMON_NOUN ':' (__* | NL)? value=SimpleValue;
