/**
 * Centralized error handling for grammar validation and processing
 */

import type { 
  GrammarError, 
  ErrorLocation
} from './types.js';
import { GrammarValidationError, createGrammarError, ErrorSeverity, ErrorCategory } from './types.js';

/**
 * Common error codes for consistent error handling
 */
export const ErrorCodes = {
  // Validation errors
  MISSING_SCOPE_NAME: 'E001',
  MISSING_PATTERNS: 'E002',
  INVALID_SCOPE_NAME: 'E003',
  INVALID_FILE_TYPES: 'E004',
  
  // Regex errors
  INVALID_REGEX: 'E101',
  REGEX_COMPILATION_FAILED: 'E102',
  
  // Scope errors
  INVALID_SCOPE: 'E201',
  UNKNOWN_SCOPE: 'E202',
  
  // Reference errors
  MISSING_REFERENCE: 'E301',
  CIRCULAR_REFERENCE: 'E302',
  DUPLICATE_KEY: 'E303',
  
  // Syntax errors
  INVALID_RULE_TYPE: 'E401',
  MISSING_REQUIRED_FIELD: 'E402',
  INVALID_FIELD_TYPE: 'E403',
  
  // Semantic errors
  UNREACHABLE_RULE: 'E501',
  INEFFICIENT_PATTERN: 'E502'
} as const;

/**
 * Error factory for creating standardized grammar errors
 */
export class GrammarErrorFactory {
  constructor(private defaultLocation?: Partial<ErrorLocation>) {}

  /**
   * Create a validation error
   */
  validation(
    message: string,
    code?: string,
    location?: Partial<ErrorLocation>,
    context?: string
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.VALIDATION,
      code,
      location: { ...this.defaultLocation, ...location },
      context
    });
  }

  /**
   * Create a regex error
   */
  regex(
    message: string,
    pattern: string,
    code?: string,
    location?: Partial<ErrorLocation>
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.REGEX,
      code,
      location: { ...this.defaultLocation, ...location },
      context: `Pattern: ${pattern}`
    });
  }

  /**
   * Create a scope error
   */
  scope(
    message: string,
    scope: string,
    code?: string,
    location?: Partial<ErrorLocation>
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.SCOPE,
      code,
      location: { ...this.defaultLocation, ...location },
      context: `Scope: ${scope}`
    });
  }

  /**
   * Create a reference error
   */
  reference(
    message: string,
    reference: string,
    code?: string,
    location?: Partial<ErrorLocation>
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.REFERENCE,
      code,
      location: { ...this.defaultLocation, ...location },
      context: `Reference: ${reference}`
    });
  }

  /**
   * Create a syntax error
   */
  syntax(
    message: string,
    code?: string,
    location?: Partial<ErrorLocation>,
    context?: string
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.SYNTAX,
      code,
      location: { ...this.defaultLocation, ...location },
      context
    });
  }

  /**
   * Create a warning
   */
  warning(
    message: string,
    code?: string,
    location?: Partial<ErrorLocation>,
    context?: string
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.VALIDATION,
      code,
      location: { ...this.defaultLocation, ...location },
      context
    });
  }

  /**
   * Create info message
   */
  info(
    message: string,
    code?: string,
    location?: Partial<ErrorLocation>,
    context?: string
  ): GrammarValidationError {
    return createGrammarError(message, {
      severity: ErrorSeverity.INFO,
      category: ErrorCategory.VALIDATION,
      code,
      location: { ...this.defaultLocation, ...location },
      context
    });
  }

  /**
   * Create a new factory with updated default location
   */
  withLocation(location: Partial<ErrorLocation>): GrammarErrorFactory {
    return new GrammarErrorFactory({ ...this.defaultLocation, ...location });
  }
}

/**
 * Default error factory instance
 */
export const errorFactory = new GrammarErrorFactory();

/**
 * Collection of errors with utilities for management
 */
export class ErrorCollection {
  private errors: GrammarError[] = [];
  private warnings: GrammarError[] = [];
  private infos: GrammarError[] = [];

  /**
   * Add an error to the collection
   */
  add(error: GrammarError | GrammarValidationError): void {
    switch (error.severity) {
      case ErrorSeverity.ERROR:
        this.errors.push(error);
        break;
      case ErrorSeverity.WARNING:
        this.warnings.push(error);
        break;
      case ErrorSeverity.INFO:
        this.infos.push(error);
        break;
    }
  }

  /**
   * Add multiple errors
   */
  addAll(errors: (GrammarError | GrammarValidationError)[]): void {
    errors.forEach(error => this.add(error));
  }

  /**
   * Get all errors
   */
  getErrors(): GrammarError[] {
    return [...this.errors];
  }

  /**
   * Get all warnings
   */
  getWarnings(): GrammarError[] {
    return [...this.warnings];
  }

  /**
   * Get all info messages
   */
  getInfos(): GrammarError[] {
    return [...this.infos];
  }

  /**
   * Get all messages (errors, warnings, infos)
   */
  getAll(): GrammarError[] {
    return [...this.errors, ...this.warnings, ...this.infos];
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * Get count of errors
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Get count of warnings
   */
  getWarningCount(): number {
    return this.warnings.length;
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
  }

  /**
   * Format all errors for display
   */
  format(): string {
    const all = this.getAll();
    if (all.length === 0) return 'No errors or warnings';

    return all.map(error => {
      const prefix = `[${error.severity.toUpperCase()}${error.code ? ` ${error.code}` : ''}]`;
      if (error instanceof GrammarValidationError) {
        return `${prefix} ${error.getFormattedMessage()}`;
      }
      return `${prefix} ${error.message}`;
    }).join('\n');
  }
}

/**
 * Create a context-aware error factory for a specific rule
 */
export function createRuleErrorFactory(
  ruleKey: string,
  filePath?: string
): GrammarErrorFactory {
  return new GrammarErrorFactory({
    ruleKey,
    filePath
  });
}

/**
 * Create a context-aware error factory for a specific property
 */
export function createPropertyErrorFactory(
  ruleKey: string,
  property: string,
  filePath?: string,
  contextPath?: string
): GrammarErrorFactory {
  return new GrammarErrorFactory({
    ruleKey,
    property,
    filePath,
    contextPath
  });
}

// Re-export from types for convenience
export { GrammarValidationError };