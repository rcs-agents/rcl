/**
 * Type Tag AST Types
 * 
 * Types for type tag constructs like <email user@domain.com>
 */

import type { AstNode, Location } from '../core/base-types.js';

/**
 * Type Tag according to formal specification:
 * TypeTag ::= '<' TYPE_TAG_NAME TypeTagValue ('|' TYPE_TAG_MODIFIER_CONTENT)? '>'
 */
export interface TypeTag extends AstNode {
  type: 'TypeTag';
  typeName: string;
  value: string;
  modifier?: string;
  location?: Location;
}

/**
 * Typed Value - a regular value with an associated type tag
 */
export interface TypedValue extends AstNode {
  type: 'TypedValue';
  typeTag: TypeTag;
  location?: Location;
}