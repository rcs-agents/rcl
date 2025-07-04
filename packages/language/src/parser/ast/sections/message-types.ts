/**
 * Message System AST Types
 * 
 * Types for message definitions and content according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';
import type { MessageShortcut } from '../shortcuts/message-shortcut-types.js';

/**
 * Messages Section according to formal specification:
 * MessagesSection ::= 'messages' IDENTIFIER ':' INDENT MessageDefinition* DEDENT
 */
export interface MessagesSection extends AstNode {
  type: 'MessagesSection';
  name: string;
  messages: MessageDefinition[];
  location?: Location;
}

/**
 * Message Definition - can be either full definition or shortcut
 */
export interface MessageDefinition extends AstNode {
  type: 'MessageDefinition';
  name: string;
  content: AgentMessage | MessageShortcut;
  location?: Location;
}

/**
 * Full Agent Message according to RCS specification
 */
export interface AgentMessage extends AstNode {
  type: 'AgentMessage';
  contentMessage?: ContentMessage;
  suggestions?: Suggestion[];
  location?: Location;
}

/**
 * Content Message with different content types
 */
export interface ContentMessage extends AstNode {
  type: 'ContentMessage';
  text?: TextContent;
  richCard?: RichCardContent;
  carousel?: CarouselContent;
  rbmFile?: RbmFileContent;
  file?: FileContent;
  location?: Location;
}

/**
 * Text Content
 */
export interface TextContent extends AstNode {
  type: 'TextContent';
  text: string;
  location?: Location;
}

/**
 * Rich Card Content
 */
export interface RichCardContent extends AstNode {
  type: 'RichCardContent';
  title?: string;
  description?: string;
  media?: MediaContent;
  suggestions?: Suggestion[];
  location?: Location;
}

/**
 * Carousel Content
 */
export interface CarouselContent extends AstNode {
  type: 'CarouselContent';
  cards: RichCardContent[];
  cardWidth?: 'SMALL' | 'MEDIUM';
  location?: Location;
}

/**
 * RBM File Content
 */
export interface RbmFileContent extends AstNode {
  type: 'RbmFileContent';
  fileUrl: string;
  thumbnailUrl?: string;
  location?: Location;
}

/**
 * File Content
 */
export interface FileContent extends AstNode {
  type: 'FileContent';
  fileUrl: string;
  location?: Location;
}

/**
 * Media Content
 */
export interface MediaContent extends AstNode {
  type: 'MediaContent';
  height?: 'SHORT' | 'MEDIUM' | 'TALL';
  contentInfo: MediaContentInfo;
  location?: Location;
}

/**
 * Media Content Info
 */
export interface MediaContentInfo extends AstNode {
  type: 'MediaContentInfo';
  fileUrl: string;
  thumbnailUrl?: string;
  forceRefresh?: boolean;
  altText?: string;
  location?: Location;
}

/**
 * Suggestion
 */
export interface Suggestion extends AstNode {
  type: 'Suggestion';
  reply?: ReplyAction;
  action?: SuggestedAction;
  location?: Location;
}

/**
 * Reply Action
 */
export interface ReplyAction extends AstNode {
  type: 'ReplyAction';
  text: string;
  postbackData?: string;
  location?: Location;
}

/**
 * Suggested Action
 */
export interface SuggestedAction extends AstNode {
  type: 'SuggestedAction';
  text: string;
  action: ActionType;
  location?: Location;
}

/**
 * Action Types
 */
export type ActionType = 
  | DialAction 
  | OpenUrlAction 
  | ShareLocationAction 
  | ViewLocationAction 
  | CreateCalendarEventAction 
  | ComposeAction;

/**
 * Dial Action
 */
export interface DialAction extends AstNode {
  type: 'DialAction';
  phoneNumber: string;
  location?: Location;
}

/**
 * Open URL Action
 */
export interface OpenUrlAction extends AstNode {
  type: 'OpenUrlAction';
  url: string;
  location?: Location;
}

/**
 * Share Location Action
 */
export interface ShareLocationAction extends AstNode {
  type: 'ShareLocationAction';
  location?: Location;
}

/**
 * View Location Action
 */
export interface ViewLocationAction extends AstNode {
  type: 'ViewLocationAction';
  latLong?: LatLong;
  label?: string;
  location?: Location;
}

/**
 * Create Calendar Event Action
 */
export interface CreateCalendarEventAction extends AstNode {
  type: 'CreateCalendarEventAction';
  title: string;
  description: string;
  startTime: CalendarDateTime;
  endTime: CalendarDateTime;
  location?: Location;
}

/**
 * Compose Action
 */
export interface ComposeAction extends AstNode {
  type: 'ComposeAction';
  composeAction: ComposeActionType;
  location?: Location;
}

/**
 * Supporting types
 */
export interface LatLong {
  latitude: number;
  longitude: number;
}

export interface CalendarDateTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  utcOffset: string;
}

export interface ComposeActionType {
  type: string;
  [key: string]: any;
}