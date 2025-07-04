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
  AgentConfig,
  AgentDefaults,
  ConfigProperty,
  DefaultProperty,
  FlowSection,
  MessagesSection,
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
    config: AgentConfig | null,
    defaults: AgentDefaults | null,
    flows: FlowSection[],
    messages: MessagesSection | null,
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

  /**
   * Create AgentConfig node
   */
  createAgentConfig(
    name: string,
    properties: ConfigProperty[],
    location?: Location
  ): AgentConfig {
    return {
      type: 'AgentConfig',
      name,
      properties,
      location
    };
  }

  /**
   * Create AgentDefaults node
   */
  createAgentDefaults(
    name: string,
    properties: DefaultProperty[],
    location?: Location
  ): AgentDefaults {
    return {
      type: 'AgentDefaults',
      name,
      properties,
      location
    };
  }

  /**
   * Create ConfigProperty node
   */
  createConfigProperty(
    key: string,
    value: any,
    location?: Location
  ): ConfigProperty {
    return {
      type: 'ConfigProperty',
      key,
      value,
      location
    };
  }

  /**
   * Create DefaultProperty node
   */
  createDefaultProperty(
    key: string,
    value: any,
    location?: Location
  ): DefaultProperty {
    return {
      type: 'DefaultProperty',
      key,
      value,
      location
    };
  }

  /**
   * Create FlowSection node (simplified for now)
   */
  createFlowSection(
    name: string,
    rules: any[],
    location?: Location
  ): FlowSection {
    return {
      type: 'FlowSection',
      name,
      rules,
      location
    } as FlowSection;
  }

  /**
   * Create MessagesSection node (simplified for now)
   */
  createMessagesSection(
    name: string,
    messages: any,
    location?: Location
  ): MessagesSection {
    return {
      type: 'MessagesSection',
      name,
      messages,
      location
    } as MessagesSection;
  }
}