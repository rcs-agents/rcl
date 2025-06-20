# RCL Language Tests

This directory contains comprehensive test suites for the RCL language implementation.

## Test Suites

### `scope.test.ts` - TextMate Grammar Scope Validation ✅

**NEW**: Comprehensive test suite for validating TextMate grammar scopes and context-aware highlighting.

This test suite validates that our **hierarchical context-aware grammar improvements** are working correctly:

#### What It Tests

1. **Agent Section Scoping**
   - Agent declaration keywords and names
   - Config, Defaults, Messages, and flow subsections
   - Proper context isolation between sections

2. **Import Statement Scoping**
   - Import keywords, namespaces, modules, and aliases
   - File-level context validation

3. **Data Type Scoping**
   - Strings, numbers, booleans, and atoms
   - Context-specific recognition (only within appropriate sections)

4. **Flow Section Scoping**
   - Flow declarations and rule syntax
   - Flow-specific operators and identifiers

5. **Context Limitation Validation**
   - Properties only appear in agent contexts (not at file level)
   - Flow rules only appear in flow contexts
   - Validates that our **context limitation fixes** are working

#### Key Improvements Validated

- ✅ **Hierarchical Context Architecture**: File → Agent → Section → Property contexts
- ✅ **Pattern Pollution Prevention**: No more global pattern conflicts
- ✅ **Context-Specific Recognition**: Rules only match in appropriate contexts
- ✅ **Maintainable Grammar Structure**: Modular, testable, debuggable

#### Running the Tests

```bash
# Run only scope tests
bun test scope.test.ts

# Run all tests
bun test
```

All scope tests pass (9/9) ✅, demonstrating that the TextMate grammar context improvements are working correctly.

---

### Other Test Suites

- `parsing.test.ts` - Langium parser validation
- `validating.test.ts` - Semantic validation rules  
- `linking.test.ts` - Cross-reference linking

## TextMate Grammar Testing Architecture

The scope tests use the same TextMate engine that VS Code uses:
- **vscode-oniguruma**: Regex engine for pattern matching
- **vscode-textmate**: Grammar tokenization and scope assignment
- **Comprehensive Token Analysis**: Every token and its scopes are validated

This ensures our syntax highlighting works correctly in real editors. 