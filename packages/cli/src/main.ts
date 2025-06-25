import { Command } from 'commander';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { configureCommands } from './commands/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    configureCommands(program);

    program.parse(process.argv);
}
