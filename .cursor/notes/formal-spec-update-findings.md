# Formal Specification Update Findings

## Overview

Updated the `rcl-formal-specification.md` to align with the `overview.md` and `data-types.md` documents. This note documents what was found in the formal spec that wasn't foreseen in the overview/data-types docs, and contradictions that were resolved.

## Items in Formal Spec Not Covered in Overview/Data-Types Docs

### 1. Detailed RCS Message Structure
The formal spec contained extensive detail about the underlying RCS message structure:
- `agentMessage`, `contentMessage`, `suggestion` hierarchies
- Detailed action types: `dialAction`, `viewLocationAction`, `createCalendarEventAction`, etc.
- Schema field mappings and requirements
- Cardinality constraints (max 11 suggestions, max 4 card suggestions, etc.)

**Impact**: These are implementation details that support the shortcuts described in data-types.md. The shortcuts are the user-facing syntax, while these structures are the expanded forms.

### 2. Schema References
The formal spec extensively referenced external JSON schemas:
- `agent-config.schema.json`
- `agent-message.schema.json`
- Field requirements and constraints from these schemas

**Impact**: These schema references were removed from the EBNF as they're semantic validation concerns, not syntactic structure.

### 3. Grammar Implementation Details
Technical parsing details not covered in the overview docs:
- `INDENT`/`DEDENT` token generation
- Lexer responsibilities for indentation tracking
- Hidden terminals (`WS`, `NL`, `SL_COMMENT`)
- AST mapping considerations

**Impact**: These remain in the formal spec as they're necessary for implementation but don't affect the user-facing language description.

### 4. Error Classification System
Detailed breakdown of syntax vs. semantic errors with examples.

**Impact**: This is implementation guidance that doesn't change the language definition but helps implementers.

### 5. Ambiguity Resolution Notes
Technical notes about parser implementation choices and EBNF limitations.

**Impact**: Implementation-specific concerns that don't affect the language specification itself.

## Contradictions Resolved (Favoring Overview/Data-Types Docs)

### 1. Boolean Literals
- **Formal Spec**: Included both `'true'/'false'` and `'True'/'False'`
- **Data-Types Doc**: Specified `True`/`False` with aliases `Yes`/`No`, `On`/`Off`, etc.
- **Resolution**: Updated to use only capitalized forms with full alias list

### 2. Type Tags Terminology
- **Formal Spec**: Called them "TypeConversion" 
- **Data-Types Doc**: Called them "Type Tags"
- **Resolution**: Updated to use "Type Tags" throughout

### 3. Import Path Syntax
- **Formal Spec**: `import STRING ('as' IDENTIFIER)? ';'`
- **Overview**: `import Shared / Common Flows / Support as Support Flow`
- **Resolution**: Updated to use slash-separated path syntax without semicolons

### 4. Section Definition Syntax
- **Formal Spec**: `'Agent' QualifiedName`
- **Overview**: `agent SectionName` (lowercase section type)
- **Resolution**: Updated to use lowercase section types (`agent`, `flow`, etc.)

### 5. Identifier Rules
- **Formal Spec**: Allowed hyphens and numbers in identifiers with complex space rules
- **Overview**: Specified title case with spaces between words, max 5 words, 2-20 chars each
- **Resolution**: Updated to match overview specification exactly

### 6. Multi-line String Terminal Names
- **Formal Spec**: `MULTILINE_STR_TRIM_LEAD_ONE_NL_END`, etc.
- **Data-Types Doc**: Clear descriptions of `|`, `|-`, `+|`, `+|+` markers
- **Resolution**: Used clearer terminal names that match the documentation

### 7. Section Types and Reserved Names
- **Formal Spec**: Incomplete section type information
- **Overview**: Complete table with cardinality, reserved names, requirements
- **Resolution**: Updated to match the complete table from overview.md

### 8. Expression Language Details
- **Formal Spec**: Basic expression syntax
- **Overview**: Detailed requirements including `return` statements for multi-line blocks
- **Resolution**: Added requirement for explicit `return` in multi-statement blocks

### 9. List Syntax Clarification
- **Formal Spec**: Unclear about minimum items for inline lists
- **Data-Types Doc**: Showed clear examples of three list syntaxes
- **Resolution**: Clarified that inline flow syntax requires minimum 2 items (comma-separated)

## Items That Remain Implementation-Specific

Some items in the formal spec are necessary for implementation but don't affect the user-facing language:

1. **Lexer Implementation**: `INDENT`/`DEDENT` generation algorithms
2. **Parser Details**: Error recovery strategies, ambiguity resolution
3. **AST Mapping**: How grammar rules map to abstract syntax tree nodes
4. **Validation Architecture**: How semantic validation is separated from parsing

## Conclusion

The formal specification has been successfully aligned with the overview and data-types documentation. The contradictions were resolved by favoring the user-facing documentation, while implementation-specific details that don't conflict with the overview were retained for implementer guidance.

The updated specification now provides a consistent technical foundation that matches the language description in the overview and data-types documents. 