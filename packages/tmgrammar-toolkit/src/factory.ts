/**
 * Factory functions for creating TextMate grammar rules
 * Clean, type-safe constructors for all rule types
 */

import type {
  GrammarInput,
  Rule,
  RegexValue,
  Grammar
} from './types.js';
import { processGrammar } from './validation/grammar.js';
import type { GrammarResult } from './result.js';

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
 *     firstLineMatch: /^#!/
 *   }
 * );
 * ```
 */
/**
 * Creates and processes a complete TextMate grammar with automatic repository management.
 * 
 * Returns a Result that forces you to check for validation errors before using the grammar.
 * 
 * @param name - Human-readable name for the grammar
 * @param scopeName - Root scope identifier (e.g., "source.typescript")
 * @param fileTypes - File extensions this grammar applies to
 * @param patterns - Top-level grammar patterns/rules
 * @param options - Optional configuration
 * @returns Result containing processed Grammar or validation errors
 */
export function createGrammar(
  name: string,
  scopeName: string,
  fileTypes: string[],
  patterns: Rule[],
  options?: {
    firstLineMatch?: RegexValue;
    foldingStartMarker?: RegexValue;
    foldingStopMarker?: RegexValue;
    uuid?: string;
    filePath?: string;
  }
): GrammarResult<Grammar> {
  const grammarInput: GrammarInput = {
    name,
    scopeName,
    fileTypes,
    patterns,
    firstLineMatch: options?.firstLineMatch,
    foldingStartMarker: options?.foldingStartMarker,
    foldingStopMarker: options?.foldingStopMarker,
    uuid: options?.uuid,
  };
  
  return processGrammar(grammarInput, options?.filePath);
} 