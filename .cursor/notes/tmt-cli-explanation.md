# TextMate Toolkit (`tmt`) CLI - Detailed Explanation

This document provides a detailed explanation of how the `tmt` (TextMate Toolkit) Command Line Interface works. The CLI is designed to be a unified toolkit for authoring, testing, and validating TextMate grammars, primarily when working with TypeScript for grammar definition.

## Overall Purpose

The `tmt` CLI aims to simplify the lifecycle of TextMate grammar development by:

1.  Allowing grammars to be defined in TypeScript, offering better type safety and modularity.
2.  Providing a mechanism to `emit` these TypeScript-defined grammars into the standard JSON TextMate format (`.tmLanguage.json`).
3.  Integrating with existing TextMate testing tools (`vscode-tmgrammar-test` and `vscode-tmgrammar-snap`) through simple wrapper commands.
4.  Offering a `validate` command to check the structural integrity of grammars, whether they are in JSON format or defined in TypeScript.

## CLI Commands

The CLI is invoked via the `tmt` command (or `bun run cli` during development within the package).

### 1. `tmt emit <ts-file> [export-name] [-o <output-file>]`

This is the core command for converting a grammar defined in a TypeScript (or JavaScript) file into a standard TextMate JSON grammar file.

**Arguments & Options:**

*   `<ts-file>`: (Required) Path to the TypeScript (e.g., `.ts`, `.mts`) or JavaScript (e.g., `.js`, `.mjs`) file containing the grammar definition.
*   `[export-name]`: (Optional) The specific named export from the file that contains the grammar object. If not provided, the CLI first looks for a `default` export, and then for an export named `grammar`.
*   `-o, --output <output-file>`: (Optional) Path to write the output JSON grammar. If not provided, the JSON is printed to standard output.

**Internal Workflow for `.ts` / `.mts` files:**

1.  **Resolution**: The user-provided `<ts-file>` path is resolved to an absolute path.
2.  **Extractor Script Preparation**:
    *   The CLI reads the content of a template script: `packages/tmgrammar-toolkit/src/grammar-extractor-template.js`.
    *   This template script is a vanilla JavaScript module designed to import another module, extract a specific export, and serialize it to JSON (handling `RegExp` objects specially).
    *   Placeholders in the template (`%%TARGET_MODULE_PATH%%`, `%%EXPORT_TO_LOAD%%`, `%%FALLBACK_EXPORT%%`) are replaced with runtime values derived from the user's input (`resolvedPath`, `exportToLoad`, `fallbackExportString`). The `resolvedPath` is escaped to ensure it's a valid string literal within the script.
3.  **Temporary Script Creation**:
    *   The processed script content (now plain JavaScript with the actual paths and export names embedded) is written to a temporary `.js` file in the system's temporary directory (e.g., `/tmp/tm-grammar-extractor-12345.js`).
4.  **Execution Environment Check & Command Construction**:
    *   The CLI checks if `bun` is available (`isBunAvailable()` by trying to run `bun --version`).
    *   If `bun` is available, the command is set to `bun run <temporary-script.js>`.
    *   If `bun` is not available, it checks the Node.js version (`getNodeVersion()`).
        *   If Node.js version is >= 14 (which has good ESM support for `.js` files), the command is set to `node <temporary-script.js>`.
        *   If neither `bun` nor a suitable Node.js version is found, an error is thrown, and the CLI exits.
5.  **Script Execution**:
    *   The constructed command is executed using `child_process.execSync()`.
    *   The temporary script (`grammar-extractor-template.js` with placeholders filled) does the following:
        *   Dynamically imports the user's target grammar module (e.g., `examples/cli-test-grammar.ts`) using `import(pathToFileURL(targetModulePath).toString())`.
        *   Retrieves the specified export (`exportToLoad` or the fallback).
        *   If the export is not found, it prints an error to `stderr` and exits.
        *   It then uses `JSON.stringify(target, replacer)` where `replacer` is a function that converts any `RegExp` instance into an object like `{ __regex: "your-regex-source" }`. This ensures RegExp source strings are preserved across the process boundary.
        *   The resulting JSON string is printed to `stdout` by the temporary script.
6.  **Result Processing**:
    *   The main CLI process captures the `stdout` from `execSync`, which contains the JSON string.
    *   It parses this JSON string using `JSON.parse()`.
    *   A `restoreRegex()` helper function traverses the parsed object and converts any `{ __regex: "..." }` objects back into actual `RegExp` instances.
7.  **Temporary File Cleanup**: The temporary script file is deleted in a `finally` block.
8.  **Validation**: The resulting grammar object (now with actual `RegExp` instances) is validated using `validateGrammar()`.
9.  **Final Emission**: The validated grammar object is passed to `emitJSON()` from `./emit.js`. This function processes the grammar (e.g., converts `RegExp` instances to their `.source` strings for the final TextMate JSON, handles repository creation) and returns the final TextMate grammar as a JSON string.
10. **Output**: The final JSON string is written to the specified output file or printed to `stdout`.

**Internal Workflow for `.js` / `.mjs` files:**

1.  **Direct Import**: The CLI attempts to dynamically import the JavaScript file directly using `await import(pathToFileURL(resolvedPath).toString())`.
2.  **Export Retrieval**: It looks for `exportName`, `default`, or `grammar` exports, similar to the TypeScript path.
3.  **Serialization**: The retrieved grammar object is serialized using `JSON.stringify(grammar, jsonReplacer)`, where `jsonReplacer` handles `RegExp` instances by converting them to `{ __regex: "..." }`.
4.  The rest of the process (JSON parsing, `restoreRegex`, validation, `emitJSON`, output) is the same as for TypeScript files from step 6 onwards (though `restoreRegex` will act on the already processed object).

### 2. `tmt test <test-files> [options]`

This command is a direct wrapper around the `vscode-tmgrammar-test` executable.

**Arguments & Options:**

*   `<test-files>`: Glob pattern for test files (e.g., `"tests/**/*.test.lang"`).
*   `-g, --grammar <file>`: Path to the grammar file (usually a `.tmLanguage.json` file).
*   `-c, --config <file>`: Path to a language configuration file (optional).
*   `--compact`: Display output in compact format.

**Internal Workflow:**

1.  The CLI constructs the command string `vscode-tmgrammar-test <test-files> [options...]` by appending the provided arguments and options.
2.  It executes this command using `child_process.execSync()`, with `stdio: 'inherit'` so the output from `vscode-tmgrammar-test` is directly displayed.
3.  If `vscode-tmgrammar-test` exits with an error, the `tmt` command also exits with an error.

### 3. `tmt snap <test-files> [options]`

This command is a direct wrapper around the `vscode-tmgrammar-snap` executable.

**Arguments & Options:**

*   `<test-files>`: Glob pattern for test files.
*   `-g, --grammar <file>`: Path to the grammar file.
*   `-c, --config <file>`: Path to a language configuration file (optional).
*   `-u, --update`: Update snapshot files.
*   `--expand-diff`: Expand diff output.
*   `--print-not-modified`: Include not modified scopes in output.

**Internal Workflow:**

1.  Similar to `tmt test`, this command constructs the command string `vscode-tmgrammar-snap <test-files> [options...]`.
2.  It executes this command using `child_process.execSync()` with `stdio: 'inherit'`.
3.  Handles errors from the underlying `vscode-tmgrammar-snap` process.

### 4. `tmt validate <file> [export-name]`

This command validates a grammar, which can either be a pre-built JSON TextMate grammar file or a grammar defined in a TypeScript/JavaScript file.

**Arguments & Options:**

*   `<file>`: Path to the grammar file. This can be a `.tmLanguage.json` file or a `.ts`/`.js` file defining the grammar.
*   `[export-name]`: (Optional) If `<file>` is a TypeScript/JavaScript file, this specifies the named export containing the grammar object (defaults to `default` then `grammar`).

**Internal Workflow:**

1.  **File Type Check**: Determines if the input file is a `.json` file or a script file (`.ts`, `.js`, etc.).
2.  **Grammar Loading**:
    *   If it's a `.json` file, it reads the file and parses it as JSON (using a utility like `readJson` from `./utils/file.js`).
    *   If it's a script file, it uses the `loadGrammarFromFile(file, exportName)` function (described in detail under the `emit` command) to obtain the grammar object. This involves the same temporary script execution mechanism for TypeScript files.
3.  **Validation**: The obtained grammar object is passed to `validateGrammar()` from `./validation/grammar.js`. This function checks for structural issues, valid regexes (using `onigasm`), and other TextMate grammar conventions.
4.  **Output**: 
    *   Prints `✅ Grammar is valid` if no errors are found.
    *   Prints any warnings (e.g., `⚠️ Warning message`).
    *   If errors are found, it prints `❌ Grammar is invalid` followed by a list of errors (e.g., `❌ Error message`) and exits with a non-zero status code.

## Key Internal Mechanisms

*   **`loadGrammarFromFile(filePath, exportName)`**: This is the central function for obtaining a live grammar object from a source file. Its complex logic for handling TypeScript via an external template script is crucial.
*   **`grammar-extractor-template.js`**: An external JavaScript file that acts as a template. It's read, its placeholders are replaced, and it's then executed in a separate process (`bun` or `node`) to safely import and serialize the user's grammar from a TypeScript file.
*   **`JSON.stringify` with Replacer & `restoreRegex`**: To pass `RegExp` objects from the sub-process (running the extractor script) to the main CLI process, `RegExp`s are serialized into `{ __regex: "source" }` objects. The `restoreRegex` function then converts these back into `RegExp` instances in the main process.
*   **`isBunAvailable()` & `getNodeVersion()`**: These helpers determine the appropriate runtime environment (`bun` or `node`) for executing the extractor script.
*   **Temporary File Management**: The `emit` command (when processing TypeScript) creates a temporary script file in the OS's temp directory and ensures it's cleaned up using `fs.unlink` in a `finally` block.
*   **`emitJSON(grammar)`**: This function (from `./emit.js`) takes the live grammar object (with `RegExp` instances) and processes it into the final TextMate JSON string format. This includes converting `RegExp`s to their source strings and building the `repository`.
*   **`validateGrammar(grammar)`**: This function (from `./validation/grammar.js`) performs structural and regex validation on the live grammar object.

This separation of concerns (especially the external script for TypeScript processing) makes the CLI more robust and the main `cli.ts` code easier to manage. 