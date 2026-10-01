import type { ComponentManifest } from "../registry/ComponentManifest";

export interface Generator {
  generate(manifest: ComponentManifest): Promise<void>;
}
