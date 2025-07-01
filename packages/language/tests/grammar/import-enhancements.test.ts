import { describe, it, expect, beforeEach } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
import { ImportStatement } from '../../src/parser/rcl-simple-ast.js';

/**
 * Test suite for Phase 6: Import Statement Enhancements
 * 
 * Tests enhanced import syntax including namespace imports with spaces,
 * multi-level namespace paths, and import aliases with spaces.
 */
describe('RCL Import Statement Enhancements', () => {
  let parser: RclCustomParser;

  beforeEach(() => {
    parser = new RclCustomParser();
  });

  describe('Basic Import Statements (Already Working)', () => {
    it('should parse simple import statements', () => {
      const input = `import utils from "shared/common"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(1);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['utils']);
      expect(importStmt.source).toBe('shared/common');
    });

    it('should parse import statements with aliases', () => {
      const input = `import utils as helpers from "shared/common"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['utils']);
      expect(importStmt.alias).toBe('helpers');
      expect(importStmt.source).toBe('shared/common');
    });
  });

  describe('Namespace Imports with Spaces', () => {
    it('should parse namespace imports with spaces in names', () => {
      const input = `import My Brand / Samples as Sample One from "brand/samples"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(1);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['My Brand', 'Samples']);
      expect(importStmt.alias).toBe('Sample One');
      expect(importStmt.source).toBe('brand/samples');
    });

    it('should parse multi-level namespace paths', () => {
      const input = `import Shared / Common Flows / Support from "shared/flows"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Shared', 'Common Flows', 'Support']);
      expect(importStmt.source).toBe('shared/flows');
    });

    it('should parse complex namespace with spaces and alias', () => {
      const input = `import Premium Customer / Support Flows as Customer Support from "premium/support"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Premium Customer', 'Support Flows']);
      expect(importStmt.alias).toBe('Customer Support');
      expect(importStmt.source).toBe('premium/support');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle namespace paths without alias', () => {
      const input = `import Brand / Agent Templates from "brand/templates"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Brand', 'Agent Templates']);
      expect(importStmt.alias).toBeUndefined();
      expect(importStmt.source).toBe('brand/templates');
    });

    it('should handle single namespace with spaces', () => {
      const input = `import Premium Support as Support from "premium"`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Premium Support']);
      expect(importStmt.alias).toBe('Support');
      expect(importStmt.source).toBe('premium');
    });

    it('should handle imports without source', () => {
      const input = `import Local Utils / Helpers`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Local Utils', 'Helpers']);
      expect(importStmt.source).toBeUndefined();
    });
  });

  describe('Mixed Import Statements', () => {
    it('should parse multiple different import types', () => {
      const input = `import utils from "shared/common"
import My Brand / Samples as Samples from "brand/samples"
import Local Helper`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(3);
      
      // First import: simple
      expect(result.ast!.imports[0].importedNames).toEqual(['utils']);
      expect(result.ast!.imports[0].source).toBe('shared/common');
      
      // Second import: namespace with alias
      expect(result.ast!.imports[1].importedNames).toEqual(['My Brand', 'Samples']);
      expect(result.ast!.imports[1].alias).toBe('Samples');
      expect(result.ast!.imports[1].source).toBe('brand/samples');
      
      // Third import: local without source
      expect(result.ast!.imports[2].importedNames).toEqual(['Local Helper']);
      expect(result.ast!.imports[2].source).toBeUndefined();
    });
  });
}); 