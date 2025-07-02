import type { BuildScopeOptions, Scope, ExtensionMode } from '../types.js';

/**
 * Creates a scope function that implements the Scope interface.
 * 
 * @param path The full scope path string
 * @returns A callable scope function with proper toString and toPrimitive methods
 */
function createScope<TPath extends string>(path: TPath): Scope<TPath> {
  const scopeFunction = ((extension: string) => `${path}.${extension}`) as Scope<TPath>;
  
  scopeFunction.toString = () => path;
  scopeFunction[Symbol.toPrimitive] = (hint: 'string' | 'default' | 'number') =>
    hint === 'string' || hint === 'default' ? path : null;
  
  return scopeFunction;
}

/**
 * Creates a scope node that can be either callable or a plain string/object.
 * 
 * @param key The scope key/name (will be converted from snake_case to kebab-case)
 * @param children Child scope nodes, or null if this is a leaf node
 * @param options Configuration options including prefix, suffix, and extension settings
 * @returns A scope object (callable or non-callable) with full type safety
 */
export function createScopeNode(
  key: string,
  children: Record<string, any> | null,
  options: BuildScopeOptions
): any {
  const { prefix = '', suffix = '', allowScopeExtension = false } = options;
  
  // Convert snake_case to kebab-case for TextMate compatibility
  const kebabKey = key.replace(/_/g, '-');
  
  // Build the path components, filtering out empty strings
  const pathParts = [prefix, kebabKey, suffix].filter(Boolean);
  const fullPath = pathParts.join('.');
  
  // Determine if this is a leaf node
  const isLeaf = !children || Object.keys(children).length === 0;
  
  // Determine if this node should be callable based on extension mode
  const shouldBeCallable = allowScopeExtension === true || 
                          (allowScopeExtension === "on-leafs" && isLeaf);
  
  let scopeNode: any;
  
  if (shouldBeCallable) {
    // Create a callable scope
    scopeNode = createScope(fullPath);
  } else {
    // For non-callable scopes, start with a simple object
    scopeNode = {};
    
    // Add toString and Symbol.toPrimitive methods that return the path
    Object.defineProperties(scopeNode, {
      toString: {
        value: () => fullPath,
        writable: false,
        enumerable: false,
        configurable: false,
      },
      [Symbol.toPrimitive]: {
        value: (hint: 'string' | 'default' | 'number') =>
          hint === 'string' || hint === 'default' ? fullPath : null,
        writable: false,
        enumerable: false,
        configurable: false,
      },
      valueOf: {
        value: () => fullPath,
        writable: false,
        enumerable: false,
        configurable: false,
      }
    });
  }
  
  // Attach child scope nodes as properties
  if (children) {
    for (const [childKey, childValue] of Object.entries(children)) {
      Object.defineProperty(scopeNode, childKey, {
        value: childValue,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }
  
  return scopeNode;
}

/**
 * Builds a scope tree from raw object definitions using the simplified type system.
 * 
 * @param options Configuration options for building the scope tree
 * @param scopeDefinition Raw object defining the scope hierarchy  
 * @returns Fully typed scope tree
 */
export function buildScopes(
  options: BuildScopeOptions,
  scopeDefinition: Record<string, any>
): any {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(scopeDefinition)) {
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      // This is a branch node - recursively build children
      const childOptions = {
        ...options,
        prefix: options.prefix ? `${options.prefix}.${key}` : key
      };
      const children = buildScopes(childOptions, value);
      
      // Create the scope node for this key with the current prefix (not including this key)
      result[key] = createScopeNode(key, children, options);
    } else {
      // This is a leaf node
      result[key] = createScopeNode(key, null, options);
    }
  }
  
  return result;
}

/**
 * Recursively merges raw scope definition objects.
 * 
 * @param baseDefinitions The base scope definition objects
 * @param customDefinitions The custom scope definition objects to merge
 * @returns Merged definition object ready for buildScopes()
 */
export function mergeDefinitions(
  baseDefinitions: Record<string, any>,
  customDefinitions: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...baseDefinitions };
  
  for (const [key, customValue] of Object.entries(customDefinitions)) {
    if (key in result) {
      const baseValue = result[key];
      
      // If both values are objects (nested definitions), merge them recursively
      if (typeof baseValue === 'object' && typeof customValue === 'object' &&
          baseValue !== null && customValue !== null &&
          !Array.isArray(baseValue) && !Array.isArray(customValue)) {
        result[key] = mergeDefinitions(baseValue, customValue);
      } else {
        // Custom definition takes precedence
        result[key] = customValue;
      }
    } else {
      result[key] = customValue;
    }
  }
  
  return result;
}