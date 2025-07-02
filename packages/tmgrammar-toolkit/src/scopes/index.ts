//@index(['./*.ts', '!types.ts'], (f, _) => `import { ${f.name.toUpperCase()}_SCOPE, ${f.name.toUpperCase()}_SCOPE_DEFINITION } from '${f.path}.js'`)
import { COMMENT_SCOPE, COMMENT_SCOPE_DEFINITION } from './comment.js'
import { CONSTANT_SCOPE, CONSTANT_SCOPE_DEFINITION } from './constant.js'
import { ENTITY_SCOPE, ENTITY_SCOPE_DEFINITION } from './entity.js'
import { INVALID_SCOPE, INVALID_SCOPE_DEFINITION } from './invalid.js'
import { KEYWORD_SCOPE, KEYWORD_SCOPE_DEFINITION, KeywordScope } from './keyword.js'
import { buildScopes, mergeDefinitions } from './lib/internal.js'
import { MARKUP_SCOPE, MARKUP_SCOPE_DEFINITION } from './markup.js'
import { META_SCOPE, META_SCOPE_DEFINITION } from './meta.js'
import { PUNCTUATION_SCOPE, PUNCTUATION_SCOPE_DEFINITION } from './punctuation.js'
import { STORAGE_SCOPE, STORAGE_SCOPE_DEFINITION } from './storage.js'
import { STRING_SCOPE, STRING_SCOPE_DEFINITION } from './string.js'
import { SUPPORT_SCOPE, SUPPORT_SCOPE_DEFINITION } from './support.js'
import { VARIABLE_SCOPE, VARIABLE_SCOPE_DEFINITION } from './variable.js'
//@endindex

import type { Simplify } from 'type-fest';
import type { BuildScopeOptions, ScopeTree, MergeScopes } from './types.js';

/**
 * Raw scope definitions for all standard TextMate scope categories.
 * Used for merging with custom scope definitions in scopesFor().
 */
const BASE_SCOPE_DEFINITIONS = {
  //@index(['./*.ts', '!types.ts'], (f, _) => `${_.camelCase(f.name)}: ${f.name.toUpperCase()}_SCOPE_DEFINITION,`)
  comment: COMMENT_SCOPE_DEFINITION,
  constant: CONSTANT_SCOPE_DEFINITION,
  entity: ENTITY_SCOPE_DEFINITION,
  invalid: INVALID_SCOPE_DEFINITION,
  keyword: KEYWORD_SCOPE_DEFINITION,
  markup: MARKUP_SCOPE_DEFINITION,
  meta: META_SCOPE_DEFINITION,
  punctuation: PUNCTUATION_SCOPE_DEFINITION,
  storage: STORAGE_SCOPE_DEFINITION,
  string: STRING_SCOPE_DEFINITION,
  support: SUPPORT_SCOPE_DEFINITION,
  variable: VARIABLE_SCOPE_DEFINITION,
  //@endindex
};

/**
 * Predefined TextMate scopes for use in grammars.
 * 
 * Includes all standard TextMate scope categories with full hierarchical support.
 * Each scope can be used as a string or called with a language suffix.
 * 
 * By default, all predefined scopes are **callable** (allowScopeExtension: true),
 * meaning they can accept additional language suffixes.
 * 
 * Supports multiple naming conventions for kebab-case scopes:
 * - Kebab-case: `scopes.comment.line['double-slash']`
 * - CamelCase: `scopes.comment.line.doubleSlash`
 * - Snake_case: `scopes.comment.line.double_slash` (converts underscores to dashes)
 *
 * @example
 * Basic usage:
 * ```typescript
 * const conditionalScope = scopes.keyword.control.conditional; // "keyword.control.conditional"
 * const jsConditional = scopes.keyword.control.conditional("js"); // "keyword.control.conditional.js"
 * ```
 * 
 * @example
 * Template literal usage:
 * ```typescript
 * const rule = `${scopes.string.quoted.double}.myLang`; // "string.quoted.double.myLang"
 * ```
 * 
 * @example
 * Multiple naming conventions:
 * ```typescript
 * scopes.comment.line['double-slash']  // "comment.line.double-slash" (kebab-case)
 * scopes.comment.line.doubleSlash      // "comment.line.double-slash" (camelCase)
 * scopes.comment.line.double_slash     // "comment.line.double-slash" (snake_case)
 * scopes.entity.name.class.forward_decl // "entity.name.class.forward-decl" (snake_case)
 * ```
 * 
 * @example
 * Accessing various scope types:
 * ```typescript
 * scopes.constant.numeric.integer.hexadecimal // "constant.numeric.integer.hexadecimal"
 * scopes.entity.name.function.constructor // "entity.name.function.constructor"
 * scopes.punctuation.definition.string.begin // "punctuation.definition.string.begin"
 * ```
 */
export const scopes = buildScopes({ allowScopeExtension: true }, BASE_SCOPE_DEFINITIONS);

export type TextMateScopes = typeof scopes;

// Export types and functions for external use
export type { BuildScopeOptions };
export { buildScopes };

/**
 * Creates scopes with configuration options and optional custom scope definitions.
 * This is the main function for creating type-safe, customizable scope objects.
 * 
 * @param options Configuration for scope generation (prefix, suffix, extension mode)
 * @param customScopes Optional custom scope definitions to merge with base scopes
 * @returns A fully typed scope tree with the specified configuration
 * 
 * @example
 * Static scopes (recommended for performance):
 * ```typescript
 * const rclScopes = scopesFor({ suffix: 'rcl', allowScopeExtension: false });
 * rclScopes.keyword.control.conditional // "keyword.control.conditional.rcl" (not callable)
 * ```
 * 
 * @example
 * Callable scopes:
 * ```typescript
 * const jsScopes = scopesFor({ suffix: 'js', allowScopeExtension: true });
 * jsScopes.keyword.control.conditional('async') // "keyword.control.conditional.js.async"
 * ```
 * 
 * @example
 * Custom scope definitions:
 * ```typescript
 * const customScopes = scopesFor({ suffix: 'rcl' }, {
 *   meta: {
 *     section: {
 *       agent: null,
 *       messages: null
 *     }
 *   }
 * });
 * customScopes.meta.section.agent // "meta.section.agent.rcl"
 * ```
 */
export function scopesFor<
  const TOptions extends BuildScopeOptions,
  const TCustom extends Record<string, any> = {}
>(
  options: TOptions,
  customScopes?: TCustom
): Simplify<
  ScopeTree<
    TCustom extends Record<string, any> ? MergeScopes<typeof BASE_SCOPE_DEFINITIONS, TCustom> : typeof BASE_SCOPE_DEFINITIONS,
    TOptions['prefix'] extends string ? TOptions['prefix'] : '',
    TOptions['suffix'] extends string ? TOptions['suffix'] : '',
    TOptions['allowScopeExtension'] extends boolean | 'on-leafs' ? TOptions['allowScopeExtension'] : false
  >
> {
  const definitions = customScopes 
    ? mergeDefinitions(BASE_SCOPE_DEFINITIONS, customScopes)
    : BASE_SCOPE_DEFINITIONS;
    
  return buildScopes({
    prefix: '',
    suffix: '',
    allowScopeExtension: false,
    ...options
  }, definitions);
}

