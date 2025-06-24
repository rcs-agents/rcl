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
 * Create a complete grammar
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