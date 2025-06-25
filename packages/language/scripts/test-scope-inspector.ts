import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { OnigScanner, OnigString, loadWASM } from 'onigasm';

const require = createRequire(import.meta.url);
const { Registry } = require('vscode-textmate');

type IGrammar = any;
type ITokenizeLineResult = any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScopeToken {
  startIndex: number;
  endIndex: number;
  scopes: string[];
  text: string;
}

interface TokenInfo {
  text: string;
  scopes: string[];
  startIndex: number;
  endIndex: number;
  line: number;
}

interface ScopeTestCase {
  name: string;
  code: string;
  expectedScopes: {
    text: string;
    scopes: string[];
  }[];
}

interface TestCase {
  name: string;
  code: string;
  expectedScopes: {
    text: string;
    expectedScope: string;
  }[];
}

/**
 * Initialize the TextMate grammar engine with WASM support
 */
async function initializeGrammar(): Promise<IGrammar | null> {
  try {
    // Load WASM for Oniguruma
    const onigasmPath = require.resolve("onigasm");
    const wasmPath = path.resolve(path.dirname(onigasmPath), "onigasm.wasm");
    const wasmBin = await fs.promises.readFile(wasmPath);
    await loadWASM(wasmBin.buffer as any);

    // Load our RCL grammar
    const grammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');
    if (!fs.existsSync(grammarPath)) {
      throw new Error(`Grammar file not found at ${grammarPath}`);
    }

    const rclGrammarContent = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));

    // Placeholder for JS
    const jsPlaceholderGrammar = {
      scopeName: 'source.js',
      patterns: [{ "match": ".*", "name": "source.js.placeholder" }] // Match anything as a placeholder
    };

    // Placeholder for TS
    const tsPlaceholderGrammar = {
      scopeName: 'source.ts',
      patterns: [{ "match": ".*", "name": "source.ts.placeholder" }] // Match anything as a placeholder
    };

    // Create registry with our grammar
    const registry = new Registry({
      onigLib: Promise.resolve({
        createOnigScanner: (patterns: string[]) => new OnigScanner(patterns),
        createOnigString: (str: string) => new OnigString(str),
      }),
      loadGrammar: async (scopeName: string) => {
        if (scopeName === 'source.rcl') {
          return rclGrammarContent;
        }
        if (scopeName === 'source.js') {
          return jsPlaceholderGrammar;
        }
        if (scopeName === 'source.ts') {
          return tsPlaceholderGrammar;
        }
        console.warn(`Attempted to load unknown grammar: ${scopeName}`);
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
 * Comprehensive test cases based on example.rcl covering all major RCL constructs
 */
const COMPREHENSIVE_TEST_CASES: TestCase[] = [
  // Import statements
  {
    name: "Import statement",
    code: `import My Brand / Samples.one as Sample One`,
    expectedScopes: [
      { text: "import", expectedScope: "keyword.control.import.rcl" },
      { text: "My Brand", expectedScope: "entity.name.namespace.rcl" },
      { text: "/", expectedScope: "punctuation.separator.namespace.rcl" },
      { text: "Samples.one", expectedScope: "entity.name.module.rcl" },
      { text: "as", expectedScope: "keyword.control.import.rcl" },
      { text: "Sample One", expectedScope: "entity.name.alias.rcl" }
    ]
  },

  // Agent declaration
  {
    name: "Agent declaration",
    code: `agent My Brand`,
    expectedScopes: [
      { text: "agent", expectedScope: "keyword.control.section.agent.rcl" },
      { text: "My Brand", expectedScope: "entity.name.section.agent.rcl" }
    ]
  },

  // Config section
  {
    name: "Config section",
    code: `  Config`,
    expectedScopes: [
      { text: "Config", expectedScope: "keyword.control.section.config.rcl" }
    ]
  },

  // Property assignments
  {
    name: "String property",
    code: `    brandName: "Sample Brand"`,
    expectedScopes: [
      { text: "brandName", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: '"Sample Brand"', expectedScope: "string.quoted.double.rcl" }
    ]
  },

  // Atom values
  {
    name: "Atom property",
    code: `    agentUseCase: :TRANSACTIONAL`,
    expectedScopes: [
      { text: "agentUseCase", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: ":TRANSACTIONAL", expectedScope: "constant.other.atom.rcl" }
    ]
  },

  // Boolean values
  {
    name: "Boolean property",
    code: `    enabled: True`,
    expectedScopes: [
      { text: "enabled", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: "True", expectedScope: "constant.language.boolean.rcl" }
    ]
  },

  // Embedded expressions
  {
    name: "JavaScript expression",
    code: `    postbackData: $js> format @selectedOption.text as :dash_case`,
    expectedScopes: [
      { text: "postbackData", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: "$js>", expectedScope: "keyword.control.embedded.marker.js.rcl" },
      { text: "format @selectedOption.text as :dash_case", expectedScope: "meta.embedded.inline.javascript.rcl" }
    ]
  },

  // Flow rules
  {
    name: "Flow rule arrow",
    code: `    :start -> Welcome`,
    expectedScopes: [
      { text: ":start", expectedScope: "constant.other.atom.rcl" },
      { text: "->", expectedScope: "keyword.operator.flow.arrow.rcl" },
      { text: "Welcome", expectedScope: "variable.other.flow.target.rcl" }
    ]
  },

  // Flow conditions
  {
    name: "Flow when condition",
    code: `      when @option.text ...`,
    expectedScopes: [
      { text: "when", expectedScope: "keyword.control.flow.when.rcl" },
      { text: "@option.text", expectedScope: "variable.other.reference.rcl" },
      { text: "...", expectedScope: "keyword.operator.flow.ellipsis.rcl" }
    ]
  },

  // Message declarations
  {
    name: "Message declaration",
    code: `    message Welcome`,
    expectedScopes: [
      { text: "message", expectedScope: "keyword.control.section.message.rcl" },
      { text: "Welcome", expectedScope: "entity.name.section.message.rcl" }
    ]
  },

  // Agent message declarations
  {
    name: "Agent message declaration",
    code: `    agentMessage Welcome Full`,
    expectedScopes: [
      { text: "agentMessage", expectedScope: "keyword.control.section.agentmessage.rcl" },
      { text: "Welcome Full", expectedScope: "entity.name.section.agentmessage.rcl" }
    ]
  },

  // Suggestions
  {
    name: "Reply suggestion",
    code: `        reply: "Tell me more"`,
    expectedScopes: [
      { text: "reply", expectedScope: "keyword.control.suggestion.reply.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: '"Tell me more"', expectedScope: "string.quoted.double.rcl" }
    ]
  },

  // Actions
  {
    name: "Dial action",
    code: `        dialAction: "Call Us", "+1234567890"`,
    expectedScopes: [
      { text: "dialAction", expectedScope: "keyword.control.action.dial.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: '"Call Us"', expectedScope: "string.quoted.double.rcl" },
      { text: ",", expectedScope: "punctuation.separator.sequence.rcl" },
      { text: '"+1234567890"', expectedScope: "string.quoted.double.rcl" }
    ]
  },

  // Rich cards
  {
    name: "Rich card declaration",
    code: `        richCard`,
    expectedScopes: [
      { text: "richCard", expectedScope: "keyword.control.section.richcard.rcl" }
    ]
  },

  // Standalone cards
  {
    name: "Standalone card",
    code: `          standaloneCard`,
    expectedScopes: [
      { text: "standaloneCard", expectedScope: "keyword.control.section.standalonecard.rcl" }
    ]
  },

  // Numbers
  {
    name: "Number property",
    code: `    ttl: 3600`,
    expectedScopes: [
      { text: "ttl", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: "3600", expectedScope: "constant.numeric.integer.rcl" }
    ]
  },

  // Multi-line strings
  {
    name: "Multi-line string",
    code: `    description: |
      This is a multi-line
      description`,
    expectedScopes: [
      { text: "description", expectedScope: "variable.other.property.rcl" },
      { text: ":", expectedScope: "punctuation.separator.key-value.rcl" },
      { text: "|", expectedScope: "punctuation.definition.string.multiline.begin.rcl" },
      { text: "This is a multi-line", expectedScope: "string.quoted.multiline.content.rcl" },
      { text: "description", expectedScope: "string.quoted.multiline.content.rcl" }
    ]
  }
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
 * Simplified tokenization for comprehensive tests
 */
async function tokenizeCode(code: string): Promise<TokenInfo[]> {
  const grammar = await initializeGrammar();
  if (!grammar) {
    throw new Error('Failed to initialize grammar');
  }

  const lines = code.split('\n');
  const results: TokenInfo[] = [];

  let ruleStack: any = null; // Use null instead of vsctm.INITIAL
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const result = grammar.tokenizeLine(line, ruleStack);
    
    for (const token of result.tokens) {
      const tokenText = line.substring(token.startIndex, token.endIndex);
      results.push({
        text: tokenText,
        scopes: token.scopes,
        startIndex: token.startIndex,
        endIndex: token.endIndex,
        line: i
      });
    }
    
    ruleStack = result.ruleStack;
  }

  return results;
}

/**
 * Run comprehensive tests based on example.rcl
 */
async function runComprehensiveTests(): Promise<void> {
  console.log('\n🧪 Running Comprehensive RCL Scope Tests');
  console.log('==========================================\n');

  let passedTests = 0;
  let totalTests = 0;
  const failedTests: Array<{ name: string; issues: string[] }> = [];

  for (const testCase of COMPREHENSIVE_TEST_CASES) {
    totalTests++;
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`Code: ${testCase.code}`);

    try {
      const tokens = await tokenizeCode(testCase.code);
      console.log(`  Found ${tokens.length} tokens`);

      // Show all tokens first for debugging
      console.log('  🔍 All tokens:');
      tokens.forEach(token => {
        if (token.text.trim()) {
          console.log(`    "${token.text}" → [${token.scopes.join(', ')}]`);
        }
      });

      const issues: string[] = [];

      for (const expected of testCase.expectedScopes) {
        const matchingTokens = tokens.filter(token => {
          const tokenText = token.text.trim();
          const expectedText = expected.text.trim();
          return tokenText === expectedText || 
                 tokenText.includes(expectedText) || 
                 expectedText.includes(tokenText);
        });

        if (matchingTokens.length === 0) {
          issues.push(`❌ Text "${expected.text}" not found in tokens`);
          continue;
        }

        // Check if any of the matching tokens has the expected scope
        const hasExpectedScope = matchingTokens.some(token => 
          token.scopes.some(scope => 
            scope === expected.expectedScope || 
            scope.includes(expected.expectedScope) ||
            expected.expectedScope.includes(scope)
          )
        );

        if (!hasExpectedScope) {
          const actualScopes = matchingTokens.map(t => t.scopes.join(', ')).join(' | ');
          issues.push(`❌ "${expected.text}" expected scope "${expected.expectedScope}" but got: ${actualScopes}`);
        } else {
          console.log(`  ✅ "${expected.text}" → ${expected.expectedScope}`);
        }
      }

      if (issues.length === 0) {
        passedTests++;
        console.log(`  🎉 Test passed!`);
      } else {
        failedTests.push({ name: testCase.name, issues });
        console.log(`  ❌ Test failed with ${issues.length} issues:`);
        issues.forEach(issue => console.log(`    ${issue}`));
      }

    } catch (error) {
      failedTests.push({ 
        name: testCase.name, 
        issues: [`Error during tokenization: ${error instanceof Error ? error.message : String(error)}`] 
      });
      console.log(`  💥 Test error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${failedTests.length}/${totalTests}`);
  
  if (failedTests.length > 0) {
    console.log('\n🔍 Failed Test Details:');
    failedTests.forEach(({ name, issues }) => {
      console.log(`\n📋 ${name}:`);
      issues.forEach(issue => console.log(`  ${issue}`));
    });
  }

  console.log(`\n🎯 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔍 RCL Scope Inspector');
    console.log('=====================\n');
    console.log('Usage:');
    console.log('  bun run inspect:scopes <code>           # Inspect code snippet');
    console.log('  bun run inspect:file <file>             # Inspect entire file');
    console.log('  bun run test:scopes                     # Run predefined tests');
    console.log('  bun run test:comprehensive              # Run comprehensive tests');
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'test':
        await runTests();
        break;
      case 'comprehensive':
        await runComprehensiveTests();
        break;
      case 'file':
        if (args[1]) {
          await inspectFile(args[1]);
        } else {
          console.error('❌ Please provide a file path');
        }
        break;
      default:
        // Treat as code to inspect
        await inspectCode(args.join(' '));
        break;
    }
  } catch (error) {
    console.error('💥 Error:', error instanceof Error ? error.message : String(error));
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