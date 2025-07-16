# Rich Communication Language (RCL) - Formal Specification

## 1. Introduction

This document provides the formal specification for the Rich Communication Language (RCL) using an Extended Backus-Naur Form (EBNF)-like notation.

RCL is a data language designed to express any JSON-representable structure through a human-friendly syntax. It provides a generic Section/Attribute model where sections correspond to objects and can represent any hierarchical data. The language emphasizes simplicity, readability, and extensibility.

### Design Philosophy
- **Generic Data Language**: Any JSON structure can be expressed using Sections (objects) and Attributes (properties)
- **Indentation-based**: Blocks are defined by indentation (like Python/YAML), no explicit end keywords
- **Extensible**: New section types can be added without changing the core syntax
- **Type-aware**: Built-in type tags for common data types with validation

### Notation Conventions
- `RuleName ::= Definition` : Defines a rule
- `'literal'` : Literal string or keyword (e.g., `'agent'`, `':'`)
- `TERMINAL_NAME` : Terminal symbol/token (e.g., `IDENTIFIER`, `STRING`)
- `RuleName` : Non-terminal symbol reference
- `A | B` : Alternative (A or B)
- `(A B)` : Sequence of A followed by B
- `A?` : Zero or one occurrence (optional)
- `A*` : Zero or more occurrences
- `A+` : One or more occurrences
- `// comment` : Explanatory comments

## 2. Lexical Specification (Terminals)

### 2.1 Block Delimiters
RCL uses indentation-based blocks (Python-style) without explicit end keywords.
```ebnf
INDENT ::= // Increase in indentation level
DEDENT ::= // Decrease in indentation level
```

### 2.2 Hidden Terminals
```ebnf
WS ::= /[\t ]+/                    // Whitespace (spaces/tabs), not newlines
NL ::= /[\r\n]+/                   // Newlines
SL_COMMENT ::= /#.*/               // Single-line comments
```

### 2.3 Common Terminals
```ebnf
IDENTIFIER ::= /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/     // Title Case with spaces
ATTRIBUTE_KEY ::= /[a-z][a-zA-Z0-9_]*/                     // lowerCamelCase
SECTION_TYPE ::= /[a-z][a-zA-Z0-9]*/                       // lowercase section types
VARIABLE ::= /@[a-zA-Z_][a-zA-Z0-9_]*/                     // @variable
PROPERTY_ACCESS ::= VARIABLE ('.' ATTRIBUTE_KEY)*          // @obj.property
ATOM ::= /:[a-zA-Z_][a-zA-Z0-9_]*/                        // :symbol
STRING ::= /"(\\.|[^"\\])*"/                               // Double-quoted strings
TRIPLE_STRING_DELIM ::= /"""/                              // Triple quote delimiter
NUMBER ::= /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/         // Numbers with optional decimals/exponents
ISO_DURATION ::= /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/
SPREAD ::= /\.\.\./                                        // Spread operator
```

### 2.4 String Interpolation
```ebnf
INTERPOLATION_START ::= /#\{/
INTERPOLATION_END ::= /\}/
```

### 2.5 Embedded Code Terminals
```ebnf
EMBEDDED_CODE ::= /\$((js|ts)?>)\s*[^\r\n]*/              // $js> code or $> expr
MULTI_LINE_CODE_START ::= /\$((js|ts)?)>>>/               // $js>>> or $>>>
MULTI_LINE_CODE_END ::= /<\$/                             // End marker
```

### 2.6 Multi-line String Terminals
```ebnf
MULTILINE_STR_CLEAN ::= /\|\s*$/                          // | (clean)
MULTILINE_STR_TRIM ::= /\|-\s*$/                          // |- (trim trailing)
MULTILINE_STR_PRESERVE ::= /\+\|\s*$/                     // +| (preserve leading)
MULTILINE_STR_PRESERVE_ALL ::= /\+\|\+\s*$/               // +|+ (preserve all)
MULTILINE_STR_END ::= /^\s*\|$/                           // Line with only |
```

### 2.7 Type Tag Terminals
```ebnf
TYPE_TAG_NAME ::= /[a-zA-Z]+/                             // email, phone, url, etc.
```

## 3. Syntactic Specification (Parser Rules)

### 3.0 Core Value Rules

```ebnf
BooleanLiteral ::= 'True' | 'Yes' | 'On' | 'False' | 'No' | 'Off'

NullLiteral ::= 'Null' | 'None' | 'Void'

PrimitiveValue ::=
    STRING
    | MultiLineString
    | NUMBER
    | BooleanLiteral
    | NullLiteral
    | ATOM
    | TypeTag

InterpolatedContent ::=
    PlainText
    | (INTERPOLATION_START (VARIABLE | PROPERTY_ACCESS | Value) INTERPOLATION_END)

TypeTag ::=
    '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'

Value ::=
    PrimitiveValue
    | IDENTIFIER
    | VARIABLE
    | PROPERTY_ACCESS
    | List
    | Dictionary
    | EmbeddedCode

ContextualizedValue ::=
    Value ('with' ParameterList)?

Parameter ::=
    ATTRIBUTE_KEY ':' Value
    | Value  // Positional parameter

ParameterList ::=
    Parameter (',' Parameter)*
```

### 3.1 Collection Rules

```ebnf
List ::=
    ParenthesesList
    | InlineList
    | BlockList

ParenthesesList ::= '(' (Value (',' Value)*)? ')'

InlineList ::= Value (',' Value)+  // 2+ items, parentheses optional

BlockList ::=
    INDENT
    (BlockListItem)+
    DEDENT

BlockListItem ::= '-' Value

Dictionary ::=
    BraceDictionary
    | BlockDictionary

BraceDictionary ::= '{' (DictEntry (',' DictEntry)*)? '}'

BlockDictionary ::=
    INDENT
    (DictEntry)+
    DEDENT

DictEntry ::= (ATTRIBUTE_KEY | STRING) ':' Value
```

### 3.2 String Rules

MultiLineString ::=
    ( // Pipe-style
        (MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
        INDENT
        StringContent
        DEDENT
        MULTILINE_STR_END
    ) | ( // Triple-quote style
        TRIPLE_STRING_DELIM
        (InterpolatedContent)*
        TRIPLE_STRING_DELIM
    )

StringContent ::= // Raw text content with proper indentation handling

### 3.3 Embedded Code Rules

```ebnf
EmbeddedCode ::=
    SingleLineCode
    | MultiLineCode

SingleLineCode ::= EMBEDDED_CODE

MultiLineCode ::=
    MULTI_LINE_CODE_START
    INDENT
    CodeContent
    DEDENT
    MULTI_LINE_CODE_END

CodeContent ::= // Raw code content
```

### 3.4 Section Rules

```ebnf
Section ::=
    SECTION_TYPE IDENTIFIER? ParameterList?
    (INDENT
        (SpreadDirective | Attribute | Section | MatchBlock)*
    DEDENT)?

SpreadDirective ::= SPREAD IDENTIFIER

Attribute ::= ATTRIBUTE_KEY ':' Value

MatchBlock ::=
    'match' Value
    INDENT
    (MatchCase)+
    DEDENT

MatchCase ::=
    (STRING | NUMBER | ATOM) '->' ContextualizedValue
    | ':default' '->' ContextualizedValue
```

### 3.5 File Structure

```ebnf
RclFile ::=
    (ImportStatement)*
    (Section)*

ImportStatement ::=
    'import' ImportPath ('as' IDENTIFIER)?

ImportPath ::= IDENTIFIER ('/' IDENTIFIER)*
```

## 4. Type System

### 4.1 Identifier Rules

**IDENTIFIER** (Title Case):
- Must start with uppercase letter (A-Z)
- Can contain letters, numbers, hyphens, underscores
- Spaces allowed between Title Case words
- Examples: `Welcome Message`, `User-Profile`, `Order ID 123`

**ATTRIBUTE_KEY** (lowerCamelCase):
- Must start with lowercase letter (a-z)
- Can contain letters, numbers, underscore
- Examples: `displayName`, `messageType`, `user_id`

**SECTION_TYPE** (lowercase):
- Must start with lowercase letter
- Examples: `agent`, `config`, `flow`, `messages`, `on`

### 4.2 Type Tags

| Type | Aliases | Examples | Notes |
|------|---------|----------|-------|
| `email` | - | `<email user@example.com>` | |
| `phone` | `msisdn` | `<phone +1234567890>` | |
| `url` | - | `<url https://example.com>` | |
| `time` | `t` | `<time 4pm \| UTC>` | Default UTC |
| `datetime` | `date`, `dt` | `<datetime 2024-07-26>`, `<datetime +5m>` | Relative times supported |
| `zipcode` | `zip` | `<zip 94103>`, `<zip 25585-460 \| BR>` | |
| `duration` | `ttl` | `<duration P1D>`, `<ttl 3600s>` | ISO 8601 or seconds |
| `money` | - | `<money 3.50>`, `<money 10.99 \| USD>` | Default USD |

## 5. Semantic Rules

### 5.1 File Structure
- Files may contain imports followed by sections
- All semantic validation happens at a higher level
- RCL is purely a data representation language

### 5.2 Section Semantics
- Sections are generic containers mapping to objects
- Section type is just a string identifier
- Implicit ID: If no ID provided, title-case the section type
- No reserved names at the syntax level

### 5.3 Value Contextualization
- Any value can be contextualized with `with` keyword
- Creates a value-context pair for semantic processing
- Context is a map of key-value parameters

### 5.4 Spread Semantics
- `...ID` includes all attributes from referenced section
- Works across imports with proper scoping
- Applied before local attributes (can be overridden)

### 5.5 Variable Scoping
- Variables (`@name`) reference runtime context
- Property access (`@obj.prop`) navigates context objects
- Context provided by runtime environment

## 6. Examples

### 6.1 Generic RCL Structure
```rcl
# Import example
import Common/Config as BaseConfig

# Any section type with any attributes
agent Coffee Shop
  displayName: "Quick Coffee"
  brandName: "QuickCo"
  
config
  ...BaseConfig  # Spread from import
  description: "Order coffee for pickup"
  phoneNumber: <phone +1-555-0123>
  
# Nested sections
flow Main Flow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Order" -> Menu
      "Hours" -> Info
      :default -> Welcome
      
# Section with various content types
messages Messages
  text Welcome "Welcome to #{@shopName}!"
    suggestions
      reply "Order Coffee"
      reply "Store Hours"
```

### 6.2 Collections and Types
```rcl
# Lists
items: ("coffee", "tea", "juice")
prices: 3.50, 4.00, 2.50  # Parentheses optional

# Block list
menu:
  - "Espresso"
  - "Cappuccino"
  - "Latte"

# Dictionary
order: {item: "Latte", size: "Large", price: <money 5.50>}

# Block dictionary
customer:
  name: "John Doe"
  phone: <phone +1234567890>
  member: True
```

### 6.3 Multi-line Strings
```rcl
# Triple quotes
message: """
  Thank you for your order!
  Your #{@item} will be ready in 5 minutes.
"""

# Pipe notation with control
description: |
  This is a multi-line
  description with clean formatting
|

code: +|+
  def process_order(item):
      return f"Processing {item}"
|
```