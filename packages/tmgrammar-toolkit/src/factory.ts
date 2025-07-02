/**
 * Factory functions for creating TextMate grammar rules
 * Clean, type-safe constructors for all rule types
 */

import type {
  Grammar,
  Rule,
  RegexValue
} from './types.js';
import { schema } from './types.js';

/**
 * Creates a complete TextMate grammar with automatic repository management.
 * 
 * Rules with a `key` property are automatically collected and placed into the 
 * grammar's repository during emission. Use `repositoryItems` for explicit control
 * over which rules are included in the repository.
 * 
 * @param name - Human-readable name for the grammar (e.g., "TypeScript")
 * @param scopeName - Root scope identifier (e.g., "source.typescript")
 * @param fileTypes - File extensions this grammar applies to (e.g., ["ts", "tsx"])
 * @param patterns - Top-level grammar patterns/rules
 * @param options - Optional grammar configuration
 * @param options.variables - Variable definitions for pattern reuse
 * @param options.firstLineMatch - Regex to match first line for grammar detection
 * @param options.foldingStartMarker - Regex marking start of foldable sections
 * @param options.foldingStopMarker - Regex marking end of foldable sections
 * @param options.repositoryItems - Explicitly declare all repository rules for reliable processing
 * @returns Complete grammar ready for emission to TextMate format
 * 
 * @example
 * ```typescript
 * const grammar = createGrammar(
 *   'My Language',
 *   'source.mylang',
 *   ['mylang', 'ml'],
 *   [keywordRule, stringRule, commentRule],
 *   {
 *     repositoryItems: [keywordRule, stringRule, commentRule],
 *     firstLineMatch: /^#!/
 *   }
 * );
 * ```
 */
export function createGrammar(
  name: string,
  scopeName: string,
  fileTypes: string[],
  patterns: Rule[],
  options?: {
    variables?: Record<string, string>;
    firstLineMatch?: RegexValue;
    foldingStartMarker?: RegexValue;
    foldingStopMarker?: RegexValue;
    repositoryItems?: Rule[];
  }
): Grammar {
  return {
    $schema: schema,
    name,
    scopeName,
    fileTypes,
    patterns,
    repositoryItems: options?.repositoryItems,
    variables: options?.variables,
    firstLineMatch: options?.firstLineMatch,
    foldingStartMarker: options?.foldingStartMarker,
    foldingStopMarker: options?.foldingStopMarker,
  };
} 