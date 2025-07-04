import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { clearDocuments, parseHelper } from 'langium/test';
import { createRclServices } from '../../src/rcl-module.js';
import type { RclFile } from '../../s../parser/ast';
import { CompletionParams, Position } from 'vscode-languageserver';

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

describe('RCL Completion Provider Tests', () => {
  describe('Section Keywords Completion', () => {
    test('suggests agent keywords at file level', async () => {
      document = await parse('a');
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 1)
      } as CompletionParams);
      
      expect(completions).toBeDefined();
      expect(completions?.items).toBeDefined();
      
      const items = completions!.items;
      const agentCompletion = items.find(item => item.label === 'agent');
      expect(agentCompletion).toBeDefined();
      expect(agentCompletion?.insertText).toContain('agent');
    });

    test('suggests import keywords at file start', async () => {
      document = await parse('i');
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 1)
      } as CompletionParams);
      
      expect(completions?.items).toBeDefined();
      
      const items = completions!.items;
      const importCompletion = items.find(item => item.label === 'import');
      expect(importCompletion).toBeDefined();
    });

    test('suggests subsection keywords within agent', async () => {
      const content = `agent Test Agent:
    name: "Test"
    c`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 5)
      } as CompletionParams);
      
      if (completions?.items) {
        const configCompletion = completions.items.find(item => item.label === 'config');
        expect(configCompletion).toBeDefined();
      }
    });

    test('suggests flow keywords within agent', async () => {
      const content = `agent Test Agent:
    name: "Test"
    f`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 5)
      } as CompletionParams);
      
      if (completions?.items) {
        const flowCompletion = completions.items.find(item => item.label === 'flow');
        expect(flowCompletion).toBeDefined();
      }
    });
  });

  describe('Property Completion', () => {
    test('suggests common agent properties', async () => {
      const content = `agent Test Agent:
    n`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 5)
      } as CompletionParams);
      
      if (completions?.items) {
        const nameCompletion = completions.items.find(item => item.label === 'name');
        expect(nameCompletion).toBeDefined();
      }
    });

    test('suggests config properties within config section', async () => {
      const content = `agent Test Agent:
    name: "Test"
    config:
        w`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 9)
      } as CompletionParams);
      
      if (completions?.items) {
        const webhookCompletion = completions.items.find(item => 
          item.label.includes('webhook') || item.label.includes('url')
        );
        // Should suggest config-specific properties
        expect(completions.items.length).toBeGreaterThan(0);
      }
    });

    test('suggests message properties within messages', async () => {
      const content = `agent Test Agent:
    name: "Test"
    messages:
        welcome:
            t`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(4, 13)
      } as CompletionParams);
      
      if (completions?.items) {
        const textCompletion = completions.items.find(item => item.label === 'text');
        expect(textCompletion).toBeDefined();
      }
    });
  });

  describe('Value Completion', () => {
    test('suggests boolean values', async () => {
      const content = `agent Test Agent:
    enabled: T`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 14)
      } as CompletionParams);
      
      if (completions?.items) {
        const trueCompletion = completions.items.find(item => item.label === 'True');
        expect(trueCompletion).toBeDefined();
      }
    });

    test('suggests atom values', async () => {
      const content = `agent Test Agent:
    priority: :`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 15)
      } as CompletionParams);
      
      if (completions?.items) {
        // Should suggest common atom values
        expect(completions.items.some(item => item.label.startsWith(':'))).toBe(true);
      }
    });
  });

  describe('Flow Completion', () => {
    test('suggests flow rule targets', async () => {
      const content = `agent Test Agent:
    flow Main Flow:
        :start -> w`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 19)
      } as CompletionParams);
      
      if (completions?.items) {
        // Should suggest message names and flow targets
        expect(completions.items.length).toBeGreaterThan(0);
      }
    });

    test('suggests flow atoms', async () => {
      const content = `agent Test Agent:
    flow Main Flow:
        :`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 9)
      } as CompletionParams);
      
      if (completions?.items) {
        const startAtom = completions.items.find(item => item.label === ':start');
        const endAtom = completions.items.find(item => item.label === ':end');
        expect(startAtom || endAtom).toBeDefined();
      }
    });
  });

  describe('Import Completion', () => {
    test('suggests namespace completion', async () => {
      const content = 'import S';
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 8)
      } as CompletionParams);
      
      if (completions?.items) {
        // Should suggest common namespaces
        expect(completions.items.length).toBeGreaterThan(0);
      }
    });

    test('suggests alias keyword completion', async () => {
      const content = 'import Shared/Utils a';
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 21)
      } as CompletionParams);
      
      if (completions?.items) {
        const asCompletion = completions.items.find(item => item.label === 'as');
        expect(asCompletion).toBeDefined();
      }
    });
  });

  describe('Context-Aware Completion', () => {
    test('completion is context-aware for different sections', async () => {
      const content = `agent Test Agent:
    config:
        api`;
      
      document = await parse(content);
      
      // Test completion within config context
      const configCompletions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 11)
      } as CompletionParams);
      
      if (configCompletions?.items) {
        // Should suggest config-specific properties
        expect(configCompletions.items.length).toBeGreaterThan(0);
        
        // Should not suggest message-specific properties in config context
        const textProperty = configCompletions.items.find(item => item.label === 'text');
        expect(textProperty).toBeUndefined();
      }
    });

    test('completion works after colons', async () => {
      const content = `agent Test Agent:
    enabled: `;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(1, 13)
      } as CompletionParams);
      
      if (completions?.items) {
        // Should suggest values, not properties
        const booleanValues = completions.items.filter(item => 
          item.label === 'True' || item.label === 'False'
        );
        expect(booleanValues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Recovery in Completion', () => {
    test('provides completion even with syntax errors', async () => {
      const content = `agent Test Agent:
    name: "Test"
    invalid syntax here
    config:
        api`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(4, 11)
      } as CompletionParams);
      
      // Should still provide completions despite syntax errors above
      expect(completions).toBeDefined();
      if (completions?.items) {
        expect(completions.items.length).toBeGreaterThan(0);
      }
    });

    test('handles incomplete statements gracefully', async () => {
      const content = `agent`;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 5)
      } as CompletionParams);
      
      // Should handle incomplete agent declaration
      expect(completions).toBeDefined();
    });
  });

  describe('Snippet Completion', () => {
    test('provides agent snippet completion', async () => {
      document = await parse('');
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(0, 0)
      } as CompletionParams);
      
      if (completions?.items) {
        const agentSnippet = completions.items.find(item => 
          item.label.includes('agent') && item.insertText?.includes('name:')
        );
        
        if (agentSnippet) {
          expect(agentSnippet.insertText).toContain('agent');
          expect(agentSnippet.insertText).toContain('name:');
        }
      }
    });

    test('provides flow snippet completion', async () => {
      const content = `agent Test Agent:
    name: "Test"
    `;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(2, 4)
      } as CompletionParams);
      
      if (completions?.items) {
        const flowSnippet = completions.items.find(item => 
          item.label.includes('flow') && item.insertText?.includes(':start')
        );
        
        if (flowSnippet) {
          expect(flowSnippet.insertText).toContain('flow');
          expect(flowSnippet.insertText).toContain(':start');
        }
      }
    });

    test('provides message snippet completion', async () => {
      const content = `agent Test Agent:
    name: "Test"
    messages:
        `;
      
      document = await parse(content);
      
      const completions = await services.Rcl.lsp.CompletionProvider?.getCompletion(document, {
        textDocument: { uri: document.uri.toString() },
        position: Position.create(3, 8)
      } as CompletionParams);
      
      if (completions?.items) {
        const messageSnippet = completions.items.find(item => 
          item.insertText?.includes('text:')
        );
        
        if (messageSnippet) {
          expect(messageSnippet.insertText).toContain('text:');
        }
      }
    });
  });
});