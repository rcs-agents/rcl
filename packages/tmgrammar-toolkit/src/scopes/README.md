# TextMate Scopes - Internal Architecture

This document provides an architectural overview of the `scopes` module, intended for contributors to the `tmgrammar-toolkit` project. For user-facing documentation, please see the `docs/` directory.

## Core Concepts

The scope system is designed to be highly type-safe, flexible, and performant. It is built upon a foundation of modern TypeScript features, including `const` generics and conditional types, to provide a superior developer experience.

The architecture revolves around three key components:
1.  **`ScopeTree<...>` Type**: A powerful recursive type that builds the entire scope structure at compile time.
2.  **`createScopeNode()`**: A runtime function that constructs individual scope nodes (both callable and non-callable).
3.  **`buildScopes()`**: A recursive runtime function that traverses a definition object and uses `createScopeNode` to build the final scope tree.

## Type-Level Implementation: `ScopeTree`

The heart of the system is the `ScopeTree` generic type, located in `src/scopes/types.ts`.

```typescript
export type ScopeTree<
  Tree, 
  P extends string = "", 
  S extends string = "", 
  E extends ExtensionMode = false
> = {
  // prettier-ignore
  [K in keyof Tree]: K extends string
    ? keyof Tree[K] extends never // It's a leaf node.
      ? E extends false
        ? ScopePath<P, K, S> 
        : Scope<ScopePath<P, K, S>>
      : E extends true // It's a branch node.
        ? Scope<ScopePath<P, K, S>> & Simplify<ScopeTree<...>>
        : ScopePath<P, K, S> & Simplify<ScopeTree<...>>
    : never;
};
```

### How it Works

- **`Tree`**: The raw scope definition object (e.g., `{ keyword: { control: null } }`).
- **`P` (Prefix)**: The current dot-separated path (e.g., `"keyword"`).
- **`S` (Suffix)**: The language suffix (e.g., `"js"`).
- **`E` (ExtensionMode)**: Controls callability (`true`, `false`, or `"on-leafs"`).

It recursively traverses the `Tree`, making decisions based on whether a node is a leaf (`keyof Tree[K] extends never`) or a branch, and what the `ExtensionMode` is.

- **Leaf Nodes**: If `E` is `false`, the type is just the final path string. Otherwise, it's a callable `Scope<TPath>`.
- **Branch Nodes**: If `E` is `true`, the node is both a callable `Scope` and a recursively-defined `ScopeTree`. If `E` is `false` or `"on-leafs"`, it's just the path string intersected with the `ScopeTree`.

## Runtime Implementation

### `createScopeNode()`

Located in `src/scopes/lib/internal.ts`, this function is the factory for individual scope nodes.

- It takes the `key`, `children`, and `options` (prefix, suffix, etc.).
- It constructs the full scope path string (e.g., `keyword.control.conditional.js`).
- It converts `snake_case` keys to `kebab-case`.
- Based on `allowScopeExtension` and whether the node is a leaf, it creates either:
  1.  A **callable function** that can append further suffixes.
  2.  A **plain object**.
- Both versions have `toString()` and `[Symbol.toPrimitive]` defined to ensure they resolve to the correct string path when used in string contexts.

### `buildScopes()`

This recursive function in `src/scopes/lib/internal.ts` drives the runtime construction of the scope tree.

- It iterates over a scope definition object.
- For each key, it recursively calls itself to build the children.
- It then calls `createScopeNode()` to create the node for the current key, passing in the children it just built.
- This process mirrors the `ScopeTree` type logic at runtime.

## Public API: `scopesFor()`

The public-facing API in `src/scopes/index.ts` uses `const` generics to capture the literal types of the options provided by the user. This allows the `ScopeTree` type to construct a precise return type based on the exact `suffix` and `allowScopeExtension` values.

```typescript
export function scopesFor<
  const TOptions extends BuildScopeOptions, 
  const TExtensions extends Record<string, any>
>(
  options: TOptions, 
  customScopes: TExtensions
): Simplify<
  ScopeTree<
    MergeScopes<typeof BASE_SCOPE_DEFINITIONS, TExtensions>,
    // ... type parameters extracted from TOptions
  >
>;
```

The implementation then passes these options to `buildScopes()`, which performs the actual runtime construction. This combination of type-level and runtime logic ensures maximum type safety and a dynamic, flexible implementation. 