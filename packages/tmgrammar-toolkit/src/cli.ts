#!/usr/bin/env node

import { Command } from 'commander';
import { resolve, extname } from 'node:path';
import { writeFile as writeFileAsync } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { pathToFileURL as convertPathToURL } from 'node:url';
import { emitJSON } from './emit.js';
import { validateGrammar } from './validation/grammar.js';
import type { Grammar } from './types.js';

const program = new Command();

program
  .name('tmt')
  .description('TextMate Toolkit CLI - A unified toolkit for TextMate grammar authoring, testing, and validation')
  .version('0.1.0');

/**
 * Check if Bun is available on the system
 */
async function isBunAvailable(): Promise<boolean> {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Load grammar from TypeScript file using Bun
 */
async function loadGrammarWithBun(filePath: string, exportName?: string): Promise<Grammar> {
  const escapedPath = filePath.replace(/'/g, "\\'");
  const exportToTry = exportName || 'default';
  
  const script = `
    import { pathToFileURL } from 'node:url';
    try {
      const module = await import(pathToFileURL('${escapedPath}').toString());
      const exportToTry = '${exportToTry}';
      const grammar = module[exportToTry] || module.default || module.grammar;
      
      if (!grammar) {
        const availableExports = Object.keys(module).filter(k => k !== 'default');
        console.error('Error: No grammar found. Available exports: ' + availableExports.join(', '));
        process.exit(1);
      }
      
      console.log(JSON.stringify(grammar, (key, value) => 
        value instanceof RegExp ? { __regex: value.source } : value
      ));
    } catch (error) {
      console.error('Error loading grammar:', error.message);
      process.exit(1);
    }
  `;
  
  try {
    const result = execSync(`bun -e "${script}"`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit']
    });
    const parsed = JSON.parse(result);
    return restoreRegexObjects(parsed);
  } catch (error) {
    throw new Error(`Failed to load grammar with Bun: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load grammar from JavaScript file using Node.js direct import
 */
async function loadGrammarWithNode(filePath: string, exportName?: string): Promise<Grammar> {
  const moduleUrl = convertPathToURL(filePath).toString();
  const module = await import(moduleUrl);
  
  const grammar = module[exportName || 'default'] || module.default || module.grammar;
  
  if (!grammar) {
    const availableExports = Object.keys(module).filter(k => k !== 'default');
    throw new Error(
      `No grammar found in ${filePath}. Available exports: ${availableExports.join(', ')}`
    );
  }
  
  return grammar;
}

/**
 * Load and validate a grammar from a TypeScript or JavaScript file
 */
async function loadGrammarFromFile(filePath: string, exportName?: string): Promise<Grammar> {
  const resolvedPath = resolve(filePath);
  const ext = extname(resolvedPath);
  
  // Validate file extension
  if (!['.ts', '.js', '.mts', '.mjs'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Expected .ts, .js, .mts, or .mjs`);
  }

  let grammar: Grammar;
  
  try {
    if (['.ts', '.mts'].includes(ext)) {
      // TypeScript: Require Bun
      if (!await isBunAvailable()) {
        throw new Error(
          'Bun is required for TypeScript file support.\n' +
          'Install Bun: https://bun.sh/docs/installation\n' +
          'Or convert your grammar to JavaScript.'
        );
      }
      grammar = await loadGrammarWithBun(resolvedPath, exportName);
    } else {
      // JavaScript: Use Node.js direct import
      grammar = await loadGrammarWithNode(resolvedPath, exportName);
    }

    // Validate the loaded grammar
    const validation = validateGrammar(grammar);
    if (!validation.valid) {
      throw new Error(`Invalid grammar:\n${validation.errors.join('\n')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('Grammar validation warnings:');
      for (const warning of validation.warnings) {
        console.warn(`  - ${warning}`);
      }
    }
    
    return grammar;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load grammar from ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to restore RegExp objects from serialized format
 */
function restoreRegexObjects(obj: any): any {
  if (obj && typeof obj === 'object') {
    if (obj.__regex) {
      return new RegExp(obj.__regex);
    }
    if (Array.isArray(obj)) {
      return obj.map(restoreRegexObjects);
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = restoreRegexObjects(value);
    }
    return result;
  }
  return obj;
}

// Emit command
program
  .command('emit')
  .description('Emit a TextMate grammar in JSON format from a TypeScript file')
  .argument('<ts-file>', 'Path to TypeScript file containing grammar')
  .argument('[export-name]', 'Name of export (defaults to "default" then "grammar")')
  .option('-o, --output <file>', 'Output file path (defaults to stdout)')
  .action(async (tsFile: string, exportName?: string, options?: { 
    output?: string; 
  }) => {
    try {
      // Load and validate grammar
      const grammar = await loadGrammarFromFile(tsFile, exportName);
      
      const output = await emitJSON(grammar);
      
      // Output to file or stdout
      if (options?.output) {
        await writeFileAsync(options.output, output, 'utf-8');
        console.log(`Grammar written to ${options.output}`);
      } else {
        console.log(output);
      }
      
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Test command (wrapper around vscode-tmgrammar-test)
program
  .command('test')
  .description('Run grammar tests using vscode-tmgrammar-test')
  .argument('<test-files>', 'Glob pattern for test files (e.g., "tests/**/*.test.lang")')
  .option('-g, --grammar <file>', 'Path to grammar file')
  .option('-c, --config <file>', 'Path to language configuration file')
  .option('--compact', 'Display output in compact format')
  .action((testFiles: string, options?: { 
    grammar?: string; 
    config?: string; 
    compact?: boolean; 
  }) => {
    try {
      const args = [testFiles];
      
      if (options?.grammar) {
        args.push('-g', options.grammar);
      }
      
      if (options?.config) {
        args.push('-c', options.config);
      }
      
      if (options?.compact) {
        args.push('--compact');
      }
      
      execSync(`vscode-tmgrammar-test ${args.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Test command failed');
      process.exit(1);
    }
  });

// Snapshot command (wrapper around vscode-tmgrammar-snap)
program
  .command('snap')
  .description('Run grammar snapshot tests using vscode-tmgrammar-snap')
  .argument('<test-files>', 'Glob pattern for test files')
  .option('-g, --grammar <file>', 'Path to grammar file')
  .option('-c, --config <file>', 'Path to language configuration file')
  .option('-u, --update', 'Update snapshot files')
  .option('--expand-diff', 'Expand diff output')
  .option('--print-not-modified', 'Include not modified scopes in output')
  .action((testFiles: string, options?: { 
    grammar?: string; 
    config?: string; 
    update?: boolean; 
    expandDiff?: boolean; 
    printNotModified?: boolean; 
  }) => {
    try {
      const args = [testFiles];
      
      if (options?.grammar) {
        args.push('-g', options.grammar);
      }
      
      if (options?.config) {
        args.push('-c', options.config);
      }
      
      if (options?.update) {
        args.push('-u');
      }
      
      if (options?.expandDiff) {
        args.push('--expand-diff');
      }
      
      if (options?.printNotModified) {
        args.push('--print-not-modified');
      }
      
      execSync(`vscode-tmgrammar-snap ${args.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Snapshot command failed');
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate a grammar file or TypeScript export')
  .argument('<file>', 'Path to grammar file (.tmLanguage.json) or TypeScript file')
  .argument('[export-name]', 'Export name for TypeScript files')
  .action(async (file: string, exportName?: string) => {
    try {
      let grammarToValidate: any;
      
      if (file.endsWith('.json')) {
        // Load JSON grammar file
        const { readJson } = await import('./utils/file.js');
        grammarToValidate = await readJson(file);
      } else {
        // Load from TypeScript file
        grammarToValidate = await loadGrammarFromFile(file, exportName);
      }
      
      const validation = validateGrammar(grammarToValidate);
      
      if (validation.valid) {
        console.log('✅ Grammar is valid');
        if (validation.warnings.length > 0) {
          console.log('\nWarnings:');
          for (const warning of validation.warnings) {
            console.log(`  ⚠️  ${warning}`);
          }
        }
      } else {
        console.log('❌ Grammar is invalid');
        console.log('\nErrors:');
        for (const error of validation.errors) {
          console.log(`  ❌ ${error}`);
        }
        process.exit(1);
      }
      
    } catch (error) {
      console.error('Validation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(); 