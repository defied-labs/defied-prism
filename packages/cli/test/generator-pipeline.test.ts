import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { TemplateGenerator, type GeneratorOptions } from "../src/generators/TemplateGenerator";
import { createGenerator } from "../src/generators/GeneratorFactory";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

const manifest: any = {
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

const TEMPLATE = `import React from "react";
const slots = {{STYLE_SLOTS}};
export const Button = () => <button className={slots.root.base} />;
`;

const registry: any = {
  getFile: async (_component: string, file: string) => {
    if (file === "Button.tsx") return TEMPLATE;
    throw new Error("File not found");
  },
};

async function generate(
  options: Omit<GeneratorOptions, "componentsPath">,
  source: any = registry,
) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-gen-"));
  tempDirs.push(dir);
  await new TemplateGenerator("react", source, { ...options, componentsPath: dir }).generate(manifest);
  const read = (name: string) => fs.readFile(path.join(dir, name), "utf8");
  return { dir, read };
}

describe("Generator Pipeline", () => {
  it("inlines the slots expression", async () => {
    const { read } = await generate({
      styling: "tailwind",
      slotsExpression: '{"root":{"base":"[display:flex]","variants":{}}}',
      styleFile: null,
    });
    const jsx = await read("Button.tsx");

    expect(jsx).toContain('const slots = {"root":{"base":"[display:flex]","variants":{}}};');
    expect(jsx).not.toContain("import styles");
  });

  it("emits a CSS Module and references styles.root", async () => {
    const { read } = await generate({
      styling: "css-modules",
      slotsExpression: '{ "root": { base: styles["root"], variants: {} } }',
      styleFile: ".root { display: flex; }",
    });

    const jsx = await read("Button.tsx");
    expect(jsx).toContain('import styles from "./Button.module.css";');
    expect(jsx).toContain('base: styles["root"]');
    expect(await read("Button.module.css")).toContain(".root { display: flex; }");
  });

  it("emits a plain stylesheet and a prism-<name> class for css", async () => {
    const { read } = await generate({
      styling: "css",
      slotsExpression: '{ "root": { base: "prism-button", variants: {} } }',
      styleFile: ".prism-button { display: flex; }",
    });

    const jsx = await read("Button.tsx");
    expect(jsx).toContain('import "./Button.css";');
    expect(jsx).toContain('base: "prism-button"');
    expect(await read("Button.css")).toContain(".prism-button { display: flex; }");
  });

  it("fails generation if template is missing required placeholders", async () => {
    await expect(
      generate(
        { styling: "tailwind", slotsExpression: "{}", styleFile: null },
        { getFile: async () => `const base = 123;` },
      ),
    ).rejects.toThrow(/missing required style placeholders/);
  });

  it("throws error in createGenerator when framework is unsupported by manifest", () => {
    const reactOnlyManifest: any = {
      metadata: { name: "card" },
      compatibility: { frameworks: [{ framework: "react" }] },
    };

    expect(() =>
      createGenerator("vue", registry, {} as any, reactOnlyManifest),
    ).toThrow(/does not declare compatibility/);
  });
});

describe("Generator Pipeline (Vue SFC)", () => {
  const vueManifest: any = {
    metadata: { name: "button" },
    compatibility: {
      frameworks: [
        { framework: "react", files: [{ source: "Button.tsx", destination: "Button.tsx" }] },
        { framework: "vue", files: [{ source: "Button.vue", destination: "Button.vue" }] },
      ],
    },
  };
  const SFC = `<script setup lang="ts">
import { computed } from "vue";
import { slotClass } from "@defied-prism/core";

const slots = {{STYLE_SLOTS}};
</script>

<template>
  <button :class="slotClass(slots, 'root', {})"><slot /></button>
</template>
`;
  const vueRegistry: any = {
    getFile: async (_c: string, file: string) => {
      if (file === "Button.vue") return SFC;
      throw new Error(`unexpected ${file}`);
    },
  };

  async function generateVue(options: Omit<GeneratorOptions, "componentsPath">) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-vue-"));
    tempDirs.push(dir);
    await new TemplateGenerator("vue", vueRegistry, { ...options, componentsPath: dir }).generate(vueManifest);
    return { dir, read: (name: string) => fs.readFile(path.join(dir, name), "utf8") };
  }

  it("writes only the Vue files, with the import inside <script setup>", async () => {
    const { dir, read } = await generateVue({
      styling: "css-modules",
      slotsExpression: '{ "root": { base: styles["root"], variants: {} } }',
      styleFile: ".root{display:flex}",
    });
    expect((await fs.readdir(dir)).sort()).toEqual(["Button.module.css", "Button.vue"]);
    const sfc = await read("Button.vue");
    expect(sfc).toContain(
      'import { slotClass } from "@defied-prism/core";\nimport styles from "./Button.module.css";\n',
    );
    expect(sfc.indexOf("import styles")).toBeLessThan(sfc.indexOf("</script>"));
    expect(sfc).toContain('const slots = { "root": { base: styles["root"], variants: {} } };');
    expect(sfc).not.toContain("{{STYLE_SLOTS}}");
  });

  it("adds the tailwind runtime import for tailwind", async () => {
    const { read } = await generateVue({
      styling: "tailwind",
      slotsExpression: 'tailwindSlots({"root":{"base":"flex","variants":{}}})',
      styleFile: null,
    });
    expect(await read("Button.vue")).toContain('import { tailwindSlots } from "@defied-prism/core/tailwind";');
  });

  it("createGenerator accepts vue when the manifest declares it", () => {
    expect(() =>
      createGenerator("vue", vueRegistry, { styling: "tailwind", slotsExpression: "{}", styleFile: null, componentsPath: "." }, vueManifest),
    ).not.toThrow();
  });
});

describe("Generator Pipeline (component folders)", () => {
  const files: Record<string, string> = {
    "vue/styles.ts": 'import type { StyleSlots } from "@defied-prism/core";\nexport const slots: StyleSlots = {{STYLE_SLOTS}};\n',
    "vue/Dialog.vue": '<script setup lang="ts">\nimport { slots } from "./styles";\n</script>\n<template><div /></template>\n',
    "vue/index.ts": 'export { default as Dialog } from "./Dialog.vue";\n',
  };
  const folderRegistry: any = { getFile: async (_c: string, file: string) => files[file] };
  const folderManifest = (destinations: string[]): any => ({
    metadata: { name: "dialog" },
    compatibility: {
      frameworks: [
        {
          framework: "vue",
          files: Object.keys(files).map((source, i) => ({ source, destination: destinations[i] })),
        },
      ],
    },
  });

  it("keeps destination folders and injects only the file holding the placeholder", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-folder-"));
    tempDirs.push(dir);
    await new TemplateGenerator("vue", folderRegistry, {
      styling: "css-modules",
      slotsExpression: '{ "root": { base: styles["root"], variants: {} } }',
      styleFile: ".root{}",
      componentsPath: dir,
    }).generate(folderManifest(["dialog/styles.ts", "dialog/Dialog.vue", "dialog/index.ts"]));

    expect((await fs.readdir(path.join(dir, "dialog"))).sort()).toEqual([
      "Dialog.vue",
      "index.ts",
      "styles.module.css",
      "styles.ts",
    ]);
    const styles = await fs.readFile(path.join(dir, "dialog/styles.ts"), "utf8");
    expect(styles).toContain('import styles from "./styles.module.css";');
    const sfc = await fs.readFile(path.join(dir, "dialog/Dialog.vue"), "utf8");
    expect(sfc).toBe(files["vue/Dialog.vue"]);
  });

  it.each(["../escape.ts", "dialog/../../escape.ts", path.resolve("/abs.ts")])(
    "refuses unsafe destination %s",
    async (bad) => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-unsafe-"));
      tempDirs.push(dir);
      await expect(
        new TemplateGenerator("vue", folderRegistry, {
          styling: "tailwind",
          slotsExpression: "{}",
          styleFile: null,
          componentsPath: dir,
        }).generate(folderManifest([bad, "dialog/Dialog.vue", "dialog/index.ts"])),
      ).rejects.toThrow(/unsafe destination/);
    },
  );
});

describe("Generator Pipeline (line endings)", () => {
  it("places the import inside <script setup> for CRLF templates", async () => {
    const sfc = '<script setup lang="ts">\r\nimport { slotClass } from "@defied-prism/core";\r\n\r\nconst slots = {{STYLE_SLOTS}};\r\n</script>\r\n<template><button /></template>\r\n';
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-test-crlf-"));
    tempDirs.push(dir);
    await new TemplateGenerator("vue", { getFile: async () => sfc } as any, {
      styling: "tailwind",
      slotsExpression: "tailwindSlots({})",
      styleFile: null,
      componentsPath: dir,
    }).generate({
      metadata: { name: "button" },
      compatibility: { frameworks: [{ framework: "vue", files: [{ source: "Button.vue", destination: "button/Button.vue" }] }] },
    } as any);
    const out = await fs.readFile(path.join(dir, "button/Button.vue"), "utf8");
    expect(out.startsWith("<script setup")).toBe(true);
    expect(out).toContain('from "@defied-prism/core";\r\nimport { tailwindSlots } from "@defied-prism/core/tailwind";');
  });
});
