# TMGrammar Toolkit - Documentation Gaps

This note outlines features and concepts in `tmgrammar-toolkit` that are either undocumented or under-documented in the `/docs` directory.

### Core Concepts & Emission (`emit.ts`, `factory.ts`)

-   **Automatic Repository Management**: The mechanism where rules with a `key` property are automatically collected and placed into the grammar's `repository` during emission is not documented. This is a major authoring convenience that users should be aware of.
-   **`repositoryItems` Property**: The `repositoryItems` array in the `createGrammar` options, used to explicitly declare all repository rules for reliable processing, is not documented.
-   **The `meta` Symbol**: The special `meta` symbol, which gets expanded to `meta.<rule_key>.<grammar_name>`, is a powerful feature for creating structural scopes without boilerplate. It is not mentioned in the documentation.

### API Reference (`docs/api-reference.md`)

The API reference needs several updates to align with the current implementation:

-   **Regex Helpers (`helpers/regex.ts`)**:
    -   The documentation should clarify that all helper functions now return validated `RegExp` objects, not raw strings.
    -   The `concat` helper (and its alias `r`) is missing from the API list.

-   **Terminal Patterns (`terminals/`)**:
    -   The `api-reference.md` is missing patterns from `terminals/chars.ts` (`DOT`) and `terminals/markers.ts` (`WB`, `EOL`, `BOL`).

-   **Testing API (`testing/`)**:
    -   The function names are incorrect. The docs list `runDeclarativeTests` and `runSnapshotTests`, but the implementation exports `declarativeTest` and `snapshot`.
    -   The **Programmatic Testing API** is significantly under-documented. The `ProgrammaticTester` class, its constructor functions (`createTesterFromFile`, `createTesterFromContent`), and its methods (`tokenize`, `findToken`, `expectTokenScope`, etc.) should be properly documented.

-   **Validation API (`validation/`)**:
    -   The documentation is very brief. It should be expanded to explain *what* each function validates. For instance, it should mention that `validateRegex` uses the same Oniguruma engine as VS Code, providing highly accurate validation.

-   **CLI (`cli.ts`)**:
    -   The `tmt validate` command documentation is incomplete. It should mention that it can validate a specific named export from a TypeScript file, not just a file path.
    -   The CLI's seamless integration with `bun` to handle TypeScript files on-the-fly is a key feature that should be highlighted in the docs.

### General Documentation

-   **Bun Integration**: While mentioned in `cli.ts`, the developer experience improvement of using `bun` to directly work with `.ts` grammar files without a separate build step is a major selling point and is not prominently featured in the `getting-started.md` or `modules-overview.md`. 