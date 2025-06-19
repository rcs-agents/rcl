import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOnigScanner, createOnigString, loadWASM } from 'vscode-oniguruma';
import { Registry, IGrammar, ITokenizeLineResult } from 'vscode-textmate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScopeToken {
  startIndex: number;
  endIndex: number;
  scopes: string[];
  text: string;
}

interface ScopeTestCase {
  name: string;
  code: string;
  expectedScopes: {
    text: string;
    scopes: string[];
  }[];
}

/**
 * Initialize the TextMate grammar engine with WASM support
 */
async function initializeGrammar(): Promise<IGrammar | null> {
  try {
    // Load WASM for Oniguruma (regex engine used by TextMate)
    // Look for WASM in package node_modules or workspace root node_modules
    const possiblePaths = [
      path.join(__dirname, '../node_modules/vscode-oniguruma/release/onig.wasm'),
      path.join(__dirname, '../../../node_modules/vscode-oniguruma/release/onig.wasm'),
    ];
    
    let wasmPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        wasmPath = possiblePath;
        break;
      }
    }
    
    if (!wasmPath) {
      throw new Error('WASM file not found. Please run `bun install` in the workspace root.');
    }
    
    const wasmBin = fs.readFileSync(wasmPath);
    await loadWASM(wasmBin);

    // Load our RCL grammar
    const grammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');
    if (!fs.existsSync(grammarPath)) {
      throw new Error(`Grammar file not found at ${grammarPath}`);
    }

    const grammarContent = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));

    // Create registry with our grammar
    const registry = new Registry({
      onigLib: Promise.resolve({
        createOnigScanner,
        createOnigString,
      }),
      loadGrammar: async (scopeName: string) => {
        if (scopeName === 'source.rcl') {
          return grammarContent;
        }
        return null;
      },
    });

    return await registry.loadGrammar('source.rcl');
  } catch (error) {
    console.error('❌ Failed to initialize grammar:', error);
    return null;
  }
}

/**
 * Tokenize a line of code and extract scope information
 */
function tokenizeLine(grammar: IGrammar, line: string, ruleStack?: any): ScopeToken[] {
  const result = grammar.tokenizeLine(line, ruleStack);
  const tokens: ScopeToken[] = [];

  for (let i = 0; i < result.tokens.length; i++) {
    const token = result.tokens[i];
    const nextToken = result.tokens[i + 1];
    
    const startIndex = token.startIndex;
    const endIndex = nextToken ? nextToken.startIndex : line.length;
    const text = line.substring(startIndex, endIndex);

    tokens.push({
      startIndex,
      endIndex,
      scopes: token.scopes,
      text,
    });
  }

  return tokens;
}

/**
 * Inspect scopes for a multi-line code snippet
 */
function inspectScopes(grammar: IGrammar, code: string): {
  lines: Array<{
    lineNumber: number;
    text: string;
    tokens: ScopeToken[];
  }>;
  summary: {
    totalTokens: number;
    uniqueScopes: string[];
  };
} {
  const lines = code.split('\n');
  const result: any = { lines: [], summary: { totalTokens: 0, uniqueScopes: new Set() } };
  let ruleStack: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = tokenizeLine(grammar, line, ruleStack);
    
    // Update rule stack for next line
    const tokenizeResult = grammar.tokenizeLine(line, ruleStack);
    ruleStack = tokenizeResult.ruleStack;

    result.lines.push({
      lineNumber: i + 1,
      text: line,
      tokens,
    });

    result.summary.totalTokens += tokens.length;
    tokens.forEach(token => {
      token.scopes.forEach(scope => result.summary.uniqueScopes.add(scope));
    });
  }

  result.summary.uniqueScopes = Array.from(result.summary.uniqueScopes).sort();
  return result;
}

/**
 * Format scope inspection results for console output
 */
function formatScopeResults(results: any): string {
  let output = '';

  // Header
  output += '🔍 RCL Grammar Scope Inspection Results\n';
  output += '=====================================\n\n';

  // Summary
  output += `📊 Summary:\n`;
  output += `   Total lines: ${results.lines.length}\n`;
  output += `   Total tokens: ${results.summary.totalTokens}\n`;
  output += `   Unique scopes: ${results.summary.uniqueScopes.length}\n\n`;

  // Line-by-line breakdown
  for (const line of results.lines) {
    output += `Line ${line.lineNumber}: "${line.text}"\n`;
    
    if (line.tokens.length === 0) {
      output += '   (no tokens)\n';
    } else {
      for (const token of line.tokens) {
        const paddedText = `"${token.text}"`.padEnd(20);
        const scopeChain = token.scopes.join(' → ');
        output += `   ${paddedText} [${token.startIndex}-${token.endIndex}]: ${scopeChain}\n`;
      }
    }
    output += '\n';
  }

  // Scope summary
  output += '🏷️  All Unique Scopes Found:\n';
  output += '==========================\n';
  for (const scope of results.summary.uniqueScopes) {
    output += `   ${scope}\n`;
  }

  return output;
}

/**
 * Test specific scope expectations
 */
function runScopeTests(grammar: IGrammar, testCases: ScopeTestCase[]): boolean {
  console.log('🧪 Running Scope Tests\n');
  
  let allPassed = true;
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    const results = inspectScopes(grammar, testCase.code);
    
    let testPassed = true;
    
    // Check if expected text/scope combinations exist
    for (const expected of testCase.expectedScopes) {
      let found = false;
      
      for (const line of results.lines) {
        for (const token of line.tokens) {
          if (token.text.trim() === expected.text.trim()) {
            const hasAllScopes = expected.scopes.every(scope => 
              token.scopes.includes(scope)
            );
            if (hasAllScopes) {
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      
      if (!found) {
        console.log(`   ❌ Expected "${expected.text}" with scopes: ${expected.scopes.join(', ')}`);
        testPassed = false;
      } else {
        console.log(`   ✅ Found "${expected.text}" with expected scopes`);
      }
    }
    
    if (!testPassed) {
      allPassed = false;
      console.log(`   Full results for debugging:`);
      console.log(formatScopeResults(results));
    }
    
    console.log('');
  }
  
  return allPassed;
}

/**
 * Pre-defined test cases for common RCL patterns
 */
const DEFAULT_TEST_CASES: ScopeTestCase[] = [
  {
    name: 'Agent section declaration',
    code: 'agent Test Agent',
    expectedScopes: [
      { text: 'agent', scopes: ['keyword.control.section.agent.rcl'] },
      { text: 'Test Agent', scopes: ['entity.name.section.agent.rcl'] },
    ],
  },
  {
    name: 'Config section with boolean',
    code: `Config
  enabled: True`,
    expectedScopes: [
      { text: 'Config', scopes: ['keyword.control.section.rcl'] },
      { text: 'enabled', scopes: ['variable.other.property.rcl'] },
      { text: 'True', scopes: ['constant.language.boolean.rcl'] },
    ],
  },
  {
    name: 'JavaScript embedded expression',
    code: 'value: $js> new Date().toISOString()',
    expectedScopes: [
      { text: 'value', scopes: ['variable.other.property.rcl'] },
      { text: '$js>', scopes: ['keyword.control.embedded.marker.js.rcl'] },
      { text: 'new Date().toISOString()', scopes: ['source.js'] },
    ],
  },
  {
    name: 'Multi-line string',
    code: `description: |
  This is a multi-line
  string with proper
  indentation`,
    expectedScopes: [
      { text: 'description', scopes: ['variable.other.property.rcl'] },
      { text: '|', scopes: ['punctuation.definition.string.multiline.begin.rcl'] },
    ],
  },
];

/**
 * Interactive scope inspector - inspect a specific piece of code
 */
async function inspectCode(code: string): Promise<void> {
  console.log('🔍 Inspecting RCL Code Scopes\n');
  
  const grammar = await initializeGrammar();
  if (!grammar) {
    console.error('❌ Failed to load grammar');
    return;
  }

  const results = inspectScopes(grammar, code);
  console.log(formatScopeResults(results));
}

/**
 * Run comprehensive scope tests
 */
async function runComprehensiveTests(): Promise<boolean> {
  console.log('🧪 Running Comprehensive Scope Tests\n');
  
  const grammar = await initializeGrammar();
  if (!grammar) {
    console.error('❌ Failed to load grammar');
    return false;
  }

  // Run pre-defined test cases
  const testsPassed = runScopeTests(grammar, DEFAULT_TEST_CASES);
  
  // Test with example files
  const examplesDir = path.join(__dirname, '../../../examples');
  if (fs.existsSync(examplesDir)) {
    console.log('📁 Testing with example files:');
    
    const exampleFiles = fs.readdirSync(examplesDir)
      .filter(file => file.endsWith('.rcl'))
      .slice(0, 3); // Test first 3 files to avoid too much output
    
    for (const file of exampleFiles) {
      const filePath = path.join(examplesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`\n📄 Testing ${file}:`);
      const results = inspectScopes(grammar, content);
      console.log(`   Found ${results.summary.totalTokens} tokens with ${results.summary.uniqueScopes.length} unique scopes`);
      
      // Check for critical scopes
      const criticalScopes = [
        'keyword.other.agent.rcl',
        'keyword.other.config.rcl',
        'variable.other.attribute.rcl',
        'constant.language.boolean',
      ];
      
      const foundCritical = criticalScopes.filter(scope => 
        results.summary.uniqueScopes.some(found => found.includes(scope))
      );
      
      console.log(`   Critical scopes found: ${foundCritical.length}/${criticalScopes.length}`);
    }
  }
  
  return testsPassed;
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔍 RCL Scope Inspector');
    console.log('====================\n');
    console.log('Usage:');
    console.log('  bun run scripts/test-scope-inspector.ts test           # Run comprehensive tests');
    console.log('  bun run scripts/test-scope-inspector.ts inspect "code" # Inspect specific code');
    console.log('  bun run scripts/test-scope-inspector.ts file path.rcl  # Inspect file');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'test':
      const success = await runComprehensiveTests();
      process.exit(success ? 0 : 1);
      break;
      
    case 'inspect':
      if (args[1]) {
        await inspectCode(args[1]);
      } else {
        console.error('❌ Please provide code to inspect');
        process.exit(1);
      }
      break;
      
    case 'file':
      if (args[1]) {
        const filePath = path.resolve(args[1]);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          await inspectCode(content);
        } else {
          console.error(`❌ File not found: ${filePath}`);
          process.exit(1);
        }
      } else {
        console.error('❌ Please provide file path');
        process.exit(1);
      }
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

/**
 * Export for use in other scripts
 */
export { inspectCode, runComprehensiveTests, initializeGrammar, inspectScopes };

/**
 * Run if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
} 