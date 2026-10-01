/**
 * Generates the code shown on the site with the real CLI pipeline: every
 * showcase component, for every framework and styling target, exactly as
 * `prism add` writes it. Also counts what the registry ships, so the numbers
 * on the page come from the registry rather than from copy.
 *
 * Run before `dev` and `build`; writes src/generated/stats.json and one
 * src/generated/snippets/<component>.json per component (loaded on demand).
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { regenerateComponent } from "../../../packages/cli/src/commands/add";

const registryPath = path.resolve(import.meta.dirname, "../../../packages/core");
const out = path.resolve(import.meta.dirname, "../src/generated");

export const SHOWCASE = [
  "button",
  "input",
  "field",
  "select",
  "dialog",
  "toast",
  "calendar",
  "data-table",
] as const;
const FRAMEWORKS = ["react", "vue"] as const;
const STYLINGS = ["tailwind", "css-modules"] as const;

interface Snippet {
  /** Path as written into the project, relative to componentsPath. */
  path: string;
  code: string;
}

function listFiles(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join("/")];
  });
}

const snippets: Record<string, Record<string, Record<string, Snippet[]>>> = {};
const tmp = mkdtempSync(path.join(os.tmpdir(), "prism-snippets-"));
try {
  for (const name of SHOWCASE) {
    snippets[name] = {};
    for (const framework of FRAMEWORKS) {
      snippets[name][framework] = {};
      for (const styling of STYLINGS) {
        const componentsPath = path.join(tmp, framework, styling, name);
        await regenerateComponent(name, { framework, styling, registryPath, componentsPath });
        snippets[name][framework][styling] = listFiles(componentsPath)
          .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
          .map((file) => ({
            path: file,
            code: readFileSync(path.join(componentsPath, file), "utf8").replace(/\r\n/g, "\n"),
          }));
      }
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

/** Main component first, its stylesheet next, plumbing (index/context) last. */
function order(file: string): number {
  if (/\.module\.css$/.test(file)) return 1;
  if (/(index|context|types)\.ts$/.test(file)) return 3;
  if (/styles\.ts$/.test(file)) return 2;
  return 0;
}

const componentsDir = path.join(registryPath, "components");
const components = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(componentsDir, entry.name, "manifest.json")))
  .map((entry) => JSON.parse(readFileSync(path.join(componentsDir, entry.name, "manifest.json"), "utf8")));

const stats = {
  components: components.length,
  vueComponents: components.filter((m) =>
    m.compatibility.frameworks.some((f: { framework: string }) => f.framework === "vue"),
  ).length,
  stylings: ["tailwind", "css-modules", "css"].length,
  machines: readdirSync(componentsDir, { recursive: true }).filter((f) => String(f).endsWith(".machine.ts")).length,
  vueReady: components
    .filter((m) => m.compatibility.frameworks.some((f: { framework: string }) => f.framework === "vue"))
    .map((m) => m.metadata.name as string)
    .sort(),
};

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "snippets"), { recursive: true });
writeFileSync(path.join(out, "stats.json"), JSON.stringify(stats) + "\n");
for (const [name, byFramework] of Object.entries(snippets)) {
  writeFileSync(path.join(out, "snippets", `${name}.json`), JSON.stringify(byFramework) + "\n");
}
console.log(`✓ snippets: ${SHOWCASE.length} components × ${FRAMEWORKS.length} frameworks × ${STYLINGS.length} stylings; registry: ${stats.components} components, ${stats.vueComponents} with Vue`);
