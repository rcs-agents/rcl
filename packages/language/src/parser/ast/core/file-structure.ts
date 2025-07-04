/**
 * File Structure AST Types
 * 
 * Types for the top-level RCL file structure according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from './base-types.js';
import type { AgentDefinition } from '../sections/agent-types.js';

/**
 * RCL File AST node according to formal specification:
 * RclFile ::= (ImportStatement)* AgentDefinition
 */
export interface RclFile extends AstNode {
  type: 'RclFile';
  imports: ImportStatement[];
  agentSection: AgentDefinition | null;
}

/**
 * Import Statement according to formal specification:
 * ImportStatement ::= 'import' ImportPath ('as' IDENTIFIER)? ('from' STRING)?
 * ImportPath ::= IDENTIFIER ('/' IDENTIFIER)*
 */
export interface ImportStatement extends AstNode {
  type: 'ImportStatement';
  importPath: string[]; // Array of identifiers from the path
  alias?: string;       // Optional alias after 'as'
  source?: string;      // Optional source after 'from'
  location?: Location;
}