/**
 * Result of scope name validation
 */
export interface ScopeValidationResult {
  valid: boolean;
  scopeName: string;
  errors: string[];
  warnings: string[];
}

/**
 * Result of validating multiple scope names
 */
export interface ScopeValidationResults {
  valid: boolean;
  results: ScopeValidationResult[];
  errors: ScopeValidationResult[];
  totalScopes: number;
  validScopes: number;
} 

/**
 * Validate scope names according to TextMate conventions
 */
export function validateScopeName(scopeName: string): ScopeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic format validation
  if (!scopeName) {
    errors.push('Scope name cannot be empty');
    return { valid: false, scopeName, errors, warnings };
  }

  if (typeof scopeName !== 'string') {
    errors.push('Scope name must be a string');
    return { valid: false, scopeName, errors, warnings };
  }

  // Check for valid characters (letters, numbers, dots, hyphens)
  if (!/^[a-zA-Z0-9.-]+$/.test(scopeName)) {
    errors.push('Scope name contains invalid characters. Only letters, numbers, dots, and hyphens are allowed');
  }

  // Check structure
  const parts = scopeName.split('.');

  if (parts.length < 2) {
    warnings.push('Scope name should have at least two parts separated by dots');
  }

  // Check for common root scopes
  const validRoots = ['source', 'text', 'meta', 'keyword', 'entity', 'variable', 'constant', 'string', 'comment', 'markup'];
  if (!validRoots.includes(parts[0])) {
    warnings.push(`Scope name should start with a common root scope like: ${validRoots.join(', ')}`);
  }

  // Check for empty parts
  if (parts.some(part => part.length === 0)) {
    errors.push('Scope name cannot have empty parts (consecutive dots)');
  }

  // Check for reserved patterns
  if (scopeName.includes('..')) {
    errors.push('Scope name cannot contain consecutive dots');
  }

  if (scopeName.startsWith('.') || scopeName.endsWith('.')) {
    errors.push('Scope name cannot start or end with a dot');
  }

  return {
    valid: errors.length === 0,
    scopeName,
    errors,
    warnings
  };
}

/**
 * Validate multiple scope names
 */
export function validateScopeNames(scopeNames: string[]): ScopeValidationResults {
  const results = scopeNames.map(validateScopeName);
  const valid = results.every(r => r.valid);
  const errors = results.filter(r => !r.valid);

  return {
    valid,
    results,
    errors,
    totalScopes: scopeNames.length,
    validScopes: results.filter(r => r.valid).length
  };
}