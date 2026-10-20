import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { Generator } from "./Generator";
import type { ComponentManifest } from "../registry/ComponentManifest";
import type { RegistryClient } from "../registry/RegistryClient";
import { ManifestValidator } from "../registry/ManifestValidator";
import type { PrismConfig } from "../config/types";
import type { Framework } from "../registry/ComponentManifest";

export interface GeneratorOptions {
  styling: PrismConfig["styling"];
  /** JS expression for the template's StyleSlots object. */
  slotsExpression: string;
  /** Stylesheet contents for css-modules / css. */
  styleFile: string | null;
  componentsPath: string;
}

/**
 * Placeholder every component template must contain. It is replaced by a
 * JavaScript *expression* (a StyleSlots object), so templates use it bare:
 *
 *   const slots: StyleSlots = {{STYLE_SLOTS}};
 */
const PLACEHOLDER = "{{STYLE_SLOTS}}";

/**
 * Writes a component's templates for one framework, with the compiled styles
 * injected. Templates are plain source files (`.tsx`, `.vue`); only the
 * placeholder and the stylesheet import differ between targets, and inside a
 * Vue SFC the `<script setup>` imports are found the same way as in a module.
 */
export class TemplateGenerator implements Generator {
  constructor(
    private framework: Framework,
    private registry: RegistryClient,
    private options: GeneratorOptions,
  ) {}

  async generate(manifest: ComponentManifest): Promise<void> {
    const validManifest = ManifestValidator.validate(manifest);

    const entry = validManifest.compatibility.frameworks.find(
      (f) => f.framework === this.framework,
    );

    if (
      !entry ||
      !Array.isArray(entry.files) ||
      entry.files.length === 0
    ) {
      throw new Error(
        `[prism] Component "${validManifest.metadata.name}" does not declare valid files for framework "${this.framework}".`,
      );
    }

    // Stage everything first so a failure never leaves half-written output.
    const stagingDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `prism-gen-${validManifest.metadata.name}-`),
    );

    try {
      let injected = 0;
      for (const file of entry.files) {
        const destination = this.safeDestination(file.destination, validManifest.metadata.name);
        const isComponent = (file.type ?? "component") === "component";

        const raw = await this.registry.getFile(
          validManifest.metadata.name,
          file.source,
        );
        // Compound Vue components keep their slots in one file; the rest import it
        const hasSlots = isComponent && raw.includes(PLACEHOLDER);
        const baseName = path.parse(destination).name;
        const content = hasSlots ? this.injectStyles(raw, baseName) : raw;
        await this.stage(stagingDir, destination, content);

        const stylesheet = this.stylesheetName(baseName);
        if (hasSlots && stylesheet) {
          if (this.options.styleFile === null) {
            throw new Error(
              `[prism] ${this.options.styling} generation for "${baseName}" produced no stylesheet.`,
            );
          }
          await this.stage(
            stagingDir,
            path.join(path.dirname(destination), stylesheet),
            this.options.styleFile,
          );
        }
        if (hasSlots) injected++;
      }

      if (injected === 0) {
        throw new Error(
          `[prism] Template for component "${validManifest.metadata.name}" is missing required style placeholders: ${PLACEHOLDER}.`,
        );
      }

      await fs.cp(stagingDir, this.options.componentsPath, { recursive: true });
    } finally {
      await fs.rm(stagingDir, { recursive: true, force: true });
    }
  }

  private async stage(stagingDir: string, destination: string, content: string) {
    const target = path.join(stagingDir, destination);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
  }

  /** A relative path inside the components directory; registries may be remote. */
  private safeDestination(destination: string, component: string): string {
    const normalized = path.normalize(destination);
    if (
      path.isAbsolute(normalized) ||
      normalized.split(/[\\/]/).includes("..")
    ) {
      throw new Error(
        `[prism] Component "${component}" declares an unsafe destination: "${destination}".`,
      );
    }
    return normalized;
  }

  private stylesheetName(componentName: string): string | null {
    switch (this.options.styling) {
      case "css-modules":
        return `${componentName}.module.css`;
      case "css":
        return `${componentName}.css`;
      default:
        return null;
    }
  }

  private injectStyles(content: string, componentName: string): string {
    if (!content.includes(PLACEHOLDER)) {
      throw new Error(
        `[prism] Template for component "${componentName}" is missing required style placeholders: ${PLACEHOLDER}.`,
      );
    }

    const stylesheet = this.stylesheetName(componentName);
    const withImport =
      this.options.styling === "css-modules"
        ? this.addImport(content, `import styles from "./${stylesheet}";
`)
        : this.options.styling === "css"
          ? this.addImport(content, `import "./${stylesheet}";
`)
          : this.addImport(content, `import { tailwindSlots } from "@defied/prism-core/tailwind";
`);

    return withImport.split(PLACEHOLDER).join(this.options.slotsExpression);
  }

  /** Insert after the last top-level import. */
  private addImport(content: string, importStatement: string): string {
    if (content.includes(importStatement.trim())) return content;

    const imports = [...content.matchAll(/^import[\s\S]*?from\s+["'][^"']+["'];?\r?\n/gm)];
    const last = imports.at(-1);
    if (last?.index !== undefined) {
      const at = last.index + last[0].length;
      return content.slice(0, at) + importStatement + content.slice(at);
    }
    return importStatement + content;
  }
}
