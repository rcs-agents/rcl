# RCS Language Overview

## TODO

- Remove all types and properties marked as deprecated in https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#ComposeAction
- Accept `title`s as identifiers for sections

## Structure

- the main building blocks are: sections, properties, symbols, clauses, and code (expressions or blocks)
- sections have `types` that define which properties and child sections it contains
- `section types` are defined either by RCS Specification or by RCS Language and the user cannot define new 
- section are defined via the statement `sectionType SectionName`
  - A `SectionName` follows the identifier rules of javascript, but **MUST** start with an uppercase letter
  - A `sectionTame` follows the identifier rules of javascript, and **ALWAYS** start with an lowercase letter
- section types or attributes (except for sections that explicitly allow user-defined attributes)
- section types may define child sections to be *required*, *reserved*, or both.
  - **required** child sections **MUST** be present for the parent section to be valid
  - **reserved** child sections are optional, but prevent the user from creation a section of another type with the `SectionName`
  For example. the `agent` section requires _one or more_ `agentFlow` sections, defines the `agentConfig Config` and `agentDefault Defaults` as **reserved**, and _exactly one_ `agentMessages Messages` as both **required** and **reserved**. That means that when the user creates `flow` sections they cannot use the names "Config", "Defaults", or "Messages" for the `flow` section name.
  > NOTE: reserved section names are contextual, so an `agent` can be defined using "Config", "Defaults", or "Messages", since these names are only reserved _inside_ the `agent` section
- **reserved** child sections can be defined simply by their name, since their type has already been established by the parent section when reserving the name, so the user can simply write `Messages` instead of `agentMessages Messages`

## Properties, Symbols, and Titles

- `symbols` are special values that start with a `:` and are used to represent something (they atoms in Elixir). For example, "the starting point of a flow" is represented by the `:start` symbol. When the value of a property in the RCS specification must be _one of_ a list of options (we call this an "enumeration"), each option becomes a symbol.
  For example: the value of the agent's [`agentUseCase`](https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#agentusecase) can be "TRANSACTIONAL", "PROMOTIONAL", "OTP", "MULTI_USE", or "AGENT_USE_CASE_UNSPECIFIED", these are mapped to the symbols `:TRANSACTIONAL`, `:PROMOTIONAL`, `:OTP`, `:MULTI_USE`, or `:UNSPECIFIED` (all enumeration values that end with "_UNSPECIFIED" are mapped to the `:UNSPECIFIED`)
- Properties always have valid non-qualified identifier names which are follow by a `:` when their value is being defined
- A `title` are a kind of `identifier` that follows a different rule. A `title` is a sequence of one or more words, each starting with an uppercase letter, for example: `Welcome Message`

## Expressions & Blocks

- Expressions are executable code that will be run in the JavaScript runtime, inside a sandboxed environment and only have access to ECMAScript 6 standard JavaScript language features, a `context` variable (with the current `flow`, `currentStep`, `currentState`, and `selectedOption`), and the `RclUtils` global with utilities like `format`
- Single line expressions start with the `$[language]>` token (ex: `$js>`, `$ts>`). The `[language]` can be omitted, in which case, the language will be assumed to be the one defined in the current agent's `Defaults.expression.language` property, which itself defaults to `:javascript` if not specified. For now, only JavaScript and TypeScript are supported.
- Blocks are multiline expressions, defined with `$[lang]>>>` and may contain multiple statements, in which case they **MUST** use `return` to explicitly return a value 
- Expressions are written in JavaScript or TypeScript and have access to the `context` variable and `RclUtils` global utilities

## Other data types

### Strings (text)

- Single-line strings **MUST** be defined using **double** quotes
- Multi-line strings can be defined using a `|` token, which can be preceded or followed by a chomping marker. A `-` means "trim" spaces and new lines, a `+` means "keep" spaces and new lines.
   - `|` - # trim beginning of the text, **one** new line at the end
   - `|-` # trim beginning of the text, and all new lines at the end
   - `+|` # keep new lines at the beginning, one new line at the end
   - `+|+` # keep all new lines at the beginning and end

### Type Tags

You can specify the type of a value using the syntax `<TYPE_TAG VALUE>`, where `TYPE_TAG` is one of the supported types, or its alias.

After parsing and before generation, a class for the type tag will be created and the value will be passed to the class constructor.

Here's a table of the support type tags, their aliases and examples

| Type         | Aliases | Example                                           | Notes |
|--------------|----------|---------------------------------------------------|----|
| `email`      | -      | `<email user@domain.com>` | |
| `phone`      | `msisdn`      | `<phone +1234567890>` | |
| `url`| -      | `<url "https://example.com">` | |
| `time`       | -      | `<time 10:00>`<br> `<time 4pm \| Z>`<br> `<t 23:59 \| UTC-3>`<br> `<t 09:15am>` | `Z` is a synonym for `UTC`.<br> Timezone defaults to `UTC` if not defined |
| `datetime`   | `date`     | `<date Jul 4th>`<br> `<date 2023-12-31T23:59:59Z>`<br> `<dt 2024-06-01 \| 15>` | Time defaults to `00:00:00 UTC` |
| `zipcode`    | `zip`      | `<zipcode 94103>`, `<zip 10001>`, `<zip 25585-460 \| BR>` | |

## RCS Spec Shortcuts

### Messages

#### `agentMessage { text: string, suggestions: [] }`

```rcl
text TEXT_PROP_VALUE
  suggestions: # optional
    ...
```

#### `agentMessage { uploadedRbmFile: { fileName: string, thumbnailName: string }, suggestions: [] }`

```rcl
uploadedRbmFile FILE_NAME THUMBNAIL_NAME
  suggestions: # optional
    ...
```

#### `agentMessage { contentInfo: { fileUrl: string, thumbnailUrl: string, forceRefresh: boolean }, suggestions: [] }`

```rcl
file FILE_URL THUMBNAIL_URL [:force_refresh]
  suggestions: # optional
    ...
```

#### `agentMessage { richCard: { ... }, suggestions: [] }`

```rcl
richCard TITLE
  suggestions: # optional
    ...
```

### Suggestions

> [NOTE] The `postbackData` property, when not defined, will be automatically generated based on the suggestion's text.
> 
> By default it will be the suggestion's text transformed to lowercase and with any character that is not a letter of number converted to a `_`,
> but the user can define their own rule via `Defaults.postbackData`, which takes an expression in RclScript or Javascript.

```rcl
reply TEXT [postbackData]
```

```rcl
dial TEXT PHONE_NUMBER
# example dial "Call Us" <phone +1234567890>
```

```rcl
openUrl TEXT URL DESCRIPTION [:BROWSER | :WEBVIEW [:FULL|:HALF|:TALL] ]

# Examples
# openUrl "Visit Website" <url https://www.example.com>
# openUrl "Visit Website" "https://www.example.com"
```

```rcl
shareLocation TEXT
# Example: shareLocation "Share your location"
```

```rcl
createCalendarEvent TEXT 
  event EVT_TITLE START_TIME END_TIME
    description: DESCRIPTION

# Example
createCalendarEvent "Save the date!"
  event "Mary & Sue's Wedding" <date Sep 15th, 2025 | 3pm> <date Sep 15th, 2025 | 11pm>
    description: |
      Here we can write a long description in multiple lines.
      As long as we don't go beyond 200 characters!
```

```rcl
viewLocation [LatLng] [label] [query]
```

## Gaps and Outstanding Questions

Based on the analysis of the language specification and current Langium grammar implementation, the following language features need to be specified, clarified, or defined:

### 1. Expression System

**Status**: Basic framework exists, needs full specification
**Questions to Answer**:
- How are single-line expressions (`$js>`, `$ts>`) tokenized and parsed?
  - **Answer**: Single-line expressions use `$>` (defaulting to JavaScript) or `$ts>` for TypeScript. Multi-line blocks use `$>>>` with proper indentation marking the block end.
- How are multi-line expression blocks (`$[lang]>>>`) handled with proper indentation?
  - **Answer**: Indentation level at the first line after the token determines the block boundary, with the block ending when indentation returns to less than the original level.
- What variables and globals are available within expressions?
  - **Answer**: Expressions have access to `context` variable and `RclUtils` global utilities, with standard ES6 JavaScript features

### 2. Multi-line String Literals

**Status**: Missing from grammar
**Questions to Answer**:
- How are multi-line string tokens (`|`, `|-`, `+|`, `+|+`) implemented?
  - **Answer**: String variants with different whitespace behaviors:
    - `|` = clean text with single newline at end (most common)
    - `|-` = clean text with no trailing newline (for concatenation)
    - `+|` = preserve leading space, single newline at end
    - `+|+` = preserve all whitespace exactly
- What is the exact whitespace trimming behavior for each variant?
  - **Answer**: Base indentation matches the `|` character position, content is dedented relative to that baseline
- How does indentation interact with multi-line strings?
  - **Answer**: Content indentation is measured relative to the `|` marker position, allowing proper nesting within sections

### 3. Type Conversion Syntax

**Status**: Missing from grammar
**Questions to Answer**:
- How is the `<type VALUE>` syntax tokenized and parsed?
  - **Answer**: `<type value>` becomes a special `TypeConversion` AST node with type and value properties
- What is the complete list of supported types and their aliases?
  - **Answer**: Readable examples include:
    - `<phone +1-555-123-4567>` → validates and formats phone numbers
    - `<email user@domain.com>` → validates email format
    - `<time 2:30pm | EST>` → converts to user's timezone
    - `<date March 15th, 2024>` → parses natural date format
- How are timezone specifications handled in time/datetime conversions?
  - **Answer**: `<time 2pm | PST>` or `<time 14:00 | UTC-8>` for clarity
- How does type conversion interact with the expression system?
  - **Answer**: Type conversions can be used in expressions: `$js> showAppointment(<time appointment.time | user_timezone>)`
- Are custom type conversion rules allowed?
  - **Answer**: Allow extension through `Defaults.types.custom_name: $js> /* conversion logic */`

### 4. Title Identifiers

**Status**: Missing from grammar (TODO item in spec)
**Questions to Answer**:
- What is the exact grammar rule for Title identifiers (e.g., `Welcome Message`)?
  - **Answer**: `TITLE: /[A-Z][a-z]*([ ]+[A-Z][a-z]*)*/` - Each word starts with capital, spaces between
- Where can Title identifiers be used as section names?
  - **Answer**: Flow names, message names, and user-defined sections: `flow Welcome Flow`, `agentMessage Booking Confirmation`
- How do Title identifiers interact with reserved section names?
  - **Answer**: System reserved names (Config, Defaults, Messages) cannot be used as titles
- What are the validation rules for Title identifiers?
  - **Answer**: Maximum 5 words, each word 2-20 characters, no special characters except spaces

### 5. Flow System Semantics

**Status**: Basic implementation exists, needs semantic clarification
**Questions to Answer**:
- How are flow parameters passed between states?
  - **Answer**: Parameters passed via `with` clause are available in the next state's context
- How are flow states with expressions (not just literals) handled?
  - **Answer**: Allow computed states: `$js> determine_next_step(context.user.type, context.message)`
- What is the semantic meaning of the `:start` special symbol?
  - **Answer**: `:start` is a special reserved state that begins all flows
- How are flow parameters and the `with` clause defined?
  - **Answer**: `with` clause passes data: `-> Book Appointment with service: context.selected_service, time: context.preferred_time`
- How are flow references (`ref`) resolved across imported files?
  - **Answer**: `ref Other Flow` resolves to imported or sibling flows with proper namespacing

### 6. RCS Spec Shortcuts

**Status**: Partially missing from grammar
**Questions to Answer**:
- How are the shortcut syntaxes for messages implemented (e.g., `text TEXT_PROP_VALUE`)?
  - **Answer**: Top-level keywords create implicit `agentMessage` and `contentMessage` blocks
- How is automatic `postbackData` generation configured and implemented?
  - **Answer**: Auto-generated from text using `Defaults.postbackData` JavaScript expression (default: lowercase + underscores)
- How are the shortcut syntaxes for suggestions (`reply`, `dial`, `openUrl`, etc.) parsed?
  - **Answer**: Natural action syntax: `reply "Got it"`, `call "Support" <phone +1-555-0123>`
- How does the shortcut syntax map to the full `agentMessage` structure?
  - **Answer**: Shortcuts expand to full structure during code generation

### 7. Defaults and Configuration Semantics

**Status**: Basic implementation, missing expression support
**Questions to Answer**:
- How is `Defaults.expression.language` property implemented?
  - **Answer**: `expressions.language: :javascript` sets default for `$>` expressions
- How is the `Defaults.postbackData` expression field handled?
  - **Answer**: `postbackData: $js> formatAsSnakeCase(context.text)` defines auto-generation rule
- What other default properties should be supported?
  - **Answer**: `messageTrafficType`, `fallback_message`, `ttl`, `color_scheme`, `greeting_style`

### 8. Section Type System and Validation Rules

**Status**: Basic validation framework exists, needs semantic specification
**Questions to Answer**:
- How are required vs. reserved child sections defined?
  - **Answer**: Section types specify which child sections are required for validity and which names are reserved
- How is contextual section name reservation implemented?
  - **Answer**: Reserved names are scoped to their parent section type
- How are section types validated against the RCS specification?
  - **Answer**: Built-in rules ensure compliance with RCS Business Messaging specifications
- What are the semantic validation rules for each section type?
  - **Answer**: Each section type has specific validation (Config properties, Message limits, Flow completeness)
- How are RCS specification constraints defined?
  - **Answer**: Built-in validators for suggestion limits (11 max), text lengths, required fields

### 9. Import and Module System

**Status**: Basic grammar exists, semantics unclear
**Questions to Answer**:
- How are imported RCL files resolved and processed?
  - **Answer**: Relative paths from current file, with `.rcl` extension optional
- How do imports interact with section references?
  - **Answer**: `ref Imported Flow Name` or `ref filename.Flow Name` for explicit namespacing
- What is the namespace and scoping model for imports?
  - **Answer**: Imported flows available by name, conflicts resolved by explicit namespace
- How are circular dependencies handled?
  - **Answer**: Detected and reported as errors with helpful suggestion
- How does the section type system interact with imports?
  - **Answer**: Imported sections respect the same type rules as local sections

### 10. Missing Grammar Elements

**Status**: Various missing terminals and rules
**Missing Elements**:
- `EXPRESSION` and `BLOCK` rules for embedded code
- `TITLE` terminal for title identifiers
- `MULTILINE_STRING` terminals for multi-line string variants
- `TYPE_CONVERSION` rule for `<type value>` syntax

**Proposed Implementation**:
- Add all missing lexical elements with clear regex patterns
- Implement AST nodes for each construct with proper typing
- Ensure new elements work together seamlessly
- Comprehensive test suite for each new grammar element

### 11. Scoping and Cross-References

**Questions to Answer**:
- How are symbol tables maintained for cross-references?
  - **Answer**: Hierarchical scoping with import resolution and conflict detection
- What is the type system for expressions?
  - **Answer**: Simple type system focusing on context variables and function signatures
- How are message template references resolved?
  - **Answer**: Link flow actions to message definitions with validation

### 12. Spec Consistency and Standards

**Issues to Resolve**:
- Reconcile differences between overview.md and rcl-language-specification.md
  - **Answer**: Single source of truth with clear examples and consistent terminology
- Clarify the relationship between `agent` vs `Agent` in section definitions
  - **Answer**: `Agent` for top-level declaration, lowercase for section types and properties
- Standardize the grammar for section hierarchies
  - **Answer**: Clear indentation rules with consistent validation
- Define the complete keyword list and reserved words
  - **Answer**: Complete reserved word list with case-sensitive definitions