import fs from "node:fs/promises";
import path from "node:path";

import { buildThemeCss, themes, type ColorToken, type ThemeOverrides } from "@defied-labs/prism-tokens";

export interface ThemeOptions {
  primary?: string;
  darkPrimary?: string;
  /** Repeated `token=value` or `dark.token=value`. */
  set?: string[];
  out: string;
}

/** Parses `--set` entries into light/dark overrides. */
export function parseThemeOptions(options: Omit<ThemeOptions, "out">) {
  const light: ThemeOverrides = {};
  const dark: ThemeOverrides = {};
  if (options.primary) light.primary = options.primary;
  if (options.darkPrimary) dark.primary = options.darkPrimary;

  for (const entry of options.set ?? []) {
    const eq = entry.indexOf("=");
    if (eq <= 0) throw new Error(`[prism] --set expects token=value, got "${entry}".`);
    const key = entry.slice(0, eq).trim();
    const value = entry.slice(eq + 1).trim();
    const [target, token] = key.startsWith("dark.") ? [dark, key.slice(5)] : [light, key];
    if (!(token in themes.light)) throw new Error(`[prism] Unknown color token "${token}".`);
    target[token as ColorToken] = value;
  }
  if (Object.keys(light).length === 0 && Object.keys(dark).length === 0) {
    throw new Error("[prism] Nothing to theme: pass --primary <color> or --set token=value.");
  }
  // Dark follows light unless it sets its own values
  return { light, dark: { ...light, ...dark } };
}

export async function themeCommand(options: ThemeOptions) {
  const { css, issues } = buildThemeCss(parseThemeOptions(options));
  const out = path.resolve(options.out);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, css, "utf8");

  console.log(`✓ Wrote ${path.relative(process.cwd(), out)}`);
  console.log(`  Import it after the tokens, in your global stylesheet:
    @import "@defied-labs/prism-tokens/tokens.css";
    @import "./${path.basename(out)}";`);

  if (issues.length > 0) {
    console.warn("\n⚠ Contrast below WCAG AA:");
    for (const i of issues) {
      console.warn(`  ${i.theme}: ${i.fg} on ${i.bg} is ${i.ratio.toFixed(2)}:1 (needs ${i.required}:1)`);
    }
  }
}
