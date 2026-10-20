/**
 * The Vue twin of generated-types.test.ts: generates every Vue registry
 * component for every CSS target and runs `vue-tsc` over the output, as a
 * Vue project would. Vitest strips types from SFCs, so only this catches a
 * type error in a Vue template.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { regenerateComponent, resolveInstallOrder } from "../src/commands/add";
import { STYLINGS, componentsFor, generatedRoot, registryPath } from "./support/generated";

const root = path.join(generatedRoot, "types-vue");
const packages = path.resolve(__dirname, "../..");

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("generated Vue components", () => {
  it("type-check in every CSS target", { timeout: 240_000 }, async () => {
    rmSync(root, { recursive: true, force: true });
    for (const styling of STYLINGS) {
      for (const name of componentsFor("vue")) {
        // With its registry dependencies alongside, as `prism add` installs them
        for (const component of await resolveInstallOrder(name, registryPath)) {
          await regenerateComponent(component, {
            framework: "vue",
            styling,
            registryPath,
            componentsPath: path.join(root, styling, name),
          });
        }
      }
    }

    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "css.d.ts"),
      `declare module "*.module.css" { const styles: Record<string, string>; export default styles; }\ndeclare module "*.css";\n`,
    );
    writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "preserve",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          noUnusedLocals: true,
          isolatedModules: true,
          types: [],
          typeRoots: [path.join(__dirname, "../node_modules/@types")],
          paths: {
            "@defied/prism-core": [path.join(packages, "core/index.ts")],
            "@defied/prism-core/*": [path.join(packages, "core/*/index.ts")],
            "@defied/prism-vue": [path.join(packages, "vue/src/index.ts")],
          },
        },
        include: ["**/*.ts", "**/*.vue"],
        // create-vue defaults; strictTemplates rejects every data-* attribute
        vueCompilerOptions: {},
      }),
    );

    const tsc = createRequire(import.meta.url).resolve("vue-tsc/bin/vue-tsc.js");
    let output = "";
    try {
      execFileSync(process.execPath, [tsc, "-p", root], { encoding: "utf8" });
    } catch (error: any) {
      output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    }
    expect(output).toBe("");
  });
});
