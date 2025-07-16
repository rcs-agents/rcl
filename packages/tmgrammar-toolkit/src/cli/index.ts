import { Command } from "commander";
import {
  createEmitCommand,
  createSnapCommand,
  createTestCommand,
  createValidateCommand,
} from "./commands/index.js";

const program = new Command();

program
  .name("tmt")
  .description(
    "TextMate Toolkit CLI - A unified toolkit for TextMate grammar authoring, testing, and validation",
  )
  .version("0.1.0");

program.addCommand(createEmitCommand());
program.addCommand(createTestCommand());
program.addCommand(createSnapCommand());
program.addCommand(createValidateCommand());

program.parse(); 