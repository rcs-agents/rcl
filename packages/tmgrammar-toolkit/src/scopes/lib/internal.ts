import type { Scope } from "../types.js";

/**
 * Definition format for scope trees using tuples.
 * Each tuple contains: [scope_name, children_or_empty_array]
 * 
 * @example
 * ```typescript
 * [
 *   ['line', [
 *     ['double_slash', []],
 *     ['number_sign', []]
 *   ]],
 *   ['block', []]
 * ]
 * ```
 */
export type ScopeTupleDefinition = Array<[string, ScopeTupleDefinition]>;

/**
 * Creates a scope node that can be called with language suffixes and converted to strings.
 * Automatically converts snake_case to kebab-case for TextMate compatibility.
 * 
 * @template P The scope path string type
 * @template C The children object type
 * @param path The scope path (will be converted from snake_case to kebab-case)
 * @param children Optional child scope nodes
 * @param languageSuffix Optional language suffix to pre-apply
 * @returns A callable scope object with full type safety
 * 
 * @example
 * Regular scope:
 * ```typescript
 * const scope = createScopeNode('comment.line.double_slash');
 * console.log(scope.toString()); // "comment.line.double-slash"
 * console.log(scope('js')); // "comment.line.double-slash.js"
 * ```
 * 
 * @example
 * Language-specific scope:
 * ```typescript
 * const jsScope = createScopeNode('comment.line.double_slash', undefined, 'js');
 * console.log(jsScope.toString()); // "comment.line.double-slash.js"
 * console.log(jsScope('async')); // "comment.line.double-slash.js.async"
 * ```
 */
export function createScopeNode<
  P extends string,
  C extends Record<string, any> = {},
  Lang extends string = never
>(
  path: P,
  children?: C,
  languageSuffix?: Lang,
): Lang extends string 
  ? Scope<P, Lang> & C
  : Scope<P> & C {
  
  // Convert snake_case to kebab-case for TextMate compatibility
  const kebabPath = path.replace(/_/g, '-');
  
  // Create the final path (with language suffix if provided)
  const finalPath = languageSuffix ? `${kebabPath}.${languageSuffix}` : kebabPath;
  
  // Create the callable function that appends additional suffixes
  const func = (additionalSuffix: string) => 
    `${finalPath}.${additionalSuffix}`;

  // Attach child scope nodes as properties
  if (children) {
    for (const key in children) {
      if (Object.prototype.hasOwnProperty.call(children, key)) {
        Object.defineProperty(func, key, {
          value: children[key as keyof C],
          writable: false,
          enumerable: false, // Hide from Object.keys and loops
          configurable: true,
        });
      }
    }
  }

  // Add toString and Symbol.toPrimitive to the function itself
  Object.defineProperties(func, {
    toString: {
      value: () => finalPath,
      writable: false,
      enumerable: false,
      configurable: false,
    },
    [Symbol.toPrimitive]: {
      value: (hint: 'string' | 'default' | 'number') =>
        hint === 'string' || hint === 'default' ? finalPath : null,
      writable: false,
      enumerable: false,
      configurable: false,
    },
  });

  // Create a proxy to handle snake_case to kebab-case and other aliases
  return new Proxy(func, {
    get(target, prop, receiver) {
      if (typeof prop === 'string') {
        // Direct property exists (like a child scope)
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }
        
        // Handle snake_case to kebab-case for scope names
        // e.g., double_slash -> double-slash
        const snakeCaseProp = prop.replace(/-/g, '_');
        if (Reflect.has(target, snakeCaseProp)) {
          return Reflect.get(target, snakeCaseProp, receiver);
        }

        // Handle camelCase to snake_case
        // e.g., doubleSlash -> double_slash
        const camelToSnake = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (Reflect.has(target, camelToSnake)) {
          return Reflect.get(target, camelToSnake, receiver);
        }
      }
      
      // Fallback to the target function's own properties (like toString)
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (typeof prop === 'string') {
        const snakeCaseProp = prop.replace(/-/g, '_');
        const camelToSnake = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return Reflect.has(target, prop) || Reflect.has(target, snakeCaseProp) || Reflect.has(target, camelToSnake);
      }
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      const childKeys = children ? Object.keys(children) : [];
      const targetKeys = Reflect.ownKeys(target);
      return [...new Set([...childKeys, ...targetKeys])];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (children && typeof prop === 'string' && Object.prototype.hasOwnProperty.call(children, prop)) {
        return {
          value: children[prop],
          writable: false,
          enumerable: true,
          configurable: true,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    }
  }) as any;
}

/**
 * Builds a complete scope tree from tuple definitions with full type safety.
 * Converts snake_case property names to kebab-case scope strings automatically.
 * Can optionally create language-specific scopes by providing a language suffix.
 * 
 * @template T The target scope tree type
 * @param definition Array of tuples defining the scope hierarchy
 * @param basePath Optional base path for nested calls (used internally)
 * @param languageSuffix Optional language suffix to apply to all scopes
 * @returns Fully typed scope tree with callable nodes
 * 
 * @example
 * Regular scopes:
 * ```typescript
 * const commentScope = buildScopes<CommentScope>([
 *   ['line', [
 *     ['double_slash', []],
 *     ['double_dash', []],
 *   ]],
 *   ['block', [['documentation', []]]],
 * ]);
 * 
 * commentScope.line.double_slash.toString() // "comment.line.double-slash"
 * commentScope.block.documentation('js')    // "comment.block.documentation.js"
 * ```
 * 
 * @example
 * Language-specific scopes:
 * ```typescript
 * const jsCommentScope = buildScopes<CommentScope>([
 *   ['line', [['double_slash', []]]],
 * ], '', 'js');
 * 
 * jsCommentScope.line.double_slash.toString() // "comment.line.double-slash.js"
 * jsCommentScope.line.double_slash('async')   // "comment.line.double-slash.js.async"
 * ```
 */
export function buildScopes<T = any>(
  definition: ScopeTupleDefinition,
  basePath = '',
  languageSuffix?: string
): T {
  const result: any = {};

  for (const [key, children] of definition) {
    const currentPath = basePath ? `${basePath}.${key}` : key;

    if (children.length === 0) {
      // Terminal scope with no children
      result[key] = createScopeNode(currentPath, undefined, languageSuffix);
    } else {
      // Scope with children - recursively build child scopes
      const childScopes = buildScopes(children, currentPath, languageSuffix);
      result[key] = createScopeNode(currentPath, childScopes, languageSuffix);
    }
  }

  return result as T;
}

/**
 * Builds language-specific scope objects from existing scope definitions.
 * This is a convenience function that works with scope objects created by `buildScopes`.
 * 
 * @param definition The scope definition object (from buildScopes or individual scope files)
 * @param langSuffix The language suffix to append to all scopes
 * @param basePath Optional base path for nested calls (used internally)
 * @returns A complete scope tree with language suffixes pre-applied
 * 
 * @example
 * ```typescript
 * import { scopes } from './index.js';
 * 
 * const jsScopes = buildLanguageScopes(scopes, 'js');
 * 
 * jsScopes.keyword.control.conditional // "keyword.control.conditional.js"
 * jsScopes.comment.line.double_slash   // "comment.line.double-slash.js"
 * ```
 */
export function buildLanguageScopes(
  definition: Record<string, any>,
  langSuffix: string,
  basePath = ''
): any {
  const result: any = {};

  for (const [key, value] of Object.entries(definition)) {
    const currentPath = basePath ? `${basePath}.${key}` : key;

    // A value is a scope if it's a function.
    if (typeof value === 'function') {
      const childKeys = Object.keys(value);
      let children: Record<string, any> | undefined;

      if (childKeys.length > 0) {
        // It's a ScopeTree. Recurse on its properties.
        children = buildLanguageScopes(value, langSuffix, currentPath);
      }
      
      // Create a new language-specific scope node.
      // If it had children, they are now language-specific too.
      result[key] = createScopeNode(currentPath, children, langSuffix);

    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // This is a plain container object. Just recurse.
      result[key] = buildLanguageScopes(value, langSuffix, currentPath);
    }
  }

  return result;
}