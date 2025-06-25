import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTmLanguage } from './build-grammar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test the tmLanguage build process
 */
function testTmLanguageBuild(): boolean {
  console.log('🧪 Testing tmLanguage build process...\n');

  const baseGrammarPath = path.join(__dirname, '../syntaxes/rcl.base.tmLanguage.json');
  const enhancedGrammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');

  let success = true;
  const errors: string[] = [];

  // Test 1: Check if base grammar exists
  console.log('1. Checking base grammar exists...');
  if (!fs.existsSync(baseGrammarPath)) {
    errors.push(`❌ Base grammar not found at ${baseGrammarPath}`);
    console.log('   ❌ Base grammar not found. Run `bun run langium:generate` first.');
    success = false;
  } else {
    console.log('   ✅ Base grammar found');
  }

  // Test 2: Try to enhance the grammar
  console.log('2. Testing grammar enhancement...');
  try {
    generateTmLanguage();
    console.log('   ✅ Grammar enhancement completed');
  } catch (error) {
    errors.push(`❌ Grammar enhancement failed: ${error}`);
    console.log(`   ❌ Enhancement failed: ${error}`);
    success = false;
  }

  // Test 3: Check if enhanced grammar exists
  console.log('3. Checking enhanced grammar exists...');
  if (!fs.existsSync(enhancedGrammarPath)) {
    errors.push(`❌ Enhanced grammar not found at ${enhancedGrammarPath}`);
    console.log('   ❌ Enhanced grammar not generated');
    success = false;
  } else {
    console.log('   ✅ Enhanced grammar generated');
  }

  // Test 4: Validate enhanced grammar structure
  console.log('4. Validating enhanced grammar structure...');
  if (fs.existsSync(enhancedGrammarPath)) {
    try {
      const grammarContent = fs.readFileSync(enhancedGrammarPath, 'utf-8');
      const grammar = JSON.parse(grammarContent);

      // Check for required properties
      const requiredProps = ['name', 'scopeName', 'patterns', 'repository'];
      for (const prop of requiredProps) {
        if (!grammar[prop]) {
          errors.push(`❌ Missing required property: ${prop}`);
          success = false;
        }
      }

      // Check for embedded language patterns
      const embeddedPatterns = [
        'embedded-js-singleline',
        'embedded-ts-singleline',
        'embedded-generic-singleline',
        'embedded-js-multiline',
        'embedded-ts-multiline',
        'embedded-generic-multiline',
        'embedded-code'
      ];

      for (const pattern of embeddedPatterns) {
        if (!grammar.repository[pattern]) {
          errors.push(`❌ Missing embedded pattern: ${pattern}`);
          success = false;
        }
      }

      // Check if embedded-code is included in main patterns
      const hasEmbeddedInclude = grammar.patterns.some(
        (p: any) => p.include === '#embedded-code'
      );
      if (!hasEmbeddedInclude) {
        errors.push('❌ embedded-code not included in main patterns');
        success = false;
      }

      if (success) {
        console.log('   ✅ Grammar structure valid');
        console.log(`   📊 Found ${Object.keys(grammar.repository).length} repository entries`);
        console.log(`   📊 Found ${grammar.patterns.length} main patterns`);
      }

    } catch (error) {
      errors.push(`❌ Invalid JSON in enhanced grammar: ${error}`);
      console.log(`   ❌ Invalid JSON: ${error}`);
      success = false;
    }
  }

  // Test 5: File size check (enhanced should be larger than base)
  console.log('5. Comparing file sizes...');
  if (fs.existsSync(baseGrammarPath) && fs.existsSync(enhancedGrammarPath)) {
    const baseSize = fs.statSync(baseGrammarPath).size;
    const enhancedSize = fs.statSync(enhancedGrammarPath).size;

    if (enhancedSize <= baseSize) {
      errors.push('❌ Enhanced grammar should be larger than base grammar');
      console.log('   ❌ Enhanced grammar is not larger than base');
      success = false;
    } else {
      console.log(`   ✅ Enhanced grammar is ${enhancedSize - baseSize} bytes larger`);
    }
  }

  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');

  if (success) {
    console.log('🎉 All tests passed! tmLanguage build process is working correctly.');
    console.log('\n🚀 Next steps:');
    console.log('   - Build the extension: `cd ../extension && bun run build`');
    console.log('   - Test syntax highlighting in a .rcl file');
    console.log('   - Verify embedded language support works');
  } else {
    console.log('💥 Some tests failed:');
    for (const error of errors) {
      console.log(`   ${error}`);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure Langium has generated the base grammar');
    console.log('   - Check build script for syntax errors');
    console.log('   - Verify file permissions and paths');
  }

  return success;
}

/**
 * Main execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = testTmLanguageBuild();
  process.exit(success ? 0 : 1);
}

export { testTmLanguageBuild };