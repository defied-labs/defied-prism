import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { flattenRecipe } from "@defied-prism/style-engine";

const componentsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../components",
);
const args = process.argv.slice(2);
const check = args.includes("--check");
const only = new Set(args.filter((a) => !a.startsWith("--")));

const stale: string[] = [];

/** Write `content` to `file` unless it's unchanged; in --check mode, record it as stale. */
async function emit(file: string, content: string, label: string) {
  const existing = await readFile(file, "utf8").catch(() => null);
  if (existing?.replace(/\r\n/g, "\n") === content) return;
  if (check) {
    stale.push(path.relative(process.cwd(), file));
  } else {
    await writeFile(file, content, "utf8");
    console.log(`✓ ${label}`);
  }
}

for (const entry of await readdir(componentsDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || (only.size > 0 && !only.has(entry.name)))
    continue;

  const dir = path.join(componentsDir, entry.name);
  const mod = await import(pathToFileURL(path.join(dir, "recipe.ts")).href);
  const recipe = mod.default;

  // Compiling validates tokens, states and property ownership; fail the build early.
  const { tokens } = flattenRecipe(recipe);
  await emit(
    path.join(dir, "recipe.json"),
    JSON.stringify(recipe, null, 2) + "\n",
    `${entry.name}/recipe.json`,
  );

  // The manifest's token list is derived from the recipe, never hand-written
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.tokens = tokens.map((name) => ({ name, required: true }));
  await emit(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    `${entry.name}/manifest.json tokens`,
  );
}

if (stale.length > 0) {
  console.error(
    `Stale registry output (run \`pnpm --filter @defied-prism/core build:registry\`):\n  ${stale.join("\n  ")}`,
  );
  process.exit(1);
}
