import type { ASTNode, BaseNode } from './nodes';

/**
 * Visitor interface for AST traversal
 */
export interface ASTVisitor<T = void> {
  visitSourceFile?(node: ASTNode & { type: 'source_file' }): T;
  visitImport?(node: ASTNode & { type: 'import_statement' }): T;
  visitAgent?(node: ASTNode & { type: 'agent_definition' }): T;
  visitFlow?(node: ASTNode & { type: 'flow_definition' }): T;
  visitState?(node: ASTNode & { type: 'state_definition' }): T;
  visitTransition?(node: ASTNode & { type: 'transition' }): T;
  visitAction?(node: ASTNode & { type: 'action' }): T;
  visitParameter?(node: ASTNode & { type: 'parameter' }): T;
  visitMessages?(node: ASTNode & { type: 'messages_section' }): T;
  visitMessage?(node: ASTNode & { type: 'message_definition' }): T;
  visitDefaults?(node: ASTNode & { type: 'defaults_section' }): T;
  visitConfiguration?(node: ASTNode & { type: 'configuration_section' }): T;
  visitString?(node: ASTNode & { type: 'string' }): T;
  visitNumber?(node: ASTNode & { type: 'number' }): T;
  visitBoolean?(node: ASTNode & { type: 'boolean' }): T;
  visitAtom?(node: ASTNode & { type: 'atom' }): T;
  visitExpression?(node: ASTNode & { type: 'expression' }): T;
  visitTypeTag?(node: ASTNode & { type: 'type_tag' }): T;
  visitCollection?(node: ASTNode & { type: 'collection' }): T;
  visitKeyValuePair?(node: ASTNode & { type: 'key_value_pair' }): T;
  visitMultilineString?(node: ASTNode & { type: 'multiline_string' }): T;
  visitIsoDuration?(node: ASTNode & { type: 'iso_duration' }): T;
  visitComment?(node: ASTNode & { type: 'comment' }): T;
  visitError?(node: ASTNode & { type: 'ERROR' }): T;
  
  // Default visitor for unhandled nodes
  visitDefault?(node: BaseNode): T;
}

/**
 * Accept visitor on an AST node
 */
export function accept<T>(node: BaseNode, visitor: ASTVisitor<T>): T | undefined {
  const methodName = `visit${node.type.charAt(0).toUpperCase()}${node.type.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`;
  const method = (visitor as any)[methodName];
  
  if (typeof method === 'function') {
    return method.call(visitor, node);
  }if (visitor.visitDefault) {
    return visitor.visitDefault(node);
  }
  
  return undefined;
}

/**
 * Base visitor class with default implementations
 */
export abstract class BaseASTVisitor<T = void> implements ASTVisitor<T> {
  /**
   * Visit all children of a node
   */
  protected visitChildren(node: BaseNode): void {
    if (node.children) {
      for (const child of node.children) {
        accept(child, this);
      }
    }
  }
  
  visitDefault(node: BaseNode): T {
    this.visitChildren(node);
    return undefined as any;
  }
}

/**
 * Collecting visitor that gathers results from all nodes
 */
export abstract class CollectingVisitor<T> extends BaseASTVisitor<T[]> {
  protected results: T[] = [];
  
  visitDefault(node: BaseNode): T[] {
    this.visitChildren(node);
    return this.results;
  }
  
  protected collect(item: T): void {
    this.results.push(item);
  }
  
  getResults(): T[] {
    return this.results;
  }
  
  reset(): void {
    this.results = [];
  }
}

/**
 * Transforming visitor that modifies the AST
 */
export abstract class TransformingVisitor extends BaseASTVisitor<BaseNode | null> {
  visitDefault(node: BaseNode): BaseNode {
    const newNode = { ...node };
    
    if (node.children) {
      const newChildren: BaseNode[] = [];
      
      for (const child of node.children) {
        const transformed = accept(child, this);
        if (transformed) {
          newChildren.push(transformed);
        }
      }
      
      newNode.children = newChildren;
    }
    
    return newNode;
  }
}