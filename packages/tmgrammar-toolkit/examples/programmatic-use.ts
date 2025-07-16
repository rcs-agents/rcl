import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { Grammar } from 'tmgrammar-toolkit';
import { schema, emitJSON } from 'tmgrammar-toolkit';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Import your grammar rules and patterns
import { allRules, mainPatterns } from '../src/my-grammar';
const LANG_ID = 'my-lang';


export const MyGrammar: Grammar = {
    $schema: schema,
    name: LANG_ID,
    scopeName: `source.${LANG_ID}`,
    fileTypes: [LANG_ID],
    patterns: mainPatterns,
    repositoryItems: allRules,
}; 

async function main() {
  const outputPath = path.join(__dirname, `../src/${LANG_ID}.tmLanguage.json`);
  const grammarAsJson = await emitJSON(MyGrammar, {
    errorSourceFilePath: outputPath
  });
  await fs.writeFile(outputPath, grammarAsJson);
  console.log(`[${new Date().toLocaleTimeString()}] ✅ ${LANG_ID} tmLanguage generated at ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 