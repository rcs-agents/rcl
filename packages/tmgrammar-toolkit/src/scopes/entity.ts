import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

/**
 * Root scope for `entity`.
 * Names of data structures, types, and uniquely-identifiable constructs.
 * The entity scopes target the **names** only, not entire constructs (use `meta.*` for that).
 * Full path: `entity`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
 * 
 * @example
 * ```typescript
 * scopes.entity.name.class // "entity.name.class"
 * scopes.entity.name.function.constructor("js") // "entity.name.function.constructor.js"
 * scopes.entity.other.inherited_class // "entity.other.inherited-class"
 * ```
 */
export type EntityScope = ScopeTree<'entity', {
  /**
   * Represents the `entity.name` scope.
   * Names of various language constructs.
   * Full path: `entity.name`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
   */
  name: ScopeTree<'name', {
    /**
     * Represents the `entity.name.class` scope.
     * Class names.
     * Full path: `entity.name.class`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    class: ScopeTree<'class', {
      /**
       * Represents the `entity.name.class.forward-decl` scope.
       * Forward-declaration of a class.
       * Full path: `entity.name.class.forward-decl`
       */
      forward_decl: Scope<'forward-decl'>;
    }>;
    /**
     * Represents the `entity.name.struct` scope.
     * Struct names.
     * Full path: `entity.name.struct`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    struct: Scope<'struct'>;
    /**
     * Represents the `entity.name.enum` scope.
     * Enumeration names.
     * Full path: `entity.name.enum`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    enum: Scope<'enum'>;
    /**
     * Represents the `entity.name.union` scope.
     * Union names.
     * Full path: `entity.name.union`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    union: Scope<'union'>;
    /**
     * Represents the `entity.name.trait` scope.
     * Trait names.
     * Full path: `entity.name.trait`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    trait: Scope<'trait'>;
    /**
     * Represents the `entity.name.interface` scope.
     * Interface names.
     * Full path: `entity.name.interface`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    interface: Scope<'interface'>;
    /**
     * Represents the `entity.name.impl` scope.
     * Implementation names.
     * Full path: `entity.name.impl`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    impl: Scope<'impl'>;
    /**
     * Represents the `entity.name.type` scope.
     * Generic type names.
     * Full path: `entity.name.type`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    type: Scope<'type'>;
    /**
     * Represents the `entity.name.function` scope.
     * Function names (when defined).
     * Full path: `entity.name.function`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    function: ScopeTree<'function', {
      /**
       * Represents the `entity.name.function.constructor` scope.
       * Constructor names.
       * Full path: `entity.name.function.constructor`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
       */
      constructor: Scope<'constructor'>;
      /**
       * Represents the `entity.name.function.destructor` scope.
       * Destructor names.
       * Full path: `entity.name.function.destructor`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
       */
      destructor: Scope<'destructor'>;
    }>;
    /**
     * Represents the `entity.name.namespace` scope.
     * Namespace/module/package names.
     * Full path: `entity.name.namespace`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    namespace: Scope<'namespace'>;
    /**
     * Represents the `entity.name.constant` scope.
     * Named constants (vs `variable.other.constant`).
     * Full path: `entity.name.constant`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    constant: Scope<'constant'>;
    /**
     * Represents the `entity.name.label` scope.
     * Labels for goto statements.
     * Full path: `entity.name.label`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    label: Scope<'label'>;
    /**
     * Represents the `entity.name.section` scope.
     * Section/heading names in markup.
     * Full path: `entity.name.section`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    section: Scope<'section'>;
    /**
     * Represents the `entity.name.tag` scope.
     * HTML/XML tag names (only `entity.name` scope applied to repeated constructs).
     * Full path: `entity.name.tag`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    tag: Scope<'tag'>;
  }>;

  /**
   * Represents the `entity.other` scope.
   * Other entity-related constructs.
   * Full path: `entity.other`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
   */
  other: ScopeTree<'other', {
    /**
     * Represents the `entity.other.inherited-class` scope.
     * Superclass/baseclass names.
     * Full path: `entity.other.inherited-class`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    inherited_class: Scope<'inherited-class'>;
    /**
     * Represents the `entity.other.attribute-name` scope.
     * HTML/XML attribute names.
     * Full path: `entity.other.attribute-name`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#entity)
     */
    attribute_name: Scope<'attribute-name'>;
  }>;
}>;

export const ENTITY_SCOPE: EntityScope = buildScopes<EntityScope>([
  ['name', [
    ['class', [
      ['forward_decl', []]
    ]],
    ['struct', []],
    ['enum', []],
    ['union', []],
    ['trait', []],
    ['interface', []],
    ['impl', []],
    ['type', []],
    ['function', [
      ['constructor', []],
      ['destructor', []],
    ]],
    ['constant', []],
    ['variable', []],
    ['namespace', []],
    ['label', []],
    ['tag', []],
    ['section', []],
  ]],
  ['other', [
    ['inherited-class', []],
    ['attribute-name', []],
  ]],
], 'entity'); 