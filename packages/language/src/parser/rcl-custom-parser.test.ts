import { describe, it, expect, beforeEach } from 'vitest';
import { RclCustomParser } from './rcl-custom-parser.js';
import type { RclFile, Section, Attribute } from './rcl-simple-ast.js';

describe('RclCustomParser', () => {
  let parser: RclCustomParser;

  beforeEach(() => {
    parser = new RclCustomParser();
  });

  describe('Basic Parsing', () => {
    it('should parse an empty file', () => {
      const result = parser.parse('');
      
      expect(result.ast).toBeDefined();
      expect(result.ast?.imports).toHaveLength(0);
      expect(result.ast?.sections).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse a minimal agent section', () => {
      const input = `agent Test Agent:
    name: "Test Agent"
    version: "1.0"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      expect(result.ast?.sections).toHaveLength(1);
      
      const section = result.ast!.sections[0];
      expect(section.type).toBe('Section');
      expect(section.sectionType).toBe('agent');
      expect(section.name).toBe('Test Agent');
      expect(section.attributes).toHaveLength(2);
      
      const nameAttr = section.attributes.find(a => a.key === 'name');
      expect(nameAttr).toBeDefined();
      expect(nameAttr?.value.type).toBe('StringValue');
      expect((nameAttr?.value as any).value).toBe('Test Agent');
    });

    it('should parse import statements', () => {
      const input = `import utils as u from "shared/utils"
agent Simple Agent:
    name: "Simple"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(1);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.type).toBe('ImportStatement');
      expect(importStmt.importedNames).toContain('utils');
      expect(importStmt.alias).toBe('u');
      expect(importStmt.source).toBe('shared/utils');
    });

    it('should parse multiple sections', () => {
      const input = `agent BMW Customer Service:
    description: "Customer support"
    
flows:
    Welcome Flow:
        start: welcome_message
    
messages:
    welcome_message:
        text: "Welcome to BMW"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.sections).toHaveLength(3);
      
      const agentSection = result.ast!.sections.find(s => s.sectionType === 'agent');
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      const messagesSection = result.ast!.sections.find(s => s.sectionType === 'messages');
      
      expect(agentSection).toBeDefined();
      expect(flowsSection).toBeDefined();
      expect(messagesSection).toBeDefined();
      
      expect(agentSection?.name).toBe('BMW Customer Service');
      expect(flowsSection?.name).toBe('');
      expect(messagesSection?.name).toBe('');
    });

    it('should parse boolean and numeric values', () => {
      const input = `agent Config Agent:
    enabled: True
    timeout: 30
    priority: 1.5
    debug: False`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      const section = result.ast!.sections[0];
      
      const enabledAttr = section.attributes.find(a => a.key === 'enabled');
      expect(enabledAttr?.value.type).toBe('BooleanValue');
      expect((enabledAttr?.value as any).value).toBe(true);
      
      const timeoutAttr = section.attributes.find(a => a.key === 'timeout');
      expect(timeoutAttr?.value.type).toBe('NumberValue');
      expect((timeoutAttr?.value as any).value).toBe(30);
      
      const priorityAttr = section.attributes.find(a => a.key === 'priority');
      expect(priorityAttr?.value.type).toBe('NumberValue');
      expect((priorityAttr?.value as any).value).toBe(1.5);
      
      const debugAttr = section.attributes.find(a => a.key === 'debug');
      expect(debugAttr?.value.type).toBe('BooleanValue');
      expect((debugAttr?.value as any).value).toBe(false);
    });

    it('should handle space-separated identifiers', () => {
      const input = `agent BMW Customer Service:
    name: BMW Customer Service
    department: Customer Relations Team`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      const section = result.ast!.sections[0];
      
      expect(section.name).toBe('BMW Customer Service');
      
      const nameAttr = section.attributes.find(a => a.key === 'name');
      expect(nameAttr?.value.type).toBe('IdentifierValue');
      expect((nameAttr?.value as any).value).toBe('BMW Customer Service');
      expect((nameAttr?.value as any).isSpaceSeparated).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle syntax errors gracefully', () => {
      const input = `agent Broken Agent
    missing: colon`;

      const result = parser.parse(input);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeNull();
    });

    it('should continue parsing after recoverable errors', () => {
      const input = `agent First Agent:
    valid: "attribute"
    
    invalid syntax here
    
agent Second Agent:
    another: "valid attribute"`;

      const result = parser.parse(input);
      
      // Should have some errors but still parse valid parts
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast).toBeDefined();
    });
  });

  describe('Indentation Handling', () => {
    it('should handle nested sections with proper indentation', () => {
      const input = `agent Main Agent:
    description: "Main agent"
    flows:
        Welcome Flow:
            start: welcome
    messages:
        welcome:
            text: "Hello"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.sections).toHaveLength(1);
      
      const mainSection = result.ast!.sections[0];
      expect(mainSection.subSections).toHaveLength(2);
      
      const flowsSubSection = mainSection.subSections.find(s => s.sectionType === 'flows');
      const messagesSubSection = mainSection.subSections.find(s => s.sectionType === 'messages');
      
      expect(flowsSubSection).toBeDefined();
      expect(messagesSubSection).toBeDefined();
    });
  });
}); 