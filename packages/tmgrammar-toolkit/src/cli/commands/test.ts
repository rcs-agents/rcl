import { Command } from "commander";
import { execSync } from "node:child_process";

export function createTestCommand(): Command {
  const testCommand = new Command("test")
    .description("Run grammar tests using vscode-tmgrammar-test")
    .argument(
      "<test-files>",
      'Glob pattern for test files (e.g., "tests/**/*.test.lang")',
    )
    .option("-g, --grammar <file>", "Path to grammar file")
    .option("-c, --config <file>", "Path to language configuration file")
    .option("--compact", "Display output in compact format")
    .action(
      (
        testFiles: string,
        options?: {
          grammar?: string;
          config?: string;
          compact?: boolean;
        },
      ) => {
        try {
          const args = [testFiles];

          if (options?.grammar) {
            args.push("-g", options.grammar);
          }

          if (options?.config) {
            args.push("-c", options.config);
          }

          if (options?.compact) {
            args.push("--compact");
          }

          execSync(`vscode-tmgrammar-test ${args.join(" ")}`, {
            stdio: "inherit",
          });
        } catch (error) {
          console.error("Test command failed");
          process.exit(1);
        }
      },
    );

  return testCommand;
} 