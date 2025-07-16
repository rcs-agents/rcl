import type { BaseNode, ASTNode, Position, Range } from './nodes';

/**
 * Check if a node is of a specific type
 */
export function isNodeType<T extends ASTNode>(
  node: BaseNode,
  type: T['type']
): node is T {
  return node.type === type;
}

/**
 * Get text content of a node
 */
export function getNodeText(node: BaseNode): string {
  return node.text || '';
}

/**
 * Find a node by type in the AST
 */
export function findNodeByType<T extends ASTNode>(
  root: BaseNode,
  type: T['type']
): T | null {
  if (isNodeType<T>(root, type)) {
    return root as T;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByType<T>(child, type);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Find all nodes by type in the AST
 */
export function findNodesByType<T extends ASTNode>(
  root: BaseNode,
  type: T['type']
): T[] {
  const nodes: T[] = [];

  function traverse(node: BaseNode) {
    if (isNodeType<T>(node, type)) {
      nodes.push(node as T);
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return nodes;
}

/**
 * Get the parent node of a specific type
 */
export function getParentOfType<T extends ASTNode>(
  node: BaseNode,
  type: T['type']
): T | null {
  let current = node.parent;
  
  while (current) {
    if (isNodeType<T>(current, type)) {
      return current as T;
    }
    current = current.parent;
  }
  
  return null;
}

/**
 * Check if a position is within a range
 */
export function isPositionInRange(position: Position, range: Range): boolean {
  const { start, end } = range;
  
  if (position.line < start.line || position.line > end.line) {
    return false;
  }
  
  if (position.line === start.line && position.character < start.character) {
    return false;
  }
  
  if (position.line === end.line && position.character > end.character) {
    return false;
  }
  
  return true;
}

/**
 * Find node at a specific position
 */
export function findNodeAtPosition(
  root: BaseNode,
  position: Position
): BaseNode | null {
  let deepestNode: BaseNode | null = null;

  function traverse(node: BaseNode) {
    if (isPositionInRange(position, node.range)) {
      deepestNode = node;
      
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }
  }

  traverse(root);
  return deepestNode;
}

/**
 * Walk the AST with a visitor function
 */
export function walkAST(
  root: BaseNode,
  visitor: (node: BaseNode, parent: BaseNode | null) => undefined | boolean,
  parent: BaseNode | null = null
): void {
  const shouldContinue = visitor(root, parent);
  
  if (shouldContinue !== false && root.children) {
    for (const child of root.children) {
      walkAST(child, visitor, root);
    }
  }
}

/**
 * Transform AST nodes
 */
export function transformAST<T extends BaseNode = BaseNode>(
  root: BaseNode,
  transformer: (node: BaseNode) => BaseNode | null
): T | null {
  const transformed = transformer(root);
  if (!transformed) return null;

  if (transformed.children) {
    const newChildren: BaseNode[] = [];
    
    for (const child of transformed.children) {
      const transformedChild = transformAST(child, transformer);
      if (transformedChild) {
        newChildren.push(transformedChild);
      }
    }
    
    transformed.children = newChildren;
  }

  return transformed as T;
}

/**
 * Check if AST contains any error nodes
 */
export function hasErrors(root: BaseNode): boolean {
  let hasError = false;
  
  walkAST(root, (node) => {
    if (node.type === 'ERROR') {
      hasError = true;
      return false; // Stop walking
    }
  });
  
  return hasError;
}

/**
 * Collect all error nodes
 */
export function collectErrors(root: BaseNode): BaseNode[] {
  const errors: BaseNode[] = [];
  
  walkAST(root, (node) => {
    if (node.type === 'ERROR') {
      errors.push(node);
    }
    return true; // Continue walking
  });
  
  return errors;
}

/**
 * Create a range from positions
 */
export function createRange(
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number
): Range {
  return {
    start: { line: startLine, character: startChar },
    end: { line: endLine, character: endChar }
  };
}

/**
 * Compare positions
 */
export function comparePositions(a: Position, b: Position): number {
  if (a.line !== b.line) {
    return a.line - b.line;
  }
  return a.character - b.character;
}

/**
 * Check if range A contains range B
 */
export function rangeContains(a: Range, b: Range): boolean {
  return (
    comparePositions(a.start, b.start) <= 0 &&
    comparePositions(a.end, b.end) >= 0
  );
}