import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { regenerateComponent, resolveInstallOrder } from "../../src/commands/add";
import { ManifestValidator } from "../../src/registry/ManifestValidator";
import { RecipeValidator } from "../../src/registry/RecipeValidator";
import type { PrismConfig } from "../../src/config/types";

export const registryPath = path.resolve(__dirname, "../../../core");
export const generatedRoot = path.resolve(__dirname, "../.generated");

export const registryComponents = readdirSync(path.join(registryPath, "components"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

/** Set PRISM_COMPONENTS=dialog,tabs to check only some components. */
const only = process.env.PRISM_COMPONENTS?.split(",").filter(Boolean);
/** The registry components under test (all, unless PRISM_COMPONENTS filters them). */
export const selectedComponents = registryComponents.filter((name) => !only || only.includes(name));

export const STYLINGS: PrismConfig["styling"][] = ["tailwind", "css-modules", "css"];

export const pascal = (s: string) =>
  s.replace(/(^|-)([a-z])/g, (_m, _dash, c: string) => c.toUpperCase());
export const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function readRegistryComponent(name: string) {
  const dir = path.join(registryPath, "components", name);
  const manifest = ManifestValidator.validate(
    JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8")),
    name,
  );
  const recipe = RecipeValidator.parse(readFileSync(path.join(dir, "recipe.json"), "utf8"), name);
  return { manifest, recipe, contract: manifest.contract! };
}

/** `data-slot` value for a component slot. */
export const dataSlot = (component: string, slot: string) =>
  slot === "root" ? component : `${component}-${kebab(slot)}`;

/** Registry components whose manifest declares a target for `framework`. */
export const componentsFor = (framework: PrismConfig["framework"]) =>
  selectedComponents.filter((name) =>
    readRegistryComponent(name).manifest.compatibility.frameworks.some((f) => f.framework === framework),
  );

/**
 * Generates a registry component with the real CLI pipeline and imports it.
 * `namespace` keeps parallel test files from writing the same directory.
 * React components are one file (`Button.tsx`); Vue components are a folder
 * whose `index.ts` exports the same names.
 */
export async function loadGenerated(
  name: string,
  styling: PrismConfig["styling"],
  namespace: string,
  framework: PrismConfig["framework"] = "react",
): Promise<Record<string, any>> {
  const componentsPath = path.join(generatedRoot, namespace, framework, styling, name);
  // Registry dependencies land next to it, as `prism add` installs them
  for (const component of await resolveInstallOrder(name, registryPath)) {
    await regenerateComponent(component, { framework, styling, registryPath, componentsPath });
  }
  const file =
    framework === "vue"
      ? path.join(componentsPath, name, "index.ts")
      : path.join(componentsPath, `${pascal(name)}.tsx`);
  return import(/* @vite-ignore */ pathToFileURL(file).href);
}
