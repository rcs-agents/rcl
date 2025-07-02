import { describe, it, expect, beforeEach } from 'vitest';
import { RclCustomParser } from '../../src/parser/rcl-custom-parser.js';
import { ImportStatement } from '../../src/parser/rcl-simple-ast.js';
import { resolveImportPath, findProjectRoot, type FileSystemInterface, webFileSystemMock } from '../../src/utils/filesystem.js';

/**
 * Test suite for Phase 6: Import Statement Enhancements
 * 
 * Tests enhanced import syntax including namespace imports with spaces,
 * multi-level namespace paths, and import aliases with spaces.
 * Updated to comply with RCL formal specification (no 'from' clause).
 */
describe('RCL Import Statement Enhancements', () => {
  let parser: RclCustomParser;

  beforeEach(() => {
    parser = new RclCustomParser();
  });

  describe('Basic Import Statements (Already Working)', () => {
    it('should parse simple import statements', () => {
      const input = `import Utils`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(1);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Utils']);
      expect(importStmt.alias).toBeUndefined();
    });

    it('should parse import statements with aliases', () => {
      const input = `import Utils as Helpers`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Utils']);
      expect(importStmt.alias).toBe('Helpers');
    });
  });

  describe('Namespace Imports with Spaces', () => {
    it('should parse namespace imports with spaces in names', () => {
      const input = `import My Brand / Samples as Sample One`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(1);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['My Brand', 'Samples']);
      expect(importStmt.alias).toBe('Sample One');
    });

    it('should parse multi-level namespace paths', () => {
      const input = `import Shared / Common Flows / Support`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Shared', 'Common Flows', 'Support']);
      expect(importStmt.alias).toBeUndefined();
    });

    it('should parse complex namespace with spaces and alias', () => {
      const input = `import Premium Customer / Support Flows as Customer Support`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Premium Customer', 'Support Flows']);
      expect(importStmt.alias).toBe('Customer Support');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle namespace paths without alias', () => {
      const input = `import Brand / Agent Templates`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Brand', 'Agent Templates']);
      expect(importStmt.alias).toBeUndefined();
    });

    it('should handle single namespace with spaces', () => {
      const input = `import Premium Support as Support`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Premium Support']);
      expect(importStmt.alias).toBe('Support');
    });

    it('should handle imports without source', () => {
      const input = `import Local Utils / Helpers`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      
      const importStmt = result.ast!.imports[0];
      expect(importStmt.importedNames).toEqual(['Local Utils', 'Helpers']);
      expect(importStmt.alias).toBeUndefined();
    });
  });

  describe('Mixed Import Statements', () => {
    it('should parse multiple different import types', () => {
      const input = `import Utils
import My Brand / Samples as Samples  
import Local Helper`;

      const result = parser.parse(input);
      
      expect(result.errors).toHaveLength(0);
      expect(result.ast?.imports).toHaveLength(3);
      
      // First import: simple
      expect(result.ast!.imports[0].importedNames).toEqual(['Utils']);
      expect(result.ast!.imports[0].alias).toBeUndefined();
      
      // Second import: namespace with alias
      expect(result.ast!.imports[1].importedNames).toEqual(['My Brand', 'Samples']);
      expect(result.ast!.imports[1].alias).toBe('Samples');
      
      // Third import: local without source
      expect(result.ast!.imports[2].importedNames).toEqual(['Local Helper']);
      expect(result.ast!.imports[2].alias).toBeUndefined();
    });
  });
});

describe('Import Resolution Logic', () => {
  // Use the utilities directly from the utils module
  const fs = require('node:fs');
  const path = require('node:path');
  const os = require('node:os');

  function withTempDir(testFn: (dir: string) => void) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rcl-import-test-'));
    try {
      testFn(tmp);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }

  it('should resolve a simple file import (case-insensitive)', () => {
    withTempDir(tmp => {
      const file = path.join(tmp, 'utils.rcl');
      fs.writeFileSync(file, '');
      const result = resolveImportPath(['Utils'], { currentFilePath: file });
      // On case-insensitive filesystems, the resolved path might have different case
      expect(result.filePath.toLowerCase()).toBe(file.toLowerCase());
      expect(result.sectionName).toBeUndefined();
    });
  });

  it('should resolve a multi-level namespace to a file', () => {
    withTempDir(tmp => {
      // Create a project root marker
      fs.writeFileSync(path.join(tmp, 'rclconfig.yml'), '');
      
      const dir = path.join(tmp, 'shared', 'common flows');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'retail.rcl');
      fs.writeFileSync(file, '');
      
      // Use a different file as the currentFilePath to ensure project root detection works
      const currentFile = path.join(tmp, 'current.rcl');
      fs.writeFileSync(currentFile, '');
      
      const result = resolveImportPath(['Shared', 'Common Flows', 'Retail'], { currentFilePath: currentFile });
      // On case-insensitive filesystems, the resolved path might have different case
      expect(result.filePath.toLowerCase()).toBe(file.toLowerCase());
      expect(result.sectionName).toBeUndefined();
    });
  });

  it('should resolve a section in a parent file', () => {
    withTempDir(tmp => {
      // Create a project root marker
      fs.writeFileSync(path.join(tmp, 'rclconfig.yml'), '');
      
      // Create the directory structure
      const sharedDir = path.join(tmp, 'shared');
      fs.mkdirSync(sharedDir, { recursive: true });
      
      // Create the parent file that should be found for ['Shared', 'Common Flows', 'Retail', 'Catalog']
      // This should resolve to section 'Catalog' in file 'shared/common flows/retail.rcl'
      const commonFlowsDir = path.join(sharedDir, 'common flows');
      fs.mkdirSync(commonFlowsDir, { recursive: true });
      const parentFile = path.join(commonFlowsDir, 'retail.rcl');
      fs.writeFileSync(parentFile, '');
      
      // Use a different file as the currentFilePath to ensure project root detection works
      const currentFile = path.join(tmp, 'current.rcl');
      fs.writeFileSync(currentFile, '');
      
      // Should resolve to section 'Catalog' in 'shared/common flows/retail.rcl' for ['Shared', 'Common Flows', 'Retail', 'Catalog']
      const result = resolveImportPath(['Shared', 'Common Flows', 'Retail', 'Catalog'], { currentFilePath: currentFile });
      // On case-insensitive filesystems, the resolved path might have different case
      expect(result.filePath.toLowerCase()).toBe(parentFile.toLowerCase());
      expect(result.sectionName).toBe('Catalog');
    });
  });

  it('should throw on ambiguity (multiple files)', () => {
    withTempDir(tmp => {
      // Create a project root marker
      fs.writeFileSync(path.join(tmp, 'rclconfig.yml'), '');
      
      // Create multiple directories with the same file name to simulate ambiguity
      const dir1 = path.join(tmp, 'shared', 'common flows');
      const dir2 = path.join(tmp, 'shared', 'common-flows');
      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });
      const file1 = path.join(dir1, 'retail.rcl');
      const file2 = path.join(dir2, 'retail.rcl');
      fs.writeFileSync(file1, '');
      fs.writeFileSync(file2, '');
      
      const currentFile = path.join(tmp, 'current.rcl');
      fs.writeFileSync(currentFile, '');
      
      expect(() => resolveImportPath(['Shared', 'Common Flows', 'Retail'], { currentFilePath: currentFile })).toThrow(/Ambiguous/);
    });
  });

  it('should throw if not found', () => {
    withTempDir(tmp => {
      expect(() => resolveImportPath(['DoesNotExist'], { currentFilePath: tmp + '/file.rcl' })).toThrow(/not found/i);
    });
  });

  it('should use project root detection', () => {
    withTempDir(tmp => {
      const configFile = path.join(tmp, 'rclconfig.yml');
      fs.writeFileSync(configFile, '');
      const subdir = path.join(tmp, 'foo', 'bar');
      fs.mkdirSync(subdir, { recursive: true });
      const file = path.join(subdir, 'baz.rcl');
      fs.writeFileSync(file, '');
      // Should detect project root as tmp
      const root = findProjectRoot(file);
      expect(root).toBe(tmp);
    });
  });

  it('should work in web environment with filesystem mock', () => {
    // Create a web-compatible filesystem mock
    const webFileSystem = {
      existsSync: (path: string) => {
        // Mock project root marker and utils file existing
        return path === '/project/rclconfig.yml' || path === '/project/utils.rcl';
      },
      join: (...paths: string[]) => paths.join('/').replace(/\/+/g, '/'),
      dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
      resolve: (path: string) => path.startsWith('/') ? path : '/' + path
    };

    // Test project root detection with web filesystem - should find /project due to rclconfig.yml
    const projectRoot = findProjectRoot('/project/src/file.rcl', webFileSystem);
    expect(projectRoot).toBe('/project'); // Should find project root

    // Test import resolution with web filesystem
    const result = resolveImportPath(['Utils'], { 
      currentFilePath: '/project/src/main.rcl',
      fileSystem: webFileSystem 
    });
    expect(result.filePath).toBe('/project/utils.rcl');
    expect(result.sectionName).toBeUndefined();
  });

  it('should fallback gracefully when files dont exist in web environment', () => {
    // Create a web filesystem mock where no files exist
    const emptyWebFileSystem = {
      existsSync: () => false,
      join: (...paths: string[]) => paths.join('/').replace(/\/+/g, '/'),
      dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
      resolve: (path: string) => path.startsWith('/') ? path : '/' + path
    };

    // Should throw "not found" error when no files exist
    expect(() => resolveImportPath(['DoesNotExist'], { 
      currentFilePath: '/project/src/main.rcl',
      fileSystem: emptyWebFileSystem 
    })).toThrow(/not found/i);
  });
}); 