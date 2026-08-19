import { loadConfig, saveConfig } from "../config/loadConfig";

import { regenerateComponent } from "./add";

interface SyncOptions {
  style?: "tailwind" | "css-modules";
  registry?: string;
}

export async function syncCommand(options: SyncOptions) {
  const config = await loadConfig();

  const styling = options.style ?? config.styling;

  const registryPath = options.registry ?? config.registryPath ?? "./registry";

  const components = config.components ?? [];

  if (options.style && options.style !== config.styling) {
    config.styling = options.style;
    await saveConfig(config);
    console.log(
      `✓ Switched styling in prism.json: ${config.styling} -> ${options.style}`,
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

      console.log(`✓ Synced ${component} (${usedStyling})`);

      succeeded++;
    } catch (error) {
      console.error(`✗ Failed to sync ${component}: ${error}`);

      failed++;
    }
  }

  console.log(`\nSync complete: ${succeeded} ok, ${failed} failed.`);

  if (styling === "css-modules" && succeeded > 0) {
    console.log(
      `\nReminder: CSS Modules emits \`var(--color-*)\` tokens picked from your global theme. ` +
        `Make sure your design tokens are defined, or open the generated \`.module.css\` for warnings.`,
    );
  }
}
