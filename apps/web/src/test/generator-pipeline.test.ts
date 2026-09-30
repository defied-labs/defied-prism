import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { ReactGenerator } from "../../../../packages/cli/src/generators/ReactGenerator";
import { createGenerator } from "../../../../packages/cli/src/generators/GeneratorFactory";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("Generator Pipeline", () => {
  const validManifest: any = {
    metadata: { name: "button" },
    compatibility: {
      frameworks: [
        {
          framework: "react",
          files: [{ source: "Button.tsx", destination: "Button.tsx" }],
        },
      ],
    },
  };

  const mockRegistry: any = {
    getFile: async (component: string, file: string) => {
      if (file === "Button.tsx") {
        return `import React from "react";
const base = {{STYLE_BASE}};
const variants = {{STYLE_VARIANTS}};
const host = {{STYLE_HOST_STATES}};
export const Button = () => <button className={base} />;`;
      }
      throw new Error("File not found");
    },
  };

  it("generates React component with Tailwind styles", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-gen-"));
    tempDirs.push(tempDir);

    const generator = new ReactGenerator(mockRegistry, {
      styling: "tailwind",
      compiledBase: "bg-primary text-white",
      compiledVariants: '{"secondary":"bg-secondary"}',
      compiledHostStates: "hover:bg-primary/80",
      styleFile: null,
      componentsPath: tempDir,
    });

    await generator.generate(validManifest);

    const generatedFile = path.join(tempDir, "Button.tsx");
    const content = await fs.readFile(generatedFile, "utf8");

    expect(content).toContain('"bg-primary text-white"');
    expect(content).toContain('{"secondary":"bg-secondary"}');
    expect(content).toContain('"hover:bg-primary/80"');
  });

  it("generates React component with CSS Modules styles", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-gen-"));
    tempDirs.push(tempDir);

    const generator = new ReactGenerator(mockRegistry, {
      styling: "css-modules",
      compiledBase: "styles.root",
      compiledVariants: "{}",
      compiledHostStates: "",
      styleFile: ".root { display: flex; }",
      componentsPath: tempDir,
    });

    await generator.generate(validManifest);

    const generatedJsx = await fs.readFile(
      path.join(tempDir, "Button.tsx"),
      "utf8",
    );
    const generatedCss = await fs.readFile(
      path.join(tempDir, "Button.module.css"),
      "utf8",
    );

    expect(generatedJsx).toContain('import styles from "./Button.module.css";');
    expect(generatedCss).toContain(".root { display: flex; }");
  });

  it("fails generation if template is missing required placeholders", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-gen-"));
    tempDirs.push(tempDir);

    const badRegistry: any = {
      getFile: async () => `const base = 123;`,
    };

    const generator = new ReactGenerator(badRegistry, {
      styling: "tailwind",
      compiledBase: "flex",
      compiledVariants: "{}",
      compiledHostStates: "",
      styleFile: null,
      componentsPath: tempDir,
    });

    await expect(generator.generate(validManifest)).rejects.toThrow(
      /missing required style placeholders/,
    );
  });

  it("throws error in createGenerator when framework is unsupported by manifest", () => {
    const reactOnlyManifest: any = {
      metadata: { name: "card" },
      compatibility: {
        frameworks: [{ framework: "react" }],
      },
    };

    expect(() =>
      createGenerator("vue", mockRegistry, {} as any, reactOnlyManifest),
    ).toThrow(/does not declare compatibility/);
  });
});
