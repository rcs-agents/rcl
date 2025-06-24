# TextMate Scope Naming Conventions

A practical guide to scope naming for tmLanguage files. This covers the conventions used by TextMate, Sublime Text, VS Code, and other editors that support TextMate grammars.

## Understanding Scopes

Scopes are hierarchical, dot-separated strings that identify code elements. They flow from general to specific, enabling powerful contextual features such as syntax highlighting, intelligent code completion, and context-aware key bindings.

**Example breakdown:**
~~~
keyword.control.conditional.php
│       │       │           │
│       │       │           └── Language
│       │       └─────────────── Specific keyword type
│       └─────────────────────── Category of control
└─────────────────────────────── Root scope
~~~

This hierarchy enables **cascading styles** – if a theme doesn't define `keyword.control.conditional.php`, it falls back to `keyword.control.conditional`, then `keyword.control`, and finally to `keyword`.

**Key principles:**
- Always end with the language name (e.g., `.python`, `.javascript`)
- Reuse existing sub-types rather than inventing new ones
- Choose scopes based on meaning, not just appearance
- Spread elements across different root categories for better theme support

## Scope Categories

### `comment`

Comments are non-executable text. Use specific variants for better tooling support.

- `comment.line` - Single-line comments
  - `double-slash` - `// comment`
  - `double-dash` - `-- comment`  
  - `number-sign` - `# comment`
  - `percentage` - `% comment`
- `comment.block` - Multi-line comments
  - `documentation` - JSDoc, PHPDoc, etc.

Apply `punctuation.definition.comment` to comment delimiters (`//`, `/*`, `*/`). Use `meta.toc-list` for section headers that should appear in symbol lists.

### `constant`

Fixed values including literals, language constants, and escape sequences. Distinguish between user-defined constants (`entity.name.constant`) and literal values.

- `constant.numeric` - All numeric literals
  - `integer` - Integer values
    - `binary` - Binary integers (`0b1010`)
    - `octal` - Octal integers (`0o777`)
    - `decimal` - Decimal integers (`42`)
    - `hexadecimal` - Hex integers (`0xFF`)
    - `other` - Other integer formats
  - `float` - Floating-point values
    - `binary` - Binary floats
    - `octal` - Octal floats
    - `decimal` - Decimal floats (`3.14`)
    - `hexadecimal` - Hex floats (`0x1.5p3`)
    - `other` - Other float formats
  - `complex` - Complex numbers
    - `real` - Real part
    - `imaginary` - Imaginary part
- `constant.character.escape` - Escape sequences (`\\n`, `\\t`, `\\u0041`)
- `constant.language` - Built-in constants (`true`, `false`, `nil`, `undefined`)
- `constant.other.placeholder` - Format placeholders (`%s`, `{0}`)
- `constant.other` - Other constants (CSS colors, symbols)

### `entity`

Names of data structures, types, and uniquely-identifiable constructs. **Avoid** `entity.name.type.class` and `entity.name.type.struct` - use specific terminology instead.

The entity scopes target the **names** only, not entire constructs (use `meta.*` for that). Notable exceptions are `entity.name.tag` and `entity.other.attribute-name` for HTML/XML.

- `entity.name.class` - Class names
- `entity.name.struct` - Struct names  
- `entity.name.enum` - Enumeration names
- `entity.name.union` - Union names
- `entity.name.trait` - Trait names
- `entity.name.interface` - Interface names
- `entity.name.impl` - Implementation names
- `entity.name.type` - Generic type names
- `entity.name.function` - Function names (when defined)
  - `constructor` - Constructor names
  - `destructor` - Destructor names
- `entity.name.namespace` - Namespace/module/package names
- `entity.name.constant` - Named constants (vs `variable.other.constant`)
- `entity.name.label` - Labels for goto statements
- `entity.name.section` - Section/heading names in markup
- `entity.name.tag` - HTML/XML tag names (only `entity.name` scope applied to repeated constructs)
- `entity.other.inherited-class` - Superclass/baseclass names
- `entity.other.attribute-name` - HTML/XML attribute names

**Forward declarations:** Use `.forward-decl` variants (e.g., `entity.name.class.forward-decl`) to exclude from symbol lists and indexing.

### `invalid`

Invalid or deprecated code. Use sparingly to avoid unpleasant highlighting.

- `invalid.illegal` - Syntax errors, illegal characters
- `invalid.deprecated` - Deprecated features (use very rarely)

### `keyword`

Reserved words and operators with special language meaning.

- `keyword.control` - Control flow keywords
  - `conditional` - Conditional keywords (`if`, `else`)
  - `import` - Import/include keywords
- `keyword.operator` - Operators
  - `assignment` - Assignment operators
  - `arithmetic` - Math operators
  - `bitwise` - Bitwise operators
  - `logical` - Logical operators
  - `word` - Word operators (`and`, `or`, `not`)
- `keyword.declaration` - Declaration keywords (see `storage` section for combined usage)
  - `function` - Function declaration keywords
  - `class` - Class declaration keywords
  - `struct` - Struct declaration keywords
  - `enum` - Enum declaration keywords
  - `union` - Union declaration keywords
  - `trait` - Trait declaration keywords
  - `interface` - Interface declaration keywords
  - `impl` - Implementation declaration keywords
  - `type` - Type declaration keywords
- `keyword.other` - Other keywords

Apply `punctuation.definition.keyword` to punctuation within keywords (e.g., `@` in CSS).

### `markup`

Content markup in documentation and markup languages. Use for content formatting, not code syntax.

- `markup.heading` - Section headings
- `markup.list.unnumbered` - Bullet lists
- `markup.list.numbered` - Numbered lists
- `markup.bold` - Bold text
- `markup.italic` - Italic text
- `markup.underline` - Underlined text
  - `link` - Links (inherits underline styling)
- `markup.inserted` - Inserted content (diff)
- `markup.deleted` - Deleted content (diff)
- `markup.quote` - Blockquotes
- `markup.raw.inline` - Inline code
- `markup.raw.block` - Code blocks (disables spell checking)
- `markup.other` - Other markup constructs

### `meta`

Structural sections for larger code constructs. **Not intended for styling** - used by preferences and plugins for contextual behavior.

**Critical:** Never stack meta scopes of the same type. For example, `meta.function.php meta.function.parameters.php` should never occur - alternate between different meta scopes.

- `meta.class` - Complete class definitions
- `meta.struct` - Complete struct definitions
- `meta.enum` - Complete enum definitions
- `meta.union` - Complete union definitions
- `meta.trait` - Complete trait definitions
- `meta.interface` - Complete interface definitions
- `meta.impl` - Complete implementation definitions
- `meta.type` - Complete type definitions
- `meta.function` - Complete function definitions
  - `parameters` - Parameter lists
  - `return-type` - Return type annotations
- `meta.namespace` - Namespace/module definitions
- `meta.preprocessor` - Preprocessor statements
- `meta.annotation` - Annotations/decorators
  - `identifier` - Annotation names
  - `parameters` - Annotation parameters
- `meta.path` - Qualified identifiers
- `meta.function-call` - Function invocations
- `meta.block` - Code blocks `{}`
- `meta.braces` - Alternative for curly braces
- `meta.group` - Grouped expressions `()`
- `meta.parens` - Alternative for parentheses
- `meta.brackets` - Bracket expressions `[]`
- `meta.generic` - Generic type parameters `<>`
- `meta.tag` - Complete HTML/XML tags
- `meta.paragraph` - Paragraphs in markup
- `meta.string` - Complete string literals
- `meta.interpolation` - String interpolation
- `meta.toc-list` - Table of contents entries

### `punctuation`

Structural and syntactic punctuation. Use specific subtypes for precise editor behavior.

- `punctuation.separator` - Commas, colons
  - `continuation` - Line continuation characters
- `punctuation.terminator` - Semicolons, statement terminators
- `punctuation.accessor` - Member access (`.`, `->`, `::`)
- `punctuation.definition` - Punctuation that defines other scopes
  - `comment` - Comment delimiters
  - `string.begin` / `string.end` - String quotes
  - `keyword` - Keyword punctuation
  - `variable` - Variable symbols (`$` in PHP)
  - `annotation` - Annotation symbols
  - `generic.begin` / `generic.end` - Generic delimiters `<>`
- `punctuation.section` - Section delimiters
  - `block.begin` / `block.end` - Block delimiters `{}`
  - `group.begin` / `group.end` - Group delimiters `()`
  - `parens.begin` / `parens.end` - Alternative for parentheses
  - `brackets.begin` / `brackets.end` - Bracket delimiters `[]`
  - `braces.begin` / `braces.end` - Alternative for curly braces
  - `interpolation.begin` / `interpolation.end` - Interpolation delimiters

### `source` and `text`

Root scopes for different document types:
- `source` - Programming languages and executable code
- `text` - Content and markup (disables many code features)
  - `text.html` - HTML documents (variants like `text.html.markdown`)
  - `text.xml` - XML documents

### `storage`

Keywords affecting how variables, functions, or data structures are stored or accessed.

- `storage.type` - Type keywords (`int`, `bool`, `char`)
  - `function` - Function keywords (`def`, `function`) + `keyword.declaration.function`
  - `class` - Class keywords (`class`) + `keyword.declaration.class`
  - `struct` - Struct keywords + `keyword.declaration.struct`
  - `enum` - Enum keywords + `keyword.declaration.enum`
  - `union` - Union keywords + `keyword.declaration.union`
  - `trait` - Trait keywords + `keyword.declaration.trait`
  - `interface` - Interface keywords + `keyword.declaration.interface`
  - `impl` - Implementation keywords + `keyword.declaration.impl`
- `storage.modifier` - Storage modifiers (`static`, `const`, `public`, `private`)

**Note:** Declaration keywords should use both `storage.type.*` and `keyword.declaration.*` for backward compatibility.

### `string`

String literals and related constructs. Use `meta.string` for entire strings including punctuation.

- `string.quoted.single` - Single-quoted strings
- `string.quoted.double` - Double-quoted strings
- `string.quoted.triple` - Triple-quoted strings
- `string.quoted.other` - Other quoting styles
- `string.unquoted` - Unquoted strings (`shell`, `batch`)
- `string.regexp` - Regular expression literals

**String interpolation pattern:**
```
meta.string
  punctuation.definition.string.begin
  meta.interpolation
    punctuation.section.interpolation.begin
    source.language.embedded
    punctuation.section.interpolation.end
  punctuation.definition.string.end
```

When strings contain interpolated code, remove the `string.*` scope using `clear_scopes:` and apply `meta.interpolation` to the entire interpolation including punctuation.

### `support`

Elements provided by frameworks, libraries, and language runtimes (as opposed to user-defined elements).

- `support.function` - Library functions (`console.log`, `NSLog`)
- `support.class` - Library classes
- `support.type` - Library types
- `support.constant` - Library constants
- `support.module` - Library modules
- `support.variable` - Library variables

Many syntaxes also apply these to unrecognized user constructs, effectively scoping all user-defined elements.

### `variable`

Variable names and identifiers representing mutable data.

- `variable.other` - Generic variables
  - `readwrite` - Mutable variables
  - `constant` - Immutable variables
  - `member` - Object properties/fields
- `variable.language` - Language-reserved variables (`this`, `self`, `super`)
- `variable.parameter` - Function parameters
- `variable.function` - Function names (when called, not defined)
- `variable.annotation` - Annotation identifiers

Apply `punctuation.definition.variable` to variable prefixes like `$` in PHP.

## Color Scheme Guidelines

### Essential Scopes for Themes

Target these scopes for broad compatibility:

- `entity.name` (with overrides for `entity.name.tag` and `entity.name.section`)
- `entity.other.inherited-class`
- `variable` (with specific variants)
- `constant` (with specific variants)
- `storage.type` and `storage.modifier`
- `support`
- `keyword` (with specific variants)
- `string`
- `comment`
- `invalid`

### Best Practices

- Style general scopes first, then override specific ones
- Avoid styling `meta` scopes - they're for structural information
- Use scope inheritance - specific scopes inherit from general ones

## Common Decision Points

**Definition vs Usage:**
- Function definition: `entity.name.function`
- Function call: `variable.function`

**Constants vs Variables:**
- Named constants: `entity.name.constant` (appears in symbol list)
- Immutable variables: `variable.other.constant` (doesn't appear in symbol list)

**Framework vs User Code:**
- Library functions: `support.function`
- User-defined functions: `entity.name.function`

This guide covers the semantic foundation for creating consistent tmLanguage files that work well with existing themes and editor features. 