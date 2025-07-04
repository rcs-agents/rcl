import type { AgentDefinition, ConfigProperty, DefaultProperty } from '../../parser/ast/index.js';
import { ValueConverter } from './value-converter.js';

/**
 * Converts RCL agent sections to agent configuration JSON format
 * matching the agent-config.schema.json schema
 */
export class AgentConfigConverter {
  private valueConverter: ValueConverter;

  constructor() {
    this.valueConverter = new ValueConverter();
  }

  /**
   * Convert agent configuration to JSON
   */
  convert(agentSection: AgentDefinition): Record<string, any> {
    const config: Record<string, any> = {};
    
    // Convert main attributes from AgentDefinition
    config.displayName = agentSection.displayName;
    config.brandName = agentSection.brandName;
    
    // Process configuration properties
    if (agentSection.config) {
      config.properties = this.processConfigProperties(agentSection.config.properties);
    }

    // Process default properties  
    if (agentSection.defaults) {
      config.defaults = this.processDefaultProperties(agentSection.defaults.properties);
    }

    return config;
  }

  /**
   * Process configuration properties from current grammar
   */
  private processConfigProperties(configProperties: ConfigProperty[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const prop of configProperties) {
      if (prop.key && prop.value) {
        result[prop.key] = this.valueConverter.convertValue(prop.value);
      }
    }
    
    return result;
  }

  /**
   * Process default properties from current grammar
   */
  private processDefaultProperties(defaultProperties: DefaultProperty[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const prop of defaultProperties) {
      if (prop.key && prop.value) {
        result[prop.key] = this.valueConverter.convertValue(prop.value);
      }
    }
    
    return result;
  }
} 