#!/usr/bin/env node
import { createRequire } from "node:module";

import { Command, Option } from "commander";

import { initCommand } from "./commands/init";

import { addCommand } from "./commands/add";

import { syncCommand } from "./commands/sync";

import { themeCommand } from "./commands/theme";

const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

const program = new Command();

program
  .name("prism")
  .description("Defied Prism CLI")
  .version(version);

program
  .command("init")
  .description(
    "Initialize Prism. Asks for anything the flags don't answer; with --yes (or without a terminal, or in CI) asks nothing and uses the flags plus detected defaults",
  )
  .option("-y, --yes", "Never prompt: use the flags, then defaults detected from the project")
  .addOption(
    new Option(
      "--framework <framework>",
      "Framework to generate components for (default: from package.json, else react)",
    ).choices(["react", "vue"]),
  )
  .addOption(
    new Option("--style <style>", "Styling engine (default: tailwind if the project uses it, else css-modules)").choices([
      "tailwind",
      "css-modules",
      "css",
    ]),
  )
  .option("--components-path <path>", "Where components are written (default: src/components/ui)")
  .option("--primary <color>", "Brand color (hex, rgb() or oklch())")
  .addOption(
    new Option("--package-manager <pm>", "Package manager (default: from the lockfile, else npm)").choices([
      "npm",
      "pnpm",
      "yarn",
      "bun",
    ]),
  )
  .option("--add <components...>", "Components to add once initialized")
  .option("--no-install", "Skip installing the runtime packages")
  .option("--force", "Overwrite an existing prism.json")
  .action(initCommand);

const styleOption = () =>
  new Option("--style <style>", "Styling engine").choices([
    "tailwind",
    "css-modules",
    "css",
  ]);

program
  .command("add <components...>")
  .description("Add one or more components to your project")
  .addOption(styleOption())
  .option("--registry <path|url>", "Registry to install from")
  .action(addCommand);

program
  .command("sync")
  .description("Regenerate all installed components (--style switches the project's styling)")
  .addOption(styleOption())
  .option("--registry <path|url>", "Registry to install from")
  .action(syncCommand);

program
  .command("theme")
  .description("Generate a CSS file that re-themes Prism from your brand colors")
  .option("--primary <color>", "Brand color (hex, rgb() or oklch()); shades, text, ring and links are derived")
  .option("--dark-primary <color>", "Brand color for the dark theme (default: --primary)")
  .option(
    "--set <token=value>",
    "Override any color token; prefix with dark. for the dark theme (repeatable)",
    (value: string, previous: string[] = []) => [...previous, value],
  )
  .option("--out <file>", "Output file", "src/prism-theme.css")
  .action(themeCommand);

program.parseAsync().catch((error: unknown) => {
  // Ctrl+C during an inquirer prompt
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("\nCancelled.");
    process.exit(130);
  }
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
