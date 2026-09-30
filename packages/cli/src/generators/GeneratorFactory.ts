import type { Generator } from "./Generator";
import type { ComponentManifest } from "../registry/ComponentManifest";
import type { RegistryClient } from "../registry/RegistryClient";
import type { Framework } from "../registry/ComponentManifest";
import { ReactGenerator } from "./ReactGenerator";
import type { GeneratorOptions } from "./ReactGenerator";

export function createGenerator(
  framework: Framework,
  registry: RegistryClient,
  options: GeneratorOptions,
  manifest: ComponentManifest,
): Generator {
  const supported = manifest.compatibility.frameworks.some(
    (f) => f.framework === framework,
  );

  if (!supported) {
    const declared = manifest.compatibility.frameworks
      .map((f) => f.framework)
      .join(", ");
    throw new Error(
      `Component "${manifest.metadata.name}" does not declare compatibility ` +
        `with framework "${framework}". Declared frameworks: ${
          declared || "(none)"
        }.`,
    );
  }

  switch (framework) {
    case "react":
      return new ReactGenerator(registry, options);
    default: {
      const _exhaustive: string = framework;
      void _exhaustive;
      throw new Error(`Unsupported framework: ${framework}`);
    }
  }
}
