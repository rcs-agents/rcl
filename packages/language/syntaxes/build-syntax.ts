import path from 'node:path';
import fs from 'node:fs/promises';
import { rclGrammar } from './rcl/rcl.grammar.js';
import { fileURLToPath } from 'node:url';
import { emitJSON } from 'tmgrammar-toolkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const outputPath = path.join(__dirname, '../src/syntaxes/rcl.tmLanguage.json');
  const grammarAsJson = await emitJSON(rclGrammar, {
    errorSourceFilePath: outputPath
  });
  await fs.writeFile(outputPath, grammarAsJson);
  console.log(`[${new Date().toLocaleTimeString()}] ✅ RCL tmLanguage generated at ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 