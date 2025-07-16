import type { Simplify } from 'type-fest';
import { mergeDefinitions, buildScopes } from './internal';
import type { BuildScopeOptions, MergeScopes, ScopeTree } from './types';
import { WELL_KNOWN_SCOPES } from './well-known';

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
    TCustom extends Record<string, any>
      ? MergeScopes<typeof WELL_KNOWN_SCOPES, TCustom>
      : typeof WELL_KNOWN_SCOPES,
    TOptions['prefix'] extends string
        ? TOptions['prefix']
        : '',
    TOptions['suffix'] extends string
      ? TOptions['suffix']
      : '',
    TOptions['allowScopeExtension'] extends boolean
      ? TOptions['allowScopeExtension']
      : false
  >
> {
  const definitions = customScopes
    ? mergeDefinitions(WELL_KNOWN_SCOPES, customScopes)
    : WELL_KNOWN_SCOPES;

  return buildScopes({
    prefix: '',
    suffix: '',
    allowScopeExtension: false,
    ...options
  }, definitions);
}
const simpleTest = scopesFor({
  suffix: 'rcl',
  allowScopeExtension: false
}, {
  meta: {
    section: null,
  }
});

simpleTest.meta.section;

