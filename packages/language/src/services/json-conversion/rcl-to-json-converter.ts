import type { RclFile, FlowSection } from '../../parser/ast/index.js';
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
    if (rclFile.agentSection.flows) {
        for (const flow of rclFile.agentSection.flows) {
            result.flows[this.getFlowId(flow)] = this.flowConverter.convert(flow);
        }
    }
    if (rclFile.agentSection.messages) {
        result.messages = this.messageConverter.convert(rclFile.agentSection.messages);
    }

    return result;
  }

  /**
   * Extract flow ID from a flow section
   */
  private getFlowId(section: FlowSection): string {
    return section.name || 'default-flow';
  }
} 