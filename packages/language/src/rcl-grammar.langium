grammar RCL

// -------------------- Terminals --------------------

// Keywords
terminal IMPORT: 'import';
terminal AS: 'as';
terminal WITH: 'with';
terminal MATCH: 'match';

// Literals
terminal BOOLEAN: 'True' | 'Yes' | 'On' | 'False' | 'No' | 'Off';
terminal NULL: 'Null' | 'None' | 'Void';
terminal NUMBER returns number: /-?\d+(\.\d+)?([eE][+-]?\d+)?/;

// Identifiers
terminal IDENTIFIER: /[A-Z](?:[A-Za-z0-9_-]|[ \t]+[A-Z0-9][A-Za-z0-9_-]*)*/;
terminal LOWER_NAME: /[a-z][a-zA-Z0-9_]*/;
terminal VARIABLE: /@[a-zA-Z_][a-zA-Z0-9_]*/;

// Atoms and attributes
terminal ATTRIBUTE_NAME: /[a-z][a-zA-Z0-9_]*:/;
terminal ATOM: /:[a-zA-Z_][a-zA-Z0-9_]*/;
terminal DEFAULT_CASE: ':default';

// Strings and regex
terminal STRING: /"(?:\\.|[^"\\])*"/;
terminal REGEX: /\/(?:\\.|[^\/\\])+\//;

// Embedded code
terminal EMBEDDED_CODE: /\$(?:js|ts)?>[^\r\n]*/;
terminal MULTI_LINE_CODE_START: /\$(?:js|ts)?>>>/;

// Multi-line string markers
terminal MULTILINE_STR_CLEAN: /\|[ \t]*\r?\n/;
terminal MULTILINE_STR_TRIM: /\|-[ \t]*\r?\n/;
terminal MULTILINE_STR_PRESERVE: /\+\|[ \t]*\r?\n/;
terminal MULTILINE_STR_PRESERVE_ALL: /\+\|\+[ \t]*\r?\n/;

// Symbols
terminal ARROW: '->';
terminal COLON: ':';
terminal COMMA: ',';
terminal DOT: '.';
terminal LPAREN: '(';
terminal RPAREN: ')';
terminal LBRACE: '{';
terminal RBRACE: '}';
terminal LANGLE: '<';
terminal RANGLE: '>';
terminal PIPE: '|';
terminal SLASH: '/';
terminal HYPHEN: '-';
terminal SPREAD: '...';

// Indentation (virtual tokens, handled by lexer base)
terminal INDENT: 'INDENT';
terminal DEDENT: 'DEDENT';

// Type tag mode terminals
terminal TYPE_TAG_NAME: /[a-zA-Z]+/;
terminal TYPE_TAG_CONTENT: /[^>|\r\n]+/;

// Simplified content terminals
terminal TRIPLE_QUOTE_START: '"""';
terminal TRIPLE_QUOTE_END: '"""';
terminal INTERPOLATION_START: '#{';
terminal INTERPOLATION_END: '}';
terminal CODE_BLOCK_END: '<$';
terminal MULTI_LINE_CONTENT: /[^\r\n]+/;
terminal ML_END: /\r?\n[ \t]*\|[ \t]*\r?\n/;

// Whitespace and comments
hidden terminal WS: /[ \t]+/;
hidden terminal COMMENT: /#[^\r\n]*/;
terminal NEWLINE: /\r?\n/;

// -------------------- Interfaces --------------------


/**
 * The root node of an RCL file.
 * @spec RclFile ::= (ImportStatement)* (Section)*
 */
interface RclFile {
  imports: ImportStatement[];
  sections: Section[];
}

/**
 * An import statement.
 * @spec ImportStatement ::= 'import' ImportPath ('as' IDENTIFIER)?
 */
interface ImportStatement {
  /** @spec ImportPath ::= IDENTIFIER ('/' IDENTIFIER)* */
  importPath: string[];
  alias?: string;
}

// #endregion

// #region Section Constructs

type SectionItem = SpreadDirective | Attribute | Section | MatchBlock;

/**
 * A generic section, which is the primary building block of an RCL file.
 * @spec Section ::= SECTION_TYPE IDENTIFIER? ParameterList? (INDENT (SpreadDirective | Attribute | Section | MatchBlock)* DEDENT)?
 */
interface Section {
  sectionType: string;
  identifier?: string;
  parameters?: Parameter[];
  body?: SectionItem[];
}

/**
 * An attribute, which is a key-value pair within a section.
 * @spec Attribute ::= ATTRIBUTE_KEY ':' Value
 */
interface Attribute {
  key: string;
  value: Value;
}

/**
 * A spread directive to include attributes from another section.
 * @spec SpreadDirective ::= SPREAD IDENTIFIER
 */
interface SpreadDirective {
  identifier: string;
}

/**
 * A match block for conditional value selection.
 * @spec MatchBlock ::= 'match' Value INDENT (MatchCase)+ DEDENT
 */
interface MatchBlock {
  discriminant: Value;
  cases: MatchCase[];
}

/**
 * A case within a match block.
 * @spec MatchCase ::= (STRING | NUMBER | ATOM) '->' ContextualizedValue | ':default' '->' ContextualizedValue
 */
interface MatchCase {
  value?: StringLiteral | NumericLiteral | Atom;
  consequence: ContextualizedValue;
}

// #endregion

// #region Value Constructs

/**
 * A union of all possible value types in RCL.
 * @spec Value ::= PrimitiveValue | IDENTIFIER | VARIABLE | PROPERTY_ACCESS | List | Dictionary | EmbeddedCode
 */
type Value = PrimitiveValue
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
type PrimitiveValue = StringLiteral
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
interface ContextualizedValue {
  value: Value;
  parameters?: Parameter[];
}

/**
 * A single parameter, which can be positional or named.
 * @spec Parameter ::= ATTRIBUTE_KEY ':' Value | Value
 */
interface Parameter {
  key?: string;
  value: Value;
}

// #endregion

// #region Literals and Identifiers

/** A double-quoted string literal. May contain interpolations. */
interface StringLiteral {
  value: string;
}

/**
 * A multi-line string with chomping controls or in triple-quoted mode.
 * @spec MultiLineString ::= (PIPE_STYLE) | (TRIPLE_QUOTE_STYLE)
 */
interface MultiLineString {
  mode: string;  // The delimiter string - processed later
  value: MultiLineStringContent | TripleQuoteStringContent;
}

interface MultiLineStringContent {
  content: string[];
}

interface TripleQuoteStringContent {
  content: (string | Interpolation)[];
}

interface Interpolation {
  expr: InterpolationExpr;
}

interface InterpolationExpr {
  // Either a variable access or a value
}

/** A numeric literal. */
interface NumericLiteral {
  value: number;
}

/** A boolean literal. */
interface BooleanLiteral {
  value: string;
}

/** A null literal. */
interface NullLiteral {
}

/** An atom literal. */
interface Atom {
  value: string; // e.g., ':symbol'
}

/** A variable reference. */
interface Variable {
  name: string; // e.g., '@variable'
}

/** A property access on a variable. */
interface PropertyAccess {
  object: Variable;
  properties: string[]; // e.g., 'property1', 'property2'
}

// #endregion

// #region Collections

/**
 * A list of values.
 * @spec List ::= ParenthesesList | InlineList | BlockList
 */
interface List {
  items: Value[];
}

/**
 * A dictionary of key-value pairs.
 * @spec Dictionary ::= BraceDictionary | BlockDictionary
 */
interface Dictionary {
  entries: DictionaryEntry[];
}

/**
 * An entry in a dictionary.
 * @spec DictEntry ::= (ATTRIBUTE_KEY | STRING) ':' Value
 */
interface DictionaryEntry {
  key: string | StringLiteral;
  value: Value;
}

// #endregion

// #region Advanced Values

/**
 * A type tag for semantic data types.
 * @spec TypeTag ::= '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'
 */
interface TypeTag {
  tagName: string;
  value: string | number;
  qualifier?: string;
}

/**
 * An embedded code expression or block.
 * @spec EmbeddedCode ::= SingleLineCode | MultiLineCode
 */
type EmbeddedCode = SingleLineCode | MultiLineCode;

/**
 * A single-line embedded code expression.
 * @spec SingleLineCode ::= EMBEDDED_CODE
 */
interface SingleLineCode {
  language?: 'js' | 'ts';
  code: string;
}

/**
 * A multi-line embedded code block.
 * @spec MultiLineCode ::= MULTI_LINE_CODE_START INDENT CodeContent DEDENT MULTI_LINE_CODE_END
 */
interface MultiLineCode {
  language?: 'js' | 'ts';
  code: string;
}


// -------------------- Rules --------------------

// Root node: RclFile
entry RclFile returns RclFile:
    (imports+=ImportStatement)*
    (sections+=Section)*
    EOF
;

// Import statement
ImportStatement returns ImportStatement:
    {ImportStatement}
    IMPORT importPath+=IDENTIFIER (SLASH importPath+=IDENTIFIER)* (AS alias=IDENTIFIER)? NEWLINE
;

// Section
Section returns Section:
    {Section}
    sectionType=LOWER_NAME
    (identifier=IDENTIFIER)?
    (parameters+=Parameter*)?
    (NEWLINE INDENT body+=(SpreadDirective | Attribute | Section | MatchBlock)* DEDENT)?
    NEWLINE?
;

// Attribute (key-value pair)
Attribute returns Attribute:
    {Attribute}
    key=ATTRIBUTE_NAME value=Value NEWLINE
;

// Spread directive
SpreadDirective returns SpreadDirective:
    {SpreadDirective}
    SPREAD identifier=IDENTIFIER NEWLINE
;

// Match block
MatchBlock returns MatchBlock:
    {MatchBlock}
    MATCH discriminant=Value NEWLINE
    INDENT
        (cases+=MatchCase)+
    DEDENT
;

// Match case
MatchCase returns MatchCase:
    {MatchCase}
    (
        (value=StringLiteral | value=NumericLiteral | value=Atom) ARROW consequence=ContextualizedValue
      | DEFAULT_CASE ARROW consequence=ContextualizedValue
    )
    NEWLINE
;

// Contextualized value
ContextualizedValue returns ContextualizedValue:
    {ContextualizedValue}
    value=Value (WITH ParameterList)?
;

// Parameter list
ParameterList:
    parameters+=Parameter (COMMA parameters+=Parameter)*
;

// Parameter
Parameter returns Parameter:
    {Parameter}
    (
        key=ATTRIBUTE_NAME value=Value
      | value=Value
    )
;

// Value (union)
Value returns Value:
      PrimitiveValue
    | IDENTIFIER
    | Variable
    | PropertyAccess
    | List
    | Dictionary
    | EmbeddedCode
;

// PrimitiveValue (union)
PrimitiveValue returns PrimitiveValue:
      StringLiteral
    | MultiLineString
    | NumericLiteral
    | BooleanLiteral
    | NullLiteral
    | Atom
    | TypeTag
;

// String literal (double-quoted, with interpolation)
StringLiteral returns StringLiteral:
    {StringLiteral}
    value=STRING
;

// Multi-line string (pipe or triple-quoted)
MultiLineString returns MultiLineString:
    {MultiLineString}
    (
        (mode=MULTILINE_STR_CLEAN value=MultiLineStringContent)
      | (mode=MULTILINE_STR_TRIM value=MultiLineStringContent)
      | (mode=MULTILINE_STR_PRESERVE value=MultiLineStringContent)
      | (mode=MULTILINE_STR_PRESERVE_ALL value=MultiLineStringContent)
      | (mode=TRIPLE_QUOTE_START value=TripleQuoteStringContent)
    )
;


// MultiLineStringContent
MultiLineStringContent returns MultiLineStringContent:
    content+=MULTI_LINE_CONTENT* ML_END
;

// Triple-quoted string content
TripleQuoteStringContent returns TripleQuoteStringContent:
    TRIPLE_QUOTE_START content+=(MULTI_LINE_CONTENT | Interpolation)* TRIPLE_QUOTE_END
;

// Numeric literal
NumericLiteral returns NumericLiteral:
    {NumericLiteral}
    value=NUMBER
;

// Boolean literal
BooleanLiteral returns BooleanLiteral:
    {BooleanLiteral}
    value=BOOLEAN
;

// Null literal
NullLiteral returns NullLiteral:
    {NullLiteral}
    NULL
;

// Atom
Atom returns Atom:
    {Atom}
    value=ATOM
;

// Variable reference
Variable returns Variable:
    {Variable}
    name=VARIABLE
;

// Property access
PropertyAccess returns PropertyAccess:
    {PropertyAccess}
    object=Variable (DOT properties+=LOWER_NAME)+
;

// List (parentheses, inline, or block)
List returns List:
    {List}
    (
        ParenthesesList
      | BlockList
    )
;

// Parentheses list
ParenthesesList returns List:
    LPAREN (items+=Value (COMMA items+=Value)*)? RPAREN
;

// Block list
BlockList returns List:
    INDENT (HYPHEN items+=Value NEWLINE)+ DEDENT
;

// Dictionary (brace or block)
Dictionary returns Dictionary:
    {Dictionary}
    (
        BraceDictionary
      | BlockDictionary
    )
;

// Brace dictionary
BraceDictionary returns Dictionary:
    LBRACE (entries+=DictionaryEntry (COMMA entries+=DictionaryEntry)*)? RBRACE
;

// Block dictionary
BlockDictionary returns Dictionary:
    INDENT (entries+=DictionaryEntry)+ DEDENT
;

// Dictionary entry
DictionaryEntry returns DictionaryEntry:
    {DictionaryEntry}
    (
        key=ATTRIBUTE_NAME COLON value=Value
      | key=STRING COLON value=Value
    )
;

// Type tag
TypeTag returns TypeTag:
    {TypeTag}
    LANGLE tagName=TYPE_TAG_NAME value=TYPE_TAG_CONTENT? (PIPE qualifier=TYPE_TAG_CONTENT)? RANGLE
;

// Embedded code (single-line or multi-line)
EmbeddedCode returns EmbeddedCode:
      SingleLineCode
    | MultiLineCode
;

// Single-line embedded code
SingleLineCode returns SingleLineCode:
    code=EMBEDDED_CODE
;

// Multi-line embedded code
MultiLineCode returns MultiLineCode:
    MULTI_LINE_CODE_START code=MULTI_LINE_CONTENT CODE_BLOCK_END
;

// Interpolation (for string interpolation)
Interpolation returns Interpolation:
    INTERPOLATION_START expr=InterpolationExpr INTERPOLATION_END
;

// Interpolation expression
InterpolationExpr returns InterpolationExpr:
      VARIABLE (DOT LOWER_NAME)*
    | Value
;
