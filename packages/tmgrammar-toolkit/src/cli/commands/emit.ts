import { Command } from "commander";
import { writeFile as writeFileAsync } from "node:fs/promises";
import { emitJSON, emitPList, emitYAML } from "../../emit.js";
import { loadGrammarFromFile } from "../utils/grammar.js";
import { processGrammar } from "../../validation/grammar.js";
import { isError } from "../../result.js";

export function createEmitCommand(): Command {
  const emitCommand = new Command("emit")
    .description("Emit a TextMate grammar from a TypeScript file")
    .argument("<ts-file>", "Path to TypeScript file containing grammar")
    .argument(
      '[export-name]',
      'Name of export (defaults to "default" then "grammar")',
    )
    .option("-o, --output <file>", "Output file path (defaults to stdout)")
    .option("--json", "Emit JSON format (default)")
    .option("--plist", "Emit PList XML format")
    .option("--yaml", "Emit YAML format")
    .option("--all", "Emit all formats")
    .action(
      async (
        tsFile: string,
        exportName?: string,
        options?: {
          output?: string;
          json?: boolean;
          plist?: boolean;
          yaml?: boolean;
          all?: boolean;
        },
      ) => {
        try {
          // Load and validate grammar
          const grammarInput = await loadGrammarFromFile(tsFile, exportName);
          const processResult = processGrammar(grammarInput, tsFile);

          if (isError(processResult)) {
            const errorMessage = processResult.error instanceof Error && 'getFormattedMessage' in processResult.error
              ? (processResult.error as any).getFormattedMessage()
              : processResult.error.message || String(processResult.error);
            console.error("❌ Grammar validation failed:");
            console.error(errorMessage);
            process.exit(1);
          }

          const processedGrammar = processResult.value;

          // Determine output formats
          const formats: Array<{ name: string; extension: string; emitter: typeof emitJSON }> = [];
          
          if (options?.all) {
            formats.push(
              { name: 'JSON', extension: '.tmLanguage.json', emitter: emitJSON },
              { name: 'PList', extension: '.tmLanguage', emitter: emitPList },
              { name: 'YAML', extension: '.tmLanguage.yaml', emitter: emitYAML }
            );
          } else {
            // Default to JSON if no format specified
            if (!options?.json && !options?.plist && !options?.yaml) {
              options = { ...options, json: true };
            }
            
            if (options?.json) {
              formats.push({ name: 'JSON', extension: '.tmLanguage.json', emitter: emitJSON });
            }
            if (options?.plist) {
              formats.push({ name: 'PList', extension: '.tmLanguage', emitter: emitPList });
            }
            if (options?.yaml) {
              formats.push({ name: 'YAML', extension: '.tmLanguage.yaml', emitter: emitYAML });
            }
          }

          // Emit each format
          for (const format of formats) {
            const emitResult = await format.emitter(processedGrammar);
            
            if (isError(emitResult)) {
              console.error(`❌ Failed to emit ${format.name} format: ${emitResult.error}`);
              process.exit(1);
            }

            const output = emitResult.value;

            // Determine output file path
            let outputPath: string | undefined;
            if (options?.output) {
              if (formats.length === 1) {
                outputPath = options.output;
              } else {
                // Multiple formats - append extension
                const baseName = options.output.replace(/\.[^.]*$/, '');
                outputPath = baseName + format.extension;
              }
            }

            // Output to file or stdout
            if (outputPath) {
              await writeFileAsync(outputPath, output, "utf-8");
              console.log(`✅ ${format.name} grammar written to ${outputPath}`);
            } else {
              if (formats.length > 1) {
                console.log(`\n--- ${format.name} ---`);
              }
              console.log(output);
            }
          }
        } catch (error) {
          console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error),
          );
          process.exit(1);
        }
      },
    );

  return emitCommand;
} 