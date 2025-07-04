/**
 * Collection AST Types
 * 
 * Types for lists, dictionaries, and mapped types in RCL.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';
import type { Value } from './literal-types.js';

/**
 * List Value
 */
export interface ListValue extends AstNode {
  type: 'ListValue';
  items: Value[];
  isInline: boolean;  // true for (item1, item2), false for block lists
  location?: Location;
}

/**
 * Dictionary Value
 */
export interface DictionaryValue extends AstNode {
  type: 'DictionaryValue';
  entries: DictionaryEntry[];
  isInline: boolean;  // true for {key: value}, false for block dictionaries
  location?: Location;
}

/**
 * Dictionary Entry
 */
export interface DictionaryEntry extends AstNode {
  type: 'DictionaryEntry';
  key: string;
  value: Value;
  location?: Location;
}

/**
 * Mapped Type according to specification:
 * MappedType ::= IDENTIFIER 'list' 'of' '(' TypeList ')'
 */
export interface MappedType extends AstNode {
  type: 'MappedType';
  name: string;
  elementTypes: string[];  // Types in the tuple
  items: MappedTypeItem[];
  location?: Location;
}

/**
 * Mapped Type Item
 */
export interface MappedTypeItem extends AstNode {
  type: 'MappedTypeItem';
  values: Value[];  // Values corresponding to the element types
  location?: Location;
}