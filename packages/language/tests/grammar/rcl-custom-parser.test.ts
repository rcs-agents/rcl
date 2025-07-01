import { describe, it, expect, beforeEach } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
// Import removed as the types are not used in tests

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

  describe('Enhanced Flow Rules with Arrow Operators', () => {
    it('should parse simple flow transitions with arrows', () => {
      const input = `agent Test Agent:
    description: "Test agent"
    
flows:
    Default Flow:
        :start -> Welcome
        Welcome -> Main Menu`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
      
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      expect(flowsSection).toBeDefined();
      expect(flowsSection!.flowRules).toHaveLength(1);
      
      const defaultFlow = flowsSection!.flowRules[0];
      expect(defaultFlow.name).toBe('Default Flow');
      expect(defaultFlow.transitions).toHaveLength(2);
      
      // Check first transition: :start -> Welcome
      const firstTransition = defaultFlow.transitions[0];
      expect(firstTransition.type).toBe('FlowTransition');
      expect(firstTransition.source.operandType).toBe('atom');
      expect(firstTransition.source.value).toBe(':start');
      expect(firstTransition.destination.operandType).toBe('identifier');
      expect(firstTransition.destination.value).toBe('Welcome');
      
      // Check second transition: Welcome -> Main Menu
      const secondTransition = defaultFlow.transitions[1];
      expect(secondTransition.source.operandType).toBe('identifier');
      expect(secondTransition.source.value).toBe('Welcome');
      expect(secondTransition.destination.operandType).toBe('identifier');
      expect(secondTransition.destination.value).toBe('Main Menu');
    });

    it('should parse flow transitions with string operands', () => {
      const input = `agent Test Agent:
    description: "Test agent"
    
flows:
    Support Flow:
        :start -> "Welcome Message"
        "Technical Issue" -> "Tech Support"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      const supportFlow = flowsSection!.flowRules[0];
      expect(supportFlow.transitions).toHaveLength(2);
      
      // Check transition with string destination
      const firstTransition = supportFlow.transitions[0];
      expect(firstTransition.destination.operandType).toBe('string');
      expect(firstTransition.destination.value).toBe('Welcome Message');
      
      // Check transition with string source
      const secondTransition = supportFlow.transitions[1];
      expect(secondTransition.source.operandType).toBe('string');
      expect(secondTransition.source.value).toBe('Technical Issue');
      expect(secondTransition.destination.operandType).toBe('string');
      expect(secondTransition.destination.value).toBe('Tech Support');
    });

    it('should parse flow transitions with with clauses', () => {
      const input = `agent Test Agent:
    description: "Test agent"
    
flows:
    Booking Flow:
        :start -> Book Appointment with service: premium, time: "10:00"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      const bookingFlow = flowsSection!.flowRules[0];
      expect(bookingFlow.transitions).toHaveLength(1);
      
      const transition = bookingFlow.transitions[0];
      expect(transition.withClause).toBeDefined();
      expect(transition.withClause!.parameters).toHaveLength(2);
      
      const serviceParam = transition.withClause!.parameters[0];
      expect(serviceParam.name).toBe('service');
      expect(serviceParam.defaultValue?.type).toBe('IdentifierValue');
      expect((serviceParam.defaultValue as any)?.value).toBe('premium');
      
      const timeParam = transition.withClause!.parameters[1];
      expect(timeParam.name).toBe('time');
      expect(timeParam.defaultValue?.type).toBe('StringValue');
      expect((timeParam.defaultValue as any)?.value).toBe('10:00');
    });

    it('should parse mixed flow rules (legacy named flows and new transitions)', () => {
      const input = `agent Test Agent:
    description: "Test agent"
    
flows:
    Default Flow:
        :start -> Welcome
        Welcome -> Main Menu
        
    Legacy Flow:
        start: welcome_message
        timeout: 30`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      expect(flowsSection!.flowRules).toHaveLength(2);
      
      // Check modern flow with transitions
      const defaultFlow = flowsSection!.flowRules[0];
      expect(defaultFlow.name).toBe('Default Flow');
      expect(defaultFlow.transitions).toHaveLength(2);
      expect(defaultFlow.attributes).toHaveLength(0);
      
      // Check legacy flow with attributes
      const legacyFlow = flowsSection!.flowRules[1];
      expect(legacyFlow.name).toBe('Legacy Flow');
      expect(legacyFlow.transitions).toHaveLength(0);
      expect(legacyFlow.attributes).toHaveLength(2);
    });

    it('should handle complex real-world flow example', () => {
      const input = `agent BMW Support Agent:
    displayName: "BMW Support"
    
flows:
    Default Flow:
        :start -> WelcomeMessage
        :WelcomeMessage -> MainMenu
        :MainMenu -> TechIssueSelectedMessage
        :MainMenu -> BillingInquirySelectedMessage
        :MainMenu -> ConfirmAgentTransferMessage
        :TechIssueSelectedMessage -> TechSupportFollowUpMessage
        :ConfirmAgentTransferMessage -> AgentTransferInProgressMessage`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const flowsSection = result.ast!.sections.find(s => s.sectionType === 'flows');
      const defaultFlow = flowsSection!.flowRules[0];
      
      expect(defaultFlow.name).toBe('Default Flow');
      expect(defaultFlow.transitions).toHaveLength(7);
      
      // Verify specific transitions
      const startTransition = defaultFlow.transitions[0];
      expect(startTransition.source.value).toBe(':start');
      expect(startTransition.destination.value).toBe('WelcomeMessage');
      
      const menuTransitions = defaultFlow.transitions.filter(t => 
        t.source.value === ':MainMenu'
      );
      expect(menuTransitions).toHaveLength(3);
    });
  });
}); 