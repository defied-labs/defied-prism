/**
 * Templates contain a placeholder, so they can't be type-checked in place.
 * This generates every registry component for every CSS target with the real
 * pipeline and runs `tsc` over the output, as a user's project would.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { regenerateComponent, resolveInstallOrder } from "../src/commands/add";
import { STYLINGS, generatedRoot, selectedComponents, registryPath } from "./support/generated";

const root = path.join(generatedRoot, "types");
const packages = path.resolve(__dirname, "../..");

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("generated components", () => {
  it("type-check in every CSS target", { timeout: 120_000 }, async () => {
    rmSync(root, { recursive: true, force: true });
    for (const styling of STYLINGS) {
      for (const name of selectedComponents) {
        // With its registry dependencies alongside, as `prism add` installs them
        for (const component of await resolveInstallOrder(name, registryPath)) {
          await regenerateComponent(component, {
            framework: "react",
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
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          noUnusedLocals: true,
          isolatedModules: true,
          types: [],
          typeRoots: [path.join(__dirname, "../node_modules/@types")],
          paths: {
            "@defied-prism/core": [path.join(packages, "core/index.ts")],
            "@defied-prism/core/*": [path.join(packages, "core/*/index.ts")],
            "@defied-prism/react": [path.join(packages, "react/src/index.ts")],
            react: [path.join(__dirname, "../node_modules/@types/react")],
            "react/jsx-runtime": [path.join(__dirname, "../node_modules/@types/react/jsx-runtime.d.ts")],
            "react-dom": [path.join(__dirname, "../node_modules/@types/react-dom")],
          },
        },
        include: ["**/*.ts", "**/*.tsx"],
      }),
    );

    const tsc = createRequire(import.meta.url).resolve("typescript/bin/tsc");
    let output = "";
    try {
      execFileSync(process.execPath, [tsc, "-p", root], { encoding: "utf8" });
    } catch (error: any) {
      output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    }
    expect(output).toBe("");
  });
});
