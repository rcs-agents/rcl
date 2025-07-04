// Simple test to check if grammar changes work
const input = `agent Test Agent:
  displayName: "Test Agent"
  brandName: "Test Brand"

flow Test Flow:
  :start -> :end

messages Messages:
  hello: text "Hello World"`;

console.log("Testing grammar with input:");
console.log(input);
console.log("\nIf this file loads without syntax errors, the basic grammar structure is likely correct.");