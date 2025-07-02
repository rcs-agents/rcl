/**
 * Simplified AST interfaces for RCL
 * 
 * These interfaces provide a clean, Langium-independent representation
 * of the RCL language structure that can later be bridged to Langium AST.
 */

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface BaseAstNode {
  type: string;
  location?: SourceLocation;
}

/**
 * Root RCL file structure
 */
export interface RclFile extends BaseAstNode {
  type: 'RclFile';
  imports: ImportStatement[];
  sections: Section[];
}

/**
 * Represents an import statement in RCL, supporting multi-level namespace paths and space-separated aliases.
 *
 * Example usages:
 *   import My Brand / Samples as Sample One
 *   import Shared / Common Flows / Support
 *
 * - The `importedNames` array contains each namespace segment as a string, preserving spaces.
 * - The `alias` property, if present, is a space-separated alias for the import.
 * - The `source` property, if present, is the quoted string source (for future extensibility).
 *
 * This interface is used by both the custom parser and for bridging to Langium AST.
 */
export interface ImportStatement extends BaseAstNode {
  /**
   * The type discriminator for AST nodes.
   * Always 'ImportStatement' for import statements.
   */
  type: 'ImportStatement';
  /**
   * The namespace path segments, each as a space-separated string.
   * For example, ["My Brand", "Samples"] for `import My Brand / Samples`.
   */
  importedNames: string[];
  /**
   * Optional alias for the import, as a space-separated string (e.g., "Sample One").
   */
  alias?: string;
  /**
   * Optional quoted string source (not commonly used in RCL, reserved for future use).
   */
  source?: string;
}

/**
 * Section (agent, flows, messages, etc.)
 */
export interface Section extends BaseAstNode {
  type: 'Section';
  sectionType?: string; // 'agent', 'flows', 'messages', etc.
  name: string;
  attributes: Attribute[];
  subSections: Section[];
  flowRules: FlowRule[];
  messages: MessageDefinition[];
}

/**
 * Key-value attribute: key: value
 */
export interface Attribute extends BaseAstNode {
  type: 'Attribute';
  key: string;
  value: Value;
}

/**
 * Flow operand (source or destination in flow transitions)
 */
export interface FlowOperand extends BaseAstNode {
  type: 'FlowOperand';
  operandType: 'atom' | 'identifier' | 'string';
  value: string;
}

/**
 * Flow transition: source -> destination
 */
export interface FlowTransition extends BaseAstNode {
  type: 'FlowTransition';
  source: FlowOperand;
  destination: FlowOperand;
  withClause?: WithClause;
  whenClause?: WhenClause;
}

/**
 * When clause for conditional flow rules
 */
export interface WhenClause extends BaseAstNode {
  type: 'WhenClause';
  condition: EmbeddedExpression | Value;
  transitions: FlowTransition[];
}

/**
 * Flow rule: can be a named flow or a transition
 */
export interface FlowRule extends BaseAstNode {
  type: 'FlowRule';
  name: string;
  // Legacy fields for backward compatibility
  source?: string;
  destination?: string;
  isStart?: boolean;
  withClause?: WithClause;
  attributes: Attribute[];
  nestedRules: FlowRule[];
  // Enhanced fields for arrow-based flows
  transitions: FlowTransition[];
  whenClauses: WhenClause[];
}

/**
 * With clause for flow rules: with param1: type1, param2: type2
 */
export interface WithClause extends BaseAstNode {
  type: 'WithClause';
  parameters: Parameter[];
}

/**
 * Parameter definition: name: type = value
 */
export interface Parameter extends BaseAstNode {
  type: 'Parameter';
  name: string;
  parameterType?: string;
  defaultValue?: Value;
}

/**
 * Message definition
 */
export interface MessageDefinition extends BaseAstNode {
  type: 'MessageDefinition';
  name: string;
  messageType?: string; // 'text', 'richCard', etc.
  attributes: Attribute[];
}

/**
 * Embedded expression (single line): $js> code, $ts> code
 */
export interface EmbeddedExpression extends BaseAstNode {
  type: 'EmbeddedExpression';
  language: 'js' | 'ts';
  content: string;
  isMultiline: boolean;
  location?: SourceLocation;
}

/**
 * Embedded code block (multi-line): $js> { ... }, $ts> { ... }
 */
export interface EmbeddedCodeBlock extends BaseAstNode {
  type: 'EmbeddedCodeBlock';
  language: 'js' | 'ts';
  content: string[]; // Array of lines
  location?: SourceLocation;
}

/**
 * Various value types
 */
export type Value = 
  | StringValue 
  | NumberValue 
  | BooleanValue 
  | NullValue 
  | IdentifierValue
  | ListValue 
  | ObjectValue
  | TypeTaggedValue
  | EmbeddedExpression
  | EmbeddedCodeBlock;

export interface StringValue extends BaseAstNode {
  type: 'StringValue';
  value: string;
  isMultiline?: boolean;
  chompingIndicator?: 'clip' | 'strip' | 'keep' | 'preserve';
}

export interface NumberValue extends BaseAstNode {
  type: 'NumberValue';
  value: number;
  rawValue: string; // Original text representation
}

export interface BooleanValue extends BaseAstNode {
  type: 'BooleanValue';
  value: boolean;
  rawValue: string; // 'True', 'False', 'On', etc.
}

export interface NullValue extends BaseAstNode {
  type: 'NullValue';
  rawValue: string; // 'null', 'None', 'Void'
}

export interface IdentifierValue extends BaseAstNode {
  type: 'IdentifierValue';
  value: string;
  isSpaceSeparated?: boolean;
}

export interface ListValue extends BaseAstNode {
  type: 'ListValue';
  items: Value[];
  style: 'inline' | 'indented' | 'bracketed';
}

export interface ObjectValue extends BaseAstNode {
  type: 'ObjectValue';
  pairs: ObjectPair[];
  style: 'inline' | 'indented' | 'braced';
}

export interface ObjectPair extends BaseAstNode {
  type: 'ObjectPair';
  key: Value;
  value: Value;
}

export interface TypeTaggedValue extends BaseAstNode {
  type: 'TypeTaggedValue';
  tagType: string; // 'email', 'phone', 'url', etc.
  value: Value;
  modifier?: string; // Optional type modifier
}

/**
 * Utility functions for working with AST nodes
 */
export class AstUtils {
  /**
   * Check if a node is of a specific type
   */
  static isType<T extends BaseAstNode>(node: BaseAstNode, type: string): node is T {
    return node.type === type;
  }

  /**
   * Find all nodes of a specific type in an AST
   */
  static findNodes<T extends BaseAstNode>(root: BaseAstNode, type: string): T[] {
    const result: T[] = [];
    
    function visit(node: any) {
      if (node && typeof node === 'object') {
        if (node.type === type) {
          result.push(node as T);
        }
        
        // Recursively visit all properties
        for (const key in node) {
          const value = node[key];
          if (Array.isArray(value)) {
            value.forEach(visit);
          } else if (value && typeof value === 'object') {
            visit(value);
          }
        }
      }
    }
    
    visit(root);
    return result;
  }

  /**
   * Get all section names from an RCL file
   */
  static getSectionNames(file: RclFile): string[] {
    const sections = AstUtils.findNodes<Section>(file, 'Section');
    return sections.map(s => s.name);
  }

  /**
   * Get all flow rules from an RCL file
   */
  static getFlowRules(file: RclFile): FlowRule[] {
    return AstUtils.findNodes<FlowRule>(file, 'FlowRule');
  }

  /**
   * Get all message definitions from an RCL file
   */
  static getMessages(file: RclFile): MessageDefinition[] {
    return AstUtils.findNodes<MessageDefinition>(file, 'MessageDefinition');
  }
} 