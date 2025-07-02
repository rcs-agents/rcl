import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

// Test various import syntaxes according to formal spec
const tests = [
  "import Shared/Utils",
  "import Shared/Utils as Utils", 
  "import My Brand/Flow One as FlowOne",
  "import Single"
];

tests.forEach((test, i) => {
  console.log(`\n=== Test ${i + 1}: ${test} ===`);
  const input = `${test}
agent Test:
    name: "test"`;
  
  const result = parser.parse(input);
  console.log(`Errors: ${result.errors.length}`);
  if (result.errors.length > 0) {
    result.errors.forEach(error => console.log(`  - ${error.message}`));
  } else {
    console.log('Import parsed successfully:');
    console.log('  importedNames:', result.ast?.imports[0]?.importedNames);
  }
});
