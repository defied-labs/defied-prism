import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * The registry that ships with the CLI. The published build bundles it next to
 * the entry point (`dist/registry`); inside the monorepo, fall back to
 * `packages/core`, which holds the registry sources.
 */
export function defaultRegistryPath(): string {
  const candidates = [
    path.join(here, "registry"),
    path.resolve(here, "../../../core"),
  ];
  const found = candidates.find((dir) => existsSync(path.join(dir, "components")));
  if (!found) {
    throw new Error(
      `[prism] Bundled component registry not found (looked in ${candidates.join(", ")}). Pass --registry <path|url>.`,
    );
  }
  return found;
}
