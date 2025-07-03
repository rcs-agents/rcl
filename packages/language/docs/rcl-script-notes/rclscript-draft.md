# RclScript Specification

## Overview
RclScript is the language used inside RCL's expressions (`$rcl>`) and blocks (`$rcl>>>`). It's a language for expressing simple business logic in RCS agent flows, inspired by Elixir with a focus on readability.

## Key Features
- Natural language syntax with optional innocuous keywords
- Pipe operator (`|>`) for function chaining
- Context variables with `@` prefix
- Symbols (atoms) with `:` prefix
- No required parentheses for function calls
- Statement expansion with ellipsis (`...`)
- Pattern matching with variable binding

## Syntax Elements

### 1. Context Variables
Access flow context with `@` prefix:
- `@flow` → `context.flow`
- `@message` → `context.message`
- `@flow.current_step` → `context.flow.current_step`

### 2. Symbols (Atoms)
- `:symbol_name` → `$symbol_name` in generated code
- Used for enums and special values
- Example: `:TRANSACTIONAL` → `"TRANSACTIONAL"`

### 3. Identifiers
Identifiers are names used for variables, functions, and other named entities within RclScript (excluding Context Variables prefixed with `@` and Symbols prefixed with `:`).

**Rules for Valid Identifiers:**
- Must start with an uppercase letter (A-Z).
- Subsequent characters can be uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), or hyphens (`-`).
- Spaces are allowed within an identifier, but only if the character immediately following the space is an uppercase letter or a number. This allows for multi-word identifiers that read naturally.
- Hyphens (`-`) are allowed but cannot be preceded or followed by a space. They must be part of a continuous sequence of non-space characters.
- Identifiers are case-sensitive.

**Examples of Valid Identifiers:**
```
MyVariable
CustomerName
ProcessOrder
User ID
Order Number 123
Calculate-Total-Amount
Is Active User
URL-Validator
ItemCount
```

**Examples of Invalid Identifiers:**
```
myVariable         # Must start with an uppercase letter
_MyVariable        # Cannot start with an underscore (reserved for embedded comments)
123Order           # Cannot start with a number
Customer Name      # Space before 'Name' is okay, but 'name' is not capitalized or a number
User - ID          # Hyphen surrounded by spaces
An identifier      # Starts with uppercase, but 'identifier' is not capitalized or a number
```

### 4. Function Calls
Natural syntax without parentheses:
```rcl
format @user.name as title case
```
Equivalent to:
```javascript
RclUtils.format(context.user.name, "title_case")
```

#### Advanced Function Call Patterns
When an argument is an operation (like another function call), you **MUST EITHER** use parentheses in the inner call **OR** use commas to separate the arguments:

| JavaScript | RclScript | Alternative | Notes |
|------------|-----------|-------------|-------|
| `String.toLowerCase(number.toFixed(2))` | `String.toLowerCase number.toFixed(2)` | `number |> toFixed 2 |> String.toLowerCase` | No comma option supported |
| `String.toLowerCase(Number(number).toFixed(2))` | `String.toLowerCase(Number(number).toFixed 2)` | `(number |> Number).toFixed 2 |> String.toLowerCase` | No comma option supported |
| `funA(a, funB(b))` | `funA a, funB b` | `funA a, funB(b)` | Multiple options |
| `funA(funB(b), a)` | `funA funB(b) a` | `funA funB b, a` | Also: `funA funB(b), a` |

### 5. Pipe Operator (`|>`)
Chains function calls left-to-right:
```rcl
number |> toFixed 2 |> String.toLowerCase
```
Equivalent to:
```javascript
String.toLowerCase(number.toFixed(2))
```

### 6. Innocuous Keywords
These words are ignored during compilation:
- `as`, `a`, `an`, `the`, `with`

Example:
```rcl
show a message to the user
```
Compiles to:
```javascript
show(message, user)
```

### 7. Returning Values

Use the left-arrow operator (`<-`) to return a value.

```rcl
  name = format @user.name
  time = format_time @appointment.time
  <- "Hello #{name}, your appointment is at #{time}"
```

### 8. Statement Expansion with Ellipsis

When an ellipsis (`...`) is used in a statement, it takes a clause list and replaces each ellipsis with the condition part of the clause, for each clause.

#### Basic Example
```rcl
when A is ...
  1 -> print "one"
  2 -> print "two"
```

Expands to:
```rcl
when A is 1 -> print "one"
when A is 2 -> print "two"
```

#### Complex Example with Multiple Ellipsis
```rcl
when @option.text is ... or @option.text matches ...
  "Book Appointment" -> Book Appointment
  "Contact Support" -> Contact Support
  /Appointment (number:[0-9]+)/ -> Status Response with id: number, time: <time 10 + number>
```

Expands to:
```rcl
when @option.text is "Book Appointment" or @option.text matches "Book Appointment" -> Book Appointment
when @option.text is "Contact Support" or @option.text matches "Contact Support" -> Contact Support  
when @option.text is /Appointment (number:[0-9]+)/ or @option.text matches /Appointment (number:[0-9]+)/ -> Status Response with id: number, time: <time 10 + number>
```

### 9. Conditional Logic

#### When Clauses
```rcl
when @option.text is "Book" -> Book Appointment
when @option.text matches /appt/i -> Show Appointments
```

#### Pattern Matching with Variable Binding
The `^it` syntax captures the matched value for use in nested conditions:

```rcl
when @message starts_with "Appointment" and ^it ends_with ...
  "1" -> Status Response with id: 1, time: <time 10:00>
  "2" -> Status Response with id: 2, time: <time 11:00>
  "3" -> Status Response with id: 3, time: <time 12:00>
```

#### Complex Conditional Flow Control
```rcl
Welcome ->
  when @option.text ...
    "Tell me more" -> Check Status
    "Book an appointment" -> Book Appointment
    "Contact support" -> Contact Support
    starts_with "Appointment" and ^it ends_with ...
        "1" -> Status Response with id: 1, time: <time 10:00>
        "2" -> Status Response with id: 2, time: <time 11:00>
        "3" -> Status Response with id: 3, time: <time 12:00>
```

This translates to JavaScript as:
```javascript
switch (context.selectedOption.text) {
  case "Tell me more":
    CheckStatus();
    break;
  case "Book an appointment":
    BookAppointment();
    break;
  case "Contact support":
    ContactSupport();
    break;
  default:
    if (context.selectedOption.text.startsWith("Appointment")) {
      if (context.selectedOption.text.endsWith("1")) {
        StatusResponse({ id: 1, time: "<time 10:00>" });
      } else if (context.selectedOption.text.endsWith("2")) {
        StatusResponse({ id: 2, time: "<time 11:00>" });
      } else if (context.selectedOption.text.endsWith("3")) {
        StatusResponse({ id: 3, time: "<time 12:00>" });
      }
    }
    break;
}
```

### 10. Type Conversion
Syntax: `<type value>`
Example:
```rcl
send_confirmation to: <email @user.email>, time: <time @appointment.time>
```

### 11. Multi-line Strings
Used within RclScript expressions:
```rcl
description: |
  This is a multi-line
  string with proper
  indentation handling.
```

## Operator Precedence
// ... existing code ...