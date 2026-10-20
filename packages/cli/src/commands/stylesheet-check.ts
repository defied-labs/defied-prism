import fs from "node:fs/promises";
import path from "node:path";

import type { PrismConfig } from "../config/types";

const SKIP = new Set(["node_modules", "dist", "build", ".next", ".turbo", ".git", "coverage"]);

async function cssFiles(dir: string, depth = 0): Promise<string[]> {
  if (depth > 5) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : cssFiles(full, depth + 1);
      return entry.name.endsWith(".css") && !entry.name.endsWith(".module.css") ? [full] : [];
    }),
  );
  return nested.flat();
}

/**
 * Warnings for stylesheet imports the generated components rely on:
 * `tokens.css` always, and `tailwind.css` for Tailwind styling, whose
 * utilities (`bg-primary`, `px-4`…) resolve through it.
 */
export async function missingStylesheetImports(styling: PrismConfig["styling"], cwd = process.cwd()): Promise<string[]> {
  const sources = await Promise.all((await cssFiles(cwd)).map((file) => fs.readFile(file, "utf8")));
  const imports = (name: string) => sources.some((css) => css.includes(`@defied/prism-tokens/${name}`));

  const missing: string[] = [];
  if (!imports("tokens.css")) missing.push(`@import "@defied/prism-tokens/tokens.css";`);
  if (styling === "tailwind" && !imports("tailwind.css")) {
    missing.push(`@import "@defied/prism-tokens/tailwind.css";   (after @import "tailwindcss")`);
  }
  return missing;
}

export async function warnMissingStylesheetImports(styling: PrismConfig["styling"]) {
  const missing = await missingStylesheetImports(styling);
  if (missing.length === 0) return;
  console.warn(
    `\n⚠ Components won't be styled until your global stylesheet imports:\n  ${missing.join("\n  ")}`,
  );
}
