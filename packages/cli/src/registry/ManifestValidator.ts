import type { ComponentManifest } from "./ComponentManifest";
import { validateContract } from "./contract";

export class ManifestValidator {
  static validate(data: unknown, componentName?: string): ComponentManifest {
    if (!data || typeof data !== "object") {
      throw new Error(
        `[prism] Malformed manifest for component "${componentName ?? "unknown"}": expected a JSON object.`,
      );
    }

    const manifest = data as Partial<ComponentManifest>;

    if (!manifest.metadata || typeof manifest.metadata !== "object") {
      throw new Error(
        `[prism] Malformed manifest for component "${componentName ?? "unknown"}": missing "metadata" block.`,
      );
    }

    if (!manifest.metadata.name) {
      throw new Error(
        `[prism] Malformed manifest for component "${componentName ?? "unknown"}": missing "metadata.name".`,
      );
    }

    if (
      componentName &&
      manifest.metadata.name.toLowerCase() !== componentName.toLowerCase()
    ) {
      throw new Error(
        `[prism] Component name mismatch: requested "${componentName}", but manifest declares "${manifest.metadata.name}".`,
      );
    }

    if (!manifest.compatibility || !Array.isArray(manifest.compatibility.frameworks)) {
      throw new Error(
        `[prism] Component "${manifest.metadata.name}" manifest is missing valid "compatibility.frameworks" array.`,
      );
    }

    const deps = manifest.registryDependencies;
    if (
      deps !== undefined &&
      (!Array.isArray(deps) || deps.some((d) => typeof d !== "string" || !/^[a-z][a-z0-9-]*$/.test(d)))
    ) {
      throw new Error(
        `[prism] Component "${manifest.metadata.name}": "registryDependencies" must be an array of component names.`,
      );
    }

    if (manifest.contract !== undefined) {
      manifest.contract = validateContract(manifest.contract, manifest.metadata.name);
    }

    return data as ComponentManifest;
  }
}
