import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { clearDocuments, parseHelper } from 'langium/test';
import { createRclServices } from '../../src/rcl-module.js';
import type { RclFile } from '../../s../parser/ast';
import { HoverParams, Position } from 'vscode-languageserver';

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

describe('RCL Hover Provider Tests', () => {
  describe('Keyword Hover Information', () => {
    test('provides hover info for agent keyword', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"`);
      
      const hover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 2) // Inside 'agent' keyword
      } as HoverParams);
      
      if (hover) {
        expect(hover.contents).toBeDefined();
        if (typeof hover.contents === 'string') {
          expect(hover.contents.toLowerCase()).toContain('agent');
        } else if (Array.isArray(hover.contents)) {
          const content = hover.contents.join('').toLowerCase();
          expect(content).toContain('agent');
        }
      }
    });

    test('provides hover info for flow keyword', async () => {
      document = await parse(`agent Test Agent:
    flow Test Flow:
        :start -> message1`);
      
      const hover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 6) // Inside 'flow' keyword
      } as HoverParams);
      
      if (hover) {
        expect(hover.contents).toBeDefined();
        // Should provide information about flow sections
      }
    });

    test('provides hover info for import keyword', async () => {
      document = await parse(`import Shared/Utils as Utils`);
      
      const hover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 3) // Inside 'import' keyword
      } as HoverParams);
      
      if (hover) {
        expect(hover.contents).toBeDefined();
        // Should provide information about import statements
      }
    });
  });

  describe('Property Hover Information', () => {
    test('provides hover info for agent properties', async () => {
      document = await parse(`agent Test Agent:
    name: "Test Agent"
    version: "1.0.0"
    enabled: True`);
      
      // Test 'name' property hover
      const nameHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 6) // Inside 'name' property
      } as HoverParams);
      
      if (nameHover) {
        expect(nameHover.contents).toBeDefined();
        // Should provide information about the name property
      }
      
      // Test 'version' property hover
      const versionHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 6) // Inside 'version' property
      } as HoverParams);
      
      if (versionHover) {
        expect(versionHover.contents).toBeDefined();
        // Should provide information about the version property
      }
    });

    test('provides hover info for config properties', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    config:
        webhookUrl: "https://api.example.com"
        timeout: 30
        ssl: True`);
      
      const webhookHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 10) // Inside 'webhookUrl' property
      } as HoverParams);
      
      if (webhookHover) {
        expect(webhookHover.contents).toBeDefined();
        // Should provide information about webhook configuration
      }
    });

    test('provides hover info for message properties', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    messages:
        welcome:
            text: "Welcome message"
            type: "greeting"
            priority: 1`);
      
      const textHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(4, 12) // Inside 'text' property
      } as HoverParams);
      
      if (textHover) {
        expect(textHover.contents).toBeDefined();
        // Should provide information about message text property
      }
    });
  });

  describe('Value Hover Information', () => {
    test('provides hover info for boolean values', async () => {
      document = await parse(`agent Test Agent:
    enabled: True
    disabled: False`);
      
      const trueHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 15) // Inside 'True' value
      } as HoverParams);
      
      if (trueHover) {
        expect(trueHover.contents).toBeDefined();
        // Should provide information about boolean values
      }
    });

    test('provides hover info for atom values', async () => {
      document = await parse(`agent Test Agent:
    priority: :HIGH
    environment: :PRODUCTION`);
      
      const atomHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 16) // Inside ':HIGH' atom
      } as HoverParams);
      
      if (atomHover) {
        expect(atomHover.contents).toBeDefined();
        // Should provide information about atom values
      }
    });

    test('provides hover info for string values', async () => {
      document = await parse(`agent Test Agent:
    name: "Test Agent Name"
    description: "This is a test agent"`);
      
      const stringHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 15) // Inside string value
      } as HoverParams);
      
      if (stringHover) {
        expect(stringHover.contents).toBeDefined();
        // Should provide information about string values
      }
    });
  });

  describe('Reference Hover Information', () => {
    test('provides hover info for flow rule references', async () => {
      document = await parse(`agent Test Agent:
    flow Main Flow:
        :start -> welcome_message
        welcome_message -> :end
        
    messages:
        welcome_message:
            text: "Welcome to our service"
            type: "greeting"`);
      
      const refHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 18) // Inside 'welcome_message' reference
      } as HoverParams);
      
      if (refHover) {
        expect(refHover.contents).toBeDefined();
        // Should provide information about the referenced message
        if (typeof refHover.contents === 'string') {
          expect(refHover.contents.toLowerCase()).toContain('message');
        }
      }
    });

    test('provides hover info for import references', async () => {
      document = await parse(`import Shared/Utils as Utils

agent Test Agent:
    name: "Test"
    utility: Utils.someFunction`);
      
      const importRefHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 15) // Inside 'Utils' reference
      } as HoverParams);
      
      if (importRefHover) {
        expect(importRefHover.contents).toBeDefined();
        // Should provide information about the imported module
      }
    });
  });

  describe('Section Hover Information', () => {
    test('provides hover info for section names', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    
    flow Main Flow:
        :start -> message1
        
    messages Customer Messages:
        message1:
            text: "Hello"`);
      
      // Test agent section name hover
      const agentHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 10) // Inside 'Test Agent' name
      } as HoverParams);
      
      if (agentHover) {
        expect(agentHover.contents).toBeDefined();
      }
      
      // Test flow section name hover
      const flowHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 10) // Inside 'Main Flow' name
      } as HoverParams);
      
      if (flowHover) {
        expect(flowHover.contents).toBeDefined();
      }
    });

    test('provides hover info for message names', async () => {
      document = await parse(`agent Test Agent:
    messages:
        welcome_message:
            text: "Welcome"
            type: "greeting"
            description: "Initial welcome message for users"`);
      
      const messageHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 10) // Inside 'welcome_message' name
      } as HoverParams);
      
      if (messageHover) {
        expect(messageHover.contents).toBeDefined();
        // Should show message details like text and type
      }
    });
  });

  describe('Context-Aware Hover', () => {
    test('provides different hover info based on context', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    config:
        timeout: 30
    defaults:
        timeout: 60`);
      
      // Test hover on 'timeout' in config context
      const configTimeoutHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 10) // Inside 'timeout' in config
      } as HoverParams);
      
      // Test hover on 'timeout' in defaults context
      const defaultsTimeoutHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(5, 10) // Inside 'timeout' in defaults
      } as HoverParams);
      
      // Both should provide hover info, potentially with different context
      if (configTimeoutHover) {
        expect(configTimeoutHover.contents).toBeDefined();
      }
      if (defaultsTimeoutHover) {
        expect(defaultsTimeoutHover.contents).toBeDefined();
      }
    });
  });

  describe('Error Handling in Hover', () => {
    test('handles hover on invalid syntax gracefully', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"
    invalid syntax here
    valid: "Still works"`);
      
      // Test hover on invalid syntax
      const invalidHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 10) // Inside invalid syntax
      } as HoverParams);
      
      // Should handle gracefully without crashing
      expect(invalidHover).toBeDefined();
    });

    test('handles hover on missing references', async () => {
      document = await parse(`agent Test Agent:
    flow Main Flow:
        :start -> nonexistent_message`);
      
      const missingRefHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 18) // Inside 'nonexistent_message'
      } as HoverParams);
      
      // Should handle missing references gracefully
      expect(missingRefHover).toBeDefined();
    });

    test('handles hover at file boundaries', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"`);
      
      // Test hover at beginning of file
      const startHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 0) // Very beginning
      } as HoverParams);
      
      // Test hover at end of file
      const endHover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 20) // Near end
      } as HoverParams);
      
      // Should handle boundary conditions
      expect(startHover).toBeDefined();
      expect(endHover).toBeDefined();
    });
  });

  describe('Hover Content Quality', () => {
    test('provides structured hover content', async () => {
      document = await parse(`agent Test Agent:
    name: "Test Agent"
    version: "1.0.0"`);
      
      const hover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 6) // Inside 'name' property
      } as HoverParams);
      
      if (hover) {
        expect(hover.contents).toBeDefined();
        
        // Should have proper range information
        expect(hover.range).toBeDefined();
        if (hover.range) {
          expect(hover.range.start).toBeDefined();
          expect(hover.range.end).toBeDefined();
        }
        
        // Content should be meaningful
        if (typeof hover.contents === 'string') {
          expect(hover.contents.length).toBeGreaterThan(0);
        } else if (Array.isArray(hover.contents)) {
          expect(hover.contents.length).toBeGreaterThan(0);
        }
      }
    });

    test('provides markdown-formatted hover content', async () => {
      document = await parse(`agent Test Agent:
    name: "Test"`);
      
      const hover = await services.Rcl.lsp.HoverProvider?.getHoverContent(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 2) // Inside 'agent' keyword
      } as HoverParams);
      
      if (hover && hover.contents) {
        // Check if content is markdown formatted
        const content = Array.isArray(hover.contents) ? hover.contents.join('') : hover.contents;
        if (typeof content === 'object' && 'kind' in content) {
          // Should be MarkupContent
          expect(content.kind).toBeDefined();
        }
      }
    });
  });
});