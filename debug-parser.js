const { RclCustomParser } = require('./src/parser/rcl-custom-parser');

const parser = new RclCustomParser();

// Test the import statements case
const input = `import MyBrand/Flows
agent Simple Agent:
    name: "Simple"`;

console.log('=== Testing Import Statements ===');
console.log('Input:');
console.log(input);
console.log('\n=== Results ===');

const result = parser.parse(input);

console.log(`Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}: ${error.message}`);
    if (error.location) {
      console.log(`  Location: line ${error.location.start.line}, column ${error.location.start.column}`);
    }
  });
}

console.log('\nAST:');
console.log(JSON.stringify(result.ast, null, 2)); 