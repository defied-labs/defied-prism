import {
  loadConfig,
  recordInstalledComponent,
} from "../config/loadConfig";
import type { PrismConfig } from "../config/types";
import { warnMissingStylesheetImports } from "./stylesheet-check";

import { createRegistryClient } from "../registry/RegistryClient";
import { defaultRegistryPath } from "../registry/defaultRegistry";

import { createGenerator } from "../generators/GeneratorFactory";
import type { GeneratorOptions } from "../generators/TemplateGenerator";
import type { Framework } from "../registry/ComponentManifest";

import {
  compileRecipeCss,
  compileRecipeTailwind,
  type Recipe,
} from "@defied-labs/prism-style-engine";

type Styling = PrismConfig["styling"];

export interface AddOptions {
  /** Styling engine for this run only; `prism.json` is not modified. */
  style?: Styling;
  registry?: string;
}

type CompiledStyles = Pick<GeneratorOptions, "slotsExpression" | "styleFile">;

/** Every target emits the same declarations from the same recipe. */
export function compileStyles(recipe: Recipe, styling: Styling): CompiledStyles {
  if (styling === "tailwind") {
    return {
      // Pretty-printed: these classes are meant to be read and edited
      slotsExpression: `tailwindSlots(${JSON.stringify(compileRecipeTailwind(recipe).slots, null, 2)})`,
      styleFile: null,
    };
  }

  const { css, classNames } = compileRecipeCss(
    recipe,
    styling === "css-modules" ? "modules" : "vanilla",
  );
  const entries = Object.entries(classNames).map(([slot, className]) => {
    const base =
      styling === "css-modules"
        ? `styles[${JSON.stringify(className)}]`
        : JSON.stringify(className);
    return `${JSON.stringify(slot)}: { base: ${base}, variants: {} }`;
  });
  return { slotsExpression: `{ ${entries.join(", ")} }`, styleFile: css };
}

/** Fetch, compile and write one component. Shared by `add` and `sync`. */
export async function regenerateComponent(
  component: string,
  context: {
    framework: Framework;
    styling: Styling;
    registryPath: string;
    componentsPath: string;
  },
) {
  const registry = createRegistryClient(context.registryPath);
  const manifest = await registry.getManifest(component);
  const recipe = await registry.getRecipe(component);
  const compiled = compileStyles(recipe, context.styling);

  const generator = createGenerator(
    context.framework,
    registry,
    {
      styling: context.styling,
      componentsPath: context.componentsPath,
      ...compiled,
    },
    manifest,
  );

  await generator.generate(manifest);

  return context.styling;
}

/**
 * `component` and its registry dependencies, dependencies first. Throws on
 * a cycle (a component can't need itself through its dependencies).
 */
export async function resolveInstallOrder(component: string, registryPath: string): Promise<string[]> {
  const registry = createRegistryClient(registryPath);
  const order: string[] = [];
  const visit = async (name: string, path: string[]) => {
    if (path.includes(name)) {
      throw new Error(`[prism] Circular registry dependency: ${[...path, name].join(" -> ")}.`);
    }
    if (order.includes(name)) return;
    const manifest = await registry.getManifest(name);
    for (const dependency of manifest.registryDependencies ?? []) {
      await visit(dependency, [...path, name]);
    }
    order.push(name);
  };
  await visit(component, []);
  return order;
}

export function resolveRegistryPath(
  options: { registry?: string },
  config: PrismConfig,
): string {
  return options.registry ?? config.registryPath ?? defaultRegistryPath();
}

export async function addCommand(component: string, options: AddOptions) {
  const config = await loadConfig();
  const styling = options.style ?? config.styling;
  const registryPath = resolveRegistryPath(options, config);
  const context = { framework: config.framework, styling, registryPath, componentsPath: config.componentsPath };

  const installed = new Set(config.components ?? []);
  for (const name of await resolveInstallOrder(component, registryPath)) {
    // Dependencies already in the project are kept as they are: they may
    // have been customized. `prism sync` regenerates everything.
    if (name !== component && installed.has(name)) continue;
    await regenerateComponent(name, context);
    await recordInstalledComponent(name);
    console.log(
      name === component
        ? `✓ Added ${component} (${config.framework} / ${styling})`
        : `✓ Added ${name} (required by ${component})`,
    );
  }
  await warnMissingStylesheetImports(styling);

  if (options.style && options.style !== config.styling) {
    console.log(
      `  Note: prism.json still uses "${config.styling}". Run \`prism sync --style ${options.style}\` to switch the whole project.`,
    );
  }
}
