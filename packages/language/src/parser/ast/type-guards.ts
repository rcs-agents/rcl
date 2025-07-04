/**
 * Type Guard Functions for RCL AST
 * 
 * These functions provide runtime type checking for AST nodes,
 * replacing the generated type guards from langium.
 */

import type { AstNode } from 'langium';
import type {
  RclFile,
  ImportStatement
} from './core/file-structure.js';
import type {
  AgentDefinition,
  AgentConfig,
  AgentDefaults,
  ConfigProperty,
  DefaultProperty,
  FlowSection,
  FlowRule,
  MessagesSection,
  MessageDefinition,
  AgentMessage,
  ContentMessage,
  TextContent,
  RichCardContent,
  CarouselContent,
  RbmFileContent,
  FileContent,
  MediaContent,
  MediaContentInfo,
  Suggestion,
  ReplyAction,
  SuggestedAction
} from './sections/index.js';

import type {
  MessageShortcut,
  TextShortcut,
  RichCardShortcut,
  CarouselShortcut,
  RbmFileShortcut,
  FileShortcut
} from './shortcuts/index.js';

import type {
  SuggestionShortcut,
  ReplyShortcut,
  DialShortcut,
  OpenUrlShortcut,
  ShareLocationShortcut,
  ViewLocationShortcut,
  SaveEventShortcut
} from './shortcuts/index.js';

import type {
  FlowOperand,
  WithClause,
  WhenClause,
  FlowTransition,
  Parameter,
  ParameterList
} from './flow-system/index.js';

import type {
  Value,
  StringValue,
  NumberValue,
  BooleanValue,
  NullValue,
  IdentifierValue,
  AtomValue
} from './values/index.js';

import type {
  ListValue,
  DictionaryValue,
  DictionaryEntry,
  MappedType,
  MappedTypeItem
} from './values/index.js';

import type {
  EmbeddedExpression,
  EmbeddedCodeBlock
} from './values/index.js';

import type {
  TypeTag,
  TypedValue
} from './values/index.js';

// Helper function to check if an object has a specific type property
function hasType(node: any, type: string): boolean {
  return node && typeof node === 'object' && node.type === type;
}

// Core AST Type Guards
export function isAstNode(node: any): node is AstNode {
  return node && typeof node === 'object' && typeof node.type === 'string';
}

export function isRclFile(node: any): node is RclFile {
  return hasType(node, 'RclFile');
}

export function isImportStatement(node: any): node is ImportStatement {
  return hasType(node, 'ImportStatement');
}

// Agent and Configuration Type Guards
export function isAgentDefinition(node: any): node is AgentDefinition {
  return hasType(node, 'AgentDefinition');
}

export function isAgentConfig(node: any): node is AgentConfig {
  return hasType(node, 'AgentConfig');
}

export function isAgentDefaults(node: any): node is AgentDefaults {
  return hasType(node, 'AgentDefaults');
}

export function isConfigProperty(node: any): node is ConfigProperty {
  return hasType(node, 'ConfigProperty');
}

export function isDefaultProperty(node: any): node is DefaultProperty {
  return hasType(node, 'DefaultProperty');
}

// Flow System Type Guards
export function isFlowSection(node: any): node is FlowSection {
  return hasType(node, 'FlowSection');
}

export function isFlowRule(node: any): node is FlowRule {
  return hasType(node, 'FlowRule');
}

export function isFlowOperand(node: any): node is FlowOperand {
  return hasType(node, 'FlowOperand');
}

export function isWithClause(node: any): node is WithClause {
  return hasType(node, 'WithClause');
}

export function isWhenClause(node: any): node is WhenClause {
  return hasType(node, 'WhenClause');
}

export function isFlowTransition(node: any): node is FlowTransition {
  return hasType(node, 'FlowTransition');
}

export function isParameter(node: any): node is Parameter {
  return hasType(node, 'Parameter');
}

export function isParameterList(node: any): node is ParameterList {
  return hasType(node, 'ParameterList');
}

// Message System Type Guards
export function isMessagesSection(node: any): node is MessagesSection {
  return hasType(node, 'MessagesSection');
}

export function isMessageDefinition(node: any): node is MessageDefinition {
  return hasType(node, 'MessageDefinition');
}

export function isAgentMessage(node: any): node is AgentMessage {
  return hasType(node, 'AgentMessage');
}

export function isContentMessage(node: any): node is ContentMessage {
  return hasType(node, 'ContentMessage');
}

export function isTextContent(node: any): node is TextContent {
  return hasType(node, 'TextContent');
}

export function isRichCardContent(node: any): node is RichCardContent {
  return hasType(node, 'RichCardContent');
}

export function isCarouselContent(node: any): node is CarouselContent {
  return hasType(node, 'CarouselContent');
}

export function isRbmFileContent(node: any): node is RbmFileContent {
  return hasType(node, 'RbmFileContent');
}

export function isFileContent(node: any): node is FileContent {
  return hasType(node, 'FileContent');
}

export function isMediaContent(node: any): node is MediaContent {
  return hasType(node, 'MediaContent');
}

export function isMediaContentInfo(node: any): node is MediaContentInfo {
  return hasType(node, 'MediaContentInfo');
}

export function isSuggestion(node: any): node is Suggestion {
  return hasType(node, 'Suggestion');
}

export function isReplyAction(node: any): node is ReplyAction {
  return hasType(node, 'ReplyAction');
}

export function isSuggestedAction(node: any): node is SuggestedAction {
  return hasType(node, 'SuggestedAction');
}

// Message Shortcut Type Guards
export function isMessageShortcut(node: any): node is MessageShortcut {
  return isTextShortcut(node) || isRichCardShortcut(node) || isCarouselShortcut(node) || 
         isRbmFileShortcut(node) || isFileShortcut(node);
}

export function isTextShortcut(node: any): node is TextShortcut {
  return hasType(node, 'TextShortcut');
}

export function isRichCardShortcut(node: any): node is RichCardShortcut {
  return hasType(node, 'RichCardShortcut');
}

export function isCarouselShortcut(node: any): node is CarouselShortcut {
  return hasType(node, 'CarouselShortcut');
}

export function isRbmFileShortcut(node: any): node is RbmFileShortcut {
  return hasType(node, 'RbmFileShortcut');
}

export function isFileShortcut(node: any): node is FileShortcut {
  return hasType(node, 'FileShortcut');
}

// Suggestion Shortcut Type Guards
export function isSuggestionShortcut(node: any): node is SuggestionShortcut {
  return isReplyShortcut(node) || isDialShortcut(node) || isOpenUrlShortcut(node) ||
         isShareLocationShortcut(node) || isViewLocationShortcut(node) || isSaveEventShortcut(node);
}

export function isReplyShortcut(node: any): node is ReplyShortcut {
  return hasType(node, 'ReplyShortcut');
}

export function isDialShortcut(node: any): node is DialShortcut {
  return hasType(node, 'DialShortcut');
}

export function isOpenUrlShortcut(node: any): node is OpenUrlShortcut {
  return hasType(node, 'OpenUrlShortcut');
}

export function isShareLocationShortcut(node: any): node is ShareLocationShortcut {
  return hasType(node, 'ShareLocationShortcut');
}

export function isViewLocationShortcut(node: any): node is ViewLocationShortcut {
  return hasType(node, 'ViewLocationShortcut');
}

export function isSaveEventShortcut(node: any): node is SaveEventShortcut {
  return hasType(node, 'SaveEventShortcut');
}

// Value Type Guards
export function isValue(node: any): node is Value {
  return isStringValue(node) || isNumberValue(node) || isBooleanValue(node) || 
         isNullValue(node) || isIdentifierValue(node) || isAtomValue(node) ||
         isListValue(node) || isDictionaryValue(node) || isMappedType(node) ||
         isEmbeddedExpression(node) || isEmbeddedCodeBlock(node) || isTypeTag(node);
}

export function isStringValue(node: any): node is StringValue {
  return hasType(node, 'StringValue');
}

export function isNumberValue(node: any): node is NumberValue {
  return hasType(node, 'NumberValue');
}

export function isBooleanValue(node: any): node is BooleanValue {
  return hasType(node, 'BooleanValue');
}

export function isNullValue(node: any): node is NullValue {
  return hasType(node, 'NullValue');
}

export function isIdentifierValue(node: any): node is IdentifierValue {
  return hasType(node, 'IdentifierValue');
}

export function isAtomValue(node: any): node is AtomValue {
  return hasType(node, 'AtomValue');
}

// Collection Type Guards
export function isListValue(node: any): node is ListValue {
  return hasType(node, 'ListValue');
}

export function isDictionaryValue(node: any): node is DictionaryValue {
  return hasType(node, 'DictionaryValue');
}

export function isDictionaryEntry(node: any): node is DictionaryEntry {
  return hasType(node, 'DictionaryEntry');
}

export function isMappedType(node: any): node is MappedType {
  return hasType(node, 'MappedType');
}

export function isMappedTypeItem(node: any): node is MappedTypeItem {
  return hasType(node, 'MappedTypeItem');
}

// Embedded Expression Type Guards
export function isEmbeddedExpression(node: any): node is EmbeddedExpression {
  return hasType(node, 'EmbeddedExpression');
}

export function isEmbeddedCodeBlock(node: any): node is EmbeddedCodeBlock {
  return hasType(node, 'EmbeddedCodeBlock');
}

// Type Tag Type Guards
export function isTypeTag(node: any): node is TypeTag {
  return hasType(node, 'TypeTag');
}

export function isTypedValue(node: any): node is TypedValue {
  return hasType(node, 'TypedValue');
}

// Legacy compatibility - map to the new types
export function isSection(node: any): node is AgentDefinition | FlowSection | MessagesSection {
  return isAgentDefinition(node) || isFlowSection(node) || isMessagesSection(node);
}

export function isAttribute(node: any): node is ConfigProperty | DefaultProperty {
  return isConfigProperty(node) || isDefaultProperty(node);
}

// Type aliases for backward compatibility
export type Section = AgentDefinition | FlowSection | MessagesSection;

// For compatibility with old generated types
export interface EmbeddedCodeExpression extends EmbeddedExpression {}
export interface TypeConversion extends TypeTag {}

export function isEmbeddedCodeExpression(node: any): node is EmbeddedCodeExpression {
  return isEmbeddedExpression(node);
}

export function isTypeConversion(node: any): node is TypeConversion {
  return isTypeTag(node);
}

// Additional compatibility mappings
export interface InlineList extends ListValue {}
export interface InlineObject extends DictionaryValue {}
export interface IndentedList extends ListValue {}
export interface IndentedObject extends DictionaryValue {}

export function isInlineList(node: any): node is InlineList {
  return isListValue(node) && node.isInline;
}

export function isInlineObject(node: any): node is InlineObject {
  return isDictionaryValue(node) && node.isInline;
}

export function isIndentedList(node: any): node is IndentedList {
  return isListValue(node) && !node.isInline;
}

export function isIndentedObject(node: any): node is IndentedObject {
  return isDictionaryValue(node) && !node.isInline;
} 