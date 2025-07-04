import type { MessagesSection, MessageDefinition } from '../../parser/ast/index.js';

/**
 * Converts RCL message sections to message dictionary format
 * Note: Simplified implementation for current grammar structure
 */
export class MessageConverter {
  constructor() {
  }

  /**
   * Convert a message section to message dictionary
   */
  convert(messageSection: MessagesSection): Record<string, any> {
    const result: Record<string, any> = {};

    for (const messageDef of messageSection.messages) {
        result[messageDef.name] = this.convertMessageDefinition(messageDef);
    }
    
    return result;
  }

  private convertMessageDefinition(messageDef: MessageDefinition): Record<string, any> {
      const messageConfig: Record<string, any> = {
          type: messageDef.type,
          properties: {}, // MessageDefinition doesn't have attributes
          metadata: {
              sectionName: messageDef.name,
              __rclGenerated: true
          }
      };

      if (messageDef.content) {
          // A more complex conversion would be needed here based on content type
          messageConfig.content = "Content placeholder";
      }

      return messageConfig;
  }
} 