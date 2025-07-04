/**
 * Literal Value AST Types
 * 
 * Types for basic literal values in RCL.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';

export type Value = 
  | StringValue 
  | NumberValue 
  | BooleanValue 
  | NullValue 
  | IdentifierValue
  | AtomValue;

/**
 * String literal value
 */
export interface StringValue extends AstNode {
  type: 'StringValue';
  value: string;
  isMultiline?: boolean;
  chompingMarker?: 'clean' | 'trim' | 'preserve' | 'preserve_all';
  location?: Location;
}

/**
 * Number literal value
 */
export interface NumberValue extends AstNode {
  type: 'NumberValue';
  value: number;
  location?: Location;
}

/**
 * Boolean literal value
 */
export interface BooleanValue extends AstNode {
  type: 'BooleanValue';
  value: boolean;
  location?: Location;
}

/**
 * Null literal value
 */
export interface NullValue extends AstNode {
  type: 'NullValue';
  location?: Location;
}

/**
 * Identifier value (including space-separated identifiers)
 */
export interface IdentifierValue extends AstNode {
  type: 'IdentifierValue';
  value: string;
  isSpaceSeparated: boolean;
  location?: Location;
}

/**
 * Atom value (prefixed with :)
 */
export interface AtomValue extends AstNode {
  type: 'AtomValue';
  value: string;
  location?: Location;
}