// ======== RCS Shortcuts ========
// This file contains convenient message shortcuts for quick message creation

import "../core/primitives";
import "../data-types/collections";
import "../core/embedded-code";

// NOTE: Using literal keywords instead of terminals per Langium best practices

// ======== Shortcut Parser Rules ========
// Text shortcut: text "Hello world"
TextShortcut returns TextShortcut:
    'text' __ value=SimpleValue;

// Rich card shortcut: richCard "Card title" 
RichCardShortcut returns RichCardShortcut:
    'richCard' __ value=SimpleValue
    NL?
    (
        INDENT
        (attributes+=ShortcutAttribute | emptyLines+=EmptyLine)*
        DEDENT
    )?;

// Reply shortcut
ReplyShortcut returns ReplyShortcut:
    'replyShortcut' __ value=SimpleValue
    NL?
    (
        INDENT
        (attributes+=ShortcutAttribute | emptyLines+=EmptyLine)*
        DEDENT
    )?;

// Suggestion shortcut
SuggestionShortcut returns SuggestionShortcut:
    'suggestionShortcut' __ value=SimpleValue
    NL?
    (
        INDENT
        (attributes+=ShortcutAttribute | emptyLines+=EmptyLine)*
        DEDENT
    )?;

// Message shortcut
MessageShortcut returns MessageShortcut:
    'messageShortcut' __ value=SimpleValue
    NL?
    (
        INDENT
        (attributes+=ShortcutAttribute | emptyLines+=EmptyLine)*
        DEDENT
    )?;

// File shortcut with optional attributes
FileShortcut returns FileShortcut:
    'file'
    NL?
    (
        INDENT
        (attributes+=ShortcutAttribute | emptyLines+=EmptyLine)*
        DEDENT
    )?;

// ======== File Attributes ========
// File-specific attributes
FileAttribute returns FileAttribute:
    key=('filename' | 'thumbnailUrl' | 'fileUrl') ':' (__? | WS | NL)? value=SimpleValue
    | key=COMMON_NOUN ':' (__? | WS | NL)? value=SimpleValue;

// ======== Shortcut Attributes ========
// General shortcut attributes
ShortcutAttribute returns ShortcutAttribute:
    key=('filename' | 'thumbnailUrl' | 'fileUrl') ':' (__? | WS | NL)? value=SimpleValue
    | key=COMMON_NOUN ':' (__? | WS | NL)? value=SimpleValue; 