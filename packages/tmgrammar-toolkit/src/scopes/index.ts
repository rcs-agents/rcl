
import { WELL_KNOWN_SCOPES } from './well-known/index.js';
import { buildScopes } from './internal.js';
import type { ScopeTree } from './types.js';

/**
 * Predefined TextMate scopes for use in grammars.
 * 
 * Includes all standard TextMate scope categories with full hierarchical support.
 * These scopes are **not callable** to prevent creation of non-standard top-level scopes.
 * 
 * Use `scopesFor({ allowScopeExtension: true })` if you need callable scopes for 
 * language-specific extensions.
 * 
 * Supports multiple naming conventions for kebab-case scopes:
 * - Kebab-case: `scopes.comment.line['double-slash']`
 * - CamelCase: `scopes.comment.line.doubleSlash`
 * - Snake_case: `scopes.comment.line.double_slash` (converts underscores to dashes)
 *
 * @example
 * Basic usage (strings only):
 * ```typescript
 * const conditionalScope = scopes.keyword.control.conditional; // "keyword.control.conditional"
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
 * For callable scopes with language extensions:
 * ```typescript
 * const callableScopes = scopesFor({ allowScopeExtension: true });
 * callableScopes.keyword.control.conditional("js"); // "keyword.control.conditional.js"
 * ```
 */
export const scopes: ScopeTree<typeof WELL_KNOWN_SCOPES, "", "", true> = buildScopes({ allowScopeExtension: true }, WELL_KNOWN_SCOPES);

export type TextMateScopes = typeof scopes;

// Export types and functions for external use
export type { BuildScopeOptions } from './types.js';

export { scopesFor } from './scopesFor.js';

