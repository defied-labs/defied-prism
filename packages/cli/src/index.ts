#!/usr/bin/env node
import { Command } from "commander";

import { initCommand } from "./commands/init";

import { addCommand } from "./commands/add";

import { syncCommand } from "./commands/sync";

const program = new Command();

program
  .name("@defied-prism/cli")
  .description("Defied Prism CLI")
  .version("0.1.0");

program.command("init").description("Initialize Prism").action(initCommand);

program
  .command("add <component>")
  .option("--style <style>", "Styling engine")
  .option("--registry <path>", "Registry path")
  .action(addCommand);

program
  .command("sync")
  .description("Regenerate all installed components with current styling")
  .option("--style <style>", "Styling engine")
  .option("--registry <path>", "Registry path")
  .action(syncCommand);

program.parse();
