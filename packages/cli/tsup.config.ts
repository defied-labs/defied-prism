import { cp, readdir } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "tsup";

const registrySource = path.resolve("../core/components");
const registryTarget = path.resolve("dist/registry/components");

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  noExternal: ["@defied-labs/prism-style-engine", "@defied-labs/prism-tokens"],
  // Ship the registry as data only: manifests, compiled style.json and templates.
  async onSuccess() {
    const entries = await readdir(registrySource, { withFileTypes: true });
    for (const component of entries.filter((e) => e.isDirectory())) {
      const from = path.join(registrySource, component.name);
      const to = path.join(registryTarget, component.name);
      for (const entry of ["manifest.json", "recipe.json", "templates"]) {
        await cp(path.join(from, entry), path.join(to, entry), {
          recursive: true,
        });
      }
    }
  },
});
