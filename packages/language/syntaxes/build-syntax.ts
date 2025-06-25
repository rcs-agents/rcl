import path from 'node:path';
import fs from 'node:fs/promises';
import { rclGrammar } from './rcl/rcl.grammar.ts';
import { fileURLToPath } from 'node:url';
import { emitJSON } from 'tmgrammar-toolkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTime(): string {
  const date = new Date();
  const padZeroes = (i: number) => i.toString().padStart(2, "0");
  return `[${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}] `;
}

/**
 * Generates the final tmLanguage.json file from the TypeScript grammar definition.
 */
export async function generateTmLanguage(): Promise<void> {
  const outputPath = path.join(__dirname, '../src/syntaxes/rcl.tmLanguage.json');

  const json = await emitJSON(rclGrammar, {
    errorSourceFilePath: outputPath,
  });

  await fs.writeFile(outputPath, json);
  console.log(`${getTime()}✅ RCL tmLanguage generated at ${outputPath}`);
}

/**
 * Main execution when run directly
 */
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await generateTmLanguage();
  } catch (error) {
    console.error('Error generating tmLanguage file:', error);
    process.exit(1);
  }
} 