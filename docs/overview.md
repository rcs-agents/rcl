# RCS Language Overview


## Structure

The main building blocks are:

  - `sections`: sections define instances of known "classes". These "classes" are mostly defined by the RCS Specification. 
  - `properties`: a property is a known value held by a `section` or an object. For example, the RCS specification defines `name`, `displayName`, and `brandName` as properties of an agent.
  - `symbols`: symbols are used when a global known value is needed. They are like a constant but, instead of representing a value, symbols value's is literally the symbol itself. For example, the symbol `:start` is used in a flow clause to indicate the start of a flow.
  - `clauses`: clauses are used to define transitions in a conversation flow definition. They are written as `[condition] -> [consequence]`.
    The `[condition]` may be a value to be matched against the known scope (defined by the clauses container), or lambda functions that return a boolean.
    The `[consequence]` may also be a value, which will simply be returned, a statement, whose evaluated value will be returned, or a list of clauses for further matching.
  - embedded code: Embedded code syntax for JavaScript or TypeScript code that is stored literally and executed at runtime.
  - `types`: In RCL, types cannot be created. There's a fixed set of native types in RCL, that expand on the JSON types, and the `section` types, which are defined by the RCS specification. The native RCL types are:
    - string
    - number (integers or floats)
    - boolean
    - ...
    - (todo: complete list)

## Syntax

- RCL is indentation-sensitive, meaning statements are nested by increasing their indentation, like in Python.
- Sections are defined via the statement `sectionType SectionName`
  - A `sectionType` follows the identifier rules of javascript, and **MUST** start with an lowercase letter
  - A `Section Name` is a sequence of words starting with an uppercase letter (e.g., `agent Agent Name`) 
- section types and attributes are pre-defined and cannot be created by the user, except on special sections or objects that explicitly allow user-defined attributes.
- Sections can be *optional* or *required*, and have their name *reserved* or not.
  | Section Type | Required? | Cardinality | Reserved Name |
  | --- | --- | --- | --- |
  | `agent` | required | one |  |
  | `agentDefaults` | optional | zero or one | `Defaults` |
  | `agentConfig` | optional | zero or one | `Config` |
  | `flow` | required | at least one | - |
  | `messages` | required | one | `Messages` |

  
  **Reserved** section names, cannot be used in a section other  then the one they are reserved for. For example, the user cannot create an agent or `flow` section named "Defaults", "Config" or "Messages".

## Properties, Symbols, and Titles

- `symbols` are special values that start with a `:` and are used to represent something (they atoms in Elixir). For example, "the starting point of a flow" is represented by the `:start` symbol. When the value of a property in the RCS specification must be _one of_ a list of options (we call this an "enumeration"), each option becomes a symbol.
  For example: the value of the agent's [`agentUseCase`](https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#agentusecase) can be "TRANSACTIONAL", "PROMOTIONAL", "OTP", "MULTI_USE", or "AGENT_USE_CASE_UNSPECIFIED", these are mapped to the lowercase symbols `:transactional`, `:promotional`, `:otp`, `:multi_use`, or `:unspecified` (all enumeration values that end with "_UNSPECIFIED" are mapped to the `:unspecified`)
- Properties always have valid non-qualified identifier names which are followed by a `:` when their value is being defined
- A `title` is a special kind of identifier used for section names. It follows the pattern `/[A-Z][a-z]*([ ]+[A-Z][a-z]*)*/` - each word starts with an uppercase letter, separated by spaces
  - **Examples**: `Welcome Message`, `User Profile`, `Contact Support Flow`
  - **Usage**: Flow names, message names, and user-defined sections (`flow Welcome Flow`, `agentMessage Booking Confirmation`)
  - **Restrictions**: System reserved names (Config, Defaults, Messages) cannot be used as titles
  - **Limits**: Maximum 20 words, each word at least 1 character, no special characters except spaces

## Embedded Code

RCL supports embedding executable JavaScript or TypeScript code within data structures through embedded code syntax. **Important**: Embedded code is stored as literal strings in the AST and is not parsed by the RCL parser. Code execution happens at runtime by appropriate engines.

### Single-line Embedded Code
Start with `$[language]>` where language can be `js`, `ts`, or omitted (defaults to JavaScript):
- `$js>` - Explicit JavaScript embedded code
- `$ts>` - TypeScript embedded code  
- `$>` - Uses default language from `Defaults.expressions.language` (defaults to JavaScript)

### Multi-line Embedded Code Blocks
Use `$[lang]>>>` with indented code blocks:
- Indentation level at the first line after the token determines the block boundary
- Block ends when indentation returns to less than the original level
- Multi-statement blocks **MUST** use `return` to explicitly return a value

### Storage Format
Embedded code is stored in the AST as:
- **Single-line**: `{ type: 'embedded_code', language: 'js', content: "code string" }`
- **Multi-line**: `{ type: 'embedded_code_block', language: 'js', content: ["line1", "line2"] }`

### Runtime Environment
When executed, embedded code runs in a sandboxed JavaScript runtime with access to:
- **ECMAScript 6** standard language features
- `context` variable (current `flow`, `currentStep`, `currentState`, `selectedOption`)
- `RclUtils` global utilities (like `format`)

### Language Configuration
The default embedded code language can be set via `Defaults.expressions.language: :javascript` or `:typescript`.

## Other data types

### Strings (text)

RCL supports both single-line and multi-line string literals with precise whitespace control.

#### Single-line Strings
- **MUST** be defined using **double** quotes (single quotes are reserved for the `'s` accessor operator)
- Example: `"This is a single-line string"`

#### Multi-line Strings  
Use a `|` token followed by indented content, with optional chomping markers:

- `|` - Clean text with single newline at end (most common)
- `|-` - Clean text with no trailing newline (for concatenation)  
- `+|` - Preserve leading space, single newline at end
- `+|+` - Preserve all whitespace exactly

**Indentation Handling**: Base indentation matches the start of the statement using the `|` character, content is indented relative to that baseline, allowing proper nesting within the attribute whose value is being set.

For complete examples and usage patterns, see [RCL Data Types - Text (strings)](./data-types.md#text-strings).

### Lists and Collections

RCL uses parentheses `()` for inline list syntax (e.g., `items: (item1, item2, item3)`) rather than square brackets. This design choice aligns with tuple semantics and creates consistency with function parameter syntax, supporting future RclScript language goals.

### Type Tags

RCL supports type tags to specify the type of a value using the syntax `<TYPE_TAG VALUE>`. Here are some examples:

- `<phone +1234567890>`
- `<url https://google.com>`
- `<time 10am>`
  
For the complete list of supported types, their aliases, and detailed examples, see [RCL Data Types - Type Tags](./data-types.md#type-tags).

## RCS Message Shortcuts

RCL provides convenient shortcuts that expand into full RCS message structures, making it easier to create common messaging patterns without writing verbose JSON-like syntax.

### Message Types
- `text` - Send a text message
- `rbmFile` - Send a file you uploaded to RCS
- `file` - Send a file from a public URL  
- `richCard` - Send a rich card with image and buttons
- `carousel` - Send a carousel of rich cards

### Action Suggestions
- `reply` - Simple reply button
- `dial` - Button that opens phone dialer
- `openUrl` - Button that opens a website
- `shareLocation` - Button asking user to share location
- `viewLocation` - Button that shows a location on map
- `saveEvent` - Button that creates calendar event with details

### Auto-Generated PostbackData
When `postbackData` is not explicitly defined, RCL automatically generates it by converting the suggestion text to lowercase and replacing non-alphanumeric characters with underscores. This behavior can be customized via `Defaults.postbackData`.

For complete syntax, examples, and expansions of all shortcuts, see [RCL Data Types - RCS Message Shortcuts](./data-types.md#rcs-message-shortcuts).

## Flow System Semantics

RCL flows define conversation paths with states, transitions, and parameters.

### Flow States and Transitions
- **Start State**: All flows begin with the special `:start` state
- **Clause Syntax**: `[condition] -> [consequence]` where conditions match against the current scope
- **State References**: States can be literal values or computed embedded code (`$js> determine_next_step(context.user.type, context.message)`)

### Parameter Passing
Flow parameters are passed between states using the `with` clause:
```rcl
-> Book Appointment with service: context.selected_service, time: context.preferred_time
```
Parameters become available in the next state's context.

### Flow References
- **Local**: `start Flow Title` resolves to flows, either imported or in the same file
- **Resolution**: Imported flows are available by name, conflicts resolved by explicit namespace

## Import and Module System

### Import Syntax
RCL files can import other RCL files to reuse flows, messages, and configurations. The import statement is composed of the `import` keyword, a `/` (slash) separated path of `Title` identifiers, and optionally the `as` keyword followed by a `Title` identifier:
- **Project Root Resolution**: All imports are resolved from the project root (no relative paths)
- **No Extension**: `.rcl` extension is not allowed in import statements
- **Namespace Paths**: Multi-level namespace paths like `Shared / Common Flows / Support`
- **Aliases with Spaces**: `import My Brand / Samples as Sample One`
- **Example**: `import Shared / Common Flows / Support as Support Flow`

### Scoping and Resolution
- **Namespace**: Imported sections available by name
- **Conflict Resolution**: Use explicit namespace for conflicts (`start Support Flow`)
- **Section Types**: Imported sections respect the same type rules as local sections
- **Circular Dependencies**: Detected and reported as errors with helpful suggestions

### Cross-References
- **Symbol Tables**: Hierarchical scoping with import resolution
- **Message References**: Link flow actions to message definitions with validation
- **Langium Integration**: Uses Langium's reference resolution system for linking and validation

## Defaults and Configuration

### Default Properties
The `agentDefaults` section (reserved name: `Defaults`) supports configuring default behaviors:
- **Embedded Code Language**: `expressions.language: :javascript` or `:typescript` sets default for `$>` embedded code
- **PostbackData Generation**: `postbackData: $js> formatAsSnakeCase(context.text)` defines auto-generation rule
- **Message Properties**: `messageTrafficType`, `ttl`, `fallback_message`
- **UI Styling**: `color_scheme`, `greeting_style`

### Section Type Validation
Each section type has specific validation rules ensuring RCS specification compliance:
- **Required Sections**: Some section types require specific child sections for validity
- **Reserved Names**: Certain names are reserved and scoped to their parent section type
- **RCS Constraints**: Built-in validators for suggestion limits (11 max), text lengths, required fields
- **Semantic Rules**: Each section type has specific validation (Config properties, Message limits, Flow completeness)

