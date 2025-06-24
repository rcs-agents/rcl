import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

/**
 * Root scope for `meta`.
 * Structural sections for larger code constructs. **Not intended for styling** - used by preferences and plugins for contextual behavior.
 * **Critical:** Never stack meta scopes of the same type. For example, `meta.function.php meta.function.parameters.php` should never occur - alternate between different meta scopes.
 * Full path: `meta`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
 * 
 * @example
 * ```typescript
 * scopes.meta.class // "meta.class"
 * scopes.meta.function.parameters("js") // "meta.function.parameters.js"
 * scopes.meta.annotation.identifier // "meta.annotation.identifier"
 * ```
 */
export type MetaScope = ScopeTree<'meta', {
  /**
   * Represents the `meta.class` scope.
   * Complete class definitions.
   * Full path: `meta.class`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  class: Scope<'class'>;

  /**
   * Represents the `meta.struct` scope.
   * Complete struct definitions.
   * Full path: `meta.struct`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  struct: Scope<'struct'>;

  /**
   * Represents the `meta.enum` scope.
   * Complete enum definitions.
   * Full path: `meta.enum`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  enum: Scope<'enum'>;

  /**
   * Represents the `meta.union` scope.
   * Complete union definitions.
   * Full path: `meta.union`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  union: Scope<'union'>;

  /**
   * Represents the `meta.trait` scope.
   * Complete trait definitions.
   * Full path: `meta.trait`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  trait: Scope<'trait'>;

  /**
   * Represents the `meta.interface` scope.
   * Complete interface definitions.
   * Full path: `meta.interface`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  interface: Scope<'interface'>;

  /**
   * Represents the `meta.impl` scope.
   * Complete implementation definitions.
   * Full path: `meta.impl`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  impl: Scope<'impl'>;

  /**
   * Represents the `meta.type` scope.
   * Complete type definitions.
   * Full path: `meta.type`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  type: Scope<'type'>;

  /**
   * Represents the `meta.function` scope.
   * Complete function definitions.
   * Full path: `meta.function`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  function: ScopeTree<'function', {
    /**
     * Represents the `meta.function.parameters` scope.
     * Parameter lists.
     * Full path: `meta.function.parameters`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
     */
    parameters: Scope<'parameters'>;
    /**
     * Represents the `meta.function.return-type` scope.
     * Return type annotations.
     * Full path: `meta.function.return-type`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
     */
    return_type: Scope<'return-type'>;
  }>;

  /**
   * Represents the `meta.namespace` scope.
   * Namespace/module definitions.
   * Full path: `meta.namespace`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  namespace: Scope<'namespace'>;

  /**
   * Represents the `meta.preprocessor` scope.
   * Preprocessor statements.
   * Full path: `meta.preprocessor`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  preprocessor: Scope<'preprocessor'>;

  /**
   * Represents the `meta.annotation` scope.
   * Annotations/decorators.
   * Full path: `meta.annotation`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  annotation: ScopeTree<'annotation', {
    /**
     * Represents the `meta.annotation.identifier` scope.
     * Annotation names.
     * Full path: `meta.annotation.identifier`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
     */
    identifier: Scope<'identifier'>;
    /**
     * Represents the `meta.annotation.parameters` scope.
     * Annotation parameters.
     * Full path: `meta.annotation.parameters`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
     */
    parameters: Scope<'parameters'>;
  }>;

  /**
   * Represents the `meta.path` scope.
   * Qualified identifiers.
   * Full path: `meta.path`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  path: Scope<'path'>;

  /**
   * Represents the `meta.function-call` scope.
   * Function invocations.
   * Full path: `meta.function-call`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  function_call: Scope<'function-call'>;

  /**
   * Represents the `meta.block` scope.
   * Code blocks `{}`.
   * Full path: `meta.block`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  block: Scope<'block'>;

  /**
   * Represents the `meta.braces` scope.
   * Alternative for curly braces.
   * Full path: `meta.braces`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  braces: Scope<'braces'>;

  /**
   * Represents the `meta.group` scope.
   * Grouped expressions `()`.
   * Full path: `meta.group`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  group: Scope<'group'>;

  /**
   * Represents the `meta.parens` scope.
   * Alternative for parentheses.
   * Full path: `meta.parens`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  parens: Scope<'parens'>;

  /**
   * Represents the `meta.brackets` scope.
   * Bracket expressions `[]`.
   * Full path: `meta.brackets`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  brackets: Scope<'brackets'>;

  /**
   * Represents the `meta.generic` scope.
   * Generic type parameters `<>`.
   * Full path: `meta.generic`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  generic: Scope<'generic'>;

  /**
   * Represents the `meta.tag` scope.
   * Complete HTML/XML tags.
   * Full path: `meta.tag`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  tag: Scope<'tag'>;

  /**
   * Represents the `meta.paragraph` scope.
   * Paragraphs in markup.
   * Full path: `meta.paragraph`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  paragraph: Scope<'paragraph'>;

  /**
   * Represents the `meta.string` scope.
   * Complete string literals.
   * Full path: `meta.string`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  string: Scope<'string'>;

  /**
   * Represents the `meta.interpolation` scope.
   * String interpolation.
   * Full path: `meta.interpolation`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  interpolation: Scope<'interpolation'>;

  /**
   * Represents the `meta.toc-list` scope.
   * Table of contents entries.
   * Full path: `meta.toc-list`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#meta)
   */
  toc_list: Scope<'toc-list'>;
}>;

export const META_SCOPE: MetaScope = buildScopes<MetaScope>([
  ['class', []],
  ['struct', []],
  ['enum', []],
  ['union', []],
  ['trait', []],
  ['interface', []],
  ['impl', []],
  ['type', []],
  ['function', [
    ['parameters', []],
    ['return-type', []],
  ]],
  ['namespace', []],
  ['preprocessor', []],
  ['annotation', [
    ['identifier', []],
    ['parameters', []],
  ]],
  ['path', []],
  ['function-call', []],
  ['block', []],
  ['braces', []],
  ['group', []],
  ['parens', []],
  ['brackets', []],
  ['generic', []],
  ['tag', []],
  ['paragraph', []],
  ['string', []],
  ['interpolation', []],
  ['toc-list', []],
], 'meta'); 