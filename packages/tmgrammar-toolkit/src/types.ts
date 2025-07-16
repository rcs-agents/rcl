/**
 * Core types for TextMate grammar definitions
 * Direct mapping to tmlanguage schema with strong type safety
 */

import type { Scope } from './scopes/types.js';

/**
 * The URL to the TMLanguage JSON schema, used for validation and tooling.
 *
 * We vendor this schema from `martinring/tmlanguage` to ensure stability and
 * avoid external dependencies at runtime. The original schema can be found at:
 * https://github.com/martinring/tmlanguage
 *
 * @credits martinring
 */
export const schema = "https://raw.githubusercontent.com/svallory/tmgrammar-toolkit/main/vendor/schemas/tmlanguage.json";

/**
 * Special scope that indicates a larger construct that doesn't get a single color.
 * Expanded to meta.<key>.<grammar name> during emit.
 */
export const meta: unique symbol = Symbol("meta");

/**
 * Valid scope value - can be a string, result from scopes API, or meta symbol
 */
export type ScopeValue = string | Scope<string, string, string> | typeof meta;


/**
 * Base interface for all rules that must have a unique key for repository management
 */
export interface RuleKey {
  /** Rule's unique key through which identifies the rule in the repository. */
  key: string;
}

/**
 * A type representing a regular expression, either as a string or a RegExp object.
 */
export type RegexValue = string | RegExp;
export type RegexValueList = Array<RegexValue | RegexValue[]>;

/**
 * Scope assignment for a rule - can be a string, our scopes API, or meta symbol
 */
export interface RuleScope {
  /**
   * The TextMate scope that gets assigned to a match and colored by a theme.
   * Can be a string, result from scopes API, or meta symbol.
   * See https://macromates.com/manual/en/language_grammars#naming_conventions
   */
  scope: ScopeValue;
}

/**
 * Rules that can contain nested patterns
 */
export interface RulePatterns {
  patterns: Pattern[];
}

/**
 * Pattern can be a full rule definition, a rule reference, or a basic include pattern
 */
export type Pattern = Rule | RuleReference | BasicIncludePattern;

/**
 * Reference to a rule that will be converted to an include statement
 * Must be a rule with a key that exists in the repository
 */
export type RuleReference = MatchRule | BeginEndRule | IncludeRule;

/**
 * Capture group definitions for regex matches
 */
export type Captures = Record<
  string,
  RuleScope | RulePatterns
>;

/**
 * Union type for all possible rule types
 */
export type Rule =
  | MatchRule
  | BeginEndRule
  | IncludeRule
  | BasicIncludePattern;

/**
 * Simple pattern matching rule
 */
export interface MatchRule extends RuleScope, RuleKey {
  match: RegexValue;
  captures?: Captures;
}

/**
 * Begin/end block rule for multi-line constructs
 */
export interface BeginEndRule
  extends RuleKey,
    RuleScope,
    Partial<RulePatterns> {
  begin: RegexValue;
  end: RegexValue;
  beginCaptures?: Captures;
  endCaptures?: Captures;
  /** Optional content scope for text between begin/end */
  contentName?: string;
  /** Optional while pattern as alternative to end */
  while?: RegexValue;
}

/**
 * Include rule that references other patterns
 */
export interface IncludeRule extends RuleKey, RulePatterns {}

/**
 * For simple include directives like { include: '#repositoryKey' }
 */
export interface BasicIncludePattern {
  include: string;
}

/**
 * Type for a repository object
 */
export type Repository = Record<string, Rule>;

/**
 * Complete grammar definition
 */
export interface GrammarInput {
  name: string;
  scopeName: string;
  fileTypes: string[];
  patterns: Rule[];
  repositoryItems?: Rule[];
  firstLineMatch?: RegexValue;
  foldingStartMarker?: RegexValue;
  foldingStopMarker?: RegexValue;
  uuid?: string;
}

/**
 * Complete grammar definition with validation results
 */
export interface Grammar {
  isValid: boolean;
  grammar: GrammarInput;
  repository: Record<string, Rule>;
  errors: GrammarError[];
}

/**
 * Options for emitting grammars
 */
export interface EmitOptions {
  errorSourceFilePath?: string;
}

/**
 * Location information for errors
 */
export interface ErrorLocation {
  /** Source file path */
  filePath?: string;
  /** Rule key or identifier where error occurred */
  ruleKey?: string;
  /** Property name where error occurred */
  property?: string;
  /** Line number in source file */
  line?: number;
  /** Column number in source file */
  column?: number;
  /** Context path (e.g., "patterns[0].match") */
  contextPath?: string;
}

/**
 * Severity levels for errors and warnings
 */
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  REGEX = 'regex',
  SCOPE = 'scope',
  REFERENCE = 'reference',
  SYNTAX = 'syntax',
  SEMANTIC = 'semantic'
}

/**
 * Base grammar error interface
 */
export interface GrammarError {
  /** Error message */
  message: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Error category */
  category: ErrorCategory;
  /** Location information */
  location?: ErrorLocation;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional context or suggestions */
  context?: string;
  /** Nested errors (for complex validation) */
  innerErrors?: GrammarError[];
}

/**
 * Grammar validation error class
 */
export class GrammarValidationError extends Error implements GrammarError {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly location?: ErrorLocation;
  public readonly code?: string;
  public readonly context?: string;
  public readonly innerErrors?: GrammarError[];

  constructor(
    message: string,
    options: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      location?: ErrorLocation;
      code?: string;
      context?: string;
      innerErrors?: GrammarError[];
    } = {}
  ) {
    super(message);
    this.name = 'GrammarValidationError';
    this.severity = options.severity ?? ErrorSeverity.ERROR;
    this.category = options.category ?? ErrorCategory.VALIDATION;
    this.location = options.location;
    this.code = options.code;
    this.context = options.context;
    this.innerErrors = options.innerErrors;
  }

  /**
   * Create a formatted error message with location information
   */
  public getFormattedMessage(): string {
    let formatted = this.message;
    
    if (this.location) {
      const parts: string[] = [];
      
      if (this.location.filePath) {
        parts.push(`File: ${this.location.filePath}`);
      }
      
      if (this.location.line !== undefined) {
        const lineCol = this.location.column !== undefined 
          ? `${this.location.line}:${this.location.column}`
          : `${this.location.line}`;
        parts.push(`Line: ${lineCol}`);
      }
      
      if (this.location.ruleKey) {
        parts.push(`Rule: ${this.location.ruleKey}`);
      }
      
      if (this.location.contextPath) {
        parts.push(`Context: ${this.location.contextPath}`);
      }
      
      if (parts.length > 0) {
        formatted += ` (${parts.join(', ')})`;
      }
    }
    
    if (this.context) {
      formatted += `\n${this.context}`;
    }
    
    return formatted;
  }

  /**
   * Convert to a plain object for serialization
   */
  public toJSON(): GrammarError {
    return {
      message: this.message,
      severity: this.severity,
      category: this.category,
      location: this.location,
      code: this.code,
      context: this.context,
      innerErrors: this.innerErrors
    };
  }
}

/**
 * Helper function to create grammar errors with location context
 */
export function createGrammarError(
  message: string,
  options: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    location?: Partial<ErrorLocation>;
    code?: string;
    context?: string;
    innerErrors?: GrammarError[];
  } = {}
): GrammarValidationError {
  return new GrammarValidationError(message, {
    ...options,
    location: options.location ? {
      filePath: options.location.filePath,
      ruleKey: options.location.ruleKey,
      property: options.location.property,
      line: options.location.line,
      column: options.location.column,
      contextPath: options.location.contextPath
    } : undefined
  });
}

/**
 * Output grammar that matches the tmlanguage schema root definition
 */
export interface TMLanguageGrammar {
  name?: string;
  scopeName: string;
  fileTypes?: string[];
  patterns: any[];
  repository?: Record<string, any>;
  firstLineMatch?: string;
  foldingStartMarker?: string;
  foldingStopMarker?: string;
  uuid?: string;
}

 