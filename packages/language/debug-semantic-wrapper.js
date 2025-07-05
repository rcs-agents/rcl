import { RclParser } from './src/parser/parser/index.js';

// Test the exact structure from integration test
const testInput = `agent BMW Customer Service:
    displayName: "BMW Customer Service Agent"
    
    flow Welcome Flow:
      :start -> welcome_message
    
    flow Contact Support Flow:
      :start -> support_greeting

    messages Messages:
      welcome_message: "Welcome to BMW Customer Service"
      support_greeting: "How can we help you today?"`;

console.log('Testing exact integration test structure:');
console.log(testInput);
console.log('\n=== Parsing result ===');

const parser = new RclParser();
const result = parser.parse(testInput);

console.log('Parse errors:', result.errors);
console.log('AST available:', !!result.ast);
console.log('AST type:', result.ast?.type);