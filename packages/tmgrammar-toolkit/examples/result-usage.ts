/**
 * Example usage of the Result pattern in the grammar toolkit
 */

import { 
  Result, 
  ok, 
  error, 
  isOk, 
  isError, 
  pipe,
  type ValidationResult, 
  type StringResult 
} from '../src/result.js';
import { GrammarValidationError } from '../src/types.js';

// Example 1: Basic usage with type guards
function parseNumber(input: string): StringResult<number> {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return error(`Invalid number: ${input}`);
  }
  return ok(num);
}

// Example 2: Validation function that returns ValidationResult
function validateGrammarName(name: string): ValidationResult<string> {
  if (!name || name.trim().length === 0) {
    return error(new GrammarValidationError('Grammar name cannot be empty'));
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    return error(new GrammarValidationError('Grammar name must start with a letter and contain only letters, numbers, hyphens, and underscores'));
  }
  
  return ok(name.trim());
}

// Example 3: Chain operations with map and flatMap
function processUserInput(input: string): StringResult<string> {
  return Result.map(parseNumber(input), num => num * 2)
    .flatMap(doubled => {
      if (doubled > 100) {
        return error('Result too large');
      }
      return ok(`Processed: ${doubled}`);
    });
}

// Example 4: Using the pipe function for functional composition
function processInputWithPipe(input: string): string {
  return pipe(parseNumber(input))
    .map(num => num * 2)
    .flatMap(doubled => doubled > 100 ? error('Too large') : ok(doubled))
    .map(doubled => `Result: ${doubled}`)
    .unwrapOr('Invalid input');
}

// Example 5: Combining multiple Results
function combineResults(inputs: string[]): StringResult<number[]> {
  const results = inputs.map(parseNumber);
  return Result.all(results);
}

// Example 6: Error handling with match
function handleResult(input: string): string {
  const result = parseNumber(input);
  
  return Result.match(result, {
    ok: (num) => `Successfully parsed: ${num}`,
    error: (err) => `Failed to parse: ${err}`
  });
}

// Example 7: Using tap for side effects (like logging)
function parseWithLogging(input: string): StringResult<number> {
  return pipe(parseNumber(input))
    .tap(num => console.log(`Parsed number: ${num}`))
    .tapError(err => console.error(`Parse error: ${err}`))
    .value;
}

// Example 8: Converting from Promise
async function parseFromAPI(url: string): Promise<StringResult<any>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return ok(data);
  } catch (err) {
    return error(`Network error: ${err}`);
  }
}

// Example 9: Using unwrapOr for default values
function getConfigValue(key: string, config: Record<string, any>): string {
  const result = key in config ? ok(config[key]) : error('Key not found');
  return Result.unwrapOr(result, 'default-value');
}

// Example 10: Complex validation chain
function validateAndProcessGrammar(name: string, content: string): ValidationResult<{name: string, processedContent: string}> {
  return pipe(validateGrammarName(name))
    .flatMap(validName => {
      if (content.length === 0) {
        return error(new GrammarValidationError('Grammar content cannot be empty'));
      }
      return ok({ name: validName, content });
    })
    .map(({ name, content }) => ({
      name,
      processedContent: content.trim()
    }))
    .value;
}

// Example usage demonstrations
console.log('=== Basic parsing ===');
console.log(handleResult('42'));      // "Successfully parsed: 42"
console.log(handleResult('invalid')); // "Failed to parse: Invalid number: invalid"

console.log('\n=== Functional composition ===');
console.log(processInputWithPipe('21'));    // "Result: 42"
console.log(processInputWithPipe('60'));    // "Invalid input" (120 > 100)
console.log(processInputWithPipe('abc'));   // "Invalid input"

console.log('\n=== Combining results ===');
const combineSuccess = combineResults(['1', '2', '3']);
if (isOk(combineSuccess)) {
  console.log('Combined successfully:', combineSuccess.value); // [1, 2, 3]
} else {
  console.log('Combine failed:', combineSuccess.error);
}

const combineFailure = combineResults(['1', 'invalid', '3']);
if (isError(combineFailure)) {
  console.log('Combine failed:', combineFailure.error); // "Invalid number: invalid"
}

console.log('\n=== Grammar validation ===');
const validGrammar = validateAndProcessGrammar('MyGrammar', '  some content  ');
if (isOk(validGrammar)) {
  console.log('Valid grammar:', validGrammar.value);
} else {
  console.log('Invalid grammar:', validGrammar.error.message);
}

const invalidGrammar = validateAndProcessGrammar('123Invalid', 'content');
if (isError(invalidGrammar)) {
  console.log('Invalid grammar:', invalidGrammar.error.message);
}

console.log('\n=== Default values ===');
const config = { theme: 'dark', maxItems: 10 };
console.log('Theme:', getConfigValue('theme', config));      // "dark"
console.log('Missing:', getConfigValue('missing', config));  // "default-value"