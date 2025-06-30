import type { Section } from '../../generated/ast.js';
import { ValueConverter } from './value-converter.js';

/**
 * Converts RCL message sections to message dictionary format
 * Note: Simplified implementation for current grammar structure
 */
export class MessageConverter {
  private valueConverter: ValueConverter;

  constructor() {
    this.valueConverter = new ValueConverter();
  }

  /**
   * Convert a message section to message dictionary
   */
  convert(messageSection: Section): Record<string, any> {
    const sectionType = messageSection.sectionType?.toLowerCase() || 'unknown';
    
    // Convert attributes to properties
    const messageProps = this.valueConverter.convertAttributes(messageSection.attributes);
    
    // Create base message structure
    const messageConfig: Record<string, any> = {
      type: sectionType,
      properties: messageProps,
      metadata: {
        sectionName: messageSection.sectionName,
        __rclGenerated: true
      }
    };

    // Add subsections if present
    if (messageSection.subSections && messageSection.subSections.length > 0) {
      messageConfig.subMessages = messageSection.subSections.map(sub => this.convert(sub));
    }

    return messageConfig;
  }
} 