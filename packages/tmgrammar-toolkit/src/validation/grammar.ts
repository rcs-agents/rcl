/**
 * Result of grammar validation
 */
export interface GrammarValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  grammar: any;
}

/**
 * Validate a grammar structure (basic validation)
 * More comprehensive validation would be implemented in v2.0
 */
export function validateGrammar(grammar: any): GrammarValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!grammar.scopeName) {
    errors.push('Grammar must have a scopeName');
  }

  if (!grammar.patterns && !grammar.repository) {
    errors.push('Grammar must have either patterns or repository');
  }

  if (grammar.scopeName && typeof grammar.scopeName !== 'string') {
    errors.push('scopeName must be a string');
  }

  if (grammar.patterns && !Array.isArray(grammar.patterns)) {
    errors.push('patterns must be an array');
  }

  if (grammar.repository && typeof grammar.repository !== 'object') {
    errors.push('repository must be an object');
  }

  // Check for common issues
  if (grammar.scopeName && !grammar.scopeName.startsWith('source.')) {
    warnings.push('scopeName should typically start with "source."');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    grammar
  };
}
