const result = parser.parse(input);

// Debug: print errors
if (result.errors.length > 0) {
  console.log('=== PARSING ERRORS ===');
  result.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}: ${error.message}`);
    console.log(`Location: line ${error.location?.start.line}, column ${error.location?.start.column}`);
  });
  console.log('======================');
}

expect(result.errors).toHaveLength(0);

it('should parse import statements', () => {
  const input = `import Shared/Utils as Utils
agent Simple Agent:
    name: "Simple"`;

  const result = parser.parse(input);
  
  expect(result.errors).toHaveLength(0);
  expect(result.ast?.imports).toHaveLength(1);
  
  const importStmt = result.ast!.imports[0];
  expect(importStmt.type).toBe('ImportStatement');
  expect(importStmt.importedNames).toEqual(['Shared', 'Utils']);
}); 