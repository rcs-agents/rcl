import { execSync } from "node:child_process";
import { restoreRegexObjects } from "./grammar.js";
import type { GrammarInput, Grammar } from "../../types.js";

/**
 * Checks if Bun runtime is available on the system.
 * Bun provides seamless TypeScript execution without build steps.
 *
 * @returns Promise resolving to true if Bun is available, false otherwise
 * @internal
 */
export async function isBunAvailable(): Promise<boolean> {
  try {
    execSync("bun --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads a grammar from a TypeScript file using Bun's runtime.
 * Supports named exports, default exports, and 'grammar' exports.
 *
 * @param filePath - Path to the TypeScript file containing the grammar
 * @param exportName - Optional specific export name to use
 * @returns Promise resolving to the loaded grammar
 * @throws {Error} If the file cannot be loaded or no grammar export is found
 * @internal
 */
export async function loadGrammarWithBun(
  filePath: string,
  exportName?: string,
): Promise<GrammarInput> {
  const escapedPath = filePath.replace(/'/g, "\\'");
  const exportToTry = exportName || "default";

  const script = `
    import { pathToFileURL } from 'node:url';
    try {
      const module = await import(pathToFileURL('${escapedPath}').toString());
      const exportToTry = '${exportToTry}';
      const grammar = module[exportToTry] || module.default || module.grammar;
      
      if (!grammar) {
        const availableExports = Object.keys(module).filter(k => k !== 'default');
        console.error('Error: No grammar found. Available exports: ' + availableExports.join(', '));
        process.exit(1);
      }
      
      console.log(JSON.stringify(grammar, (key, value) => 
        value instanceof RegExp ? { __regex: value.source } : value
      ));
    } catch (error) {
      console.error('Error loading grammar:', error.message);
      process.exit(1);
    }
  `;

  try {
    const result = execSync(`bun -e "${script}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "inherit"],
    });
    const parsed = JSON.parse(result);
    const restoredGrammar = restoreRegexObjects(parsed);
    
    // Handle Result<Grammar>, Grammar, and GrammarInput objects
    if (isResult(restoredGrammar)) {
      if (restoredGrammar._tag === 'Ok' && isProcessedGrammar(restoredGrammar.value)) {
        return restoredGrammar.value.grammar;
      }
      // Handle other Result cases or throw error for Error results
      throw new Error(`Grammar export contains an error result`);
    }
    
    if (isProcessedGrammar(restoredGrammar)) {
      return restoredGrammar.grammar;
    }
    
    return restoredGrammar;
  } catch (error) {
    throw new Error(
      `Failed to load grammar with Bun: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Type guard to check if an object is a Result type
 */
function isResult(obj: any): boolean {
  return obj && typeof obj === 'object' && 
         typeof obj._tag === 'string' && 
         (obj._tag === 'Ok' || obj._tag === 'Error');
}

/**
 * Type guard to check if an object is a processed Grammar
 */
function isProcessedGrammar(obj: any): obj is Grammar {
  return obj && typeof obj === 'object' && 
         typeof obj.isValid === 'boolean' && 
         obj.grammar && 
         Array.isArray(obj.errors);
} 