/**
 * Programmatic testing utilities - Wrapper around existing scope.test.ts functionality
 * 
 * This module provides a programmatic API for testing grammars by wrapping
 * the existing tokenization and scope validation utilities from scope.test.ts.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import type { GrammarInitOptions, TokenInfo } from './types.js';
import type { IGrammar, StateStack } from 'vscode-textmate';
import type { Grammar } from '#src/types';

const createRequireFn = createRequire(import.meta.url);

// Import vscode-textmate and vscode-oniguruma (same as scope.test.ts)
const { createOnigScanner, createOnigString, loadWASM } = createRequireFn('vscode-oniguruma');
const { Registry } = createRequireFn('vscode-textmate');

// Import the actual grammar interface from vscode-textmate

/**
 * Programmatic tester for grammar validation
 */
export class ProgrammaticTester {
  private grammar: IGrammar | null = null;
  private initialized = false;

  constructor(private options: GrammarInitOptions) {}

  /**
   * Initialize the grammar for testing (copied from scope.test.ts)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load WASM for Oniguruma (same logic as scope.test.ts)
      const possiblePaths = [
        path.join(process.cwd(), 'node_modules/vscode-oniguruma/release/onig.wasm'),
        path.join(process.cwd(), '../node_modules/vscode-oniguruma/release/onig.wasm'),
        path.join(process.cwd(), '../../node_modules/vscode-oniguruma/release/onig.wasm'),
        path.join(process.cwd(), '../../../node_modules/vscode-oniguruma/release/onig.wasm'),
      ];
      
      let wasmPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          wasmPath = possiblePath;
          break;
        }
      }
      
      if (!wasmPath) {
        throw new Error('WASM file not found. Please ensure vscode-oniguruma is installed.');
      }
      
      const wasmBin = fs.readFileSync(wasmPath);
      await loadWASM(wasmBin);

      // Load grammar content
      let grammarContent: Grammar;
      if (this.options.grammar) {
        grammarContent = this.options.grammar;
      } else if (this.options.grammarPath) {
        if (!fs.existsSync(this.options.grammarPath)) {
          throw new Error(`Grammar file not found at ${this.options.grammarPath}`);
        }
        grammarContent = JSON.parse(fs.readFileSync(this.options.grammarPath, 'utf-8'));
      } else {
        throw new Error('Either grammarPath or grammarContent must be provided');
      }

      // Create registry with grammar
      const registry = new Registry({
        onigLib: Promise.resolve({
          createOnigScanner,
          createOnigString,
        }),
        loadGrammar: async (scopeName: string) => {
          if (scopeName === this.options.scopeName) {
            return grammarContent;
          }
          
          // Check for embedded grammars
          if (this.options.embeddedGrammars?.[scopeName]) {
            return this.options.embeddedGrammars[scopeName];
          }
          
          // Provide placeholder grammars for common embedded languages
          if (scopeName === 'source.js') {
            return {
              scopeName: 'source.js',
              patterns: [{ "match": ".*", "name": "source.js.embedded" }]
            };
          }
          if (scopeName === 'source.ts') {
            return {
              scopeName: 'source.ts', 
              patterns: [{ "match": ".*", "name": "source.ts.embedded" }]
            };
          }
          
          return null;
        },
      });

      this.grammar = await registry.loadGrammar(this.options.scopeName);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize grammar:', error);
      throw error;
    }
  }

  /**
   * Tokenize code and extract tokens with scope information (copied from scope.test.ts)
   */
  async tokenize(code: string): Promise<TokenInfo[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.grammar) {
      throw new Error('Grammar not initialized');
    }

    const lines = code.split('\n');
    const results: TokenInfo[] = [];
    let ruleStack: StateStack | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const result = this.grammar.tokenizeLine(line, ruleStack);
      
      for (const token of result.tokens) {
        const tokenText = line.substring(token.startIndex, token.endIndex);
        if (tokenText.trim()) { // Only include non-whitespace tokens
          results.push({
            text: tokenText,
            scopes: token.scopes,
            startIndex: token.startIndex,
            endIndex: token.endIndex,
            line: i
          });
        }
      }
      
      ruleStack = result.ruleStack;
    }

    return results;
  }

  /**
   * Check if a token has the expected scope (copied from scope.test.ts)
   */
  hasExpectedScope(token: TokenInfo, expectedScope: string): boolean {
    return token.scopes.some(scope => 
      scope === expectedScope || 
      scope.includes(expectedScope) ||
      expectedScope.includes(scope)
    );
  }

  /**
   * Find tokens by text
   */
  findTokens(tokens: TokenInfo[], text: string): TokenInfo[] {
    return tokens.filter(token => token.text === text);
  }

  /**
   * Find first token by text
   */
  findToken(tokens: TokenInfo[], text: string): TokenInfo | undefined {
    return tokens.find(token => token.text === text);
  }

  /**
   * Assert that a token has the expected scope
   */
  expectTokenScope(tokens: TokenInfo[], tokenText: string, expectedScope: string): boolean {
    const token = this.findToken(tokens, tokenText);
    if (!token) {
      throw new Error(`Token "${tokenText}" not found`);
    }
    
    const hasScope = this.hasExpectedScope(token, expectedScope);
    if (!hasScope) {
      throw new Error(
        `Token "${tokenText}" does not have expected scope "${expectedScope}". ` +
        `Actual scopes: ${token.scopes.join(', ')}`
      );
    }
    
    return true;
  }
}

/**
 * Create a programmatic tester from a grammar file
 */
export function createTesterFromFile(grammarPath: string, scopeName: string): ProgrammaticTester {
  return new ProgrammaticTester({ grammarPath, scopeName });
}

/**
 * Create a programmatic tester from grammar content
 */
export function createTesterFromContent(grammarContent: any, scopeName: string): ProgrammaticTester {
  return new ProgrammaticTester({ grammar: grammarContent, scopeName });
}

/**
 * Convenience function to tokenize code with a grammar file
 */
export async function tokenizeWithGrammar(
  code: string, 
  grammarPath: string, 
  scopeName: string
): Promise<TokenInfo[]> {
  const tester = createTesterFromFile(grammarPath, scopeName);
  return await tester.tokenize(code);
} 