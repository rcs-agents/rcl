/**
 * Agent Definition AST Types
 * 
 * Types for agent definitions, configurations, and defaults according to the formal specification.
 */

import type { AstNode } from 'langium';
import type { Location } from '../core/base-types.js';
import type { FlowSection } from './flow-types.js';
import type { MessagesSection } from './message-types.js';
import type { Section } from './section-base.js';

/**
 * Agent Definition according to formal specification:
 * AgentDefinition ::= 'agent' IDENTIFIER INDENT
 *   ('displayName' ':' STRING)
 *   ('brandName' ':' STRING)?
 *   (ConfigSection)?
 *   (DefaultsSection)?
 *   (FlowSection)+
 *   MessagesSection
 *   DEDENT
 */
export interface AgentDefinition extends Section {
  type: 'AgentDefinition';
  name: string;
  displayName: string | null;  // Required per specification
  brandName?: string | null;   // Optional per specification
  config?: AgentConfig | null;
  defaults?: AgentDefaults | null;
  flows: FlowSection[];        // At least one required per specification
  messages: MessagesSection | null;  // Required per specification
  location?: Location;
}

/**
 * Agent Configuration Section
 * ConfigSection ::= 'agentConfig' IDENTIFIER ':' INDENT ConfigProperty* DEDENT
 */
export interface AgentConfig extends AstNode {
  type: 'AgentConfig';
  name: string;
  properties: ConfigProperty[];
  location?: Location;
}

/**
 * Agent Defaults Section
 * DefaultsSection ::= 'agentDefaults' IDENTIFIER ':' INDENT DefaultProperty* DEDENT
 */
export interface AgentDefaults extends AstNode {
  type: 'AgentDefaults';
  name: string;
  properties: DefaultProperty[];
  location?: Location;
}

/**
 * Configuration Property
 */
export interface ConfigProperty extends AstNode {
  type: 'ConfigProperty';
  key: string;
  value: any; // TODO: Define specific value types
  location?: Location;
}

/**
 * Default Property
 */
export interface DefaultProperty extends AstNode {
  type: 'DefaultProperty';
  key: string;
  value: any; // TODO: Define specific value types
  location?: Location;
}