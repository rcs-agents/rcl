import { describe, test, expect, beforeAll } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
import { AstUtils } from '../../src/parser/rcl-simple-ast.js';
import type { RclFile, Section, Value } from '../../src/parser/rcl-simple-ast.js';

describe('Comprehensive RCL Parser Tests', () => {
  let parser: RclCustomParser;

  beforeAll(() => {
    parser = new RclCustomParser();
  });

  describe('Agent Section Parsing', () => {
    test('parses complex agent with all subsections', () => {
      const input = `agent Premium Customer Support:
    displayName: "Premium Support Agent"
    brandName: "BMW Premium"
    version: "2.1.0"
    enabled: True
    timeout: 30.5
    maxSessions: 100
    
    config:
        webhookUrl: "https://api.bmw.com/webhook"
        environment: Production
        debugMode: False
        
    defaults:
        responseTime: 5
        priority: :HIGH
        language: "en-US"
        
    messages:
        welcome:
            text: "Welcome to BMW Premium Support"
            type: "greeting"
            priority: 1
            
        goodbye:
            text: "Thank you for using BMW Premium Support"
            type: "farewell"
            
    flow Premium Support Flow:
        description: "Premium customer support workflow"
        :start -> welcome
        welcome -> :end`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      expect(ast.sections).toHaveLength(6); // agent, config, defaults, messages, flow
      
      // Test agent section
      const agentSection = ast.sections.find(s => s.sectionType === 'agent');
      expect(agentSection).toBeDefined();
      expect(agentSection!.name).toBe('Premium Customer Support');
      expect(agentSection!.attributes).toHaveLength(6);
      
      // Test complex values
      const timeoutAttr = agentSection!.attributes.find(a => a.key === 'timeout');
      expect(timeoutAttr?.value.type).toBe('NumberValue');
      expect((timeoutAttr?.value as any).value).toBe(30.5);
      
      const enabledAttr = agentSection!.attributes.find(a => a.key === 'enabled');
      expect(enabledAttr?.value.type).toBe('BooleanValue');
      expect((enabledAttr?.value as any).value).toBe(true);
      
      // Test config section
      const configSection = ast.sections.find(s => s.sectionType === 'config');
      expect(configSection).toBeDefined();
      expect(configSection!.attributes).toHaveLength(3);
      
      // Test defaults section with atom value
      const defaultsSection = ast.sections.find(s => s.sectionType === 'defaults');
      expect(defaultsSection).toBeDefined();
      const priorityAttr = defaultsSection!.attributes.find(a => a.key === 'priority');
      expect(priorityAttr?.value.type).toBe('AtomValue');
      expect((priorityAttr?.value as any).value).toBe(':HIGH');
      
      // Test messages section
      const messagesSection = ast.sections.find(s => s.sectionType === 'messages');
      expect(messagesSection).toBeDefined();
      expect(messagesSection!.messages).toHaveLength(2);
      
      // Test flow section
      const flowSection = ast.sections.find(s => s.sectionType === 'flow');
      expect(flowSection).toBeDefined();
      expect(flowSection!.name).toBe('Premium Support Flow');
      expect(flowSection!.flowRules).toHaveLength(3);
    });

    test('parses agent with validation attributes', () => {
      const input = `agent Validation Agent:
    name: "Validation Test"
    validEmail: user@domain.com
    validUrl: https://example.com/api
    validNumber: -42.7
    validBool: False
    validAtom: :CUSTOM_VALUE
    nullValue: null`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agentSection = result.ast!.sections[0];
      expect(agentSection.attributes).toHaveLength(7);
      
      // Test identifier value (email)
      const emailAttr = agentSection.attributes.find(a => a.key === 'validEmail');
      expect(emailAttr?.value.type).toBe('IdentifierValue');
      expect((emailAttr?.value as any).value).toBe('user@domain.com');
      
      // Test negative number
      const numberAttr = agentSection.attributes.find(a => a.key === 'validNumber');
      expect(numberAttr?.value.type).toBe('NumberValue');
      expect((numberAttr?.value as any).value).toBe(-42.7);
      
      // Test null value
      const nullAttr = agentSection.attributes.find(a => a.key === 'nullValue');
      expect(nullAttr?.value.type).toBe('NullValue');
    });
  });

  describe('Import Statement Parsing', () => {
    test('parses various import patterns', () => {
      const input = `import Shared/Utils
import Core/Validation as Validator
import My Brand / Customer Support as Support
import namespace/module.submodule as ModuleName

agent Test Agent:
    name: "Test"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const imports = result.ast!.imports;
      expect(imports).toHaveLength(4);
      
      // Simple import
      expect(imports[0].source).toBe('Shared/Utils');
      expect(imports[0].importedNames).toContain('Utils');
      expect(imports[0].alias).toBeUndefined();
      
      // Import with alias
      expect(imports[1].source).toBe('Core/Validation');
      expect(imports[1].importedNames).toContain('Validation');
      expect(imports[1].alias).toBe('Validator');
      
      // Import with spaces in namespace
      expect(imports[2].source).toBe('My Brand / Customer Support');
      expect(imports[2].importedNames).toContain('Customer Support');
      expect(imports[2].alias).toBe('Support');
      
      // Import with module path
      expect(imports[3].source).toBe('namespace/module.submodule');
      expect(imports[3].importedNames).toContain('module.submodule');
      expect(imports[3].alias).toBe('ModuleName');
    });

    test('handles import edge cases', () => {
      const input = `import Single
import a/b/c/d/e/f/g as DeepNested
import namespace-with-dashes/module_with_underscores as Mixed

agent Test:
    name: "Test"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast!.imports).toHaveLength(3);
      
      // Single name import
      expect(result.ast!.imports[0].source).toBe('Single');
      expect(result.ast!.imports[0].importedNames).toContain('Single');
      
      // Deep nested import
      expect(result.ast!.imports[1].source).toBe('a/b/c/d/e/f/g');
      expect(result.ast!.imports[1].alias).toBe('DeepNested');
      
      // Mixed naming conventions
      expect(result.ast!.imports[2].source).toBe('namespace-with-dashes/module_with_underscores');
      expect(result.ast!.imports[2].alias).toBe('Mixed');
    });
  });

  describe('Flow Section Parsing', () => {
    test('parses complex flow rules', () => {
      const input = `agent Test:
    name: "Test"

flow Main Flow:
    description: "Main workflow"
    :start -> welcome_message
    welcome_message -> gather_info
    gather_info -> :decision
    :decision -> final_response
    final_response -> :end
    :error -> error_handler
    error_handler -> :retry
    :timeout -> timeout_message
    timeout_message -> :end`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const flowSection = result.ast!.sections.find(s => s.sectionType === 'flow');
      expect(flowSection).toBeDefined();
      expect(flowSection!.name).toBe('Main Flow');
      expect(flowSection!.flowRules).toHaveLength(9);
      
      // Test various rule types
      const rules = flowSection!.flowRules;
      
      // Start rule
      const startRule = rules.find(r => r.from === ':start');
      expect(startRule).toBeDefined();
      expect(startRule!.to).toBe('welcome_message');
      
      // Message to message rule
      const msgRule = rules.find(r => r.from === 'welcome_message');
      expect(msgRule).toBeDefined();
      expect(msgRule!.to).toBe('gather_info');
      
      // Error handling rule
      const errorRule = rules.find(r => r.from === ':error');
      expect(errorRule).toBeDefined();
      expect(errorRule!.to).toBe('error_handler');
    });

    test('parses flow with attributes and complex targets', () => {
      const input = `agent Test:
    name: "Test"

flow Advanced Flow:
    priority: :HIGH
    timeout: 60
    retryCount: 3
    :start -> complex_message_name_with_underscores
    complex_message_name_with_underscores -> "Quoted Message Name"
    "Quoted Message Name" -> Special Message With Spaces
    Special Message With Spaces -> :end`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const flowSection = result.ast!.sections.find(s => s.sectionType === 'flow');
      expect(flowSection).toBeDefined();
      expect(flowSection!.attributes).toHaveLength(3);
      expect(flowSection!.flowRules).toHaveLength(4);
      
      // Test flow attributes
      const priorityAttr = flowSection!.attributes.find(a => a.key === 'priority');
      expect(priorityAttr?.value.type).toBe('AtomValue');
      
      const timeoutAttr = flowSection!.attributes.find(a => a.key === 'timeout');
      expect(timeoutAttr?.value.type).toBe('NumberValue');
      
      // Test complex target names
      const rules = flowSection!.flowRules;
      expect(rules.some(r => r.to === 'complex_message_name_with_underscores')).toBe(true);
      expect(rules.some(r => r.from === 'complex_message_name_with_underscores')).toBe(true);
      expect(rules.some(r => r.to === 'Quoted Message Name')).toBe(true);
      expect(rules.some(r => r.to === 'Special Message With Spaces')).toBe(true);
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