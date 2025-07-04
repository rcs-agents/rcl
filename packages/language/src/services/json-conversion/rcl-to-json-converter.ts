import type { RclFile, Section } from '../../generated/ast.js';
import type { LangiumDocument } from 'langium';
import { AgentConfigConverter } from './agent-config-converter.js';
import { FlowConverter } from './flow-converter.js';
import { MessageConverter } from './message-converter.js';

/**
 * Main service for converting RCL files to JSON format.
 * Orchestrates the conversion of different sections into their respective JSON structures.
 */
export class RclToJsonConverter {
  private agentConfigConverter: AgentConfigConverter;
  private flowConverter: FlowConverter;
  private messageConverter: MessageConverter;

  constructor() {
    this.agentConfigConverter = new AgentConfigConverter();
    this.flowConverter = new FlowConverter();
    this.messageConverter = new MessageConverter();
  }

  /**
   * Convert an RCL document to JSON format
   */
  convertDocument(document: LangiumDocument<RclFile>): Record<string, any> {
    const rclFile = document.parseResult.value;
    
    if (!rclFile || !rclFile.agentSection) {
      throw new Error('Invalid RCL file: missing agent section');
    }

    const result: Record<string, any> = {
      agent: {},
      flows: {},
      messages: {}
    };

    // Convert agent configuration
    result.agent = this.agentConfigConverter.convert(rclFile.agentSection);

    // Process subsections for flows and messages
    for (const subSection of rclFile.agentSection.subSections) {
      if (this.isFlowSection(subSection)) {
        const flowId = this.getFlowId(subSection);
        result.flows[flowId] = this.flowConverter.convert(subSection);
      } else if (this.isMessagesSection(subSection)) {
        // Messages section contains individual message subsections
        for (const messageSection of subSection.subSections) {
          if (this.isMessageSection(messageSection)) {
            const messageId = this.getMessageId(messageSection);
            result.messages[messageId] = this.messageConverter.convert(messageSection);
          }
        }
      }
    }

    return result;
  }

  /**
   * Convert an RCL file directly (when you have the AST)
   */
  convertRclFile(rclFile: RclFile): Record<string, any> {
    if (!rclFile.agentSection) {
      throw new Error('Invalid RCL file: missing agent section');
    }

    const result: Record<string, any> = {
      agent: {},
      flows: {},
      messages: {}
    };

    // Convert agent configuration
    result.agent = this.agentConfigConverter.convert(rclFile.agentSection);

    // Process subsections for flows and messages
    for (const subSection of rclFile.agentSection.subSections) {
      if (this.isFlowSection(subSection)) {
        const flowId = this.getFlowId(subSection);
        result.flows[flowId] = this.flowConverter.convert(subSection);
      } else if (this.isMessagesSection(subSection)) {
        // Messages section contains individual message subsections
        for (const messageSection of subSection.subSections) {
          if (this.isMessageSection(messageSection)) {
            const messageId = this.getMessageId(messageSection);
            result.messages[messageId] = this.messageConverter.convert(messageSection);
          }
        }
      }
    }

    return result;
  }

  /**
   * Check if a section is a flow section
   */
  private isFlowSection(section: Section): boolean {
    return section.sectionType === 'flow';
  }

  /**
   * Check if a section is a messages section (simplified)
   */
  private isMessagesSection(section: Section): boolean {
    return (section.sectionType === 'messages') || 
           (section.name?.toLowerCase().includes('message') ?? false);
  }

  /**
   * Check if a section represents a message (simplified)
   */
  private isMessageSection(section: Section): boolean {
    const sectionType = section.sectionType?.toLowerCase() || '';
    return sectionType.includes('message');
  }

  /**
   * Extract flow ID from a flow section
   */
  private getFlowId(section: Section): string {
    return section.name || 'default-flow';
  }

  /**
   * Extract message ID from a message section
   */
  private getMessageId(section: Section): string {
    return section.name || 'default-message';
  }
} 