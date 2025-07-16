import { Command } from "commander";
import { execSync } from "node:child_process";

export function createSnapCommand(): Command {
  const snapCommand = new Command("snap")
    .description("Run grammar snapshot tests using vscode-tmgrammar-snap")
    .argument("<test-files>", "Glob pattern for test files")
    .option("-g, --grammar <file>", "Path to grammar file")
    .option("-c, --config <file>", "Path to language configuration file")
    .option("-u, --update", "Update snapshot files")
    .option("--expand-diff", "Expand diff output")
    .option("--print-not-modified", "Include not modified scopes in output")
    .action(
      (
        testFiles: string,
        options?: {
          grammar?: string;
          config?: string;
          update?: boolean;
          expandDiff?: boolean;
          printNotModified?: boolean;
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

          if (options?.update) {
            args.push("-u");
          }

          if (options?.expandDiff) {
            args.push("--expand-diff");
          }

          if (options?.printNotModified) {
            args.push("--print-not-modified");
          }

          execSync(`vscode-tmgrammar-snap ${args.join(" ")}`, {
            stdio: "inherit",
          });
        } catch (error) {
          console.error("Snapshot command failed");
          process.exit(1);
        }
      },
    );

  return snapCommand;
} 