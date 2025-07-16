import type {
  GrammarInput,
  Grammar,
  Rule,
  Pattern,
  RuleReference,
  BasicIncludePattern,
} from '../types.js';
import { ErrorCollection, errorFactory, ErrorCodes } from '../errors.js';
import { ok, error, type GrammarResult } from '../result.js';

/**
 * Processes and validates a grammar input, discovering repository rules and validating structure.
 * 
 * @param grammar - The grammar input to process
 * @param filePath - Optional file path for error reporting
 * @returns Result containing processed Grammar or validation error
 */
export function processGrammar(grammar: GrammarInput, filePath?: string): GrammarResult<Grammar> {
  const repository = new Map<string, Rule>();
  const errorCollection = new ErrorCollection();
  const discoveredKeys = new Set<string>();
  const factory = errorFactory.withLocation({ filePath });

  function discoverRules(patterns: Pattern[], contextPath = 'patterns') {
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const currentContextPath = `${contextPath}[${i}]`;
      
      // It's a rule with a key, so it could be a repository item
      if ('key' in pattern && typeof (pattern as RuleReference).key === 'string') {
        const rule = pattern as RuleReference;
        const ruleFactory = factory.withLocation({ 
          ruleKey: rule.key,
          contextPath: currentContextPath
        });
        
        if (discoveredKeys.has(rule.key)) {
          // If we've seen this key before, check if it's the same object.
          // If not, it's a duplicate key error.
          const existingRule = repository.get(rule.key);
          if (existingRule && existingRule !== rule) {
            errorCollection.add(ruleFactory.reference(
              `Duplicate key found: '${rule.key}'. The same key is used for different rule objects.`,
              rule.key,
              ErrorCodes.DUPLICATE_KEY
            ));
          }
        } else {
          // First time seeing this key, add it to our repo and mark as discovered.
          repository.set(rule.key, rule);
          discoveredKeys.add(rule.key);
        }
      }

      // Recursively process nested patterns
      if ('patterns' in pattern && Array.isArray((pattern as { patterns: Pattern[] }).patterns)) {
        discoverRules((pattern as { patterns: Pattern[] }).patterns, `${currentContextPath}.patterns`);
      }

      // Process captures, which can also contain patterns
      const captureTypes = ['captures', 'beginCaptures', 'endCaptures'] as const;
      for (const captureType of captureTypes) {
        if (captureType in pattern && (pattern as any)[captureType]) {
          const captures = (pattern as any)[captureType] as Record<string, { patterns?: Pattern[] }>;
          for (const [captureIndex, capture] of Object.entries(captures)) {
            if (capture.patterns) {
              discoverRules(capture.patterns, `${currentContextPath}.${captureType}[${captureIndex}].patterns`);
            }
          }
        }
      }
    }
  }

  // Kick off the discovery process with the grammar's top-level patterns
  discoverRules(grammar.patterns, 'grammar.patterns');
  
  // Validate that all `include` directives point to a valid repository item.
  function validateIncludes(patterns: Pattern[], contextPath = 'patterns') {
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const currentContextPath = `${contextPath}[${i}]`;
      
      if ('include' in pattern) {
        const include = (pattern as BasicIncludePattern).include;
        if (include.startsWith('#')) {
          const key = include.substring(1);
          if (!repository.has(key)) {
            errorCollection.add(factory.reference(
              `Broken include: rule with key '${key}' not found in the repository.`,
              key,
              ErrorCodes.MISSING_REFERENCE,
              { contextPath: `${currentContextPath}.include` }
            ));
          }
        }
      }
      
      if ('patterns' in pattern && Array.isArray((pattern as { patterns: Pattern[] }).patterns)) {
        validateIncludes((pattern as { patterns: Pattern[] }).patterns, `${currentContextPath}.patterns`);
      }
    }
  }
  
  validateIncludes(grammar.patterns, 'grammar.patterns');

  const result: Grammar = {
    isValid: !errorCollection.hasErrors(),
    grammar,
    repository: Object.fromEntries(repository),
    errors: errorCollection.getAll(),
  };

  if (errorCollection.hasErrors()) {
    return error(errorCollection.getErrors()[0]);
  }

  return ok(result);
}