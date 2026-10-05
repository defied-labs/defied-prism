// Adds (or replaces) the Vue target in a registry component's manifest.
// Usage: node scripts/add-vue-target.mjs <component> <file> [file...]
// Each file is relative to templates/vue/ and lands in <component>/ in the project.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [component, ...files] = process.argv.slice(2);
const manifestPath = path.resolve("packages/core/components", component, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const target = {
  framework: "vue",
  minVersion: "3.4.0",
  files: files.map((file) => ({
    source: `templates/vue/${file}`,
    destination: `${component}/${file}`,
    type: "component",
    editable: true,
  })),
  runtimeVersion: { package: "@defied-labs/prism-vue", version: "^0.1.0" },
  dependencies: [
    { package: "vue", version: ">=3.4.0", type: "peerDependency" },
    { package: "@defied-labs/prism-vue", version: "^0.1.0", type: "dependency" },
  ],
};

const frameworks = manifest.compatibility.frameworks.filter((f) => f.framework !== "vue");
manifest.compatibility.frameworks = [...frameworks, target];
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`✓ ${component}: vue target with ${files.length} file(s)`);
