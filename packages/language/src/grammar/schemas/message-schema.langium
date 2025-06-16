// ======== Message Schema Interfaces and Types ========
// This file contains message interfaces and types
// that map to the RCS agent message specification

import "../data-types/primitives";
import "../data-types/type-system";
import "../data-types/collections";

// ======== AST Interface Definitions ========
interface MessagesDefinition {
    elements: MessagesElement[];
}

interface ContentMessageDefinition {
    elements: ContentMessageElement[];
}

interface AgentMessageDefinition {
    messageName?: ProperNoun;
    elements: AgentMessageElement[];
}

interface UploadedRbmFile {
    fileName: string;
}

interface ContentInfo {
    forceRefresh?: boolean;
}

interface MediaDefinition {
    contentUrl: string;
    thumbnailUrl?: string;
}

// ======== Individual Message Property Block Definitions ========

MessagesElement:
    contentMessage=ContentMessageDefinition
    | agentMessage=AgentMessageDefinition;

ContentMessageElement:
    ('text' ':' text=STRING)
    | ('files' files=List)
    | contentInfo=ContentInfoDefinition;

AgentMessageElement:
    ('text' ':' text=STRING)
    | ('files' files=List)
    | contentInfo=ContentInfoDefinition;

// ======== File and Media Definitions ========

UploadedRbmFileDefinition returns UploadedRbmFile:
    'file'
    INDENT
        ('fileName' ':' fileName=STRING)
    DEDENT;

MediaDefinition returns MediaDefinition:
    'media'
    INDENT
        ('contentUrl' ':' contentUrl=STRING)
        ('thumbnailUrl' ':' thumbnailUrl=STRING)?
    DEDENT;

// ======== Content Info Block ========

ContentInfoDefinition returns ContentInfo:
    'contentInfo'
    INDENT
        ('forceRefresh' ':' forceRefresh?=('true' | 'false'))?
    DEDENT;

// ======== Main Message Section Definitions ========

ContentMessageDefinition returns ContentMessageDefinition:
    'contentMessage'
    INDENT
        (elements+=ContentMessageElement)+
    DEDENT;

AgentMessageDefinition returns AgentMessageDefinition:
    'message' messageName=ProperNoun
    INDENT
        (elements+=AgentMessageElement)+
    DEDENT;

MessagesDefinition returns MessagesDefinition:
    'messages'
    INDENT
        (elements+=MessagesElement)+
    DEDENT; 