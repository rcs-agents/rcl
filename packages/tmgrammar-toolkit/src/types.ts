/**
 * Core types for TextMate grammar definitions
 * Direct mapping to tmlanguage schema with strong type safety
 */

import type { Scope } from './scopes/types.js';

export const schema =
  "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json";

/**
 * Special scope that indicates a larger construct that doesn't get a single color.
 * Expanded to meta.<key>.<grammar name> during emit.
 */
export const meta: unique symbol = Symbol("meta");

/**
 * Valid scope value - can be a string, result from scopes API, or meta symbol
 */
export type ScopeValue = string | Scope<string, string> | typeof meta;


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

export type RegexList = (RegexValue | RegexValue[])[];

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
export interface Grammar extends RulePatterns {
  $schema: typeof schema;
  name: string;
  scopeName: string;
  fileTypes: string[];
  /** Variables for pattern substitution */
  variables?: Record<string, string>;
  /** First line regex matcher */
  firstLineMatch?: RegexValue;
  /** Folding start marker regex */
  foldingStartMarker?: RegexValue;
  /** Folding stop marker regex */
  foldingStopMarker?: RegexValue;
  /** All rules that can be part of the repository, referenced by their key. */
  repositoryItems?: Rule[];
}

/**
 * Options for emitting grammars
 */
export interface EmitOptions {
  errorSourceFilePath?: string;
} 