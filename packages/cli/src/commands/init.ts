import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";

import { buildThemeCss } from "@defied-labs/prism-tokens";

import type { PrismConfig } from "../config/types";

export interface InitOptions {
  framework?: PrismConfig["framework"];
  style?: PrismConfig["styling"];
  /** Brand color; prompted for on a TTY when omitted. */
  primary?: string;
  /** `--no-install` sets this to false. */
  install?: boolean;
  /** Overwrite an existing prism.json. */
  force?: boolean;
  cwd?: string;
}

const STYLESHEET_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/index.css",
  "src/main.css",
  "src/style.css",
  "src/styles.css",
  "src/assets/main.css",
  "src/app.css",
  "app/app.css",
];

const TAILWIND_IMPORT = /^\s*@import\s+["']tailwindcss["'].*$/m;

export function detectPackageManager(cwd: string): "pnpm" | "yarn" | "bun" | "npm" {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb")) || existsSync(path.join(cwd, "bun.lock"))) return "bun";
  return "npm";
}

export function runtimePackages(framework: PrismConfig["framework"]) {
  return ["@defied-labs/prism-tokens", `@defied-labs/prism-${framework}`, "@defied-labs/prism-core"];
}

/** The project's global stylesheet: the one importing Tailwind, else a conventional path. */
export async function findGlobalStylesheet(cwd: string): Promise<string | undefined> {
  const existing = STYLESHEET_CANDIDATES.map((rel) => path.join(cwd, rel)).filter((file) => existsSync(file));
  for (const file of existing) {
    if (TAILWIND_IMPORT.test(await fs.readFile(file, "utf8"))) return file;
  }
  return existing[0];
}

/**
 * Adds the Prism imports to a stylesheet, skipping ones already present.
 * Order: tailwindcss → tokens.css → tailwind.css → theme file.
 */
export function addStylesheetImports(css: string, styling: PrismConfig["styling"], themeImport?: string) {
  const wanted = [`@import "@defied-labs/prism-tokens/tokens.css";`];
  if (styling === "tailwind") wanted.push(`@import "@defied-labs/prism-tokens/tailwind.css";`);
  if (themeImport) wanted.push(`@import "${themeImport}";`);

  const missing = wanted.filter((line) => !css.includes(line.slice(9, -2)));
  if (missing.length === 0) return css;

  const block = missing.join("\n");
  const tailwind = css.match(TAILWIND_IMPORT);
  if (tailwind?.index !== undefined) {
    const end = tailwind.index + tailwind[0].length;
    return `${css.slice(0, end)}\n${block}${css.slice(end)}`;
  }
  return `${block}\n${css}`;
}

async function promptBrandColor(): Promise<string | undefined> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return undefined;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      const answer = (await rl.question("Brand color (hex, rgb() or oklch(); Enter to skip): ")).trim();
      if (!answer) return undefined;
      try {
        buildThemeCss({ light: { primary: answer } });
        return answer;
      } catch (error) {
        console.error(`  ${error instanceof Error ? error.message : error}`);
      }
    }
  } finally {
    rl.close();
  }
}

function installPackages(cwd: string, framework: PrismConfig["framework"]) {
  const pm = detectPackageManager(cwd);
  const packages = runtimePackages(framework);
  const args = [pm === "npm" ? "install" : "add", ...packages];
  console.log(`\n→ ${pm} ${args.join(" ")}`);
  const result = spawnSync(pm, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.warn(`\n⚠ Install failed. Run it yourself:\n  ${pm} ${args.join(" ")}`);
    return false;
  }
  return true;
}

export async function initCommand(options: InitOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const framework = options.framework ?? "react";
  const styling = options.style ?? "tailwind";
  const configPath = path.join(cwd, "prism.json");

  if (existsSync(configPath) && !options.force) {
    throw new Error("[prism] prism.json already exists. Use --force to overwrite it.");
  }

  // Validate the color before touching anything
  const primary = options.primary ?? (await promptBrandColor());
  const theme = primary ? buildThemeCss({ light: { primary }, dark: { primary } }) : undefined;

  const config: PrismConfig = { framework, styling, componentsPath: "src/components/ui", components: [] };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`✓ Prism initialized (${framework}, ${styling})`);

  // Dependencies
  const manual: string[] = [];
  if (options.install === false) {
    manual.push(`Install the runtime:\n       npm install ${runtimePackages(framework).join(" ")}`);
  } else if (!existsSync(path.join(cwd, "package.json"))) {
    manual.push(`No package.json found; install the runtime:\n       npm install ${runtimePackages(framework).join(" ")}`);
  } else if (installPackages(cwd, framework)) {
    console.log("✓ Installed runtime packages");
  }

  // Tokens and theme
  const stylesheet = await findGlobalStylesheet(cwd);
  const themeDir = stylesheet ? path.dirname(stylesheet) : path.join(cwd, "src");
  const themePath = path.join(themeDir, "prism-theme.css");
  if (theme) {
    await fs.mkdir(themeDir, { recursive: true });
    await fs.writeFile(themePath, theme.css, "utf8");
    console.log(`✓ Wrote ${path.relative(cwd, themePath)}`);
    for (const i of theme.issues) {
      console.warn(`  ⚠ ${i.theme}: ${i.fg} on ${i.bg} is ${i.ratio.toFixed(2)}:1 (needs ${i.required}:1)`);
    }
  }

  if (stylesheet) {
    const css = await fs.readFile(stylesheet, "utf8");
    const updated = addStylesheetImports(css, styling, theme ? "./prism-theme.css" : undefined);
    if (updated !== css) {
      await fs.writeFile(stylesheet, updated, "utf8");
      console.log(`✓ Added Prism imports to ${path.relative(cwd, stylesheet)}`);
    }
  } else {
    const lines = addStylesheetImports("", styling, theme ? `./${path.relative(cwd, themePath).replace(/\\/g, "/")}` : undefined);
    manual.push(
      `No global stylesheet found; add to it${styling === "tailwind" ? ` (after @import "tailwindcss")` : ""}:\n       ${lines.trim().split("\n").join("\n       ")}`,
    );
  }

  if (!theme) manual.push(`Use your brand color (optional):\n       npx prism theme --primary "#0d9488"`);
  manual.push("Add components:\n       npx prism add button");
  console.log(`\nNext steps:\n${manual.map((step, i) => `  ${i + 1}. ${step}`).join("\n")}`);
}
