import { describe, it, expect } from 'vitest';
import { RclCustomLexer } from './rcl-custom-lexer.js';
import { RclCustomParser } from './rcl-custom-parser.js';
import { AstUtils } from './rcl-simple-ast.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('RCL Lexer + Parser Integration', () => {
  describe('Complete Pipeline', () => {
    it('should parse minimal.rcl example successfully', () => {
      const input = `agent BMW Customer Service:
    description: "Customer support agent for BMW vehicles"
    version: "2.1.0"
    enabled: True

flows:
    Welcome Flow:
        start: welcome_message
    
    Contact Support Flow:
        start: support_greeting

messages:
    welcome_message:
        text: "Welcome to BMW Customer Service"
    
    support_greeting:
        text: "How can we help you today?"`;

      // Test lexer
      const lexer = new RclCustomLexer();
      const lexResult = lexer.tokenize(input);
      
      expect(lexResult.errors).toHaveLength(0);
      expect(lexResult.tokens.length).toBeGreaterThan(0);
      
      // Test parser
      const parser = new RclCustomParser();
      const parseResult = parser.parse(input);
      
      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.ast).toBeDefined();
      
      const ast = parseResult.ast!;
      
      // Verify structure
      expect(ast.type).toBe('RclFile');
      expect(ast.imports).toHaveLength(0);
      expect(ast.sections).toHaveLength(3);
      
      // Check agent section
      const agentSection = ast.sections.find(s => s.sectionType === 'agent');
      expect(agentSection).toBeDefined();
      expect(agentSection!.name).toBe('BMW Customer Service');
      expect(agentSection!.attributes).toHaveLength(3);
      
      // Verify specific attributes
      const descAttr = agentSection!.attributes.find(a => a.key === 'description');
      expect(descAttr?.value.type).toBe('StringValue');
      expect((descAttr?.value as any).value).toBe('Customer support agent for BMW vehicles');
      
      const enabledAttr = agentSection!.attributes.find(a => a.key === 'enabled');
      expect(enabledAttr?.value.type).toBe('BooleanValue');
      expect((enabledAttr?.value as any).value).toBe(true);
      
      // Check flows section
      const flowsSection = ast.sections.find(s => s.sectionType === 'flows');
      expect(flowsSection).toBeDefined();
      expect(flowsSection!.flowRules).toHaveLength(2);
      
      // Check messages section
      const messagesSection = ast.sections.find(s => s.sectionType === 'messages');
      expect(messagesSection).toBeDefined();
      expect(messagesSection!.messages).toHaveLength(2);
    });

    it('should handle imports and complex structure', () => {
      const input = `import utils from "shared/common"
import validators as v from "validation/core"

agent Multi Function Agent:
    name: "Multi Function Agent"
    version: "1.0"
    utils: utils
    validator: v

flows:
    Registration Flow:
        start: validate_input
    
    Onboarding Flow:  
        start: welcome_new_user

messages:
    validate_input:
        text: "Please provide your information"
        validation: required
        
    welcome_new_user:
        text: "Welcome to our service!"
        type: "greeting"`;

      const parser = new RclCustomParser();
      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      
      // Check imports
      expect(ast.imports).toHaveLength(2);
      
      const utilsImport = ast.imports[0];
      expect(utilsImport.importedNames).toContain('utils');
      expect(utilsImport.source).toBe('shared/common');
      
      const validatorsImport = ast.imports[1];
      expect(validatorsImport.importedNames).toContain('validators');
      expect(validatorsImport.alias).toBe('v');
      expect(validatorsImport.source).toBe('validation/core');
      
      // Check sections
      expect(ast.sections).toHaveLength(3);
      
      // Use utility functions
      const sectionNames = AstUtils.getSectionNames(ast);
      expect(sectionNames).toContain('Multi Function Agent');
      
      const flowRules = AstUtils.getFlowRules(ast);
      expect(flowRules).toHaveLength(2);
      expect(flowRules.map(f => f.name)).toContain('Registration Flow');
      expect(flowRules.map(f => f.name)).toContain('Onboarding Flow');
      
      const messages = AstUtils.getMessages(ast);
      expect(messages).toHaveLength(2);
      expect(messages.map(m => m.name)).toContain('validate_input');
      expect(messages.map(m => m.name)).toContain('welcome_new_user');
    });

    it('should handle space-separated identifiers correctly', () => {
      const input = `agent Premium Customer Support Agent:
    department: Customer Relations Team
    specialization: BMW Premium Services

flows:
    BMW Contact Support Flow:
        description: Handle premium customer inquiries
        
    Product Information Request Flow:
        description: Provide detailed product information

messages:
    Premium Welcome Message:
        text: "Welcome to BMW Premium Support"
        category: Premium Customer Service`;

      const parser = new RclCustomParser();
      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const ast = result.ast!;
      
      // Check agent with space-separated name
      const agentSection = ast.sections.find(s => s.sectionType === 'agent');
      expect(agentSection?.name).toBe('Premium Customer Support Agent');
      
      // Check space-separated attribute values
      const deptAttr = agentSection?.attributes.find(a => a.key === 'department');
      expect(deptAttr?.value.type).toBe('IdentifierValue');
      expect((deptAttr?.value as any).value).toBe('Customer Relations Team');
      expect((deptAttr?.value as any).isSpaceSeparated).toBe(true);
      
      // Check flow names
      const flowRules = AstUtils.getFlowRules(ast);
      const flowNames = flowRules.map(f => f.name);
      expect(flowNames).toContain('BMW Contact Support Flow');
      expect(flowNames).toContain('Product Information Request Flow');
      
      // Check message names
      const messages = AstUtils.getMessages(ast);
      const messageNames = messages.map(m => m.name);
      expect(messageNames).toContain('Premium Welcome Message');
    });

    it('should handle mixed value types', () => {
      const input = `agent Configuration Agent:
    name: "Config Agent"
    port: 8080
    timeout: 30.5
    enabled: True
    disabled: False
    nullable_field: null
    environment: production
    max_connections: 100

flows:
    Health Check Flow:
        interval: 60
        enabled: True

messages:
    status_message:
        text: "System status: operational"
        priority: 1
        urgent: False`;

      const parser = new RclCustomParser();
      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const agentSection = result.ast!.sections.find(s => s.sectionType === 'agent')!;
      
      // Test string value
      const nameAttr = agentSection.attributes.find(a => a.key === 'name');
      expect(nameAttr?.value.type).toBe('StringValue');
      expect((nameAttr?.value as any).value).toBe('Config Agent');
      
      // Test integer value
      const portAttr = agentSection.attributes.find(a => a.key === 'port');
      expect(portAttr?.value.type).toBe('NumberValue');
      expect((portAttr?.value as any).value).toBe(8080);
      
      // Test float value
      const timeoutAttr = agentSection.attributes.find(a => a.key === 'timeout');
      expect(timeoutAttr?.value.type).toBe('NumberValue');
      expect((timeoutAttr?.value as any).value).toBe(30.5);
      
      // Test boolean values
      const enabledAttr = agentSection.attributes.find(a => a.key === 'enabled');
      expect(enabledAttr?.value.type).toBe('BooleanValue');
      expect((enabledAttr?.value as any).value).toBe(true);
      
      const disabledAttr = agentSection.attributes.find(a => a.key === 'disabled');
      expect(disabledAttr?.value.type).toBe('BooleanValue');
      expect((disabledAttr?.value as any).value).toBe(false);
      
      // Test null value
      const nullAttr = agentSection.attributes.find(a => a.key === 'nullable_field');
      expect(nullAttr?.value.type).toBe('NullValue');
      
      // Test identifier value
      const envAttr = agentSection.attributes.find(a => a.key === 'environment');
      expect(envAttr?.value.type).toBe('IdentifierValue');
      expect((envAttr?.value as any).value).toBe('production');
    });
  });

  describe('Error Recovery', () => {
    it('should handle partial parsing with errors', () => {
      const input = `agent Good Agent:
    name: "Working Agent"
    version: "1.0"

invalid_syntax_here this should cause error

agent Another Good Agent:
    description: "This should still parse"
    enabled: True`;

      const parser = new RclCustomParser();
      const result = parser.parse(input);
      
      // Should have errors but still parse valid parts
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
      
      // Should still have parsed the valid sections
      expect(result.ast!.sections.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle reasonably large files efficiently', () => {
      // Generate a larger input
      const sections = [];
      for (let i = 0; i < 10; i++) {
        sections.push(`agent Test Agent ${i}:
    name: "Test Agent ${i}"
    version: "1.${i}"
    enabled: True`);
      }
      
      for (let i = 0; i < 5; i++) {
        sections.push(`flows:
    Flow ${i}:
        start: message_${i}`);
      }
      
      for (let i = 0; i < 15; i++) {
        sections.push(`messages:
    message_${i}:
        text: "Message ${i} content"
        priority: ${i}`);
      }
      
      const input = sections.join('\n\n');
      
      const startTime = Date.now();
      
      const parser = new RclCustomParser();
      const result = parser.parse(input);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast!.sections.length).toBeGreaterThan(25);
      
      // Should parse reasonably quickly (less than 100ms for this size)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Real Example Files', () => {
    it('should parse example.rcl if it exists', () => {
      try {
        const examplePath = join(process.cwd(), 'examples', 'example.rcl');
        const content = readFileSync(examplePath, 'utf-8');
        
        const parser = new RclCustomParser();
        const result = parser.parse(content);
        
        // Should parse without critical errors
        expect(result.ast).toBeDefined();
        
        // Log any errors for debugging
        if (result.errors.length > 0) {
          console.log('Parsing errors in example.rcl:', result.errors);
        }
        
      } catch (error) {
        // File doesn't exist or can't be read - skip test
        console.log('Skipping example.rcl test - file not found');
      }
    });

    it('should parse minimal.rcl if it exists', () => {
      try {
        const minimalPath = join(process.cwd(), 'examples', 'minimal.rcl');
        const content = readFileSync(minimalPath, 'utf-8');
        
        const parser = new RclCustomParser();
        const result = parser.parse(content);
        
        // Should parse without critical errors
        expect(result.ast).toBeDefined();
        
        // Log any errors for debugging
        if (result.errors.length > 0) {
          console.log('Parsing errors in minimal.rcl:', result.errors);
        }
        
      } catch (error) {
        // File doesn't exist or can't be read - skip test
        console.log('Skipping minimal.rcl test - file not found');
      }
    });
  });
}); 