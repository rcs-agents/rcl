import { RclCustomParser } from './lib/parser/rcl-custom-parser.js';

const parser = new RclCustomParser();

const input = `agent BMW Customer Service:
    description: "Customer support"
    
flow Welcome Flow:
        :start -> Welcome Message
    
messages Messages:
    welcome_message:
        text: "Welcome to BMW"`;

console.log('=== Multiple Sections Test (Fixed) ===');
const result = parser.parse(input);

console.log(`Errors: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}: ${error.message || error.toString()}`);
  });
}

if (result.ast) {
  console.log(`\nSections parsed: ${result.ast.sections.length}`);
  result.ast.sections.forEach((section, i) => {
    console.log(`  ${i + 1}: ${section.sectionType} "${section.name}"`);
  });
}
