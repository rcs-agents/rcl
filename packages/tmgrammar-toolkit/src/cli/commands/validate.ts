import { Command } from "commander";
import { processGrammar } from "../../validation/grammar.js";
import { loadGrammarFromFile } from "../utils/grammar.js";
import { readJson } from "../../utils/file.js";
import { isOk } from "../../result.js";

export function createValidateCommand(): Command {
  const validateCommand = new Command("validate")
    .description("Validate a grammar file or TypeScript export")
    .argument(
      "<file>",
      "Path to grammar file (.tmLanguage.json) or TypeScript file",
    )
    .argument("[export-name]", "Export name for TypeScript files")
    .action(async (file: string, exportName?: string) => {
      try {
        let grammarToValidate: any;

        if (file.endsWith(".json")) {
          // Load JSON grammar file
          grammarToValidate = await readJson(file);
        } else {
          // Load from TypeScript file
          grammarToValidate = await loadGrammarFromFile(file, exportName);
        }

        const result = processGrammar(grammarToValidate, file);

        if (isOk(result)) {
          const grammar = result.value;
          console.log("✅ Grammar is valid");
          console.log(`   - Repository items: ${Object.keys(grammar.repository).length}`);
          
          // Show warnings if any
          const warnings = grammar.errors.filter(e => e.severity === 'warning');
          if (warnings.length > 0) {
            console.log("\nWarnings:");
            for (const warning of warnings) {
              const message = 'getFormattedMessage' in warning
                ? (warning as any).getFormattedMessage()
                : warning.message;
              console.log(`  ⚠️  ${message}`);
            }
          }
        } else {
          console.log("❌ Grammar validation failed");
          const message = 'getFormattedMessage' in result.error
            ? (result.error as any).getFormattedMessage()
            : result.error.message || String(result.error);
          console.log(`\nError: ${message}`);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "Validation failed:",
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    });

  return validateCommand;
} 