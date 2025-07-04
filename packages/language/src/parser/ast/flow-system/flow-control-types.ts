/**
 * Flow Control AST Types
 * 
 * Types for flow control constructs according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';
import type { EmbeddedExpression } from '../values/embedded-types.js';
import type { Parameter } from './parameter-types.js';

/**
 * Flow Operand according to specification
 */
export interface FlowOperand extends AstNode {
  type: 'FlowOperand';
  operandType: 'atom' | 'string' | 'identifier';
  value: string;
  location?: Location;
}

/**
 * With Clause for parameter passing
 */
export interface WithClause extends AstNode {
  type: 'WithClause';
  parameters: Parameter[];
  location?: Location;
}

/**
 * When Clause for conditional flow rules
 */
export interface WhenClause extends AstNode {
  type: 'WhenClause';
  condition: EmbeddedExpression;
  transitions: FlowTransition[];
  location?: Location;
}

/**
 * Flow Transition (used in when clauses and rule definitions)
 */
export interface FlowTransition extends AstNode {
  type: 'FlowTransition';
  source: FlowOperand;
  destination: FlowOperand;
  withClause?: WithClause;
  location?: Location;
}

// Parameter is imported from parameter-types.js