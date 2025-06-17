# RCL Data Types

## Basic Types

### Text (strings)

Text values can be defined in two ways:

1. By enclosing the text in **double** quotes. Single quotes are used for the `'s` (the accessor operator, usually `.` in other languages). Example: `"this is a text"`.

1. By starting a multi-line text block with a `|` character followed by an indented block of text. The block is terminated by a line that is less indented than the first line of the block.

**Example:**

```elixir
message: |
  this is a multiline
  text block
```

You can control how whitespace around the text is handled by using a `-` (trim) or `+` (keep) character, either before or after the `|` character.

### Numbers

Numbers can be written without any special syntax. When immediately after a Proper Noun identifier, they are interpreted as part of the identifier. A dot separates the integer part from the decimal part, and you can use a comma to separate the thousands, but it is not required.

**Examples:**

```elixir
Value: 123456
Total: 123,456,7890
Discount: 123.45
```

### Booleans

Booleans represent a binary state (true or false), and have several aliases for each value just to make the writing more fluid for the future RclScript. Here's a table of the aliases:

| Value | Aliases                                      |
| ----- | -------------------------------------------- |
| true  | `True`, `Yes`, `On`, `Enabled`, `Active`     |
| false | `False`, `No`, `Off`, `Disabled`, `Inactive` |

### Nothingness and Emptiness - Null and Empty

Nothingness, the complete absence of a value can be represented using either `Null`, `None`, or `Void`.

Emptiness is a broader concept. Everything that is `Null` is also `Empty`. But an empty list, a dictionary with no keys, or a text with no characters, are still something. Checking if they are `Null` or `None` would return `false`.

**Examples:**

| Value          | `value is Null` | `value is Empty` |
| -------------- | --------------- | ---------------- |
| `value:`       | `True`          | `True`           |
| `value: Null`  | `True`          | `True`           |
| `value: None`  | `True`          | `True`           |
| `value: []`    | `False`         | `True`           |
| `value: {}`    | `False`         | `True`           |
| `value: ""`    | `False`         | `True`           |
| `value: 0`     | `False`         | `False`          |
| `value: False` | `False`         | `False`          |

## Complex Types

### Lists

A list is a sequence of values separated by commas.
To nest lists, wrap the inner list in square brackets.

**Examples:** `1, 2, 3`, `"one", "two", "three"` `(1, "one", "um"), (2, "two", "dois"), (3, "three", "três")`

Lists can also be defined by nesting the items. In this case, each item is indicated by a hyphen.

```elixir
phoneNumbers:
  - "+1234567890"
  - "+1234567891"
  - "+1234567892"
```

### Dictionaries (a.k.a Maps or Objects)

A map is a collection of key-value pairs and can _only_ be defined by nesting a **set** of definitions.
This is intentional, to make sure the document remains readable.

We called it a "set" and not a "list" because of two important reasons:

- The keys are unique, they MUST NOT repeat
- The order of the key-value pairs does not matter

**Examples:**

```elixir
phoneNumbers:
  "John Doe": "+1234567890"
  "Jane Doe": "+1234567891"
  "Jim Doe": "+1234567892"
```

> [!NOTE]
> Beyond using the `:` to separate the key from the value, maps keys are _NOT_ preceded by a hyphen. The notation below would actually create a list of 2-item lists, not a map:
>
> ```elixir
> phoneNumbers:
>   - "John Doe", "+1234567890"
>   - "Jane Doe", "+1234567891"
>   - "Jim Doe", "+1234567892"
> ```

### Mapped Types

Some times we need to create lists of dictionaries and that may become repetitive pretty fast. See the example below:

```elixir
PhoneNumbers:
  - label: "John Doe"
    number: <phone "+1234567890">
  - label: "Jane Doe"
    number: <phone "+1234567891">
  - label: "Jim Doe"
    number: <phone "+1234567892">
```

To avoid this, we can use the `Mapped Type` syntax:

```elixir
PhoneNumbers list of (label, <phone number>):
  - "some label", "+1234567890"
  - "some other label", "+1234567890"
  - "some other label", "+1098765423"
```

The `PhoneNumbers list of (label, <phone number>):` statement defines the type of `PhoneNumbers` as a `list`.

It also specifies that each item in the list will also be a list with 2 items, with the `of (label, <phone number>)` part of the statement. 

The first item is defined as `label`, and this means it will receive the key `label` during the transformation.

The second item is defined as `<phone number>`, combining a key name (`number`), with a type tag `<phone>`. This means that the value will be transformed into a phone number object and assigned to the `number` key.


For coders, this is equivalent to the following Javascript code:

```js
PhoneNumbers = [
  ["some label", "+1234567890"],
  ["some other label", "+1234567890"],
  ["some other label", "+1098765423"],
].map(([label, number]) => ({ label: label, number: TypeTag.phone(number) }));
```