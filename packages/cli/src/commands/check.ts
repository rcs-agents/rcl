import { createRclServices, RclLanguageMetaData } from 'rcl-language';
import chalk from 'chalk';

import { extractDocumentForChecking } from '../util.js';
import { NodeFileSystem } from 'langium/node';
import { Command } from 'commander';

export const fileExtensions = RclLanguageMetaData.fileExtensions.join(', ');

export const configure = (program: Command): void => {
  program
    .command('check')
    .argument('<file>', `source file to validate (possible file extensions: ${fileExtensions})`)
    .description('validates an RCL file and reports all issues')
    .action(checkAction);
};

export const checkAction = async (fileName: string): Promise<void> => {
  const services = createRclServices(NodeFileSystem).Rcl;
  
  try {
      console.log(chalk.blue(`Checking file: ${fileName}`));
      
      const document = await extractDocumentForChecking(fileName, services);
      
      // Check for parsing errors
      if (document.parseResult.lexerErrors.length > 0) {
          console.log(chalk.red('\n❌ Lexer Errors:'));
          for (const error of document.parseResult.lexerErrors) {
              console.log(chalk.red(`  Line ${error.line}: ${error.message}`));
          }
      }
      
      if (document.parseResult.parserErrors.length > 0) {
          console.log(chalk.red('\n❌ Parser Errors:'));
          for (const error of document.parseResult.parserErrors) {
              console.log(chalk.red(`  Line ${error.token.startLine}: ${error.message}`));
          }
      }
      
      // Check for validation errors and warnings
      const diagnostics = document.diagnostics ?? [];
      const errors = diagnostics.filter(d => d.severity === 1); // Error
      const warnings = diagnostics.filter(d => d.severity === 2); // Warning
      const infos = diagnostics.filter(d => d.severity === 3); // Info
      
      if (errors.length > 0) {
          console.log(chalk.red('\n❌ Validation Errors:'));
          for (const error of errors) {
              const line = error.range.start.line + 1;
              const column = error.range.start.character + 1;
              const text = document.textDocument.getText(error.range);
              console.log(chalk.red(`  Line ${line}:${column}: ${error.message}`));
              if (text.trim()) {
                  console.log(chalk.gray(`    └─ "${text}"`));
              }
          }
      }
      
      if (warnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Warnings:'));
          for (const warning of warnings) {
              const line = warning.range.start.line + 1;
              const column = warning.range.start.character + 1;
              const text = document.textDocument.getText(warning.range);
              console.log(chalk.yellow(`  Line ${line}:${column}: ${warning.message}`));
              if (text.trim()) {
                  console.log(chalk.gray(`    └─ "${text}"`));
              }
          }
      }
      
      if (infos.length > 0) {
          console.log(chalk.blue('\nℹ️  Information:'));
          for (const info of infos) {
              const line = info.range.start.line + 1;
              const column = info.range.start.character + 1;
              const text = document.textDocument.getText(info.range);
              console.log(chalk.blue(`  Line ${line}:${column}: ${info.message}`));
              if (text.trim()) {
                  console.log(chalk.gray(`    └─ "${text}"`));
              }
          }
      }
      
      // Summary
      const totalIssues = errors.length + warnings.length;
      if (totalIssues === 0) {
          console.log(chalk.green('\n✅ No issues found!'));
      } else {
          console.log(chalk.red(`\n📊 Summary: ${errors.length} error(s), ${warnings.length} warning(s)`));
          if (errors.length > 0) {
              process.exit(1);
          }
      }
      
  } catch (error) {
      console.error(chalk.red(`Failed to check file: ${error}`));
      process.exit(1);
  }
};
