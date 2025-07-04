/**
 * Flow System AST Types
 * 
 * Types for flow definitions and flow rules according to the formal specification.
 */

import type { AstNode, Location } from '../core/base-types.js';
import type { FlowOperand, WithClause, WhenClause } from '../flow-system/flow-control-types.js';

// Re-export FlowTransition for external use
export type { FlowTransition } from '../flow-system/flow-control-types.js';

/**
 * Flow Section according to formal specification:
 * FlowSection ::= 'flow' IDENTIFIER ':' INDENT FlowRule* DEDENT
 */
export interface FlowSection extends AstNode {
  type: 'FlowSection';
  name: string;
  rules: FlowRule[];
  location?: Location;
}

/**
 * Flow Rule according to formal specification:
 * FlowRule ::= FlowOperandOrExpression ('->' FlowOperandOrExpression)+ (WithClause)?
 */
export interface FlowRule extends AstNode {
  type: 'FlowRule';
  operands: FlowOperand[];     // Source and destination(s) in sequence
  withClause?: WithClause;     // Optional parameter passing
  whenClauses?: WhenClause[];  // Optional conditional rules
  location?: Location;
}

// FlowTransition is imported from flow-control-types.js