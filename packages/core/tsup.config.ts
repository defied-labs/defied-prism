import { existsSync, readdirSync } from "node:fs";
import { defineConfig } from "tsup";

// Every component with framework-agnostic logic (an index.ts) gets its own
// entry, published as @defied/prism-core/components/<name>.
const componentEntries = Object.fromEntries(
  readdirSync("components", { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`components/${d.name}/index.ts`))
    .map((d) => [`components/${d.name}`, `components/${d.name}/index.ts`]),
);

export default defineConfig({
  entry: {
    index: "index.ts",
    machine: "machine/index.ts",
    dom: "dom/index.ts",
    tailwind: "tailwind.ts",
    ...componentEntries,
  },
  format: ["esm"],
  dts: true,
  clean: true,
});
