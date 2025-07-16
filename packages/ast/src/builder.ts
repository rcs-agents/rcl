import type {
  BaseNode,
  SourceFileNode,
  ImportNode,
  AgentNode,
  FlowNode,
  StateNode,
  TransitionNode,
  ActionNode,
  ParameterNode,
  MessagesNode,
  MessageNode,
  DefaultsNode,
  ConfigurationNode,
  StringNode,
  NumberNode,
  BooleanNode,
  AtomNode,
  ExpressionNode,
  TypeTagNode,
  CollectionNode,
  KeyValuePairNode,
  MultilineStringNode,
  IsoDurationNode,
  CommentNode,
  ErrorNode,
  Range,
  ValueNode
} from './nodes';

/**
 * Builder class for creating AST nodes
 */
export class ASTBuilder {
  private static createBaseNode(type: string, range: Range, text?: string): BaseNode {
    return {
      type,
      range,
      text,
      children: []
    };
  }

  static sourceFile(
    range: Range,
    imports: ImportNode[] = [],
    agent?: AgentNode
  ): SourceFileNode {
    const node = ASTBuilder.createBaseNode('source_file', range) as SourceFileNode;
    node.imports = imports;
    node.agent = agent;
    node.children = [...imports];
    if (agent) node.children.push(agent);
    return node;
  }

  static import(
    range: Range,
    path: string,
    alias?: string
  ): ImportNode {
    const node = ASTBuilder.createBaseNode('import_statement', range) as ImportNode;
    node.path = path;
    node.alias = alias;
    return node;
  }

  static agent(
    range: Range,
    name: string,
    options: {
      displayName?: string;
      description?: string;
      flows?: FlowNode[];
      messages?: MessagesNode;
      defaults?: DefaultsNode;
      configuration?: ConfigurationNode;
    } = {}
  ): AgentNode {
    const node = ASTBuilder.createBaseNode('agent_definition', range) as AgentNode;
    node.name = name;
    node.displayName = options.displayName;
    node.description = options.description;
    node.flows = options.flows || [];
    node.messages = options.messages;
    node.defaults = options.defaults;
    node.configuration = options.configuration;
    
    node.children = [...node.flows];
    if (node.messages) node.children.push(node.messages);
    if (node.defaults) node.children.push(node.defaults);
    if (node.configuration) node.children.push(node.configuration);
    
    return node;
  }

  static flow(
    range: Range,
    name: string,
    states: StateNode[] = []
  ): FlowNode {
    const node = ASTBuilder.createBaseNode('flow_definition', range) as FlowNode;
    node.name = name;
    node.states = states;
    node.children = states;
    return node;
  }

  static state(
    range: Range,
    name: string,
    options: {
      isStart?: boolean;
      isEnd?: boolean;
      actions?: ActionNode[];
      transitions?: TransitionNode[];
    } = {}
  ): StateNode {
    const node = ASTBuilder.createBaseNode('state_definition', range) as StateNode;
    node.name = name;
    node.isStart = options.isStart || false;
    node.isEnd = options.isEnd || false;
    node.actions = options.actions || [];
    node.transitions = options.transitions || [];
    node.children = [...node.actions, ...node.transitions];
    return node;
  }

  static transition(
    range: Range,
    to: string,
    condition?: ExpressionNode,
    action?: string
  ): TransitionNode {
    const node = ASTBuilder.createBaseNode('transition', range) as TransitionNode;
    node.to = to;
    node.condition = condition;
    node.action = action;
    if (condition) node.children = [condition];
    return node;
  }

  static action(
    range: Range,
    actionType: string,
    parameters: ParameterNode[] = []
  ): ActionNode {
    const node = ASTBuilder.createBaseNode('action', range) as ActionNode;
    node.actionType = actionType;
    node.parameters = parameters;
    node.children = parameters;
    return node;
  }

  static parameter(
    range: Range,
    key: string,
    value: ValueNode
  ): ParameterNode {
    const node = ASTBuilder.createBaseNode('parameter', range) as ParameterNode;
    node.key = key;
    node.value = value;
    node.children = [value];
    return node;
  }

  static messages(
    range: Range,
    name: string,
    messages: MessageNode[] = []
  ): MessagesNode {
    const node = ASTBuilder.createBaseNode('messages_section', range) as MessagesNode;
    node.name = name;
    node.messages = messages;
    node.children = messages;
    return node;
  }

  static message(
    range: Range,
    name: string,
    messageType: 'text' | 'rich_card' | 'carousel' | 'suggestion',
    content: ValueNode,
    metadata?: Record<string, ValueNode>
  ): MessageNode {
    const node = ASTBuilder.createBaseNode('message_definition', range) as MessageNode;
    node.name = name;
    node.messageType = messageType;
    node.content = content;
    node.metadata = metadata;
    node.children = [content];
    if (metadata) {
      node.children.push(...Object.values(metadata));
    }
    return node;
  }

  static defaults(
    range: Range,
    name: string,
    values: Record<string, ValueNode> = {}
  ): DefaultsNode {
    const node = ASTBuilder.createBaseNode('defaults_section', range) as DefaultsNode;
    node.name = name;
    node.values = values;
    node.children = Object.values(values);
    return node;
  }

  static configuration(
    range: Range,
    name: string,
    settings: Record<string, ValueNode> = {}
  ): ConfigurationNode {
    const node = ASTBuilder.createBaseNode('configuration_section', range) as ConfigurationNode;
    node.name = name;
    node.settings = settings;
    node.children = Object.values(settings);
    return node;
  }

  static string(range: Range, value: string): StringNode {
    const node = ASTBuilder.createBaseNode('string', range, value) as StringNode;
    node.value = value;
    return node;
  }

  static number(range: Range, value: number): NumberNode {
    const node = ASTBuilder.createBaseNode('number', range, value.toString()) as NumberNode;
    node.value = value;
    return node;
  }

  static boolean(range: Range, value: boolean): BooleanNode {
    const node = ASTBuilder.createBaseNode('boolean', range, value.toString()) as BooleanNode;
    node.value = value;
    return node;
  }

  static atom(range: Range, value: string): AtomNode {
    const node = ASTBuilder.createBaseNode('atom', range, value) as AtomNode;
    node.value = value;
    return node;
  }

  static expression(
    range: Range,
    language: 'javascript' | 'typescript',
    code: string,
    isMultiline = false
  ): ExpressionNode {
    const node = ASTBuilder.createBaseNode('expression', range, code) as ExpressionNode;
    node.language = language;
    node.code = code;
    node.isMultiline = isMultiline;
    return node;
  }

  static typeTag(
    range: Range,
    tagType: string,
    value: string,
    modifier?: string
  ): TypeTagNode {
    const node = ASTBuilder.createBaseNode('type_tag', range) as TypeTagNode;
    node.tagType = tagType;
    node.value = value;
    node.modifier = modifier;
    return node;
  }

  static collection(
    range: Range,
    collectionType: 'list' | 'dictionary',
    items: Array<ValueNode | KeyValuePairNode> = []
  ): CollectionNode {
    const node = ASTBuilder.createBaseNode('collection', range) as CollectionNode;
    node.collectionType = collectionType;
    node.items = items;
    node.children = items;
    return node;
  }

  static keyValuePair(
    range: Range,
    key: string | StringNode,
    value: ValueNode
  ): KeyValuePairNode {
    const node = ASTBuilder.createBaseNode('key_value_pair', range) as KeyValuePairNode;
    node.key = key;
    node.value = value;
    node.children = [value];
    if (typeof key !== 'string') {
      node.children.unshift(key);
    }
    return node;
  }

  static multilineString(
    range: Range,
    marker: 'clean' | 'trim' | 'preserve' | 'preserve_all',
    content: string
  ): MultilineStringNode {
    const node = ASTBuilder.createBaseNode('multiline_string', range, content) as MultilineStringNode;
    node.marker = marker;
    node.content = content;
    return node;
  }

  static isoDuration(range: Range, value: string): IsoDurationNode {
    const node = ASTBuilder.createBaseNode('iso_duration', range, value) as IsoDurationNode;
    node.value = value;
    return node;
  }

  static comment(range: Range, content: string): CommentNode {
    const node = ASTBuilder.createBaseNode('comment', range, content) as CommentNode;
    node.content = content;
    return node;
  }

  static error(range: Range, message?: string): ErrorNode {
    const node = ASTBuilder.createBaseNode('ERROR', range, message) as ErrorNode;
    node.message = message;
    return node;
  }
}