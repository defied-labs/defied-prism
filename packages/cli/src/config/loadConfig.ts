import fs from "node:fs/promises";

import type { PrismConfig } from "./types";

export async function loadConfig(): Promise<PrismConfig> {
  const raw = await fs.readFile("prism.json", "utf-8");

  return JSON.parse(raw);
}

export async function saveConfig(config: PrismConfig): Promise<void> {
  await fs.writeFile("prism.json", JSON.stringify(config, null, 2) + "\n");
}

export async function recordInstalledComponent(name: string): Promise<void> {
  const config = await loadConfig();

  const components = new Set(config.components ?? []);

  components.add(name);

  config.components = Array.from(components);

  await saveConfig(config);
}
