export type Concat<A extends string, B extends string = never> = A extends never ? B : `${A}.${B}`;

/**
 * Represents a TextMate scope or a segment of it.
 * It can be converted to its string representation or called with a language suffix.
 * @template Path The full string path of this scope segment (e.g., "keyword.control").
 * @template LangSuffix The type of the language suffix string, defaults to `string`.
 */
export interface Scope<Path extends string, Lang extends string = never> {
  /**
   * Returns the exact string representation of the scope.
   * @example
   * console.log(scopes.keyword.control.toString()); // "keyword.control"
   */
  toString(): Lang extends never ? Path : `${Path}.${Lang}`;

  /**
   * Appends a language suffix to the current scope.
   * @param langSuffix The language suffix (e.g., "myLang", "js", "python").
   * @returns The full scope string with the language suffix (e.g., "keyword.control.myLang").
   */
  <Suffix extends string>(langSuffix: Suffix): Lang extends never ? `${Path}.${Suffix}` : `${Path}.${Lang}.${Suffix}`;

  /**
   * Allows the scope object to be used directly in string contexts (e.g., template literals).
   * This is invoked when an object is coerced to a string.
   */
  [Symbol.toPrimitive](hint: 'string' | 'default' | 'number'): Lang extends never ? Path : `${Path}.${Lang}` | null;
}

/**
 * Helper type to transform children object by prefixing each child's path with the parent path.
 */
export type PrefixChildren<ParentPath extends string, Children> = {
  [K in keyof Children]: Children[K] extends ScopeTree<infer ChildPath, infer GrandChildren>
    ? ScopeTree<`${ParentPath}.${ChildPath}`, GrandChildren>
    : Children[K] extends Scope<infer ChildPath>
      ? Scope<`${ParentPath}.${ChildPath}`>
      : never;
};

/**
 * Represents a scope tree with nested children.
 * @template Path The full string path of this scope (e.g., "keyword.control").
 * @template Children An object type describing the child scopes.
 */
export type ScopeTree<Path extends string, Children extends Record<string, any> = {}> = 
  Scope<Path> & PrefixChildren<Path, Children>;

/**
 * Wraps a scope to automatically append a language suffix
 * @template T The scope type to wrap
 * @template Lang The language suffix
 */
export type LanguageScopeWrapper<T, Lang extends string> = T extends Scope<infer Path>
  ? Scope<Path, Lang> & {
      [K in keyof T]: K extends keyof Scope<any>
        ? T[K]
        : T[K] extends Scope<any>
          ? LanguageScopeWrapper<T[K], Lang>
          : T[K];
    }
  : T;