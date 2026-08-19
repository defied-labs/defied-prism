import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { Generator } from "./Generator";
import type { ComponentManifest } from "../registry/ComponentManifest";
import type { RegistryClient } from "../registry/RegistryClient";
import { ManifestValidator } from "../registry/ManifestValidator";

export class VueGenerator implements Generator {
  constructor(private registry: RegistryClient) {}

  async generate(manifest: ComponentManifest): Promise<void> {
    const validManifest = ManifestValidator.validate(manifest);

    const vueEntry = validManifest.compatibility.frameworks.find(
      (framework) => framework.framework === "vue",
    );

    if (
      !vueEntry ||
      !Array.isArray(vueEntry.files) ||
      vueEntry.files.length === 0
    ) {
      throw new Error(
        `[prism] Component "${validManifest.metadata.name}" does not declare valid files for framework "vue".`,
      );
    }

    // Create temporary staging directory first for atomic writes
    const tempStagingDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `prism-gen-${validManifest.metadata.name}-`),
    );

    try {
      for (const file of vueEntry.files) {
        const rawContent = await this.registry.getFile(
          validManifest.metadata.name,
          file.source,
        );

        const targetFileName = path.basename(file.destination);
        const tempFilePath = path.join(tempStagingDir, targetFileName);

        // For Vue, we don't inject styles - we assume template handles it or it's handled separately
        await fs.writeFile(tempFilePath, rawContent, "utf8");
      }

      // Move output files from temp staging directory into final destination
      // For Vue, we need to respect the destination paths from manifest
      for (const file of vueEntry.files) {
        const fileName = path.basename(file.destination);
        const tempPath = path.join(tempStagingDir, fileName);
        const finalPath = file.destination; // Use absolute destination path from manifest

        await fs.mkdir(path.dirname(finalPath), { recursive: true });
        await fs.copyFile(tempPath, finalPath);
      }
    } finally {
      await fs.rm(tempStagingDir, { recursive: true, force: true });
    }
  }
}
