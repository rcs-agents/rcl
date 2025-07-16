/**
 * @fileoverview
 * This file contains the formal Abstract Syntax Tree (AST) type definitions for the
 * Rich Communication Language (RCL). The structure of these types is derived
 * directly from the RCL formal specification.
 *
 * Each interface corresponds to a rule in the syntactic specification, ensuring
 * that the parsed AST is a faithful representation of the source code's structure.
 */

// #region Core Interfaces

/**
 * The root node of an RCL file.
 * @spec RclFile ::= (ImportStatement)* (Section)*
 */
export interface RclFile {
  type: 'RclFile';
  imports: ImportStatement[];
  sections: Section[];
}

/**
 * An import statement.
 * @spec ImportStatement ::= 'import' ImportPath ('as' IDENTIFIER)?
 */
export interface ImportStatement {
  type: 'ImportStatement';
  /** @spec ImportPath ::= IDENTIFIER ('/' IDENTIFIER)* */
  importPath: string[];
  alias?: string;
}

// #endregion

// #region Section Constructs

/**
 * A generic section, which is the primary building block of an RCL file.
 * @spec Section ::= SECTION_TYPE IDENTIFIER? ParameterList? (INDENT (SpreadDirective | Attribute | Section | MatchBlock)* DEDENT)?
 */
export interface Section {
  type: 'Section';
  sectionType: string;
  identifier?: string;
  parameters?: ParameterList;
  body: (SpreadDirective | Attribute | Section | MatchBlock)[];
}

/**
 * An attribute, which is a key-value pair within a section.
 * @spec Attribute ::= ATTRIBUTE_KEY ':' Value
 */
export interface Attribute {
  type: 'Attribute';
  key: string;
  value: Value;
}

/**
 * A spread directive to include attributes from another section.
 * @spec SpreadDirective ::= SPREAD IDENTIFIER
 */
export interface SpreadDirective {
  type: 'SpreadDirective';
  identifier: string;
}

/**
 * A match block for conditional value selection.
 * @spec MatchBlock ::= 'match' Value INDENT (MatchCase)+ DEDENT
 */
export interface MatchBlock {
  type: 'MatchBlock';
  discriminant: Value;
  cases: MatchCase[];
}

/**
 * A case within a match block.
 * @spec MatchCase ::= (STRING | NUMBER | ATOM) '->' ContextualizedValue | ':default' '->' ContextualizedValue
 */
export interface MatchCase {
  type: 'MatchCase';
  value: StringLiteral | NumericLiteral | Atom | 'default';
  consequence: ContextualizedValue;
}

// #endregion

// #region Value Constructs

/**
 * A union of all possible value types in RCL.
 * @spec Value ::= PrimitiveValue | IDENTIFIER | VARIABLE | PROPERTY_ACCESS | List | Dictionary | EmbeddedCode
 */
export type Value =
  | PrimitiveValue
  | string // For IDENTIFIER
  | Variable
  | PropertyAccess
  | List
  | Dictionary
  | EmbeddedCode;

/**
 * A union of primitive value types.
 * @spec PrimitiveValue ::= STRING | MultiLineString | NUMBER | BooleanLiteral | NullLiteral | ATOM | TypeTag
 */
export type PrimitiveValue =
  | StringLiteral
  | MultiLineString
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | Atom
  | TypeTag;

/**
 * A value that can be contextualized with parameters.
 * @spec ContextualizedValue ::= Value ('with' ParameterList)?
 */
export interface ContextualizedValue {
  type: 'ContextualizedValue';
  value: Value;
  parameters?: ParameterList;
}

/**
 * A list of parameters.
 * @spec ParameterList ::= Parameter (',' Parameter)*
 */
export type ParameterList = Parameter[];

/**
 * A single parameter, which can be positional or named.
 * @spec Parameter ::= ATTRIBUTE_KEY ':' Value | Value
 */
export interface Parameter {
  type: 'Parameter';
  key?: string;
  value: Value;
}

// #endregion

// #region Literals and Identifiers

/** A double-quoted string literal. May contain interpolations. */
export interface StringLiteral {
  type: 'StringLiteral';
  value: string;
}

/**
 * A multi-line string with chomping controls or in triple-quoted mode.
 * @spec MultiLineString ::= (PIPE_STYLE) | (TRIPLE_QUOTE_STYLE)
 */
export interface MultiLineString {
  type: 'MultiLineString';
  mode: 'clean' | 'trim' | 'preserve' | 'preserve_all' | 'quoted';
  value: string;
}

/** A numeric literal. */
export interface NumericLiteral {
  type: 'NumericLiteral';
  value: number;
}

/** A boolean literal. */
export interface BooleanLiteral {
  type: 'BooleanLiteral';
  value: boolean;
}

/** A null literal. */
export interface NullLiteral {
  type: 'NullLiteral';
  value: null;
}

/** An atom literal. */
export interface Atom {
  type: 'Atom';
  value: string; // e.g., ':symbol'
}

/** A variable reference. */
export interface Variable {
  type: 'Variable';
  name: string; // e.g., '@variable'
}

/** A property access on a variable. */
export interface PropertyAccess {
  type: 'PropertyAccess';
  object: Variable;
  properties: string[]; // e.g., 'property1', 'property2'
}

// #endregion

// #region Collections

/**
 * A list of values.
 * @spec List ::= ParenthesesList | InlineList | BlockList
 */
export interface List {
  type: 'List';
  items: Value[];
}

/**
 * A dictionary of key-value pairs.
 * @spec Dictionary ::= BraceDictionary | BlockDictionary
 */
export interface Dictionary {
  type: 'Dictionary';
  entries: DictionaryEntry[];
}

/**
 * An entry in a dictionary.
 * @spec DictEntry ::= (ATTRIBUTE_KEY | STRING) ':' Value
 */
export interface DictionaryEntry {
  type: 'DictionaryEntry';
  key: string | StringLiteral;
  value: Value;
}

// #endregion

// #region Advanced Values

/**
 * A type tag for semantic data types.
 * @spec TypeTag ::= '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'
 */
export interface TypeTag {
  type: 'TypeTag';
  tagName: string;
  value: string | number;
  qualifier?: string;
}

/**
 * An embedded code expression or block.
 * @spec EmbeddedCode ::= SingleLineCode | MultiLineCode
 */
export type EmbeddedCode = SingleLineCode | MultiLineCode;

/**
 * A single-line embedded code expression.
 * @spec SingleLineCode ::= EMBEDDED_CODE
 */
export interface SingleLineCode {
  type: 'SingleLineCode';
  language?: 'js' | 'ts';
  code: string;
}

/**
 * A multi-line embedded code block.
 * @spec MultiLineCode ::= MULTI_LINE_CODE_START INDENT CodeContent DEDENT MULTI_LINE_CODE_END
 */
export interface MultiLineCode {
  type: 'MultiLineCode';
  language?: 'js' | 'ts';
  code: string;
}

/**
 * A multi-line string with chomping controls.
 * @spec MultiLineString ::= (MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL) INDENT StringContent DEDENT MULTILINE_STR_END
 */
export interface MultiLineString {
  type: 'MultiLineString';
  mode: 'clean' | 'trim' | 'preserve' | 'preserve_all';
  value: string;
}

// #endregion 