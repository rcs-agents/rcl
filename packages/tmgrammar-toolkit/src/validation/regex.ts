/**
 * Result of regex validation
 */
export interface RegexValidationResult {
  valid: boolean;
  pattern: string;
  error?: string;
}

/**
 * Result of validating multiple regex patterns
 */
export interface RegexValidationResults {
  valid: boolean;
  results: Array<{ pattern: string; valid: boolean; error?: string }>;
  errors: Array<{ pattern: string; valid: boolean; error?: string }>;
  totalPatterns: number;
  validPatterns: number;
}

/**
 * Basic regex validation using vscode-oniguruma
 * This is a minimal wrapper - more comprehensive validation would be in v2.0
 */
export async function validateRegex(pattern: string): Promise<RegexValidationResult> {
  try {
    const { createRequire } = await import('node:module');
    const createRequireFn = createRequire(import.meta.url);
    const { createOnigScanner } = createRequireFn('vscode-oniguruma');

    // Try to create a scanner with the pattern
    createOnigScanner([pattern]);

    return {
      valid: true,
      pattern
    };
  } catch (error: any) {
    return {
      valid: false,
      pattern,
      error: error.message || 'Invalid regex pattern'
    };
  }
}

/**
 * Validate multiple regex patterns at once
 */
export async function validateRegexPatterns(patterns: string[]): Promise<RegexValidationResults> {
  
  const results = await Promise.all(
    patterns.map(async (pattern) => {
      const result = await validateRegex(pattern);
      return { pattern, valid: result.valid, error: result.error };
    })
  );

  const valid = results.every(r => r.valid);
  const errors = results.filter(r => !r.valid);

  return {
    valid,
    results,
    errors,
    totalPatterns: patterns.length,
    validPatterns: results.filter(r => r.valid).length
  };
}