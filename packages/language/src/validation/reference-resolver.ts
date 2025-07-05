import type { ValidationAcceptor } from 'langium';
import type { 
  RclFile, 
  ImportStatement,
  AgentDefinition,
  FlowSection,
  FlowRule,
  FlowOperand
} from '../parser/ast/index.js';

/**
 * Reference resolution result
 */
export interface ReferenceResolution {
  resolvedReferences: Map<string, any>;
  unresolvedReferences: string[];
  circularDependencies: string[];
}

/**
 * Reference Resolver
 * 
 * Validates that all identifiers and references in RCL files
 * point to valid, defined entities and checks for circular dependencies.
 */
export class ReferenceResolver {
  
  /**
   * Resolve all references in an RCL file
   */
  resolveFileReferences(file: RclFile, accept: ValidationAcceptor): ReferenceResolution {
    const resolution: ReferenceResolution = {
      resolvedReferences: new Map(),
      unresolvedReferences: [],
      circularDependencies: []
    };

    // Resolve import references
    this.resolveImportReferences(file, resolution, accept);
    
    // Resolve flow references if agent definition exists
    if (file.agentDefinition) {
      this.resolveFlowReferences(file.agentDefinition, resolution, accept);
      this.resolveMessageReferences(file.agentDefinition, resolution, accept);
    }

    return resolution;
  }

  /**
   * Resolve import statement references
   */
  private resolveImportReferences(file: RclFile, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    for (const importStmt of file.imports) {
      this.validateImportStatement(importStmt, resolution, accept);
    }
  }

  /**
   * Validate an import statement
   */
  private validateImportStatement(importStmt: ImportStatement, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    // Validate import path structure
    if (!importStmt.importPath || importStmt.importPath.length === 0) {
      accept('error', 'Import statement must specify a path', {
        node: importStmt,
        property: 'importPath',
        code: 'missing-import-path'
      });
      return;
    }

    // Build the full import path
    const fullPath = importStmt.importPath.join('/');
    
    // Check for valid identifier format in path segments
    for (const segment of importStmt.importPath) {
      if (!this.isValidIdentifier(segment)) {
        accept('error', `Invalid identifier in import path: "${segment}"`, {
          node: importStmt,
          property: 'importPath',
          code: 'invalid-import-identifier'
        });
      }
    }

    // Validate alias if present
    if (importStmt.alias && !this.isValidIdentifier(importStmt.alias)) {
      accept('error', `Invalid alias identifier: "${importStmt.alias}"`, {
        node: importStmt,
        property: 'alias',
        code: 'invalid-alias-identifier'
      });
    }

    // Store resolved import (in a real implementation, this would resolve to actual files)
    const importKey = importStmt.alias || fullPath;
    resolution.resolvedReferences.set(`import:${importKey}`, importStmt);
  }

  /**
   * Resolve flow system references
   */
  private resolveFlowReferences(agent: AgentDefinition, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    if (!agent.flows) return;

    // Build a map of available flow operands
    const availableOperands = this.buildOperandMap(agent);
    
    // Validate flow rules and transitions
    for (const flow of agent.flows) {
      this.validateFlowSection(flow, availableOperands, resolution, accept);
    }
  }

  /**
   * Build a map of available flow operands (messages, flows, etc.)
   */
  private buildOperandMap(agent: AgentDefinition): Map<string, any> {
    const operands = new Map<string, any>();
    
    // Add special operands
    operands.set(':start', { type: 'special', value: ':start' });
    operands.set(':end', { type: 'special', value: ':end' });
    
    // Add message operands
    if (agent.messages) {
      for (const message of agent.messages.messages) {
        operands.set(message.name, { type: 'message', definition: message });
      }
    }
    
    // Add flow operands
    if (agent.flows) {
      for (const flow of agent.flows) {
        operands.set(flow.name, { type: 'flow', definition: flow });
      }
    }
    
    return operands;
  }

  /**
   * Validate a flow section
   */
  private validateFlowSection(flow: FlowSection, availableOperands: Map<string, any>, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    for (const rule of flow.rules) {
      this.validateFlowRule(rule, availableOperands, resolution, accept);
    }
  }

  /**
   * Validate a flow rule
   */
  private validateFlowRule(rule: FlowRule, availableOperands: Map<string, any>, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    for (const operand of rule.operands) {
      this.validateFlowOperand(operand, availableOperands, resolution, accept);
    }

    // Validate with clause parameters if present
    if (rule.withClause) {
      for (const param of rule.withClause.parameters) {
        // Parameter names should be valid identifiers
        if (!this.isValidIdentifier(param.name)) {
          accept('error', `Invalid parameter name: "${param.name}"`, {
            node: param,
            property: 'name',
            code: 'invalid-parameter-name'
          });
        }
      }
    }
  }

  /**
   * Validate a flow operand
   */
  private validateFlowOperand(operand: FlowOperand, availableOperands: Map<string, any>, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    const operandValue = operand.value;
    
    // Check if operand references a valid target
    if (!availableOperands.has(operandValue)) {
      resolution.unresolvedReferences.push(operandValue);
      accept('error', `Unresolved flow operand: "${operandValue}"`, {
        node: operand,
        property: 'value',
        code: 'unresolved-operand'
      });
    } else {
      // Store resolved reference
      const target = availableOperands.get(operandValue);
      resolution.resolvedReferences.set(`operand:${operandValue}`, target);
    }
  }

  /**
   * Resolve message references
   */
  private resolveMessageReferences(agent: AgentDefinition, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    if (!agent.messages) return;

    const messageNames = new Set<string>();
    
    // Check for duplicate message names
    for (const message of agent.messages.messages) {
      if (messageNames.has(message.name)) {
        accept('error', `Duplicate message name: "${message.name}"`, {
          node: message,
          property: 'name',
          code: 'duplicate-message-name'
        });
      } else {
        messageNames.add(message.name);
        resolution.resolvedReferences.set(`message:${message.name}`, message);
      }
    }
  }

  /**
   * Check for circular dependencies in flow references
   */
  checkCircularDependencies(agent: AgentDefinition, resolution: ReferenceResolution, accept: ValidationAcceptor): void {
    if (!agent.flows) return;

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const flow of agent.flows) {
      if (!visited.has(flow.name)) {
        this.detectCircularFlowDependency(flow, agent.flows, visited, recursionStack, resolution, accept);
      }
    }
  }

  /**
   * Detect circular dependencies in flow definitions
   */
  private detectCircularFlowDependency(
    currentFlow: FlowSection, 
    allFlows: FlowSection[], 
    visited: Set<string>, 
    recursionStack: Set<string>,
    resolution: ReferenceResolution,
    accept: ValidationAcceptor
  ): boolean {
    visited.add(currentFlow.name);
    recursionStack.add(currentFlow.name);

    // Check all operands in current flow
    for (const rule of currentFlow.rules) {
      for (const operand of rule.operands) {
        // If operand references another flow
        const referencedFlow = allFlows.find(f => f.name === operand.value);
        if (referencedFlow) {
          if (recursionStack.has(referencedFlow.name)) {
            // Circular dependency detected
            const cycle = `${currentFlow.name} -> ${referencedFlow.name}`;
            resolution.circularDependencies.push(cycle);
            accept('error', `Circular flow dependency detected: ${cycle}`, {
              node: operand,
              property: 'value',
              code: 'circular-flow-dependency'
            });
            return true;
          }
          
          if (!visited.has(referencedFlow.name)) {
            if (this.detectCircularFlowDependency(referencedFlow, allFlows, visited, recursionStack, resolution, accept)) {
              return true;
            }
          }
        }
      }
    }

    recursionStack.delete(currentFlow.name);
    return false;
  }

  /**
   * Validate identifier format
   */
  private isValidIdentifier(identifier: string): boolean {
    // RCL identifiers can contain letters, numbers, spaces, hyphens, underscores
    // Must start with a letter and can contain spaces for multi-word identifiers
    return /^[A-Z][A-Za-z0-9\s\-_]*$/i.test(identifier);
  }

  /**
   * Validate cross-file references (for import resolution)
   */
  validateCrossFileReferences(file: RclFile, importedFiles: Map<string, RclFile>, accept: ValidationAcceptor): void {
    for (const importStmt of file.imports) {
      const importPath = importStmt.importPath.join('/');
      
      if (!importedFiles.has(importPath)) {
        accept('error', `Cannot resolve import: "${importPath}"`, {
          node: importStmt,
          property: 'importPath',
          code: 'unresolved-import'
        });
      }
    }
  }

  /**
   * Get all referenced identifiers in a file
   */
  getAllReferencedIdentifiers(file: RclFile): Set<string> {
    const references = new Set<string>();
    
    if (file.agentDefinition) {
      // Collect flow operand references
      if (file.agentDefinition.flows) {
        for (const flow of file.agentDefinition.flows) {
          for (const rule of flow.rules) {
            for (const operand of rule.operands) {
              references.add(operand.value);
            }
          }
        }
      }
    }
    
    return references;
  }
}