import type { Section, Attribute } from '../../generated/ast.js';
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
   * Convert an agent section to agent configuration JSON
   */
  convert(agentSection: Section): Record<string, any> {
    const config: Record<string, any> = {};
    
    // Extract basic agent attributes
    const agentAttributes = this.valueConverter.convertAttributes(agentSection.attributes);
    
    // Map RCL attributes to agent config schema properties
    if (agentAttributes.displayName) {
      config.displayName = agentAttributes.displayName;
    }
    
    if (agentAttributes.brandName) {
      config.brandName = agentAttributes.brandName;
    }

    // Create RCS Business Messaging Agent configuration
    const rcsAgent = this.createRcsBusinessMessagingAgent(agentSection);
    if (Object.keys(rcsAgent).length > 0) {
      config.rcsBusinessMessagingAgent = rcsAgent;
    }

    return config;
  }

  /**
   * Create RCS Business Messaging Agent configuration object
   */
  private createRcsBusinessMessagingAgent(agentSection: Section): Record<string, any> {
    const rcsAgent: Record<string, any> = {};
    
    // Process agent attributes
    const agentAttributes = this.valueConverter.convertAttributes(agentSection.attributes);
    
    // Map basic properties
    if (agentAttributes.description) {
      rcsAgent.description = agentAttributes.description;
    }
    
    if (agentAttributes.logoUri) {
      rcsAgent.logoUri = agentAttributes.logoUri;
    }
    
    if (agentAttributes.heroUri) {
      rcsAgent.heroUri = agentAttributes.heroUri;
    }
    
    if (agentAttributes.color) {
      rcsAgent.color = agentAttributes.color;
    }

    // Process Config subsection if it exists
    const configSection = this.findConfigSection(agentSection);
    if (configSection) {
      const configAttributes = this.valueConverter.convertAttributes(configSection.attributes);
      this.applyConfigAttributes(rcsAgent, configAttributes);
    }

    // Process nested attributes for complex objects
    for (const nestedAttr of agentSection.nestedAttributes) {
      this.processNestedAttribute(rcsAgent, nestedAttr.key, nestedAttr.attributes);
    }

    return rcsAgent;
  }

  /**
   * Find the Config subsection within the agent section
   */
  private findConfigSection(agentSection: Section): Section | undefined {
    return agentSection.subSections.find(section => 
      section.reservedName === 'Config' || section.sectionType === 'agentConfig'
    );
  }

  /**
   * Apply configuration attributes to the RCS agent object
   */
  private applyConfigAttributes(rcsAgent: Record<string, any>, configAttributes: Record<string, any>): void {
    // Map config attributes to RCS agent properties
    if (configAttributes.agentUseCase) {
      rcsAgent.agentUseCase = configAttributes.agentUseCase;
    }
    
    if (configAttributes.hostingRegion) {
      rcsAgent.hostingRegion = configAttributes.hostingRegion;
    }
    
    if (configAttributes.billingCategory) {
      rcsAgent.billingConfig = {
        billingCategory: configAttributes.billingCategory
      };
    }
  }

  /**
   * Process nested attributes for complex objects like phone numbers, emails, etc.
   */
  private processNestedAttribute(rcsAgent: Record<string, any>, key: string, attributes: Attribute[]): void {
    const nestedValues = this.valueConverter.convertAttributes(attributes);
    
    switch (key.toLowerCase()) {
      case 'phonenumbers':
      case 'phone':
        rcsAgent.phoneNumbers = this.createPhoneEntries(nestedValues);
        break;
      case 'emails':
      case 'email':
        rcsAgent.emails = this.createEmailEntries(nestedValues);
        break;
      case 'websites':
      case 'website':
        rcsAgent.websites = this.createWebEntries(nestedValues);
        break;
      case 'privacy':
        rcsAgent.privacy = this.createWebEntry(nestedValues);
        break;
      case 'termsconditions':
      case 'terms':
        rcsAgent.termsConditions = this.createWebEntry(nestedValues);
        break;
      case 'partner':
        rcsAgent.partner = this.createPartnerEntry(nestedValues);
        break;
    }
  }

  /**
   * Create phone number entries
   */
  private createPhoneEntries(values: Record<string, any>): any[] {
    if (Array.isArray(values.numbers)) {
      return values.numbers.map((number: any) => ({
        number: this.valueConverter.extractStringValue(number),
        label: values.label || 'Primary'
      }));
    } else if (values.number) {
      return [{
        number: this.valueConverter.extractStringValue(values.number),
        label: values.label || 'Primary'
      }];
    }
    return [];
  }

  /**
   * Create email entries
   */
  private createEmailEntries(values: Record<string, any>): any[] {
    if (Array.isArray(values.addresses)) {
      return values.addresses.map((address: any) => ({
        address: this.valueConverter.extractStringValue(address),
        label: values.label || 'Primary'
      }));
    } else if (values.address) {
      return [{
        address: this.valueConverter.extractStringValue(values.address),
        label: values.label || 'Primary'
      }];
    }
    return [];
  }

  /**
   * Create website entries
   */
  private createWebEntries(values: Record<string, any>): any[] {
    if (Array.isArray(values.urls)) {
      return values.urls.map((url: any) => ({
        url: this.valueConverter.extractStringValue(url),
        label: values.label || 'Website'
      }));
    } else if (values.url) {
      return [{
        url: this.valueConverter.extractStringValue(values.url),
        label: values.label || 'Website'
      }];
    }
    return [];
  }

  /**
   * Create a single web entry (for privacy, terms, etc.)
   */
  private createWebEntry(values: Record<string, any>): any {
    return {
      url: this.valueConverter.extractStringValue(values.url),
      label: values.label || ''
    };
  }

  /**
   * Create partner entry
   */
  private createPartnerEntry(values: Record<string, any>): any {
    return {
      partnerId: values.partnerId || '',
      displayName: values.displayName || '',
      company: values.company || ''
    };
  }
} 