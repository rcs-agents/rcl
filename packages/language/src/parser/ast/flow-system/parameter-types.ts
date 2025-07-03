/**
 * Parameter System AST Types
 * 
 * Types for parameters and parameter lists in flow systems.
 */

import type { AstNode, Location } from '../core/base-types.js';
import type { Value } from '../values/literal-types.js';

/**
 * Parameter List
 */
export interface ParameterList extends AstNode {
  type: 'ParameterList';
  parameters: Parameter[];
  location?: Location;
}

/**
 * Parameter Definition
 */
export interface Parameter extends AstNode {
  type: 'Parameter';
  name: string;
  type?: string;
  defaultValue?: Value;
  isRequired?: boolean;
  location?: Location;
}