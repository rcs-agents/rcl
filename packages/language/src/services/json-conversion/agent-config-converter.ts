import type { Section } from '../../generated/ast.js';
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
  convert(agentSection: Section): Record<string, any> {
    const config: Record<string, any> = {};
    
    // Convert main attributes
    const agentAttributes = this.valueConverter.convertAttributes(agentSection.attributes);
    Object.assign(config, agentAttributes);
    
    // Process configuration properties
    if (agentSection.configProperties && agentSection.configProperties.length > 0) {
      config.properties = this.processConfigProperties(agentSection.configProperties);
    }

    // Process default properties  
    if (agentSection.defaultProperties && agentSection.defaultProperties.length > 0) {
      config.defaults = this.processDefaultProperties(agentSection.defaultProperties);
    }

    // Process subsections (simplified)
    if (agentSection.subSections && agentSection.subSections.length > 0) {
      config.subSections = agentSection.subSections.map(section => {
        const sectionConfig: Record<string, any> = {
          type: section.type || 'unknown',
          name: section.name,
          attributes: this.valueConverter.convertAttributes(section.attributes)
        };
        return sectionConfig;
      });
    }

    return config;
  }

  /**
   * Process configuration properties from current grammar
   */
  private processConfigProperties(configProperties: any[]): Record<string, any> {
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
  private processDefaultProperties(defaultProperties: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const prop of defaultProperties) {
      if (prop.key && prop.value) {
        result[prop.key] = this.valueConverter.convertValue(prop.value);
      }
    }
    
    return result;
  }
} 