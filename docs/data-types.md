# RCL Data Types

RCL supports YAML-compatible syntax for defining data structures, making it familiar to developers who work with YAML, JSON, and similar data formats.

## RCL Type System

In RCL, types cannot be created by users. There's a fixed set of native types that expand on JSON types, plus section types defined by the RCS specification. The native RCL types include:

- **string** (text)
- **number** (integers or floats)  
- **boolean** (True/False with aliases)
- **null** (nothingness/void)
- **symbol** (constants starting with `:`)
- **list** (arrays/sequences)
- **object** (dictionaries/maps)
- **type tags** (specialized typed values)
- **embedded code** (JavaScript/TypeScript code stored as literal strings)

## Basic Types

### Text (strings)

Text values can be defined in two ways:

1. **Single-line strings**: By enclosing the text in **double** quotes. Single quotes are reserved for the `'s` accessor operator (usually `.` in other languages). Example: `"this is a text"`.

   > **Note:** Single-line strings **MUST** use double quotes, not single quotes.

2. **Multi-line strings**: By starting a multi-line text block with a `|` character followed by an indented block of text. The block is terminated by a line that is less indented than the first line of the block.

**Example:**

```rcl
message: |
  this is a multiline
  text block
```

You can control how whitespace around the text is handled by using chomping markers. A `-` means "trim" spaces and new lines, a `+` means "keep" spaces and new lines:

- `|` - trim beginning of the text, **one** new line at the end
- `|-` - trim beginning of the text, and **all** new lines at the end  
- `+|` - keep new lines at the beginning, one new line at the end
- `+|+` - keep **all** new lines at the beginning and end

### Numbers

Numbers can be written without any special syntax. When immediately after a Proper Noun identifier, they are interpreted as part of the identifier. A dot separates the integer part from the decimal part, and you can use a comma to separate the thousands, but it is not required.

**Examples:**

```rcl
Value: 123456
Total: 123,456,7890
Discount: 123.45
```

### Booleans

Booleans represent a binary state (`True` or `False`), and have several aliases for each value just to make the writing more fluid for the future RclScript. Here's a table of the aliases:

| Value | Aliases                                      |
| ----- | -------------------------------------------- |
| `True`  | `Yes`, `On`, `Enabled`, `Active`     |
| `False` | `No`, `Off`, `Disabled`, `Inactive` |

### Nothingness and Emptiness - Null and Empty

Nothingness, the complete absence of a value can be represented using either `Null`, `None`, or `Void`.

Emptiness is a broader concept. Everything that is `Null` is also `Empty`. But an empty list, a dictionary with no keys, or a text with no characters, are still something. Checking if they are `Null` or `None` would return `false`.

**Examples:**

| Value          | `value is Null` | `value is Empty` |
| -------------- | --------------- | ---------------- |
| `value:`       | `True`          | `True`           |
| `value: Null`  | `True`          | `True`           |
| `value: None`  | `True`          | `True`           |
| `value: ()`    | `False`         | `True`           |
| `value: {}`    | `False`         | `True`           |
| `value: ""`    | `False`         | `True`           |
| `value: 0`     | `False`         | `False`          |
| `value: False` | `False`         | `False`          |

### Symbols

Symbols are special values that start with a `:` and represent constants or enumeration values. They are like atoms in Elixir - their value is literally the symbol itself.

**Examples:**
```rcl
flowStart: :start
agentUseCase: :transactional  
messageType: :promotion
status: :unspecified
```

**Common Use Cases:**
- Flow control (`:start`, `:end`)
- Enumeration values from RCS specification
- Configuration options and flags

When RCS specification properties have enumeration options like "TRANSACTIONAL", "PROMOTIONAL", "OTP", they become lowercase symbols `:transactional`, `:promotional`, `:otp`. Values ending with "_UNSPECIFIED" are mapped to `:unspecified`.

### Type Tags

You can specify the type of a value using the syntax `<TYPE_TAG VALUE>`, where `TYPE_TAG` is one of the supported types, or its alias.

After parsing and before generation, a class for the type tag will be created and the value will be passed to the class constructor.

Here's a table of the supported type tags, their aliases and examples:

| Type         | Aliases | Example                                           | Notes |
|--------------|----------|---------------------------------------------------|----|
| `email`      | -      | `<email user@domain.com>` | |
| `phone`      | `msisdn`      | `<phone +1234567890>` | |
| `url`| -      | `<url https://example.com>` | |
| `time`       | `t`      | `<time 10:00>`<br> `<time 4pm \| Z>`<br> `<t 23:59 \| UTC-3>`<br> `<t 09:15am>` | `Z` is a synonym for `UTC`.<br> Timezone defaults to `UTC` if not defined |
| `datetime`   | `date`, `dt`     | `<date Jul 4th>`<br> `<date 2023-12-31T23:59:59Z>`<br> `<dt 2024-06-01 \| 15>` | Time defaults to `00:00:00 UTC` |
| `zipcode`    | `zip`      | `<zipcode 94103>`, `<zip 10001>`, `<zip 25585-460 \| BR>` | |

**Examples of type tag usage:**
```rcl
contactInfo:
  email: <email "support@company.com">
  phone: <phone "+1-555-123-4567">
  website: <url https://company.com>

eventDetails:
  startTime: <time "2:30pm | EST">
  eventDate: <date "March 15th, 2024">
  location: <zip "10001">
```

### Embedded Code

RCL supports embedding JavaScript or TypeScript code within data structures. **Important**: Embedded code is stored as literal strings in the AST and is not parsed by the RCL parser. Code execution happens at runtime by appropriate engines.

#### Single-line Embedded Code
Start with `$[language]>` where language can be `js`, `ts`, or omitted (defaults to JavaScript). **Important**: Single-line embedded code extends to the end of the line and cannot be used in the middle of inline parameter lists.

```rcl
dynamicValue: $js> context.user.name.toUpperCase()
calculation: $ts> (price * 0.08).toFixed(2)
defaultLang: $> "Hello " + context.user.firstName
```

**Valid usage in flow parameters** (using block syntax):
```rcl
-> Book Appointment with
    userId: $js> context.user.id
    timestamp: $js> Date.now()
    service: "premium"
```

**Invalid usage** (cannot use in inline lists):
```rcl
// This is INVALID - single-line embedded code cannot be used inline
parameters: (userId: $js> context.user.id, service: "premium")
```

#### Multi-line Embedded Code Blocks
Use `$[lang]>>>` with indented code blocks:

```rcl
complexLogic: $js>>>
  let discount = 0;
  if (context.user.isPremium) {
    discount = 0.15;
  } else if (context.order.total > 100) {
    discount = 0.10;
  }
  return discount;
```

#### Storage Format
Embedded code is stored in the AST as:
- **Single-line**: `{ type: 'embedded_code', language: 'js', content: "code string" }`
- **Multi-line**: `{ type: 'embedded_code_block', language: 'js', content: ["line1", "line2"] }`

**Available when executed:**
- `context` variable (current flow, step, state, selectedOption)  
- `RclUtils` global utilities (like `format`)
- Standard ECMAScript 6 features

## Complex Types

### Lists

Lists (arrays) can be defined in two YAML-compatible ways:

#### 1. Block Syntax (indented with hyphens)
Each item on a new line, indicated by a hyphen:

```rcl
phoneNumbers:
  - "+1234567890"
  - "+1234567891"
  - "+1234567892"
```

#### 2. Inline Syntax
Using parentheses (tuple-style):

```rcl
colors: ("red", "green", "blue")
numbers: (1, 2, 3, 4)
empty: ()
```

#### Optional Parentheses

For inline lists with two or more items, the parentheses are optional:

```rcl
colors: "red", "green", "blue"
numbers: 1, 2, 3, 4
mixed: "one", 2, "three"
```

#### Nested Lists
To nest lists within other lists, wrap the inner list in parentheses:

```rcl
inline_list: ("Alice", "Bob"), ("Charlie", "David"), ("Eve", "Frank")
block_list:
  - ("Alice", "Bob")
  -
    - "Charlie"
    - "David"
  - "Eve", "Frank"
```

### Dictionaries (a.k.a Maps or Objects)

Objects are collections of key-value pairs that can be defined in two YAML-compatible ways:

#### 1. Block Syntax (indented key-value pairs)
The most readable format, with each key-value pair on its own line:

```rcl
phoneNumbers:
  "John Doe": "+1234567890"
  "Jane Doe": "+1234567891"
  "Jim Doe": "+1234567892"
```

#### 2. Brace Syntax (inline)
Using curly braces (YAML-style):

```rcl
person: {name: "John", age: 30, city: "New York"}
config: {debug: true, timeout: 5000}
empty: {}
```

#### Important Notes:

- **Keys are unique**: They MUST NOT repeat within the same object
- **Order doesn't matter**: The key-value pairs can be in any order
- **No hyphens**: Object keys are _NOT_ preceded by a hyphen (unlike list items)

> [!WARNING]
> The notation below would create a **list** of 2-item lists, not an object:
>
> ```rcl
> phoneNumbers:
>   - "John Doe", "+1234567890"
>   - "Jane Doe", "+1234567891"
>   - "Jim Doe", "+1234567892"
> ```

### Mapped Types

Some times we need to create lists of dictionaries and that may become repetitive pretty fast. See the example below:

```rcl
PhoneNumbers:
  - label: "John Doe"
    number: <phone "+1234567890">
  - label: "Jane Doe"
    number: <phone "+1234567891">
  - label: "Jim Doe"
    number: <phone "+1234567892">
```

To avoid this, we can use the `Mapped Type` syntax:

```rcl
PhoneNumbers list of (label, <phone number>):
  - "some label", "+1234567890"
  - "some other label", "+1234567890"
  - "some other label", "+1098765423"
```

The `PhoneNumbers list of (label, <phone number>):` statement defines the type of `PhoneNumbers` as a `list`.

It also specifies that each item in the list will also be a list with 2 items, with the `of (label, <phone number>)` part of the statement. 

The first item is defined as `label`, and this means it will receive the key `label` during the transformation.

The second item is defined as `<phone number>`, combining a key name (`number`), with a type tag `<phone>` (see the Type Tags section above). This means that the value will be transformed into a phone number object and assigned to the `number` key.


For coders, this is equivalent to the following Javascript code:

```js
PhoneNumbers = [
  ["some label", "+1234567890"],
  ["some other label", "+1234567890"],
  ["some other label", "+1098765423"],
].map(([label, number]) => ({ label: label, number: TypeTag.phone(number) }));
```

## RCS Message Shortcuts

To simplify creating common messages, RCL offers shortcuts that expand into the full `agentMessage` structure.

### Complete Shortcut Reference

Here's a complete reference of all available shortcuts:

| Shortcut | Description | Signature |
|----------|-------------|-----------|
| **Message Type Prefixes** |
| `transactional` | Mark message as transactional (overrides Defaults) | `transactional [message_type]` |
| `promotional` | Mark message as promotional (overrides Defaults) | `promotional [message_type]` |
| **Message Types** |
| `text` | Send a text message | `text "message"` |
| `rbmFile` | Send a file you uploaded to RCS | `rbmFile "filename" ["thumbnail"]` |
| `file` | Send a file from a public URL | `file <url> ["thumbnail_url"] [:force_refresh]` |
| `richCard` | Send a rich card with image and buttons | `richCard "title" [:orientation] [:align] [:height] [<url>]` |
| `carousel` | Send a carousel of rich cards | `carousel [:width]` |
| **Reply Suggestions** |
| `reply` | Simple reply button | `reply "text" ["custom_postback"]` |
| **Action Suggestions** |
| `dial` | Button that opens phone dialer | `dial "text" <phone number>` |
| `openUrl` | Button that opens a website | `openUrl "text" <url> ["description"] [:browser \| :webview [:full\|:half\|:tall]]` |
| `shareLocation` | Button asking user to share location | `shareLocation "text"` |
| `viewLocation` | Button that shows a location on map | `viewLocation "text"` with location details |
| `saveEvent` | Button that creates calendar event with details | `saveEvent "text" "title" <datetime> <datetime> "description"` |

### Shortcut Expansions

---
#### `text`

**Minimal:**
```rcl
text "Welcome!"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Welcome!"
```

**With Suggestions:**
```rcl
text "Please choose an option:"
  suggestions:
    reply "Option A"
    reply "Option B"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Please choose an option:"
    suggestions:
      - reply:
          text: "Option A"
          postbackData: "option_a"
      - reply:
          text: "Option B"
          postbackData: "option_b"
```

---
#### `rbmFile`

**Minimal:**
```rcl
rbmFile "brochure.pdf"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    uploadedRbmFile:
      fileName: "brochure.pdf"
```

**Full:**
```rcl
rbmFile "brochure.pdf" "thumb.jpg"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    uploadedRbmFile:
      fileName: "brochure.pdf"
      thumbnailName: "thumb.jpg"
```

---
#### `file`

**Minimal:**
```rcl
file <url https://example.com/doc.pdf>
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    contentInfo:
      fileUrl: "https://example.com/doc.pdf"
```

**Full:**
```rcl
file <url https://example.com/doc.pdf> <url https://example.com/thumb.jpg> :force-refresh
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    contentInfo:
      fileUrl: "https://example.com/doc.pdf"
      thumbnailUrl: "https://example.com/thumb.jpg"
      forceRefresh: true
```

---
#### `reply`

**Minimal:**
```rcl
text "Do you agree?"
  suggestions:
    reply "I agree"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Do you agree?"
    suggestions:
      - reply:
          text: "I agree"
          postbackData: "i_agree" # Auto-generated
```

**Full (with custom postback):**
```rcl
text "Do you agree?"
  suggestions:
    reply "I agree" "user_agreed_postback"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Do you agree?"
    suggestions:
      - reply:
          text: "I agree"
          postbackData: "user_agreed_postback"
```

---
#### `dial`

**Minimal & Full:**
```rcl
text "Need help?"
  suggestions:
    dial "Call support" <phone +1-555-0123>
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Need help?"
    suggestions:
      - action:
          text: "Call support"
          postbackData: "call_support"
          dialAction:
            phoneNumber: "+1-555-0123"
```

---
#### `openUrl`

**Minimal:**
```rcl
text "Visit our site."
  suggestions:
    openUrl "Website" <url https://example.com>
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Visit our site."
    suggestions:
      - action:
          text: "Website"
          postbackData: "website"
          openUrlAction:
            url: "https://example.com"
```

**Full:**
```rcl
text "Visit our site."
  suggestions:
    openUrl "Our new product" <url https://example.com/product> "Check out the latest features" :webview :tall
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Visit our site."
    suggestions:
      - action:
          text: "Our new product"
          postbackData: "our_new_product"
          openUrlAction:
            url: "https://example.com/product"
            # The description, :webview, and :tall tokens are hints for the client
            # and do not map to specific fields in the final JSON.
            # The client SDK would interpret these.
```

---
#### `shareLocation`

**Minimal & Full:**
```rcl
text "Where are you?"
  suggestions:
    shareLocation "Share my location"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Where are you?"
    suggestions:
      - action:
          text: "Share my location"
          postbackData: "share_my_location"
          shareLocationAction: {}
```

---
#### `viewLocation`

**Minimal (with query):**
```rcl
text "Find a store"
  suggestions:
    viewLocation "Nearby stores"
      query: "Coffee shops near me"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Find a store"
    suggestions:
      - action:
          text: "Nearby stores"
          postbackData: "nearby_stores"
          viewLocationAction:
            query: "Coffee shops near me"
```

**Full (with lat/long and label):**
```rcl
text "Find a store"
  suggestions:
    viewLocation "Our HQ"
      latLong: 37.7749 -122.4194
      label: "Our Main Office"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Find a store"
    suggestions:
      - action:
          text: "Our HQ"
          postbackData: "our_hq"
          viewLocationAction:
            latLong:
              latitude: 37.7749
              longitude: -122.4194
            label: "Our Main Office"
```

---
#### `saveEvent`

**Minimal:**
```rcl
text "Team meeting"
  suggestions:
    saveEvent "Add to calendar" "Project Sync" <dt 2024-08-01T10:00> <dt 2024-08-01T11:00> "sync up"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Team meeting"
    suggestions:
      - action:
          text: "Add to calendar"
          postbackData: "add_to_calendar"
          createCalendarEventAction:
            title: "Project Sync"
            startTime: "2024-08-01T10:00:00Z"
            endTime: "2024-08-01T11:00:00Z"
            description: "sync up"
```

**Full:**
```rcl
text "Important meeting reminder"
  suggestions:
    saveEvent "Save to my calendar"
      title: "Project Sync Meeting"
      startTime: <dt 2024-08-01T10:00>
      endTime: <dt 2024-08-01T11:30>
      description: "Weekly team sync to discuss project progress and next steps"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    text: "Important meeting reminder"
    suggestions:
      - action:
          text: "Save to my calendar"
          postbackData: "save_to_my_calendar"
          createCalendarEventAction:
            title: "Project Sync Meeting"
            startTime: "2024-08-01T10:00:00Z"
            endTime: "2024-08-01T11:30:00Z"
            description: "Weekly team sync to discuss project progress and next steps"
```

---
#### `richCard`

**Minimal:**
```rcl
richCard "Product"
  description: "A great product"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    richCard:
      standaloneCard:
        cardOrientation: :vertical
        cardContent:
          title: "Product"
          description: "A great product"
```

**Full:**
```rcl
richCard "Product Showcase" :horizontal :left :medium <url https://example.com/product.jpg>
  description: "Our latest features and improvements"
  suggestions:
    reply "Learn more"
    openUrl "Buy now" <url https://store.com/product>
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    richCard:
      standaloneCard:
        cardOrientation: :horizontal
        thumbnailImageAlignment: :left
        cardContent:
          title: "Product Showcase"
          description: "Our latest features and improvements"
          media:
            height: :medium
            contentInfo:
              fileUrl: "https://example.com/product.jpg"
          suggestions:
            - reply:
                text: "Learn more"
                postbackData: "learn_more"
            - action:
                text: "Buy now"
                postbackData: "buy_now"
                openUrlAction:
                  url: "https://store.com/product"
```

---
#### `carousel`

**Minimal:**
```rcl
carousel
  richCard "Card 1"
    description: "First item"
  richCard "Card 2"
    description: "Second item"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    richCard:
      carouselCard:
        cardWidth: :medium # Default width
        cardContents:
          - title: "Card 1"
            description: "First item"
          - title: "Card 2"
            description: "Second item"
```

**Full:**
```rcl
carousel :small
  richCard "Card 1" <url img1.jpg>
    description: "With image and suggestions"
    suggestions:
      reply "Option 1"
  richCard "Card 2" <url img2.jpg>
    description: "Another item"
    suggestions:
      reply "Option 2"
```
**Expands to:**
```rcl
agentMessage:
  contentMessage:
    richCard:
      carouselCard:
        cardWidth: :small
        cardContents:
          - title: "Card 1"
            description: "With image and suggestions"
            media:
              height: :medium # All cards in a carousel must have the same media height (defaults to medium)
              contentInfo:
                fileUrl: "img1.jpg"
            suggestions:
              - reply:
                  text: "Option 1"
                  postbackData: "option_1"
          - title: "Card 2"
            description: "Another item"
            media:
              height: :medium
              contentInfo:
                fileUrl: "img2.jpg"
            suggestions:
              - reply:
                  text: "Option 2"
                  postbackData: "option_2"
```

## Other Default Behaviors

- **Auto-Generated PostbackData**: When you don't specify custom `postbackData`, RCL automatically generates it by converting the button text to lowercase and replacing non-alphanumeric characters with underscores (e.g., `reply "Get Support"` → `postbackData: "get_support"`). You can customize this with `Defaults.postbackData`.
- **Message Traffic Type**: Uses `Defaults.messageTrafficType` if not specified (system default: `:transactional`).
- **Embedded Code Language**: `$>` embedded code uses `Defaults.expressions.language` (system default: `:javascript`).
- **TTL (Time To Live)**: Messages use `Defaults.ttl` if not set individually.

## Import Statements (Phase 6 Enhancements)

RCL import statements now support multi-level namespace paths and space-separated aliases:

Examples:
- `import My Brand / Samples as Sample One`
- `import Shared / Common Flows / Support`

**Import Resolution Rules:**
- Namespace segments and aliases can contain spaces (e.g., `My Brand`, `Sample One`).
- Import resolution is case-insensitive.
- If two or more possible resolutions exist, an error is thrown.
- The import path is resolved relative to the project root (the closest folder up the hierarchy containing either an `rclconfig.yml` or a `config/rcl.yml` file; if none, the current file's folder is used).
- For a path like `Shared / Common Flows / Retail / Catalog`, the resolver checks:
  1. `shared/common flows/retail.rcl`, `shared/common-flows/retail.rcl`, `shared/common_flows/retail.rcl`
  2. If not found, looks for a flow `Catalog` of the `Retail` agent in:
     - `shared/common flows.rcl`, `shared/common-flows.rcl`, `shared/common_flows.rcl`

See the parser README for technical details on import resolution.