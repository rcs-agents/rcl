/**
 * Suggestion Shortcut AST Types
 * 
 * Types for suggestion shortcuts according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';

export type SuggestionShortcut = 
  | ReplyShortcut 
  | DialShortcut 
  | OpenUrlShortcut 
  | ShareLocationShortcut 
  | ViewLocationShortcut 
  | SaveEventShortcut;

/**
 * Reply Shortcut: reply "text"
 */
export interface ReplyShortcut extends AstNode {
  type: 'ReplyShortcut';
  text: string;
  postbackData?: string;
  location?: Location;
}

/**
 * Dial Shortcut: dial "text" <phone>
 */
export interface DialShortcut extends AstNode {
  type: 'DialShortcut';
  text: string;
  phoneNumber: string;
  location?: Location;
}

/**
 * Open URL Shortcut: openUrl "text" <url>
 */
export interface OpenUrlShortcut extends AstNode {
  type: 'OpenUrlShortcut';
  text: string;
  url: string;
  location?: Location;
}

/**
 * Share Location Shortcut: shareLocation "text"
 */
export interface ShareLocationShortcut extends AstNode {
  type: 'ShareLocationShortcut';
  text: string;
  location?: Location;
}

/**
 * View Location Shortcut: viewLocation "text" <coordinate>
 */
export interface ViewLocationShortcut extends AstNode {
  type: 'ViewLocationShortcut';
  text: string;
  latitude?: number;
  longitude?: number;
  label?: string;
  location?: Location;
}

/**
 * Save Event Shortcut: saveEvent "text"
 */
export interface SaveEventShortcut extends AstNode {
  type: 'SaveEventShortcut';
  text: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: Location;
}