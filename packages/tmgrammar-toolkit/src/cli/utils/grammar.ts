import { resolve, extname } from "node:path";
import { pathToFileURL as convertPathToURL } from "node:url";
import { isBunAvailable, loadGrammarWithBun } from "./bun.js";
import type { GrammarInput, Grammar } from "../../types.js";

/**
 * Load grammar from JavaScript file using Node.js direct import
 */
async function loadGrammarWithNode(
  filePath: string,
  exportName?: string,
): Promise<GrammarInput> {
  const moduleUrl = convertPathToURL(filePath).toString();
  const module = await import(moduleUrl);

  const grammar = module[exportName || "default"] || module.default || module.grammar;

  if (!grammar) {
    const availableExports = Object.keys(module).filter((k) => k !== "default");
    throw new Error(
      `No grammar found in ${filePath}. Available exports: ${availableExports.join(
        ", ",
      )}`,
    );
  }

  // Handle Result<Grammar>, Grammar, and GrammarInput objects
  if (isResult(grammar)) {
    if (grammar._tag === 'Ok' && isProcessedGrammar(grammar.value)) {
      return grammar.value.grammar;
    }
    // Handle other Result cases or throw error for Error results
    throw new Error(`Grammar export contains an error result`);
  }
  
  if (isProcessedGrammar(grammar)) {
    return grammar.grammar;
  }

  return grammar;
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

/**
 * Load and validate a grammar from a TypeScript or JavaScript file
 */
export async function loadGrammarFromFile(
  filePath: string,
  exportName?: string,
): Promise<GrammarInput> {
  const resolvedPath = resolve(filePath);
  const ext = extname(resolvedPath);

  // Validate file extension
  if (![".ts", ".js", ".mts", ".mjs"].includes(ext)) {
    throw new Error(
      `Unsupported file type: ${ext}. Expected .ts, .js, .mts, or .mjs`,
    );
  }

  let grammar: GrammarInput;

  try {
    if ([".ts", ".mts"].includes(ext)) {
      // TypeScript: Require Bun
      if (!(await isBunAvailable())) {
        throw new Error(
          "Bun is required for TypeScript file support.\n" +
            "Install Bun: https://bun.sh/docs/installation\n" +
            "Or convert your grammar to JavaScript.",
        );
      }
      grammar = await loadGrammarWithBun(resolvedPath, exportName);
    } else {
      // JavaScript: Use Node.js direct import
      grammar = await loadGrammarWithNode(resolvedPath, exportName);
    }

    return grammar;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load grammar from ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to restore RegExp objects from serialized format
 */
export function restoreRegexObjects(obj: any): any {
  if (obj && typeof obj === "object") {
    if (obj.__regex) {
      return new RegExp(obj.__regex);
    }
    if (Array.isArray(obj)) {
      return obj.map(restoreRegexObjects);
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = restoreRegexObjects(value);
    }
    return result;
  }
  return obj;
} 