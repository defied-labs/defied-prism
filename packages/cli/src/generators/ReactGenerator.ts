import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { Generator } from "./Generator";
import type { ComponentManifest } from "../registry/ComponentManifest";
import type { RegistryClient } from "../registry/RegistryClient";
import { ManifestValidator } from "../registry/ManifestValidator";

export interface GeneratorOptions {
  styling: "tailwind" | "css-modules";
  compiledBase: string;
  compiledVariants: string;
  compiledHostStates: string;
  styleFile: string | null;
  componentsPath: string;
}

export class ReactGenerator implements Generator {
  constructor(
    private registry: RegistryClient,
    private options: GeneratorOptions,
  ) {}

  async generate(manifest: ComponentManifest): Promise<void> {
    const validManifest = ManifestValidator.validate(manifest);

    const reactEntry = validManifest.compatibility.frameworks.find(
      (f) => f.framework === "react",
    );

    if (
      !reactEntry ||
      !Array.isArray(reactEntry.files) ||
      reactEntry.files.length === 0
    ) {
      throw new Error(
        `[prism] Component "${validManifest.metadata.name}" does not declare valid files for framework "react".`,
      );
    }

    // Create temporary staging directory first
    const tempStagingDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `prism-gen-${validManifest.metadata.name}-`),
    );

    try {
      for (const file of reactEntry.files) {
        const rawContent = await this.registry.getFile(
          validManifest.metadata.name,
          file.source,
        );

        const targetFileName = path.basename(file.destination);
        const componentName = path.parse(targetFileName).name;

        // Only inject styles into component files (not style files which are pre-compiled CSS)
        let injectedContent = rawContent;
        if (file.type === "component") {
          injectedContent = this.injectStyles(rawContent, componentName);
        }

        const tempFilePath = path.join(tempStagingDir, targetFileName);
        await fs.writeFile(tempFilePath, injectedContent, "utf8");

        if (this.options.styling === "css-modules" && this.options.styleFile) {
          const moduleFileName = `${componentName}.module.css`;
          const tempModulePath = path.join(tempStagingDir, moduleFileName);
          await fs.writeFile(tempModulePath, this.options.styleFile, "utf8");
        }
      }

      // Move output files from temp staging directory into final componentsPath
      await fs.mkdir(this.options.componentsPath, { recursive: true });

      const generatedFiles = await fs.readdir(tempStagingDir);
      for (const fileName of generatedFiles) {
        const tempPath = path.join(tempStagingDir, fileName);
        const finalPath = path.join(this.options.componentsPath, fileName);
        await fs.copyFile(tempPath, finalPath);
      }
    } finally {
      await fs.rm(tempStagingDir, { recursive: true, force: true });
    }
  }

  private injectStyles(content: string, componentName: string): string {
    // Canonical required placeholders that MUST exist in component templates
    const REQUIRED_PLACEHOLDERS = {
      STYLE_BASE: "{{STYLE_BASE}}",
      STYLE_VARIANTS: "{{STYLE_VARIANTS}}",
      STYLE_HOST_STATES: "{{STYLE_HOST_STATES}}",
    } as const;

    // Validate that template contains ALL required placeholders
    const missingPlaceholders: string[] = [];
    for (const [key, placeholder] of Object.entries(REQUIRED_PLACEHOLDERS)) {
      if (!content.includes(placeholder)) {
        missingPlaceholders.push(placeholder);
      }
    }

    if (missingPlaceholders.length > 0) {
      throw new Error(
        `[prism] Template for component "${componentName}" is missing required style placeholders: ${missingPlaceholders.join(", ")}. ` +
          `All component templates must include: ${Object.values(REQUIRED_PLACEHOLDERS).join(", ")}`,
      );
    }

    if (this.options.styling === "tailwind") {
      // Template expects:
      // - STYLE_BASE: raw string (template adds quotes: "{{STYLE_BASE}}")
      // - STYLE_VARIANTS: JSON string for JSON.parse("{{STYLE_VARIANTS}}")
      // - STYLE_HOST_STATES: raw string (template adds quotes: "{{STYLE_HOST_STATES}}")
      const baseLiteral = this.options.compiledBase; // raw string, no JSON.stringify
      const variantsLiteral = this.options.compiledVariants || "{}"; // already JSON string from add.ts
      const hostStatesLiteral = this.options.compiledHostStates; // raw string, no JSON.stringify

      return content
        .split(REQUIRED_PLACEHOLDERS.STYLE_BASE)
        .join(baseLiteral)
        .split(REQUIRED_PLACEHOLDERS.STYLE_VARIANTS)
        .join(variantsLiteral)
        .split(REQUIRED_PLACEHOLDERS.STYLE_HOST_STATES)
        .join(hostStatesLiteral);
    }

    if (this.options.styling === "css-modules") {
      const importStatement = `import styles from "./${componentName}.module.css";\n`;
      const withImport = this.ensureImport(content, importStatement);

      return (
        withImport
          .split(REQUIRED_PLACEHOLDERS.STYLE_BASE)
          .join(this.options.compiledBase)
          .split(REQUIRED_PLACEHOLDERS.STYLE_VARIANTS)
          .join(this.options.compiledVariants || "{}")
          // Host states not used in CSS modules - remove placeholder
          .split(REQUIRED_PLACEHOLDERS.STYLE_HOST_STATES)
          .join("")
      );
    }

    return content;
  }

  private ensureImport(content: string, importStatement: string): string {
    const existing = new RegExp(
      `import\\s+styles\\s+from\\s+"\\./[\\w-]+\\.module\\.css";`,
    );

    if (existing.test(content)) {
      return content;
    }

    const importEnd = content.match(/^import[^\n]*\n+/m);

    if (importEnd && importEnd.index !== undefined) {
      const insertionPoint = importEnd.index + importEnd[0].length;
      return (
        content.slice(0, insertionPoint) +
        importStatement +
        content.slice(insertionPoint)
      );
    }

    return importStatement + content;
  }
}
