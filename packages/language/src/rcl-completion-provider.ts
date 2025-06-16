import type { AstNode, CompletionAcceptor, CompletionContext, CompletionValueItem } from 'langium';
import { DefaultCompletionProvider } from 'langium/lsp';
import type { AgentDefinition, Property } from './generated/ast.js';
import { isAgentDefinition } from './generated/ast.js';

/**
 * RCS Specification for completion suggestions
 */
const RCS_AGENT_PROPERTIES = {
    // Core properties
    displayName: {
        description: 'The display name for the agent (required)',
        type: 'string',
        required: true,
        example: '"My Bot"'
    },
    brandName: {
        description: 'The brand name for the agent',
        type: 'string',
        required: false,
        example: '"ACME Corp"'
    },
    
    // Configuration sections
    config: {
        description: 'Agent configuration settings',
        type: 'ConfigDefinition',
        required: false,
        example: 'config {\n  timeout: 30\n}'
    },
    defaults: {
        description: 'Default values for agent behavior',
        type: 'DefaultsDefinition', 
        required: false,
        example: 'defaults {\n  language: "en"\n}'
    },
    flow: {
        description: 'Conversation flow definition',
        type: 'FlowDefinition',
        required: false,
        example: 'flow {\n  start: welcomeMessage\n}'
    },
    messages: {
        description: 'Message templates and responses',
        type: 'MessagesDefinition',
        required: false,
        example: 'messages {\n  welcome: "Hello!"\n}'
    }
} as const;

export class RclCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(context: CompletionContext, next: CompletionAcceptor): void {
        const model = context.node;
        
        // Auto-complete property names within agent definitions
        if (this.isPropertyNameCompletion(context, model)) {
            this.completeAgentPropertyNames(context, next);
            return;
        }
        
        // Auto-complete property values based on property type
        if (this.isPropertyValueCompletion(context, model)) {
            this.completePropertyValues(context, next);
            return;
        }
        
        // Auto-complete keywords and other general completions
        this.completeKeywords(context, next);
        
        // Fall back to default completion
        super.completionFor(context, next);
    }
    
    private isPropertyNameCompletion(context: CompletionContext, model: AstNode): boolean {
        // Check if we're completing a property name within an agent definition
        if (context.tokenEndOffset !== undefined) {
            const container = this.findContainerOfType(model, isAgentDefinition);
            return container !== undefined && 
                   context.feature === 'name' && 
                   context.node.$type === 'Property';
        }
        return false;
    }
    
    private isPropertyValueCompletion(context: CompletionContext, model: AstNode): boolean {
        // Check if we're completing a property value
        return context.feature === 'value' && context.node.$type === 'Property';
    }
    
    private completeAgentPropertyNames(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const agentDef = this.findContainerOfType(context.node, isAgentDefinition);
        if (!agentDef) return;
        
        // Get already defined property names to avoid duplicates
        const existingProperties = agentDef.properties.map(p => (p as Property).name);
        
        // Suggest all valid RCS agent properties
        for (const [propName, propInfo] of Object.entries(RCS_AGENT_PROPERTIES)) {
            if (!existingProperties.includes(propName)) {
                const completion: CompletionValueItem = {
                    label: propName,
                    kind: propInfo.required ? 'Property' : 'Field',
                    detail: `${propInfo.type}${propInfo.required ? ' (required)' : ' (optional)'}`,
                    documentation: {
                        kind: 'markdown',
                        value: `${propInfo.description}\n\n**Example:**\n\`\`\`\n${propName}: ${propInfo.example}\n\`\`\``
                    },
                    insertText: propName,
                    sortText: propInfo.required ? `0_${propName}` : `1_${propName}` // Required properties first
                };
                
                acceptor(context, completion);
            }
        }
    }
    
    private completePropertyValues(context: CompletionContext, acceptor: CompletionAcceptor): void {
        const property = context.node as Property;
        const propInfo = RCS_AGENT_PROPERTIES[property.name as keyof typeof RCS_AGENT_PROPERTIES];
        
        if (!propInfo) return;
        
        // Provide value suggestions based on property type
        if (propInfo.type === 'string') {
            acceptor(context, {
                label: '""',
                kind: 'Value',
                detail: 'String value',
                insertText: '""',
                command: {
                    title: 'Trigger cursor placement',
                    command: 'editor.action.triggerParameterHints'
                }
            });
        } else if (propInfo.type.includes('Definition')) {
            // For complex types, suggest block structure
            const blockName = propInfo.type.replace('Definition', '').toLowerCase();
            acceptor(context, {
                label: `${blockName} { }`,
                kind: 'Snippet',
                detail: propInfo.type,
                insertText: `${blockName} {\n  $0\n}`,
                insertTextFormat: 'Snippet'
            });
        }
    }
    
    private completeKeywords(context: CompletionContext, acceptor: CompletionAcceptor): void {
        // Suggest top-level keywords
        if (context.node.$type === 'RclFile') {
            acceptor(context, {
                label: 'agent',
                kind: 'Keyword',
                detail: 'Define an RCS agent',
                documentation: 'Creates a new RCS agent definition',
                insertText: 'agent ',
                sortText: '0_agent'
            });
            
            acceptor(context, {
                label: 'import',
                kind: 'Keyword', 
                detail: 'Import external definitions',
                documentation: 'Import definitions from other RCL files',
                insertText: 'import ',
                sortText: '0_import'
            });
        }
    }
    
    private findContainerOfType<T extends AstNode>(node: AstNode, typeGuard: (n: AstNode) => n is T): T | undefined {
        let current: AstNode | undefined = node;
        while (current) {
            if (typeGuard(current)) {
                return current;
            }
            current = current.$container;
        }
        return undefined;
    }
} 