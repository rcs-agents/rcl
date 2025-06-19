# Langium API Usage Conventions & Best Practices

## 1. Type-Only Imports

When all named imports from a module are used exclusively as types, use the `import type` syntax:

```typescript
import type { SomeInterface, AnotherType } from 'module-name';
```

This is preferred over `import { type SomeInterface, type AnotherType } from 'module-name';`.

## 2. Accessing CST Node Range

To get the `Range` of an `AstNode` from its underlying Concrete Syntax Tree (CST) node, use the direct property access:

```typescript
const astNode: AstNode = /* ... get AST node ... */;
const range = astNode.$cstNode?.range; // Safely access range if $cstNode exists
```

Avoid searching for or relying on a separate `getNodeRange(astNode)` utility if `astNode.$cstNode.range` is available and appropriate.

## 3. Utility Namespaces: `AstUtils` and `CstUtils`

Langium provides utility functions for working with AST and CST nodes under the `AstUtils` and `CstUtils` namespaces, imported from the root `'langium'` module.

```typescript
import { AstUtils, CstUtils } from 'langium';

// Example: Find leaf CST node at an offset
// const rootCstNode = document.parseResult.value.$cstNode;
// if (rootCstNode) {
//   const leafCst = CstUtils.findLeafNodeAtOffset(rootCstNode, offset);
// }

// Example: Get container AST node of a specific type
// const astNode = /* ... some AST node ... */;
// const parentSection = AstUtils.getContainerOfType(astNode, isSection);
```

**Important Argument Types:**
*   `CstUtils.findLeafNodeAtOffset(cstNode: CstNode, offset: number)`: Expects a `CstNode` as the first argument (e.g., `astRootNode.$cstNode`).
*   `AstUtils.getContainerOfType(astNode: AstNode, predicate: (n: AstNode) => boolean)`: Expects an `AstNode` as the first argument (e.g., `cstLeafNode.element`).

## 4. LSP Service Base Classes & Interfaces

When implementing LSP services, ensure you are extending the correct base class or implementing the correct interface provided by Langium, typically found in `langium/lsp`.

*   **Hover Provider**: Implement `HoverProvider` interface from `langium/lsp` or extend `AstNodeHoverProvider` from `langium/lsp`.
*   **Reference Provider**: Implement `ReferencesProvider` interface from `langium/lsp`.
*   **Semantic Token Provider**: Extend `AbstractSemanticTokenProvider` from `langium/lsp`.
*   **Document Symbol Provider**: Extend `AbstractDocumentSymbolProvider` from `langium/lsp`.

Pay close attention to the method signatures (including `override` keyword, return types like `MaybePromise`, and parameters like `CancellationToken`) required by the interface or base class.

## 5. Accessing Specific Feature CST Nodes

To get the specific CST node for a feature (property) of an AST node (e.g., for precise range information for a section's name):

```typescript
// services: LangiumServices (or RclServices which extends it)
// astNode: The AST node instance
// featureName: string (e.g., 'sectionName', 'key')

// const featureCstNode = services.syntax.cst.findNodeForFeature(astNode.$cstNode, featureName);
// if (featureCstNode) {
//   const preciseRange = featureCstNode.range;
// }
```
This requires access to `LangiumServices` (or an extended version like `RclServices`).