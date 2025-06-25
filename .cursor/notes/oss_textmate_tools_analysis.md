# Analysis of TextMate-related OSS Projects

This report analyzes `vscode-textmate`, `tmlanguage-generator`, and `vscode-tmgrammar-test` to determine their potential for improving our internal `@/tmGrammar` library and testing (`@scope.test.ts`).

### 1. `vscode-textmate`

*   **Purpose**: This is the actual TextMate grammar interpreter used in VS Code. It takes a grammar (in JSON or PLIST format) and tokenizes lines of text according to that grammar.
*   **Core Functionality**:
    *   Loads grammars (including handling `include` directives and repository references).
    *   Manages a registry of grammars.
    *   Provides a `tokenizeLine` (and `tokenizeLine2` for binary output) method that returns tokens with scope information based on the grammar rules and the state from the previous line.
    *   Handles oniguruma for regex matching.
    *   Supports theme matching to apply styles (though this is less relevant for improving `@/tmGrammar`'s generation capabilities).
*   **Relevance to `@/tmGrammar`**:
    *   `@/tmGrammar` is our library for *authoring* TextMate grammars in TypeScript, which then get compiled into a JSON/PLIST format.
    *   `vscode-textmate` is what *consumes* the output of `@/tmGrammar`.
    *   We are already using `vscode-textmate` (and `vscode-oniguruma`) in our `packages/language/test/scope.test.ts` for loading and testing our `rcl.tmLanguage.json` grammar.
    *   **Conclusion**: `vscode-textmate` is not a replacement for `@/tmGrammar`. It's a complementary tool, primarily for *using* or *testing* the grammars that `@/tmGrammar` helps create. We are already leveraging it for testing. No direct changes to `@/tmGrammar` itself are suggested by analyzing `vscode-textmate`.

### 2. `tmlanguage-generator`

*   **Purpose**: This library, as seen in `oss/typespec/packages/tmlanguage-generator/src/tmlanguage-generator.ts` and its examples (`bicep.ts`, `typespec/compiler/src/server/tmlanguage.ts`), provides helper functions and a structure for authoring TextMate grammars using TypeScript.
*   **Core Functionality**:
    *   Defines TypeScript types for grammar rules (`MatchRule`, `BeginEndRule`, `IncludeRule`, `Grammar`, `Captures`, etc.).
    *   Uses a `repository` pattern where rules are defined with unique `key` properties and then included using `#{key}`.
    *   Provides `emitJSON` and `emitPList` functions to convert the TypeScript grammar definition into standard TextMate formats.
    *   Includes regex validation using `onigasm` during the emission process.
    *   Uses a special `meta` symbol for scopes that are expanded to `meta.<key>.<grammar name>`.
*   **Comparison with `@/tmGrammar`**:
    *   Our `@/tmGrammar` (in `packages/language/src/tmGrammar/`) shares a very similar goal and approach:
        *   It defines types (`TMPattern`, `TMRule`, `TMGrammar`, etc. in `types.ts`).
        *   It has builder functions (`createComment`, `createString`, `createKeywords`, etc. in `builders.ts`).
        *   It uses a `repository` and `include` mechanism.
        *   It has utilities for regex (`terminals.ts`).
        *   Our `packages/language/scripts/build-tmlanguage.ts` is responsible for generating the final JSON/PLIST.
    *   **Key structural difference in pattern definition**: Our `@/tmGrammar` system for RCL (e.g., in `packages/language/syntaxes/rcl/variables.ts`) now defines `BASE_PATTERNS` (atomic regex strings), `KEYWORD_ALTERNATIONS`, `LITERAL_MARKERS`, and `COMPUTED_PATTERNS`. The `COMPUTED_PATTERNS` leverage native TypeScript template literals for composing more complex regex strings from the base parts (e.g., `proper_noun: `${BASE_PATTERNS.proper_word}(?:\s+${BASE_PATTERNS.proper_word})*`,`). This contrasts with the older approach that used placeholder substitution and is also different from how `tmlanguage-generator` examples might structure their reusable regex parts, though the goal of reusability is similar. We also introduced `PatternHelpers` for common regex operations.
    *   `tmlanguage-generator` seems a bit more streamlined in its direct rule-`key`-to-repository mechanism for includes.
    *   `tmlanguage-generator` explicitly uses `onigasm` for regex validation, which is a good practice we should ensure is robust in our build process.
*   **Relevance to `@/tmGrammar`**:
    *   **Abandon/Adopt**: We could potentially adopt `tmlanguage-generator`. This would mean refactoring our grammar definitions (like `packages/language/syntaxes/rcl/variables.ts` and the files that consume it) to use `tmlanguage-generator`'s types and conventions.
        *   **Pros**:
            *   Potentially a more mature or well-tested set of helper functions.
            *   Built-in regex validation during generation.
            *   Used by other OSS projects (Bicep, TypeSpec), implying some level of robustness.
        *   **Cons**:
            *   Requires refactoring effort.
            *   We might lose some custom utilities or specific architectural choices recently made in `@/tmGrammar` (like the `BASE_PATTERNS`, `COMPUTED_PATTERNS` structure and `PatternHelpers`).
    *   **Improve `@/tmGrammar`**: We could draw inspiration from `tmlanguage-generator`:
        *   Adopt its direct `key`-based include mechanism if it simplifies our current setup further.
        *   Ensure robust regex validation using `onigasm` or `vscode-oniguruma` in our build process.
        *   Compare its builder functions and type definitions to see if there are any patterns or helpers we find more convenient.
    *   The example `oss/bicep/src/textmate/src/bicep.ts` directly uses `tmlanguage-generator`, as does `oss/typespec/packages/compiler/src/server/tmlanguage.ts`. These serve as excellent, complex real-world examples of how to structure a grammar with `tmlanguage-generator`.
*   **Conclusion**:
    *   `tmlanguage-generator` is a direct alternative to our `@/tmGrammar` library.
    *   **Should we switch?** It depends on the effort vs. benefit. If `@/tmGrammar` (with its recent TypeScript-native pattern composition) is meeting our needs and is well-understood, perhaps just incorporating ideas like more explicit regex validation would be sufficient. If we find `tmlanguage-generator`'s structure and built-in validation compelling enough, and the refactoring effort is acceptable, switching could be beneficial.
    *   Analyzing the Bicep and TypeSpec examples will give you a good feel for `tmlanguage-generator`'s style.

### 3. `vscode-tmgrammar-test`

*   **Purpose**: As its `README.md` clearly states, this tool is for testing TextMate grammars using a VS Code-like engine. It allows you to write plaintext files with assertions about token scopes.
*   **How it works**:
    *   You write test files (e.g., `.test.scala` in their example) that contain code snippets.
    *   Special comment lines (`// <----- scope.name`) are used to assert the expected scopes for tokens on the line above or at specific character positions.
    *   It can run unit tests (checking explicit assertions) and snapshot tests (comparing current tokenization output to a stored snapshot).
    *   It uses `vscode-textmate` (and thus `vscode-oniguruma`) under the hood to perform the tokenization, as seen by its setup instructions that often involve `package.json` configurations pointing to grammar files.
*   **Dependencies for use with `@scope.test.ts`**:
    *   `vscode-tmgrammar-test` fundamentally relies on having a compiled TextMate grammar file (e.g., a `.tmLanguage.json` or `.tmLanguage.plist` file).
    *   Whether we generate this grammar file using our current `@/tmGrammar` library or switch to `tmlanguage-generator` is **irrelevant** to `vscode-tmgrammar-test`. It only cares about the final grammar artifact.
    *   Our current `@scope.test.ts` *also* uses `vscode-textmate` and `vscode-oniguruma` to load our `rcl.tmLanguage.json` and perform tokenization for testing.
    *   **Conclusion**:
        *   We **do not NEED** to use `vscode-textmate` (in terms of integrating its source code into our build, as we already use it as a dependency for testing) or `tmlanguage-generator` (as a replacement for `@/tmGrammar`) to be able to use `vscode-tmgrammar-test`.
        *   `vscode-tmgrammar-test` offers a different, potentially more declarative and "Sublime Text syntax tests" inspired way of writing our scope tests compared to our current programmatic approach in `@scope.test.ts`.
        *   Adopting `vscode-tmgrammar-test` would primarily involve changing *how we write our test cases*, not necessarily changing our grammar generation library. It could make writing and maintaining scope tests easier and more readable.

### Overall Recommendations:

1.  **`vscode-textmate`**: Continue using it as a dependency for our testing (as we do in `packages/language/test/scope.test.ts`). It's the de facto engine.
2.  **`tmlanguage-generator` vs. `@/tmGrammar`**:
    *   Evaluate `tmlanguage-generator`'s examples (`bicep.ts`, `typespec/compiler/src/server/tmlanguage.ts`) closely.
    *   If the benefits are significant and the migration effort for our RCL grammar definition is manageable, consider switching.
    *   If `@/tmGrammar` (with its recent TypeScript-native pattern composition) is working well, consider cherry-picking ideas:
        *   Definitely add/ensure **robust regex validation using `onigasm`** (or `vscode-oniguruma`) to our `build-tmlanguage.ts` script if it's not already there.
        *   Review `tmlanguage-generator`'s builder functions and types for any ergonomics we might want to adopt.
3.  **`vscode-tmgrammar-test` for `@scope.test.ts`**:
    *   This tool looks very promising for improving how we write and maintain scope tests. Its declarative assertion style within the test file itself can be much clearer.
    *   We can adopt `vscode-tmgrammar-test` **regardless** of whether we stick with `@/tmGrammar` or move to `tmlanguage-generator`.
    *   It would likely replace or significantly refactor our `packages/language/test/scope.test.ts`.

In essence:
*   Our `@/tmGrammar` lib and `tmlanguage-generator` solve the same problem: authoring grammars in TS.
*   `vscode-textmate` is the engine that runs these grammars.
*   `vscode-tmgrammar-test` is a test runner that uses `vscode-textmate` to test grammars, offering a potentially better way to write tests than our current `scope.test.ts`.

I'd prioritize investigating `vscode-tmgrammar-test` for our testing workflow, as it seems like a clear win. The decision between our `@/tmGrammar` and `tmlanguage-generator` is more about long-term maintainability and features of the grammar *authoring* experience. 