/**
 * Grammar processing and emit functions
 * Handles validation, repository management, and output generation
 */

import { readFile } from "node:fs/promises";
import { loadWASM, OnigRegExp } from "onigasm";
import { dirname, resolve } from "node:path";
import * as plist from "plist";
import type { Grammar, Rule, EmitOptions, MatchRule, BeginEndRule, IncludeRule, BasicIncludePattern } from './types.js';
import { meta } from './types.js';

let initialized = false;
async function initialize() {
  if (!initialized) {
    const onigasmPath = import.meta.resolve("onigasm");
    const wasmPath = resolve(dirname(new URL(onigasmPath).pathname), "onigasm.wasm");
    const wasm = await readFile(wasmPath);
    await loadWASM(wasm.buffer as any);
    initialized = true;
  }
}

/**
 * Emit the given grammar to JSON.
 */
export async function emitJSON(grammar: Grammar, options: EmitOptions = {}): Promise<string> {
  await initialize();
  const indent = 2;
  const processed = await processGrammar(grammar, options);
  return JSON.stringify(processed, undefined, indent);
}

/**
 * Emit the given grammar to PList XML
 */
export async function emitPList(grammar: Grammar, options: EmitOptions = {}): Promise<string> {
  await initialize();
  const processed = await processGrammar(grammar, options);
  return plist.build(processed);
}

/**
 * Convert the grammar from our representation to the tmlanguage schema.
 * Perform validation in the process.
 */
async function processGrammar(grammar: Grammar, options: EmitOptions): Promise<any> {
  await initialize();

  const internalRepositoryMap = new Map<string, [Rule, any]>(); // Maps rule key to [originalRule, processedRuleDefinition]
  const grammarNameLower = grammar.name.toLowerCase();

  // 1. Pre-populate and process all rules from repositoryItems
  if (grammar.repositoryItems) {
    for (const rule of grammar.repositoryItems) {
      if ('key' in rule) { // Only rules with keys can be in the repository
        const keyedRule = rule as MatchRule | BeginEndRule | IncludeRule;
        if (!internalRepositoryMap.has(keyedRule.key)) {
          const entry: [Rule, any] = [keyedRule, undefined]; // Placeholder for cyclic dependencies
          internalRepositoryMap.set(keyedRule.key, entry);
          // Process the rule definition itself and store it in entry[1]
          entry[1] = processNode(keyedRule, options, grammarNameLower, internalRepositoryMap, true);
        } else {
          const existingEntry = internalRepositoryMap.get(keyedRule.key);
          if (existingEntry && existingEntry[0] !== keyedRule) {
            throw new Error(
              `Duplicate key found in repositoryItems: '${keyedRule.key}'. \nThe same key is used for different rule objects.`);
          }
        }
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      'Warning: grammar.repositoryItems not provided. Repository discovery will be on-the-fly, which might be incomplete for complex grammars. ' +
      'It is recommended to list all keyed rules in repositoryItems for reliable repository generation.'
    );
  }

  // 2. Process the main grammar structure. processNode for the grammar object will handle its top-level fields
  // and its 'patterns' array. The 'repositoryItems' field itself will be skipped during this processing.
  const outputGrammarStructure = processNode(grammar, options, grammarNameLower, internalRepositoryMap, false);

  // 3. Construct the final repository object for the output from our populated internalRepositoryMap
  const finalRepositoryObject: any = {};
  const sortedKeys = Array.from(internalRepositoryMap.keys()).sort(); // For consistent output
  for (const key of sortedKeys) {
    const entry = internalRepositoryMap.get(key);
    if (entry && entry[1] !== undefined) { // entry[1] holds the processed rule definition
      finalRepositoryObject[key] = entry[1];
    }
  }
  outputGrammarStructure.repository = finalRepositoryObject;

  return outputGrammarStructure;
}

// Added internalRepo parameter, and isProcessingRepositoryItem flag
function processNode(
  node: any, 
  options: EmitOptions, 
  grammarName: string, 
  currentRepository: Map<string, [Rule, any]>, 
  isRepositoryItemContext: boolean
): any {
  if (typeof node !== 'object' || node === null) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((n) => processNode(n, options, grammarName, currentRepository, isRepositoryItemContext));
  }

  const outputNode: any = {};
  for (const originalKey in node) {
    const value = node[originalKey];
    let processedValue = value;

    switch (originalKey) {
      case "key": // Drop 'key' from the output of individual rule definitions
        if (!isRepositoryItemContext) { // Keep key if it's part of a structure not meant for repo (e.g. captures)
            outputNode[originalKey] = value;
        }
        break;
      case "repositoryItems": // Always drop 'repositoryItems' from the main grammar output
        break;
      case "scope": {
        const ruleKeyForMeta = node.key || 'unknown'; 
        outputNode.name = value === meta
          ? `meta.${ruleKeyForMeta}.${grammarName}`
          : String(value);
        break;
      }
      case "begin":
      case "end":
      case "match":
      case "while":
      case "firstLineMatch":
      case "foldingStartMarker":
      case "foldingStopMarker":
        if (value instanceof RegExp) {
          processedValue = value.source;
        }
        validateRegexp(processedValue, node, originalKey, options);
        outputNode[originalKey] = processedValue;
        break;
      case "patterns":
        outputNode[originalKey] = processPatterns(value, options, grammarName, currentRepository);
        break;
      default:
        outputNode[originalKey] = processNode(value, options, grammarName, currentRepository, false); // Children are not repo items context by default
        break;
    }
  }
  return outputNode;
}

function processPatterns(
  rules: Rule[], 
  options: EmitOptions, 
  grammarName: string, 
  currentRepository: Map<string, [Rule, any]>
): any[] {
  const processedPatternsArray: any[] = [];
  for (const rule of rules) {
    if ('include' in rule && !('key' in rule)) { // BasicIncludePattern like { include: "#foo" }
      processedPatternsArray.push(rule); 
      continue;
    }

    const keyedRule = rule as MatchRule | BeginEndRule | IncludeRule;

    if (!keyedRule.key) {
      // eslint-disable-next-line no-console
      console.warn('Processing a rule without a key directly in patterns (will be inlined):科研', rule);
      processedPatternsArray.push(processNode(rule, options, grammarName, currentRepository, false));
      continue;
    }

    // Rule has a key. It should be part of the repository.
    if (!currentRepository.has(keyedRule.key)) {
      // This implies the rule was in a 'patterns' array, had a key, but was NOT in grammar.repositoryItems.
      // Process it now and add to repository (fallback if repositoryItems is not used or is incomplete).
      // eslint-disable-next-line no-console
      console.warn(
        `Rule with key '${keyedRule.key}' was encountered in a 'patterns' array but not pre-processed via 'repositoryItems'.
    Processing it now for the repository.`
      );
      const entry: [Rule, any] = [keyedRule, undefined]; 
      currentRepository.set(keyedRule.key, entry);
      entry[1] = processNode(keyedRule, options, grammarName, currentRepository, true); // Process as if it were a repo item
    } else {
      const existingEntry = currentRepository.get(keyedRule.key);
      if (existingEntry && existingEntry[0] !== keyedRule) {
          // Check if they are structurally equivalent (same content, different object instances)
          const existingRule = existingEntry[0];
          const rulesAreEquivalent = JSON.stringify(existingRule) === JSON.stringify(keyedRule);
          
          if (!rulesAreEquivalent) {
            throw new Error(`Key collision: The key '${keyedRule.key}' is used for different rule objects. One in 'repositoryItems' (or processed earlier) and another encountered in a 'patterns' array.`);
          }
          // If they are structurally equivalent, we can safely ignore this - it's the same rule definition
      }
      // If it's the same rule object or equivalent rule, we don't need to do anything - it's already in the repository
    }
    processedPatternsArray.push({ include: `#${keyedRule.key}` });
  }
  return processedPatternsArray;
}

// processRepository is no longer needed as finalRepositoryObject is built directly in processGrammar

function validateRegexp(regexp: string | undefined, node: any, prop: string, options: EmitOptions) {
  if (regexp === undefined) return;
  try {
    new OnigRegExp(regexp).testSync("");
  } catch (err: any) {
    let processedError = err;
    if (/^[0-9,]+$/.test(err.message)) {
      const array = new Uint8Array(err.message.split(",").map((s: string) => Number(s)));
      const buffer = Buffer.from(array);
      processedError = new Error(buffer.toString("utf-8"));
    }
    const sourceFile = options.errorSourceFilePath ?? "unknown_file";
    // eslint-disable-next-line no-console
    console.error(`${sourceFile}(1,1): error TM0001: Bad regex: ${JSON.stringify({[prop]: regexp})}: ${processedError.message}`);
    // eslint-disable-next-line no-console
    console.error(node);
    throw processedError;
  }
} 