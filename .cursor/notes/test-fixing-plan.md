# RCL Language Test Fixes Plan

1.  **Fix Test Setup Issues:**
    *   [ ] Fix the `beforeEach is not defined` error in `tests/parser/specification-compliance.test.ts`.

2.  **Address TextMate Grammar and Scoping (`scope.test.ts`):**
    *   [ ] Examine `syntaxes/rcl.tmLanguage.json` and `src/grammar` files.
    *   [ ] Fix `agent declaration scopes correctly` test.
    *   [ ] Fix `agent with config section scopes correctly` test.
    *   [ ] Fix `properly separated subsections scope correctly` test.
    *   [ ] Fix `import statement scopes correctly` test.
    *   [ ] Fix `flow declarations and rules scope correctly` test.
    *   [ ] Fix remaining scoping tests.

3.  **Fix Parser and AST generation:**
    *   [ ] Investigate and fix parser errors shown in validation and performance tests.
    *   [ ] Focus on `parses large RCL files efficiently` test case.

4.  **Fix LSP Features (Hover & Completion):**
    *   [ ] Fix hover provider tests in `hover.test.ts`.
    *   [ ] Fix completion provider tests in `completion.test.ts`.

5.  **Final Validation:**
    *   [ ] Run all tests and ensure they pass. 