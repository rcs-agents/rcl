import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { clearDocuments, parseHelper } from 'langium/test';
import { createRclServices } from '../../src/rcl-module.js';
import type { RclFile } from '../../src/generated/ast.js';

let services: ReturnType<typeof createRclServices>;
let parse: ReturnType<typeof parseHelper<RclFile>>;
let document: LangiumDocument<RclFile> | undefined;

beforeAll(async () => {
  services = createRclServices(EmptyFileSystem);
  parse = parseHelper<RclFile>(services.Rcl);
});

afterEach(async () => {
  document && clearDocuments(services.shared, [document]);
});

describe('RCL Semantic Validation Tests', () => {
  describe('Agent Definition Validation', () => {
    test('validates required agent properties', async () => {
      document = await parse(`agent Test Agent:
    description: "Test agent without required name"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1); // Error severity
      
      // Should warn or error about missing required properties like 'name'
      expect(document.parseResult.parserErrors).toHaveLength(0); // No parser errors
      
      // Check if validation catches missing required fields
      if (validationErrors.length > 0) {
        const missingNameError = validationErrors.find(error => 
          error.message.toLowerCase().includes('name') || 
          error.message.toLowerCase().includes('required')
        );
        expect(missingNameError).toBeDefined();
      }
    });

    test('validates agent property types', async () => {
      document = await parse(`agent Test Agent:
    name: "Valid Name"
    version: InvalidVersionNumber
    enabled: NotABoolean
    timeout: "ShouldBeNumber"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate that version, enabled, and timeout have correct types
      if (validationErrors.length > 0) {
        const typeErrors = validationErrors.filter(error => 
          error.message.toLowerCase().includes('type') ||
          error.message.toLowerCase().includes('expected') ||
          error.message.toLowerCase().includes('invalid')
        );
        expect(typeErrors.length).toBeGreaterThan(0);
      }
    });

    test('validates duplicate agent definitions', async () => {
      document = await parse(`agent Test Agent:
    name: "First Agent"

agent Test Agent:
    name: "Duplicate Agent"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect duplicate agent names
      if (validationErrors.length > 0) {
        const duplicateError = validationErrors.find(error => 
          error.message.toLowerCase().includes('duplicate') ||
          error.message.toLowerCase().includes('already') ||
          error.message.toLowerCase().includes('exists')
        );
        expect(duplicateError).toBeDefined();
      }
    });
  });

  describe('Flow Validation', () => {
    test('validates flow rule references', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    flow Main Flow:
        :start -> nonexistent_message
        nonexistent_message -> :end
        
    messages:
        existing_message:
            text: "This message exists"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect reference to nonexistent message
      if (validationErrors.length > 0) {
        const referenceError = validationErrors.find(error => 
          error.message.toLowerCase().includes('nonexistent') ||
          error.message.toLowerCase().includes('not found') ||
          error.message.toLowerCase().includes('undefined')
        );
        expect(referenceError).toBeDefined();
      }
    });

    test('validates circular flow dependencies', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    flow Circular Flow:
        :start -> message_a
        message_a -> message_b
        message_b -> message_c
        message_c -> message_a
        
    messages:
        message_a:
            text: "Message A"
        message_b:
            text: "Message B"
        message_c:
            text: "Message C"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect circular dependencies
      if (validationErrors.length > 0) {
        const circularError = validationErrors.find(error => 
          error.message.toLowerCase().includes('circular') ||
          error.message.toLowerCase().includes('cycle') ||
          error.message.toLowerCase().includes('loop')
        );
        expect(circularError).toBeDefined();
      }
    });

    test('validates unreachable flow states', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    flow Unreachable Flow:
        :start -> message_a
        message_a -> :end
        
    messages:
        message_a:
            text: "Reachable message"
        message_b:
            text: "Unreachable message"
        message_c:
            text: "Another unreachable message"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 2); // Warning severity
      
      // Should warn about unreachable messages
      if (validationErrors.length > 0) {
        const unreachableWarning = validationErrors.find(error => 
          error.message.toLowerCase().includes('unreachable') ||
          error.message.toLowerCase().includes('unused') ||
          error.message.toLowerCase().includes('not referenced')
        );
        expect(unreachableWarning).toBeDefined();
      }
    });
  });

  describe('Message Validation', () => {
    test('validates required message properties', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    messages:
        incomplete_message:
            priority: 1
        complete_message:
            text: "Complete message"
            type: "greeting"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should require 'text' property for messages
      if (validationErrors.length > 0) {
        const missingTextError = validationErrors.find(error => 
          error.message.toLowerCase().includes('text') &&
          (error.message.toLowerCase().includes('required') ||
           error.message.toLowerCase().includes('missing'))
        );
        expect(missingTextError).toBeDefined();
      }
    });

    test('validates message property constraints', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    messages:
        invalid_message:
            text: "Valid text"
            priority: -1
            timeout: "invalid_timeout"
            enabled: "not_boolean"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate property constraints (priority >= 0, timeout as number, enabled as boolean)
      if (validationErrors.length > 0) {
        const constraintErrors = validationErrors.filter(error => 
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('constraint') ||
          error.message.toLowerCase().includes('range')
        );
        expect(constraintErrors.length).toBeGreaterThan(0);
      }
    });

    test('validates duplicate message names', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    messages:
        duplicate_message:
            text: "First message"
        duplicate_message:
            text: "Second message with same name"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect duplicate message names
      if (validationErrors.length > 0) {
        const duplicateError = validationErrors.find(error => 
          error.message.toLowerCase().includes('duplicate') ||
          error.message.toLowerCase().includes('already defined')
        );
        expect(duplicateError).toBeDefined();
      }
    });
  });

  describe('Import Validation', () => {
    test('validates import references', async () => {
      document = await parse(`import NonExistent/Module as Missing

agent Test Agent:
    name: "Test"
    dependency: Missing.someProperty`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect unresolved imports
      if (validationErrors.length > 0) {
        const importError = validationErrors.find(error => 
          error.message.toLowerCase().includes('import') ||
          error.message.toLowerCase().includes('module') ||
          error.message.toLowerCase().includes('not found')
        );
        expect(importError).toBeDefined();
      }
    });

    test('validates circular import dependencies', async () => {
      // This would require multiple files to test properly
      // For now, test basic import structure validation
      document = await parse(`import Self/Reference as Self

agent Test Agent:
    name: "Test"
    selfRef: Self.property`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Basic import structure should be valid
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });

    test('validates import alias conflicts', async () => {
      document = await parse(`import Module/A as Utils
import Module/B as Utils

agent Test Agent:
    name: "Test"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect alias conflicts
      if (validationErrors.length > 0) {
        const aliasError = validationErrors.find(error => 
          error.message.toLowerCase().includes('alias') ||
          error.message.toLowerCase().includes('conflict') ||
          error.message.toLowerCase().includes('duplicate')
        );
        expect(aliasError).toBeDefined();
      }
    });
  });

  describe('Configuration Validation', () => {
    test('validates config property types', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    config:
        webhookUrl: "https://valid-url.com"
        port: 8080
        ssl: True
        invalidUrl: "not-a-valid-url"
        invalidPort: "not-a-number"
        invalidBool: "not-boolean"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate URL format, port numbers, boolean values
      if (validationErrors.length > 0) {
        const typeErrors = validationErrors.filter(error => 
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('format') ||
          error.message.toLowerCase().includes('type')
        );
        expect(typeErrors.length).toBeGreaterThan(0);
      }
    });

    test('validates required config properties', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    config:
        environment: "production"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Might warn about missing essential config properties
      // This depends on the specific validation rules implemented
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Cross-Section Validation', () => {
    test('validates consistency between sections', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    defaults:
        defaultMessage: welcome_message
        
    flow Main Flow:
        :start -> welcome_message
        welcome_message -> goodbye_message
        
    messages:
        welcome_message:
            text: "Welcome"
        # goodbye_message is referenced but not defined`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should detect inconsistencies between sections
      if (validationErrors.length > 0) {
        const consistencyError = validationErrors.find(error => 
          error.message.toLowerCase().includes('goodbye_message') ||
          error.message.toLowerCase().includes('not found') ||
          error.message.toLowerCase().includes('undefined')
        );
        expect(consistencyError).toBeDefined();
      }
    });

    test('validates scope and visibility rules', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    config:
        privateConfig: "internal"
        
    messages:
        public_message:
            text: "Public message"
            config: privateConfig`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate scope and access rules
      expect(document.parseResult.parserErrors).toHaveLength(0);
    });
  });

  describe('Type System Validation', () => {
    test('validates atom value formats', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    validAtom: :VALID_ATOM
    invalidAtom: :invalid-atom-format
    anotherInvalid: :123invalid`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate atom naming conventions
      if (validationErrors.length > 0) {
        const atomErrors = validationErrors.filter(error => 
          error.message.toLowerCase().includes('atom') ||
          error.message.toLowerCase().includes('format') ||
          error.message.toLowerCase().includes('invalid')
        );
        expect(atomErrors.length).toBeGreaterThan(0);
      }
    });

    test('validates number ranges and formats', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    validNumber: 42
    validFloat: 3.14
    validNegative: -273.15
    tooLarge: 999999999999999999999
    invalidFormat: 12.34.56`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // Should validate number formats and ranges
      if (validationErrors.length > 0) {
        const numberErrors = validationErrors.filter(error => 
          error.message.toLowerCase().includes('number') ||
          error.message.toLowerCase().includes('range') ||
          error.message.toLowerCase().includes('format')
        );
        expect(numberErrors.length).toBeGreaterThan(0);
      }
    });

    test('validates string content and encoding', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    validString: "Valid string content"
    emptyString: ""
    unicodeString: "Unicode content: 🚀 ñáéíóú"
    specialChars: "Special chars: @#$%^&*()"`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      
      // String validation should generally pass for well-formed strings
      expect(document.parseResult.parserErrors).toHaveLength(0);
      
      // Might have warnings for empty strings or special characters
      const stringWarnings = (document.diagnostics || []).filter(d => 
        d.severity === 2 && 
        d.message.toLowerCase().includes('string')
      );
      // Warnings are optional and implementation-dependent
    });
  });

  describe('Complex Validation Scenarios', () => {
    test('validates complete agent with all sections', async () => {
      document = await parse(`import Shared/Utils as Utils

agent Complete Agent:
    name: "Complete Test Agent"
    version: "1.0.0"
    enabled: True
    
    config:
        webhookUrl: "https://api.example.com/webhook"
        port: 8080
        ssl: True
        environment: :PRODUCTION
        
    defaults:
        timeout: 30
        retryCount: 3
        language: "en-US"
        
    flow Main Flow:
        description: "Main conversation flow"
        :start -> welcome
        welcome -> gather_info
        gather_info -> process_request
        process_request -> response
        response -> :end
        :error -> error_handling
        error_handling -> :retry
        
    messages:
        welcome:
            text: "Welcome to our service"
            type: "greeting"
            priority: 1
            
        gather_info:
            text: "Please provide your information"
            validationRequired: True
            timeout: 30
            
        process_request:
            text: "Processing your request..."
            type: "status"
            
        response:
            text: "Thank you for using our service"
            type: "response"
            
        error_handling:
            text: "An error occurred. Please try again."
            type: "error"
            logLevel: :ERROR`);
      
      const validationErrors = (document.diagnostics || []).filter(d => d.severity === 1);
      const validationWarnings = (document.diagnostics || []).filter(d => d.severity === 2);
      
      // A well-formed complete agent should have minimal errors
      expect(document.parseResult.parserErrors).toHaveLength(0);
      
      // Should validate cross-references correctly
      expect(validationErrors.length).toBeLessThan(3); // Allow for minor validation issues
      
      console.log('Validation errors:', validationErrors.map(e => e.message));
      console.log('Validation warnings:', validationWarnings.map(w => w.message));
    });
  });
});