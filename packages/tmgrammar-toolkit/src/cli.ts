/**
 * This file is the entry point for the TextMate Toolkit CLI.
 * It has been refactored to delegate all command handling to the `src/cli` directory.
 * This modular approach improves maintainability and separation of concerns.
 *
 * To add a new command, create a file in `src/cli/commands` and export a function
 * that returns a `commander.Command` instance. Then, add it to the main `program`
 * in `src/cli/index.ts`.
 *
 * For more details, see the architecture documentation in `src/README.md`.
 */
import "./cli/index.js"; 