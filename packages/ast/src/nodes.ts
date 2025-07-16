/**
 * Parser-independent AST node definitions for RCL
 * These types should work with any parser implementation (tree-sitter, ANTLR, custom)
 */

/**
 * Position in source text
 */
export interface Position {
  line: number;
  character: number;
}

/**
 * Range in source text
 */
export interface Range {
  start: Position;
  end: Position;
}

/**
 * Base AST node interface
 */
export interface BaseNode {
  type: string;
  range: Range;
  text?: string;
  children?: BaseNode[];
  parent?: BaseNode | null;
}

/**
 * Source file node - root of the AST
 */
export interface SourceFileNode extends BaseNode {
  type: 'source_file';
  imports: ImportNode[];
  agent?: AgentNode;
}

/**
 * Import statement
 */
export interface ImportNode extends BaseNode {
  type: 'import_statement';
  path: string;
  alias?: string;
}

/**
 * Agent definition
 */
export interface AgentNode extends BaseNode {
  type: 'agent_definition';
  name: string;
  displayName?: string;
  description?: string;
  flows: FlowNode[];
  messages?: MessagesNode;
  defaults?: DefaultsNode;
  configuration?: ConfigurationNode;
}

/**
 * Flow definition
 */
export interface FlowNode extends BaseNode {
  type: 'flow_definition';
  name: string;
  states: StateNode[];
}

/**
 * State definition
 */
export interface StateNode extends BaseNode {
  type: 'state_definition';
  name: string;
  isStart: boolean;
  isEnd: boolean;
  actions: ActionNode[];
  transitions: TransitionNode[];
}

/**
 * State transition
 */
export interface TransitionNode extends BaseNode {
  type: 'transition';
  to: string;
  condition?: ExpressionNode;
  action?: string;
}

/**
 * Action in a state
 */
export interface ActionNode extends BaseNode {
  type: 'action';
  actionType: string;
  parameters: ParameterNode[];
}

/**
 * Parameter for actions and other constructs
 */
export interface ParameterNode extends BaseNode {
  type: 'parameter';
  key: string;
  value: ValueNode;
}

/**
 * Messages section
 */
export interface MessagesNode extends BaseNode {
  type: 'messages_section';
  name: string;
  messages: MessageNode[];
}

/**
 * Message definition
 */
export interface MessageNode extends BaseNode {
  type: 'message_definition';
  name: string;
  messageType: 'text' | 'rich_card' | 'carousel' | 'suggestion';
  content: ValueNode;
  metadata?: Record<string, ValueNode>;
}

/**
 * Defaults section
 */
export interface DefaultsNode extends BaseNode {
  type: 'defaults_section';
  name: string;
  values: Record<string, ValueNode>;
}

/**
 * Configuration section
 */
export interface ConfigurationNode extends BaseNode {
  type: 'configuration_section';
  name: string;
  settings: Record<string, ValueNode>;
}

/**
 * Value nodes - can be literals, expressions, collections, etc.
 */
export type ValueNode = 
  | StringNode
  | NumberNode
  | BooleanNode
  | AtomNode
  | ExpressionNode
  | TypeTagNode
  | CollectionNode
  | MultilineStringNode
  | IsoDurationNode;

/**
 * String literal
 */
export interface StringNode extends BaseNode {
  type: 'string';
  value: string;
}

/**
 * Number literal
 */
export interface NumberNode extends BaseNode {
  type: 'number';
  value: number;
}

/**
 * Boolean literal
 */
export interface BooleanNode extends BaseNode {
  type: 'boolean';
  value: boolean;
}

/**
 * Atom (unquoted identifier used as value)
 */
export interface AtomNode extends BaseNode {
  type: 'atom';
  value: string;
}

/**
 * Embedded expression
 */
export interface ExpressionNode extends BaseNode {
  type: 'expression';
  language: 'javascript' | 'typescript';
  code: string;
  isMultiline: boolean;
}

/**
 * Type tag
 */
export interface TypeTagNode extends BaseNode {
  type: 'type_tag';
  tagType: string;
  value: string;
  modifier?: string;
}

/**
 * Collection (list or dictionary)
 */
export interface CollectionNode extends BaseNode {
  type: 'collection';
  collectionType: 'list' | 'dictionary';
  items: Array<ValueNode | KeyValuePairNode>;
}

/**
 * Key-value pair in dictionary
 */
export interface KeyValuePairNode extends BaseNode {
  type: 'key_value_pair';
  key: string | StringNode;
  value: ValueNode;
}

/**
 * Multiline string
 */
export interface MultilineStringNode extends BaseNode {
  type: 'multiline_string';
  marker: 'clean' | 'trim' | 'preserve' | 'preserve_all';
  content: string;
}

/**
 * ISO duration
 */
export interface IsoDurationNode extends BaseNode {
  type: 'iso_duration';
  value: string;
}

/**
 * Comment
 */
export interface CommentNode extends BaseNode {
  type: 'comment';
  content: string;
}

/**
 * Error node - represents parsing errors
 */
export interface ErrorNode extends BaseNode {
  type: 'ERROR';
  message?: string;
}

/**
 * Union type of all AST nodes
 */
export type ASTNode =
  | SourceFileNode
  | ImportNode
  | AgentNode
  | FlowNode
  | StateNode
  | TransitionNode
  | ActionNode
  | ParameterNode
  | MessagesNode
  | MessageNode
  | DefaultsNode
  | ConfigurationNode
  | ValueNode
  | KeyValuePairNode
  | CommentNode
  | ErrorNode;