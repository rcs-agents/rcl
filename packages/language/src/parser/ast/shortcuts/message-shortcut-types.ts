/**
 * Message Shortcut AST Types
 * 
 * Types for RCS message shortcuts according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';
import type { Suggestion } from '../sections/message-types.js';

export type MessageShortcut = 
  | TextShortcut 
  | RichCardShortcut 
  | CarouselShortcut 
  | RbmFileShortcut 
  | FileShortcut;

/**
 * Text Shortcut: text "message content"
 */
export interface TextShortcut extends AstNode {
  type: 'TextShortcut';
  text: string;
  messageTrafficType?: 'transactional' | 'promotional';
  suggestions?: Suggestion[];
  location?: Location;
}

/**
 * Rich Card Shortcut: richCard "title" :orientation :alignment :size <url>
 */
export interface RichCardShortcut extends AstNode {
  type: 'RichCardShortcut';
  title: string;
  orientation?: 'horizontal' | 'vertical';
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string;
  description?: string;
  suggestions?: Suggestion[];
  messageTrafficType?: 'transactional' | 'promotional';
  location?: Location;
}

/**
 * Carousel Shortcut: carousel :size
 */
export interface CarouselShortcut extends AstNode {
  type: 'CarouselShortcut';
  size?: 'small' | 'medium';
  cards: RichCardShortcut[];
  messageTrafficType?: 'transactional' | 'promotional';
  location?: Location;
}

/**
 * RBM File Shortcut: rbmFile <url>
 */
export interface RbmFileShortcut extends AstNode {
  type: 'RbmFileShortcut';
  fileUrl: string;
  thumbnailUrl?: string;
  messageTrafficType?: 'transactional' | 'promotional';
  location?: Location;
}

/**
 * File Shortcut: file <url>
 */
export interface FileShortcut extends AstNode {
  type: 'FileShortcut';
  fileUrl: string;
  messageTrafficType?: 'transactional' | 'promotional';
  location?: Location;
}