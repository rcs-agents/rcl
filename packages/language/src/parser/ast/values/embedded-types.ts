/**
 * Embedded Expression AST Types
 * 
 * Types for embedded JavaScript/TypeScript expressions in RCL.
 */

import type { AstNode, Location } from '../core/base-types.js';

/**
 * Single-line embedded expression: $js> code, $ts> code, $> code
 */
export interface EmbeddedExpression extends AstNode {
  type: 'EmbeddedExpression';
  language: 'js' | 'ts';
  content: string;
  isMultiline: false;
  location?: Location;
}

/**
 * Multi-line embedded expression block (fixed per specification):
 * $js>>>
 *   code here
 *   more code
 */
export interface EmbeddedCodeBlock extends AstNode {
  type: 'EmbeddedCodeBlock';
  language: 'js' | 'ts';
  content: string[];  // Array of lines
  isMultiline: true;
  location?: Location;
}