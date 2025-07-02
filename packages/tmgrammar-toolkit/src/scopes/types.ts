import type { Join, Simplify } from 'type-fest';

/**
 * Configuration options for building scope objects
 */
export interface BuildScopeOptions {
  /** The prefix to prepend to all scope names */
  prefix?: string;
  /** The suffix to append to all scope names (typically language name) */
  suffix?: string;
  /** Controls which scopes can be called with additional suffixes */
  allowScopeExtension?: ExtensionMode;
}

/**
 * Extension mode for scopes - controls which scopes are callable
 * - `true`: All scopes are callable (can accept additional suffixes)
 * - `false`: No scopes are callable (plain objects only)  
 * - `"on-leafs"`: Only leaf scopes (terminal nodes) are callable
 */
export type ExtensionMode = boolean | "on-leafs";

type Filter<T extends readonly any[], U = null | undefined | ""> = T extends []
  ? []
  : T extends readonly [infer F, ...infer R]
  ? F extends U
    ? Filter<R, U>
    : [F, ...Filter<R, U>]
  : T;

type ScopePath<
  P extends string,
  K extends string,
  S extends string,
> = Join<Filter<[P, K, S]>, '.'>;

/**
 * Base interface for a callable scope.
 * It provides a call signature to extend the scope path and a primitive converter for string coercion.
 */
export interface Scope<TPath extends string = string> {
  /**
   * Extends this scope with the given suffix.
   * @param extension The string to append to the scope path.
   * @returns A new string with the extended scope path.
   */
  <const E extends string>(extension: E): Join<[TPath, E], '.'>;
  /**
   * Returns the string representation of the scope path.
   */
  toString(): string;
  /**
   * Allows for implicit string conversion.
   */
  [Symbol.toPrimitive](hint: 'string' | 'default' | 'number'): TPath | null;
}

/**
 * Recursively builds a tree of scopes from a definition object.
 * 
 * @template Tree The scope definition object.
 * @template P The current path prefix.
 * @template S The language suffix to apply to all scopes.
 * @template E The extension mode, controlling which scopes are callable.
 */
export type ScopeTree<
  Tree, 
  P extends string = "", 
  S extends string = "", 
  E extends ExtensionMode = false
> = {
  // prettier-ignore
  [K in keyof Tree]: K extends string
    ? keyof Tree[K] extends never // It's a leaf node (empty object or null).
      ? E extends false
        ? ScopePath<P, K, S> // `false` mode: leaf scopes are NOT callable.
        : Scope<ScopePath<P, K, S>> // `true` or `on-leafs` mode: leaf scopes ARE callable.
      : E extends true // It's a branch node (has children).
        ? Scope<ScopePath<P, K, S>> & Simplify<ScopeTree<Tree[K], Join<[P, K], ".">, S, E>> // `true` mode: all scopes are callable.
        : ScopePath<P, K, S> & Simplify<ScopeTree<Tree[K], Join<[P, K], ".">, S, E>> // `false` or `on-leafs` mode: branch scopes are NOT callable.
    : never;
};

/**
 * Simple merge type for combining custom scopes with base scopes.
 */
export type MergeScopes<TBase, TCustom> = TBase & TCustom;

/**
 * Type for scopes bound to a specific language suffix using the basic scopesFor(langSuffix) overload.
 * Preserves the full structure while making all scopes language-bound.
 */
export type TypeSafeScopes<Lang extends string, TScopes> = TScopes;

/**
 * Type for non-callable scopes when allowScopeExtension is false.
 * These scopes show exact path types without function call capabilities.
 * Should be applied to raw scope definitions, not built scope trees.
 */
export type NonCallableScopes<TScopeDefinitions, TSuffix extends string = ""> = ScopeTree<TScopeDefinitions, "", TSuffix, false>;

/**
 * Debug utility types for inspecting resolved types during development.
 * These help verify that complex conditional types are working correctly.
 */
export namespace Debug {
  /**
   * Forces TypeScript to expand and display a type fully.
   * Useful for seeing the complete resolved structure of complex types.
   * 
   * @example
   * ```typescript
   * type MyComplexType = ScopeTree<{ custom: { token: null } }>;
   * type Expanded = Debug.Expand<MyComplexType>; // Hover to see full expansion
   * ```
   */
  export type Expand<T> = T extends (...args: any[]) => any
    ? T
    : T extends Record<string, any>
    ? { [K in keyof T]: Expand<T[K]> }
    : T;

  /**
   * Shows what ScopeTree resolves to for a given input.
   * 
   * @example
   * ```typescript
   * type CallableResult = Debug.ScopeTreeResult<{ custom: { token: null } }, "", "", true>;
   * type WithPrefix = Debug.ScopeTreeResult<{ custom: { token: null } }, "meta", "rcl", true>;
   * type NonCallableResult = Debug.ScopeTreeResult<{ custom: { token: null } }, "", "", false>;
   * ```
   */
  export type ScopeTreeResult<
    T, 
    P extends string = "",
    S extends string = "",
    E extends ExtensionMode = false
  > = ScopeTree<T, P, S, E>;

  /**
   * Type-level test helper that only compiles if T extends Expected.
   * Use for compile-time type testing.
   * 
   * @example
   * ```typescript
   * const test: Debug.AssertExtends<string, string> = true; // ✅ compiles
   * const test2: Debug.AssertExtends<number, string> = true; // ❌ error
   * ```
   */
  export type AssertExtends<T, Expected> = T extends Expected ? true : false;

  /**
   * Type-level test helper that only compiles if T is exactly Expected.
   * 
   * @example
   * ```typescript
   * const test: Debug.AssertEqual<'test', 'test'> = true; // ✅ compiles
   * const test2: Debug.AssertEqual<'test', string> = true; // ❌ error
   * ```
   */
  export type AssertEqual<T, Expected> = T extends Expected
    ? Expected extends T
      ? true
      : false
    : false;

  /**
   * Shows the keys of a type for inspection.
   * 
   * @example
   * ```typescript
   * type Keys = Debug.Keys<{ a: string; b: number }>; // "a" | "b"
   * ```
   */
  export type Keys<T> = keyof T;

  /**
   * Shows whether a type is callable (function) or not.
   * 
   * @example
   * ```typescript
   * type IsCallable = Debug.IsCallable<string & (() => string)>; // true
   * ```
   */
  export type IsCallable<T> = T extends (...args: any[]) => any ? true : false;
}