import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTime(): string {
  const date = new Date();
  const padZeroes = (i: number) => i.toString().padStart(2, "0");
  return `[${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}] `;
}

interface GrammarModule {
  path: string;
  include: string;
  priority: number;
}

/**
 * Configuration for modular tmLanguage assembly
 */
const GRAMMAR_MODULES: GrammarModule[] = [
  { path: 'core/comments.tmLanguage.json', include: '#comments', priority: 1 },
  { path: 'embedded/expressions.tmLanguage.json', include: '#expressions', priority: 2 },
  { path: 'embedded/multiline-strings.tmLanguage.json', include: '#multiline-strings', priority: 3 },
  { path: 'sections/agent-sections.tmLanguage.json', include: '#agent-sections', priority: 4 },
  { path: 'sections/flow-sections.tmLanguage.json', include: '#flow-sections', priority: 5 },
  { path: 'core/keywords.tmLanguage.json', include: '#keywords', priority: 6 },
  { path: 'core/identifiers.tmLanguage.json', include: '#identifiers', priority: 7 },
  { path: 'data-types/primitives.tmLanguage.json', include: '#primitives', priority: 8 },
  { path: 'data-types/collections.tmLanguage.json', include: '#collections', priority: 9 },
  { path: 'data-types/references.tmLanguage.json', include: '#references', priority: 10 },
  { path: 'core/punctuation.tmLanguage.json', include: '#punctuation', priority: 11 },
];

/**
 * Enhance the base tmLanguage grammar with embedded language support and semantic patterns
 */
export function enhanceTmLanguage(): void {
  const baseGrammarPath = path.join(__dirname, '../syntaxes/rcl.base.tmLanguage.json');
  const enhancedGrammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');

  try {
    if (!fs.existsSync(baseGrammarPath)) {
      console.warn(
        `${getTime()}Warning: Base tmLanguage file not found at ${baseGrammarPath}. Skipping enhancement.`
      );
      return;
    }

    const grammarContent = fs.readFileSync(baseGrammarPath, 'utf-8');
    const grammar = JSON.parse(grammarContent);

    // Add modular semantic components (includes embedded language support)
    const finalGrammar = addSemanticModules(grammar);

    fs.writeFileSync(enhancedGrammarPath, JSON.stringify(finalGrammar, null, 2));
    console.log(
      `${getTime()}✅ Enhanced tmLanguage generated successfully at ${enhancedGrammarPath}`
    );
  } catch (error) {
    console.error(`${getTime()}❌ Error enhancing tmLanguage grammar:`, error);
    throw error;
  }
}

/**
 * Add semantic modules to the grammar by loading and merging modular components
 */
function addSemanticModules(grammar: any): any {
  const syntaxesDir = path.join(__dirname, '../syntaxes');

  // Initialize repository if it doesn't exist
  grammar.repository = grammar.repository || {};
  
  // Clear existing patterns to prioritize our semantic patterns
  const originalPatterns = grammar.patterns || [];
  grammar.patterns = [];

  // Load and merge each module
  const sortedModules = GRAMMAR_MODULES.sort((a, b) => a.priority - b.priority);

  for (const module of sortedModules) {
    const modulePath = path.join(syntaxesDir, module.path);

    if (!fs.existsSync(modulePath)) {
      console.warn(`${getTime()}Warning: Module not found at ${modulePath}, skipping.`);
      continue;
    }

    try {
      const moduleContent = fs.readFileSync(modulePath, 'utf-8');
      const moduleGrammar = JSON.parse(moduleContent);

      // Merge repository entries
      if (moduleGrammar.repository) {
        Object.assign(grammar.repository, moduleGrammar.repository);
      }

      // Add main include to patterns if not already present
      const includePattern = { include: module.include };
      if (!grammar.patterns.some((p: any) =>
        p.include === module.include ||
        JSON.stringify(p) === JSON.stringify(includePattern)
      )) {
        grammar.patterns.push(includePattern);
      }

      console.log(`${getTime()}📦 Added module: ${module.path} (${module.include})`);
    } catch (error) {
      console.warn(`${getTime()}Warning: Error loading module ${module.path}:`, error);
    }
  }

  // Add back original patterns (with lower priority)
  for (const originalPattern of originalPatterns) {
    // Skip overly broad keyword patterns that conflict with our semantic patterns
    if (originalPattern.name === 'keyword.control.rcl' && 
        originalPattern.match && 
        originalPattern.match.includes('agent|')) {
      console.log(`${getTime()}⚠️  Skipping broad keyword pattern to prioritize semantic patterns`);
      continue;
    }
    
    // Add original pattern if not already present
    const patternExists = grammar.patterns.some((p: any) => 
      JSON.stringify(p) === JSON.stringify(originalPattern)
    );
    
    if (!patternExists) {
      grammar.patterns.push(originalPattern);
    }
  }

  return grammar;
}

/**
 * Add embedded language support patterns (moved from packages/extension/esbuild.mjs)
 * This is preserved for compatibility and will be merged with the modular expressions
 */
function addEmbeddedLanguageSupport(grammar: any): any {
  grammar.repository = grammar.repository || {};
  grammar.patterns = grammar.patterns || [];

  // Remove old individual includes if they exist from previous logic
  grammar.patterns = grammar.patterns.filter(
    (p: any) =>
      p.include !== "#embedded-javascript" &&
      p.include !== "#embedded-typescript"
  );

  // Define new repository entries for single-line expressions
  grammar.repository["embedded-js-singleline"] = {
    name: "meta.embedded.inline.javascript.rcl",
    begin: "(\\$js>)\\s*", // Captures $js> with optional following whitespace
    beginCaptures: { 1: { name: "keyword.control.embedded.marker.js.rcl" } },
    end: "$", // End of line
    contentName: "source.js", // Tells TextMate to treat content as JS
    patterns: [{ include: "source.js" }],
  };

  grammar.repository["embedded-ts-singleline"] = {
    name: "meta.embedded.inline.typescript.rcl",
    begin: "(\\$ts>)\\s*", // Captures $ts> with optional following whitespace
    beginCaptures: { 1: { name: "keyword.control.embedded.marker.ts.rcl" } },
    end: "$",
    contentName: "source.ts",
    patterns: [{ include: "source.ts" }],
  };

  grammar.repository["embedded-generic-singleline"] = {
    name: "meta.embedded.inline.generic.rcl",
    begin: "(\\$>)\\s*", // Captures $> with optional following whitespace
    beginCaptures: {
      1: { name: "keyword.control.embedded.marker.generic.rcl" },
    },
    end: "$",
    contentName: "source.js", // Default to JS syntax for generic expressions
    patterns: [{ include: "source.js" }],
  };

  // Define new repository entries for multi-line expressions (indentation-based)
  grammar.repository["embedded-js-multiline"] = {
    name: "meta.embedded.block.javascript.rcl",
    begin: "^(\\s*)(\\$js>>>)\\s*$", // Start of line, capture indentation and marker
    beginCaptures: {
      2: { name: "keyword.control.embedded.marker.js.rcl" },
    },
    end: "^(?!\\1\\s+\\S)", // End when we have a line that doesn't continue the indentation
    contentName: "source.js",
    patterns: [
      {
        // Match indented content lines
        begin: "^(\\1\\s+)", // Must maintain or increase indentation from the marker line
        end: "$",
        contentName: "source.js",
        patterns: [{ include: "source.js" }],
      },
    ],
  };

  grammar.repository["embedded-ts-multiline"] = {
    name: "meta.embedded.block.typescript.rcl",
    begin: "^(\\s*)(\\$ts>>>)\\s*$", // Start of line, capture indentation and marker
    beginCaptures: {
      2: { name: "keyword.control.embedded.marker.ts.rcl" },
    },
    end: "^(?!\\1\\s+\\S)", // End when we have a line that doesn't continue the indentation
    contentName: "source.ts",
    patterns: [
      {
        // Match indented content lines
        begin: "^(\\1\\s+)", // Must maintain or increase indentation from the marker line
        end: "$",
        contentName: "source.ts",
        patterns: [{ include: "source.ts" }],
      },
    ],
  };

  grammar.repository["embedded-generic-multiline"] = {
    name: "meta.embedded.block.generic.rcl",
    begin: "^(\\s*)(\\$>>>)\\s*$", // Start of line, capture indentation and marker
    beginCaptures: {
      2: { name: "keyword.control.embedded.marker.generic.rcl" },
    },
    end: "^(?!\\1\\s+\\S)", // End when we have a line that doesn't continue the indentation
    contentName: "source.js", // Default to JS syntax for generic expressions
    patterns: [
      {
        // Match indented content lines
        begin: "^(\\1\\s+)", // Must maintain or increase indentation from the marker line
        end: "$",
        contentName: "source.js",
        patterns: [{ include: "source.js" }],
      },
    ],
  };

  // Add embedded code patterns to main grammar
  grammar.repository["embedded-code"] = {
    patterns: [
      { include: "#embedded-js-multiline" },
      { include: "#embedded-ts-multiline" },
      { include: "#embedded-generic-multiline" },
      { include: "#embedded-js-singleline" },
      { include: "#embedded-ts-singleline" },
      { include: "#embedded-generic-singleline" },
    ],
  };

  // Add the main include to grammar patterns if not already present
  if (!grammar.patterns.some((p: any) => p.include === "#embedded-code")) {
    grammar.patterns.push({ include: "#embedded-code" });
  }

  return grammar;
}

/**
 * Main execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceTmLanguage();
}