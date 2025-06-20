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

interface ContextModule {
  path: string;
  include: string;
  context: 'file' | 'section' | 'property' | 'flow' | 'global';
  priority: number;
}

/**
 * Configuration for hierarchical context-aware tmLanguage assembly
 */
const CONTEXT_MODULES: ContextModule[] = [
  // Context definitions (highest priority)
  { path: 'contexts/file-context.tmLanguage.json', include: '#file-level-patterns', context: 'file', priority: 1 },
  { path: 'contexts/section-context.tmLanguage.json', include: '#section-level-patterns', context: 'section', priority: 2 },
  { path: 'contexts/property-context.tmLanguage.json', include: '#property-level-patterns', context: 'property', priority: 3 },
  { path: 'contexts/flow-context.tmLanguage.json', include: '#flow-level-patterns', context: 'flow', priority: 4 },
  
  // Global patterns (available everywhere)
  { path: 'embedded/expressions.tmLanguage.json', include: '#expressions', context: 'global', priority: 5 },
  { path: 'data-types/primitives.tmLanguage.json', include: '#primitives', context: 'global', priority: 6 },
  { path: 'data-types/references.tmLanguage.json', include: '#references', context: 'global', priority: 7 },
  
  // Section-specific patterns
  { path: 'sections/agent-sections.tmLanguage.json', include: '#agent-sections', context: 'file', priority: 8 },
  { path: 'sections/flow-sections.tmLanguage.json', include: '#flow-sections', context: 'flow', priority: 9 },
  
  // Supporting patterns (lower priority)
  { path: 'data-types/collections.tmLanguage.json', include: '#collections', context: 'global', priority: 10 },
  { path: 'core/keywords.tmLanguage.json', include: '#keywords', context: 'global', priority: 11 },
  { path: 'core/identifiers.tmLanguage.json', include: '#identifiers', context: 'global', priority: 12 },
  { path: 'core/punctuation.tmLanguage.json', include: '#punctuation', context: 'global', priority: 13 },
];

// Legacy modules for backward compatibility
const LEGACY_MODULES = [
  { path: 'core/comments.tmLanguage.json', include: '#comments' },
  { path: 'core/properties.tmLanguage.json', include: '#properties' },
  { path: 'embedded/multiline-strings.tmLanguage.json', include: '#multiline-strings' },
];

/**
 * Enhance the base tmLanguage grammar with hierarchical context support
 */
export function enhanceTmLanguage(): void {
  const baseGrammarPath = path.join(__dirname, '../syntaxes/rcl.base.tmLanguage.json');
  const enhancedGrammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');

  if (!fs.existsSync(baseGrammarPath)) {
    throw new Error('Base tmLanguage not found. Run Langium generation first.');
  }

  const baseGrammar = JSON.parse(fs.readFileSync(baseGrammarPath, 'utf-8'));

  // Add embedded language patterns (moved from esbuild.mjs)
  const enhancedGrammar = addEmbeddedLanguageSupport(baseGrammar);

  // Add hierarchical context modules
  const finalGrammar = addHierarchicalContexts(enhancedGrammar);

  fs.writeFileSync(enhancedGrammarPath, JSON.stringify(finalGrammar, null, 2));
  console.log('✅ Enhanced context-aware tmLanguage generated at', enhancedGrammarPath);
}

/**
 * Add hierarchical context modules with proper pattern organization
 */
function addHierarchicalContexts(grammar: any): any {
  const syntaxesDir = path.join(__dirname, '../syntaxes');

  // Initialize repository if it doesn't exist
  grammar.repository = grammar.repository || {};
  
  // Set up file-level patterns as the main patterns
  grammar.patterns = [
    { include: "#file-level-patterns" }
  ];

  // Load and merge context modules
  const sortedModules = CONTEXT_MODULES.sort((a, b) => a.priority - b.priority);

  for (const module of sortedModules) {
    const modulePath = path.join(syntaxesDir, module.path);

    if (!fs.existsSync(modulePath)) {
      console.warn(`${getTime()}Warning: Context module not found at ${modulePath}, skipping.`);
      continue;
    }

    try {
      const moduleContent = fs.readFileSync(modulePath, 'utf-8');
      const moduleGrammar = JSON.parse(moduleContent);

      // Merge repository entries
      if (moduleGrammar.repository) {
        Object.assign(grammar.repository, moduleGrammar.repository);
      }

      console.log(`${getTime()}📦 Added context module: ${module.path} (${module.context} context)`);
    } catch (error) {
      console.warn(`${getTime()}Warning: Error loading context module ${module.path}:`, error);
    }
  }

  // Add legacy modules for backward compatibility
  for (const module of LEGACY_MODULES) {
    const modulePath = path.join(syntaxesDir, module.path);

    if (fs.existsSync(modulePath)) {
      try {
        const moduleContent = fs.readFileSync(modulePath, 'utf-8');
        const moduleGrammar = JSON.parse(moduleContent);

        if (moduleGrammar.repository) {
          Object.assign(grammar.repository, moduleGrammar.repository);
        }

        console.log(`${getTime()}📦 Added legacy module: ${module.path}`);
      } catch (error) {
        console.warn(`${getTime()}Warning: Error loading legacy module ${module.path}:`, error);
      }
    }
  }

  console.log(`${getTime()}🎯 Context-aware grammar assembly complete`);
  console.log(`${getTime()}📊 Repository contains ${Object.keys(grammar.repository).length} pattern definitions`);
  
  return grammar;
}

/**
 * Add embedded language support patterns (moved from packages/extension/esbuild.mjs)
 * This is preserved for compatibility and will be merged with the modular expressions
 */
function addEmbeddedLanguageSupport(grammar: any): any {
  // Add expressions patterns for embedded code
  const expressionsPattern = {
    patterns: [
      {
        name: "meta.embedded.inline.javascript.rcl",
        begin: "(\\$js>)\\s*",
        beginCaptures: {
          "1": { name: "keyword.control.embedded.marker.js.rcl" }
        },
        end: "(?=#)|$", // End at comment or end of line
        contentName: "source.js",
        patterns: [{ include: "source.js" }]
      },
      {
        name: "meta.embedded.inline.typescript.rcl",
        begin: "(\\$ts>)\\s*",
        beginCaptures: {
          "1": { name: "keyword.control.embedded.marker.ts.rcl" }
        },
        end: "(?=#)|$", // End at comment or end of line
        contentName: "source.ts",
        patterns: [{ include: "source.ts" }]
      },
      {
        name: "meta.embedded.inline.generic.rcl",
        begin: "(\\$>)\\s*",
        beginCaptures: {
          "1": { name: "keyword.control.embedded.marker.generic.rcl" }
        },
        end: "(?=#)|$", // End at comment or end of line
        contentName: "source.js",
        patterns: [{ include: "source.js" }]
      },
      {
        name: "meta.embedded.block.javascript.rcl",
        begin: "^(\\s*)(\\$js>>>)\\s*$",
        beginCaptures: {
          "2": { name: "keyword.control.embedded.marker.js.rcl" }
        },
        end: "^(?!\\1\\s+\\S)",
        contentName: "source.js",
        patterns: [
          {
            begin: "^(\\1\\s+)",
            end: "$",
            contentName: "source.js",
            patterns: [{ include: "source.js" }]
          }
        ]
      },
      {
        name: "meta.embedded.block.typescript.rcl",
        begin: "^(\\s*)(\\$ts>>>)\\s*$",
        beginCaptures: {
          "2": { name: "keyword.control.embedded.marker.ts.rcl" }
        },
        end: "^(?!\\1\\s+\\S)",
        contentName: "source.ts",
        patterns: [
          {
            begin: "^(\\1\\s+)",
            end: "$",
            contentName: "source.ts",
            patterns: [{ include: "source.ts" }]
          }
        ]
      },
      {
        name: "meta.embedded.block.generic.rcl",
        begin: "^(\\s*)(\\$>>>)\\s*$",
        beginCaptures: {
          "2": { name: "keyword.control.embedded.marker.generic.rcl" }
        },
        end: "^(?!\\1\\s+\\S)",
        contentName: "source.js",
        patterns: [
          {
            begin: "^(\\1\\s+)",
            end: "$",
            contentName: "source.js",
            patterns: [{ include: "source.js" }]
          }
        ]
      }
    ]
  };

  // Add patterns to the main grammar
  if (!grammar.repository) {
    grammar.repository = {};
  }
  
  grammar.repository.expressions = expressionsPattern;

  // Add expressions to main patterns if not already there
  if (!grammar.patterns.some((p: any) => p.include === "#expressions")) {
    grammar.patterns.unshift({ include: "#expressions" });
  }

  return grammar;
}

/**
 * Main execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceTmLanguage();
}