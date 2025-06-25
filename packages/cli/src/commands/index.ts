import { Command } from 'commander';

//@index('./*.ts', (f, {camelCase}) => `import * as ${camelCase(f.name)} from '${f.path}.js'`)
import * as check from './check.js'
//@endindex

export const configureCommands = (program: Command): void => {
    //@index('./*.ts', (f, {camelCase}) => `${camelCase(f.name)}.configure(program);`)
    check.configure(program);
    //@endindex
}

// TODO: Add generate and json commands
// export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
//     const services = createRclServices(NodeFileSystem).Rcl;
//     const model = await extractAstNode<RclFile>(fileName, services);
//     const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
//     console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
// };

// program
//     .command('generate')
//     .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
//     .option('-d, --destination <dir>', 'destination directory of generating')
//     .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
//     .action(generateAction);


