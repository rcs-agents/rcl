/**
 * Base AST Types
 * 
 * Fundamental types used throughout the RCL AST.
 */

/**
 * Position information for AST nodes
 */
export interface Position {
  line: number;
  column: number;
  offset: number;
}

/**
 * Location span for AST nodes
 */
export interface Location {
  start: Position;
  end: Position;
}

/**
 * Base interface for all AST nodes
 */
export interface AstNode {
  type: string;
  location?: Location;
}