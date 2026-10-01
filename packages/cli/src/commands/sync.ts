import { loadConfig, recordInstalledComponent, saveConfig } from "../config/loadConfig";

import { regenerateComponent, resolveInstallOrder, resolveRegistryPath } from "./add";
import { warnMissingStylesheetImports } from "./stylesheet-check";

interface SyncOptions {
  style?: "tailwind" | "css-modules" | "css";
  registry?: string;
}

export async function syncCommand(options: SyncOptions) {
  const config = await loadConfig();

  const styling = options.style ?? config.styling;

  const registryPath = resolveRegistryPath(options, config);

  // Include registry dependencies a component gained since it was installed
  const installed = config.components ?? [];
  const components: string[] = [];
  for (const component of installed) {
    try {
      for (const name of await resolveInstallOrder(component, registryPath)) {
        if (!components.includes(name)) components.push(name);
      }
    } catch {
      // Unknown to the registry: keep it so the loop below reports it
      if (!components.includes(component)) components.push(component);
    }
  }
  const added = components.filter((name) => !installed.includes(name));

  if (options.style && options.style !== config.styling) {
    const previous = config.styling;
    config.styling = options.style;
    await saveConfig(config);
    console.log(
      `✓ Switched styling in prism.json: ${previous} -> ${options.style}`,
    );
  }

  console.log(
    `Syncing ${components.length} component(s) with styling="${styling}"…\n`,
  );

  if (components.length === 0) {
    console.log("No installed components to sync.");

    return;
  }

  let succeeded = 0;

  let failed = 0;

  for (const component of components) {
    try {
      const usedStyling = await regenerateComponent(component, {
        framework: config.framework,
        styling,
        registryPath,
        componentsPath: config.componentsPath,
      });

      console.log(
        added.includes(component)
          ? `✓ Added ${component} (${usedStyling}, now required by an installed component)`
          : `✓ Synced ${component} (${usedStyling})`,
      );
      if (added.includes(component)) await recordInstalledComponent(component);

      succeeded++;
    } catch (error) {
      console.error(`✗ Failed to sync ${component}: ${error}`);

      failed++;
    }
  }

  console.log(`\nSync complete: ${succeeded} ok, ${failed} failed.`);

  if (failed > 0) process.exitCode = 1;

  if (succeeded > 0) await warnMissingStylesheetImports(styling);
}
