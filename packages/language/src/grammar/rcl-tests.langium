// ======== Test Grammar Entry Point ========
// This grammar allows testing individual language constructs in isolation
// by permitting any section type at the root level, rather than requiring
// a full agent definition structure.

grammar RclTestLanguage

import "./core/ast-nodes";
import "./core/primitives";
import "./core/import";
import "./core/sections";
import "./data-types/collections";
import "./data-types/parameters";
import "./data-types/type-tag";
import "./core/embedded-code";
import "./specialized/flow-rules";
import "./specialized/messages";
import "./specialized/rich-cards";
import "./specialized/suggestions";
import "./specialized/shortcuts";
import "./specialized/configuration";

// ======== Test Entry Point ========
// For testing, allow any section at root level, with optional imports
entry RclTestFile:
    (imports+=ImportStatement | emptyLines+=EmptyLine | testSections+=TestSection)*;

// Allow any section type for isolated testing
TestSection:
    Section |
    SimpleValue |
    MultiLineString |
    Parameter |
    ParenthesesList |
    InlineList |
    IndentedList |
    BraceObject |
    IndentedObject |
    ConfigProperty |
    DefaultProperty |
    AgentMessage |
    ContentMessage |
    ComposeTextMessage |
    ComposeRecordingMessage |
    CardContent |
    ContentInfo |
    Media |
    MessageAttribute |
    RichCard |
    StandaloneCard |
    CarouselCard |
    CardSuggestion |
    CardAttribute |
    Suggestion |
    SuggestedReply |
    SuggestedAction |
    DialAction |
    OpenUrlAction |
    ShareLocationAction |
    ViewLocationAction |
    SaveEventAction |
    CreateCalendarEventAction |
    ActionType |
    SuggestionAttribute |
    SuggestionAttribute |
    TextShortcut |
    RichCardShortcut |
    ReplyShortcut |
    SuggestionShortcut |
    MessageShortcut |
    FileShortcut |
    FileAttribute |
    ShortcutAttribute
    ;