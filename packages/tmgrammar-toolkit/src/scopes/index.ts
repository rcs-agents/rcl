//@index(['./*.ts', '!types.ts'], (f, _) => `import { ${f.name.toUpperCase()}_SCOPE } from '${f.path}.js'`)
import { COMMENT_SCOPE } from './comment.js'
import { CONSTANT_SCOPE } from './constant.js'
import { ENTITY_SCOPE } from './entity.js'
import { INVALID_SCOPE } from './invalid.js'
import { KEYWORD_SCOPE } from './keyword.js'
import { buildLanguageScopes } from './lib/internal.js'
import { MARKUP_SCOPE } from './markup.js'
import { META_SCOPE } from './meta.js'
import { PUNCTUATION_SCOPE } from './punctuation.js'
import { STORAGE_SCOPE } from './storage.js'
import { STRING_SCOPE } from './string.js'
import { SUPPORT_SCOPE } from './support.js'
import { VARIABLE_SCOPE } from './variable.js'
//@endindex

/**
 * Predefined TextMate scopes for use in grammars.
 * 
 * Includes all standard TextMate scope categories with full hierarchical support.
 * Each scope can be used as a string or called with a language suffix.
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
export const scopes = {
  //@index(['./*.ts', '!types.ts'], (f, _) => `${_.camelCase(f.name)}: ${f.name.toUpperCase()}_SCOPE,`)
  comment: COMMENT_SCOPE,
  constant: CONSTANT_SCOPE,
  entity: ENTITY_SCOPE,
  invalid: INVALID_SCOPE,
  keyword: KEYWORD_SCOPE,
  markup: MARKUP_SCOPE,
  meta: META_SCOPE,
  punctuation: PUNCTUATION_SCOPE,
  storage: STORAGE_SCOPE,
  string: STRING_SCOPE,
  support: SUPPORT_SCOPE,
  variable: VARIABLE_SCOPE,
  //@endindex
}

export type TextMateScopes = typeof scopes;


/**
 * Creates a language-specific scopes object where all scopes automatically 
 * have the specified language suffix appended.
 * 
 * This is useful when building grammars for a specific language, as it 
 * eliminates the need to manually append the language suffix to each scope.
 *
 * @param langSuffix The language suffix to append to all scopes
 * @returns A scopes object with automatic language suffix binding
 * 
 * @example
 * ```typescript
 * const jsScopes = scopesFor("js");
 * 
 * // These are equivalent:
 * jsScopes.keyword.control.conditional // "keyword.control.conditional.js"
 * scopes.keyword.control.conditional("js") // "keyword.control.conditional.js"
 * 
 * // You can still add additional suffixes:
 * jsScopes.keyword.control.conditional("async") // "keyword.control.conditional.js.async"
 * ```
 * 
 * @example
 * Usage in grammar rules:
 * ```typescript
 * const pythonScopes = scopesFor("python");
 * 
 * const rule = {
 *   name: pythonScopes.keyword.control.conditional, // "keyword.control.conditional.python"
 *   match: /\b(if|elif|else)\b/
 * };
 * ```
 */
export function scopesFor<Lang extends string>(langSuffix: Lang): LanguageScopes<Lang> {
  return buildLanguageScopes(scopes, langSuffix) as LanguageScopes<Lang>;
}

import type { LanguageScopeWrapper } from './types.js'

/**
 * Language-specific scopes that automatically append a language suffix
 * @template Lang The language suffix to append
 */
export type LanguageScopes<Lang extends string> = {
  [K in keyof TextMateScopes]: LanguageScopeWrapper<TextMateScopes[K], Lang>;
};