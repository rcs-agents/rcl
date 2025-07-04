import { describe, test, expect, beforeAll } from 'vitest';
import { RclParser } from '../../src/parser/parser.ts';
import { AstUtils } from '../../src/parser/rcl-simple-ast.js';
import type { RclFile, Section, Value } from '../../src/parser/rcl-simple-ast.js';

describe('Comprehensive RCL Parser Tests', () => {
  let parser: RclParser;

  beforeAll(() => {
    parser = new RclParser();
  });

  describe('Agent Section Parsing', () => {
    test('parses complex agent with all subsections', () => {
      const input = `agent Premium Customer Support:
    displayName: "Premium Support Agent"
    brandName: "BMW Premium"
    
    agentConfig Config:
        webhookUrl: "https://api.bmw.com/webhook"
        environment: "Production"
        debugMode: False
        
    agentDefaults Defaults:
        responseTime: 5
        priority: :HIGH
        language: "en-US"
        
    flow Premium Support Flow:
        description: "Premium customer support workflow"
        :start -> welcome
        welcome -> :end
        
    messages Messages:
        text "Welcome to BMW Premium Support"
        text "Thank you for using BMW Premium Support"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      expect(ast.agentDefinition).toBeDefined();
      
      // Test agent definition
      const agent = ast.agentDefinition!;
      expect(agent.name).toBe('Premium Customer Support');
      expect(agent.displayName).toBe('Premium Support Agent');
      expect(agent.brandName).toBe('BMW Premium');
      
      // Test config section exists
      expect(agent.configSection).toBeDefined();
      expect(agent.configSection!.properties).toHaveLength(3);
      
      // Test defaults section exists
      expect(agent.defaultsSection).toBeDefined();
      expect(agent.defaultsSection!.properties).toHaveLength(3);
      
      // Test flow sections
      expect(agent.flowSections).toHaveLength(1);
      expect(agent.flowSections[0].name).toBe('Premium Support Flow');
      
      // Test messages section
      expect(agent.messagesSection).toBeDefined();
      expect(agent.messagesSection!.shortcuts).toHaveLength(2);
    });

    test('parses agent with validation attributes', () => {
      const input = `agent Validation Agent:
    displayName: "Validation Test"
    brandName: "Test Brand"
    
    flow Test Flow:
        :start -> :end
        
    messages Messages:
        text "Hello World"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agent = result.ast!.agentDefinition!;
      expect(agent.name).toBe('Validation Agent');
      expect(agent.displayName).toBe('Validation Test');
      expect(agent.brandName).toBe('Test Brand');
      expect(agent.flowSections).toHaveLength(1);
      expect(agent.messagesSection).toBeDefined();
    });
  });

  describe('Import Statement Parsing', () => {
    test('parses various import patterns', () => {
      const input = `import Shared / Utils
import Core / Validation as Validator
import My Brand / Customer Support as Support

agent Test Agent:
    displayName: "Test Agent"
    
    flow Test Flow:
        :start -> :end
        
    messages Messages:
        text "Hello"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const imports = result.ast!.imports;
      expect(imports).toHaveLength(3);
      
      // Simple import
      expect(imports[0].importedNames).toContain('Shared');
      expect(imports[0].importedNames).toContain('Utils');
      expect(imports[0].alias).toBeUndefined();
      
      // Import with alias
      expect(imports[1].importedNames).toContain('Core');
      expect(imports[1].importedNames).toContain('Validation');
      expect(imports[1].alias).toBe('Validator');
      
      // Import with spaces and alias
      expect(imports[2].alias).toBe('Support');
    });

    test('handles import edge cases', () => {
      const input = `import Single Module
import Deep / Nested / Path as DeepNested

agent Test:
    displayName: "Test Agent"
    
    flow Test Flow:
        :start -> :end
        
    messages Messages:
        text "Hello"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast!.imports).toHaveLength(2);
      
      // Simple import
      expect(result.ast!.imports[0].importedNames).toContain('Single');
      expect(result.ast!.imports[0].importedNames).toContain('Module');
      
      // Deep nested import with alias
      expect(result.ast!.imports[1].alias).toBe('DeepNested');
    });
  });

  describe('Flow Section Parsing', () => {
    test('parses complex flow rules', () => {
      const input = `agent Test:
    displayName: "Test Agent"

    flow Main Flow:
        :start -> welcome_message
        welcome_message -> gather_info
        gather_info -> :decision
        :decision -> final_response
        final_response -> :end
        :error -> error_handler
        error_handler -> :retry
        :timeout -> timeout_message
        timeout_message -> :end
        
    messages Messages:
        text "Hello World"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agent = result.ast!.agentDefinition!;
      expect(agent.flowSections).toHaveLength(1);
      expect(agent.flowSections[0].name).toBe('Main Flow');
      expect(agent.flowSections[0].rules).toHaveLength(9);
    });

    test('parses flow with attributes and complex targets', () => {
      const input = `agent Test:
    displayName: "Test Agent"

    flow Advanced Flow:
        :start -> "Quoted Message Name"
        "Quoted Message Name" -> :end
        
    messages Messages:
        text "Hello World"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const agent = result.ast!.agentDefinition!;
      expect(agent.flowSections).toHaveLength(1);
      expect(agent.flowSections[0].name).toBe('Advanced Flow');
      expect(agent.flowSections[0].rules).toHaveLength(2);
    });
  });

  describe('Message Section Parsing', () => {
    test('parses complex message definitions', () => {
      const input = `agent Test:
    name: "Test"

messages Customer Support:
    welcome_message:
        text: "Welcome to our service"
        type: "greeting"
        priority: 1
        enabled: True
        metadata: :CUSTOMER_FACING
        
    information_request:
        text: "Please provide your information"
        validationRequired: True
        timeout: 30
        retryCount: 3
        
    error_message:
        text: "An error occurred"
        type: "error"
        logLevel: :ERROR
        displayToUser: False
        
    complex_response:
        text: "Your request has been processed"
        responseCode: 200
        additionalData: null
        timestamp: "2024-01-01T00:00:00Z"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const messagesSection = result.ast!.sections.find(s => s.sectionType === 'messages');
      expect(messagesSection).toBeDefined();
      expect(messagesSection!.name).toBe('Customer Support');
      expect(messagesSection!.messages).toHaveLength(4);
      
      // Test welcome message
      const welcomeMsg = messagesSection!.messages.find(m => m.name === 'welcome_message');
      expect(welcomeMsg).toBeDefined();
      expect(welcomeMsg!.attributes).toHaveLength(5);
      
      const textAttr = welcomeMsg!.attributes.find(a => a.key === 'text');
      expect(textAttr?.value.type).toBe('StringValue');
      expect((textAttr?.value as any).value).toBe('Welcome to our service');
      
      const metadataAttr = welcomeMsg!.attributes.find(a => a.key === 'metadata');
      expect(metadataAttr?.value.type).toBe('AtomValue');
      expect((metadataAttr?.value as any).value).toBe(':CUSTOMER_FACING');
      
      // Test error message
      const errorMsg = messagesSection!.messages.find(m => m.name === 'error_message');
      expect(errorMsg).toBeDefined();
      
      const logLevelAttr = errorMsg!.attributes.find(a => a.key === 'logLevel');
      expect(logLevelAttr?.value.type).toBe('AtomValue');
      
      const displayAttr = errorMsg!.attributes.find(a => a.key === 'displayToUser');
      expect(displayAttr?.value.type).toBe('BooleanValue');
      expect((displayAttr?.value as any).value).toBe(false);
      
      // Test complex response
      const complexMsg = messagesSection!.messages.find(m => m.name === 'complex_response');
      expect(complexMsg).toBeDefined();
      
      const responseCodeAttr = complexMsg!.attributes.find(a => a.key === 'responseCode');
      expect(responseCodeAttr?.value.type).toBe('NumberValue');
      expect((responseCodeAttr?.value as any).value).toBe(200);
      
      const additionalDataAttr = complexMsg!.attributes.find(a => a.key === 'additionalData');
      expect(additionalDataAttr?.value.type).toBe('NullValue');
    });
  });

  describe('Nested Structure Parsing', () => {
    test('parses deeply nested sections', () => {
      const input = `agent Master Agent:
    name: "Master Agent"
    
    config:
        api:
            baseUrl: "https://api.example.com"
            version: "v2"
            timeout: 30
            
        database:
            host: "localhost"
            port: 5432
            name: "customer_db"
            ssl: True
            
        features:
            enableAnalytics: True
            enableLogging: False
            maxRetries: 5
            
    defaults:
        global:
            timeout: 60
            retryPolicy: :EXPONENTIAL_BACKOFF
            
        messaging:
            language: "en-US"
            format: :JSON
            
        security:
            encryption: True
            validateInput: True`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const sections = result.ast!.sections;
      expect(sections).toHaveLength(3); // agent, config, defaults
      
      // Test config section with nested structure
      const configSection = sections.find(s => s.sectionType === 'config');
      expect(configSection).toBeDefined();
      expect(configSection!.attributes.length).toBeGreaterThan(5);
      
      // Test defaults section
      const defaultsSection = sections.find(s => s.sectionType === 'defaults');
      expect(defaultsSection).toBeDefined();
      expect(defaultsSection!.attributes.length).toBeGreaterThan(5);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    test('handles mixed indentation gracefully', () => {
      const input = `agent Mixed Indentation:
    name: "Test"
        description: "Mixed indentation test"
    version: "1.0"
        enabled: True`;

      const result = parser.parse(input);
      
      // Should handle mixed indentation without critical errors
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections).toHaveLength(1);
      
      const agentSection = result.ast!.sections[0];
      expect(agentSection.attributes.length).toBeGreaterThan(0);
    });

    test('recovers from syntax errors', () => {
      const input = `agent Error Recovery Test:
    name: "Test"
    invalid syntax here
    version: "1.0"
    
agent Second Agent:
    name: "Second"
    enabled: True`;

      const result = parser.parse(input);
      
      // Should have errors but still parse valid parts
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections.length).toBeGreaterThan(0);
      
      // Should recover and parse the second agent
      const agents = result.ast!.sections.filter(s => s.sectionType === 'agent');
      expect(agents.length).toBeGreaterThanOrEqual(1);
    });

    test('handles empty sections', () => {
      const input = `agent Empty Test:
    name: "Test"
    
    config:
    
    messages:
    
    flow Empty Flow:`;

      const result = parser.parse(input);
      
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections.length).toBeGreaterThan(0);
    });

    test('handles unicode and special characters', () => {
      const input = `agent Unicode Test:
    name: "Test with émojis 🚀"
    description: "Supports unicode: ñáéíóú"
    specialChars: "Special chars: @#$%^&*()[]{}|;:'\\",.<>?/\\\\~"
    unicodeValue: "価格: ¥1000"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agentSection = result.ast!.sections[0];
      expect(agentSection.attributes).toHaveLength(4);
      
      const nameAttr = agentSection.attributes.find(a => a.key === 'name');
      expect((nameAttr?.value as any).value).toBe('Test with émojis 🚀');
      
      const unicodeAttr = agentSection.attributes.find(a => a.key === 'unicodeValue');
      expect((unicodeAttr?.value as any).value).toBe('価格: ¥1000');
    });
  });

  describe('AST Utility Functions', () => {
    test('AST utilities work correctly', () => {
      const input = `import Utils from "shared/utils"

agent Test Agent:
    name: "Test"
    
flow Test Flow:
    :start -> message1
    
messages Test Messages:
    message1:
        text: "Hello"`;

      const result = parser.parse(input);
      expect(result.errors).toHaveLength(0);
      
      const ast = result.ast!;
      
      // Test utility functions
      const sectionNames = AstUtils.getSectionNames(ast);
      expect(sectionNames).toContain('Test Agent');
      expect(sectionNames).toContain('Test Flow');
      expect(sectionNames).toContain('Test Messages');
      
      const flowRules = AstUtils.getFlowRules(ast);
      expect(flowRules).toHaveLength(1);
      expect(flowRules[0].from).toBe(':start');
      expect(flowRules[0].to).toBe('message1');
      
      const messages = AstUtils.getMessages(ast);
      expect(messages).toHaveLength(1);
      expect(messages[0].name).toBe('message1');
      
      const imports = AstUtils.getImports(ast);
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('shared/utils');
    });
  });

  describe('Value Type Validation', () => {
    test('correctly identifies all value types', () => {
      const input = `agent Value Types Test:
    stringValue: "This is a string"
    numberInt: 42
    numberFloat: 3.14159
    numberNegative: -273.15
    booleanTrue: True
    booleanFalse: False
    atomValue: :CUSTOM_ATOM
    nullValue: null
    identifierValue: some_identifier
    spacedIdentifier: Spaced Identifier Value`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agentSection = result.ast!.sections[0];
      expect(agentSection.attributes).toHaveLength(10);
      
      // Test each value type
      const getValue = (key: string) => 
        agentSection.attributes.find(a => a.key === key)?.value;
      
      expect(getValue('stringValue')?.type).toBe('StringValue');
      expect(getValue('numberInt')?.type).toBe('NumberValue');
      expect(getValue('numberFloat')?.type).toBe('NumberValue');
      expect(getValue('numberNegative')?.type).toBe('NumberValue');
      expect(getValue('booleanTrue')?.type).toBe('BooleanValue');
      expect(getValue('booleanFalse')?.type).toBe('BooleanValue');
      expect(getValue('atomValue')?.type).toBe('AtomValue');
      expect(getValue('nullValue')?.type).toBe('NullValue');
      expect(getValue('identifierValue')?.type).toBe('IdentifierValue');
      expect(getValue('spacedIdentifier')?.type).toBe('IdentifierValue');
      
      // Test specific values
      expect((getValue('numberFloat') as any).value).toBe(3.14159);
      expect((getValue('numberNegative') as any).value).toBe(-273.15);
      expect((getValue('booleanTrue') as any).value).toBe(true);
      expect((getValue('booleanFalse') as any).value).toBe(false);
      expect((getValue('atomValue') as any).value).toBe(':CUSTOM_ATOM');
      expect((getValue('spacedIdentifier') as any).value).toBe('Spaced Identifier Value');
    });
  });
});