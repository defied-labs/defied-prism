#!/usr/bin/env node
import { Command, Option } from "commander";

import { initCommand } from "./commands/init";

import { addCommand } from "./commands/add";

import { syncCommand } from "./commands/sync";

import { themeCommand } from "./commands/theme";

const program = new Command();

program
  .name("prism")
  .description("Defied Prism CLI")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize Prism")
  .addOption(
    new Option("--framework <framework>", "Framework to generate components for")
      .choices(["react", "vue"])
      .default("react"),
  )
  .addOption(
    new Option("--style <style>", "Styling engine").choices(["tailwind", "css-modules", "css"]).default("tailwind"),
  )
  .option("--primary <color>", "Brand color (hex, rgb() or oklch()); prompted for when omitted on a TTY")
  .addOption(
    new Option("--package-manager <pm>", "Package manager (default: from the lockfile, else asked)").choices([
      "npm",
      "pnpm",
      "yarn",
      "bun",
    ]),
  )
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
  .command("add <component>")
  .description("Add a component to your project")
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
