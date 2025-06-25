# List Syntax Design Rationale - RCL

## Decision: Use Parentheses `()` for Inline Lists

After consideration, RCL has adopted parentheses `()` for inline list syntax instead of square brackets `[]`.

## Syntax Examples

### Inline Lists
```rcl
# With parentheses
colors: ("red", "green", "blue")
numbers: (1, 2, 3, 4)
empty: ()

# Optional parentheses for 2+ items
colors: "red", "green", "blue"
numbers: 1, 2, 3, 4
```

### Block Lists (unchanged)
```rcl
phoneNumbers:
  - "+1234567890"
  - "+1234567891"
  - "+1234567892"
```

### Nested Lists
```rcl
teams: ("Alice", "Bob"), ("Charlie", "David"), ("Eve", "Frank")
```

## Rationale

### 1. **Tuple Semantics**
Parentheses align with the mathematical concept of tuples and ordered sequences, making the syntax conceptually clearer.

### 2. **Function Parameter Consistency**
List syntax mirrors function parameter lists, creating conceptual unity:
```rcl
# Function call (conceptually a list of arguments)
processOrder(customerId, orderItems, shippingAddress)

# List definition (also a collection of values)  
orderItems: (item1, item2, item3)
```

### 3. **English Prose Naturalness**
Parentheses are commonly used in English to enumerate items within text, making RCL more readable for non-programmers.

### 4. **RclScript Compatibility**
This design supports future goals for the RclScript language where function calls and data structures share consistent syntax patterns.

### 5. **No Parsing Conflicts**
Using parentheses for lists and embedded expressions eliminates potential conflicts, as embedded expression content is treated as raw text.

## Implementation Notes

### Updated Grammar Rules
- `ParenthesesList ::= '(' (ListItem (',' ListItem)*)? ')'`
- `InlineList ::= ListItem (',' ListItem)+` (parentheses optional for 2+ items)
- Removed `BracketList` rule

### Documentation Updates
- All three core documents (overview.md, data-types.md, rcl-formal-specification.md) now consistently use parentheses syntax
- Added design rationale to formal specification
- Updated all examples to use parentheses

## Impact

### Benefits
- Conceptual consistency with tuple/function parameter semantics
- Better readability and natural language flow
- Future-proofing for RclScript language goals
- Eliminates potential parsing ambiguities

### Breaking Changes
- Existing RCL files using square brackets will need to be updated
- Grammar parsers will need to be updated to reflect new syntax
- Syntax highlighting and tooling will need updates

This decision aligns RCL's syntax with its design philosophy of being both human-readable and conceptually consistent. 