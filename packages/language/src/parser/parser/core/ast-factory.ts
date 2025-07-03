/**
 * AST Factory
 * 
 * Creates AST nodes with proper type information and location data.
 * Centralizes AST node creation for consistency and validation.
 */

import type {
  RclFile,
  AgentDefinition,
  ImportStatement,
  Location
} from '../../ast/index.js';

export class AstFactory {
  
  /**
   * Create RclFile node
   */
  createRclFile(imports: ImportStatement[], agentDefinition: AgentDefinition | null): RclFile {
    return {
      type: 'RclFile',
      imports,
      agentDefinition
    };
  }

  /**
   * Create ImportStatement node
   */
  createImportStatement(
    importPath: string[],
    alias?: string,
    source?: string,
    location?: Location
  ): ImportStatement {
    return {
      type: 'ImportStatement',
      importPath,
      alias,
      source,
      location
    };
  }

  /**
   * Create AgentDefinition node
   */
  createAgentDefinition(
    name: string,
    displayName: string | null,
    brandName: string | null,
    config: any,
    defaults: any,
    flows: any[],
    messages: any,
    location?: Location
  ): AgentDefinition {
    return {
      type: 'AgentDefinition',
      name,
      displayName,
      brandName,
      config,
      defaults,
      flows,
      messages,
      location
    };
  }

  // TODO: Add more factory methods for other AST node types as they are implemented
}