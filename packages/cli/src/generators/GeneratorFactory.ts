import type { Generator } from "./Generator";
import type { ComponentManifest } from "../registry/ComponentManifest";
import type { RegistryClient } from "../registry/RegistryClient";
import type { Framework } from "../registry/ComponentManifest";
import { TemplateGenerator } from "./TemplateGenerator";
import type { GeneratorOptions } from "./TemplateGenerator";

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
    case "vue":
      return new TemplateGenerator(framework, registry, options);
    default: {
      const _exhaustive: never = framework;
      void _exhaustive;
      throw new Error(`Unsupported framework: ${framework}`);
    }
  }
}
