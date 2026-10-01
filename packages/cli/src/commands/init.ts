import fs from "node:fs/promises";

import type { PrismConfig } from "../config/types";

export interface InitOptions {
  framework?: PrismConfig["framework"];
}

export async function initCommand(options: InitOptions = {}) {
  const framework = options.framework ?? "react";
  const config = {
    framework,

    styling: "tailwind",

    componentsPath: "src/components/ui",

    components: [],
  };

  await fs.writeFile(
    "prism.json",

    JSON.stringify(config, null, 2) + "\n",
  );

  console.log(`✓ Prism initialized (${framework})`);
  console.log(`
Next steps:
  1. Install the runtime:
       npm install @defied-prism/tokens @defied-prism/${framework} @defied-prism/core
  2. Load the design tokens once, in your global stylesheet or entry file:
       @import "@defied-prism/tokens/tokens.css";
     With Tailwind styling (the default), also expose them as theme values,
     after @import "tailwindcss" (components use bg-primary, px-4…):
       @import "@defied-prism/tokens/tailwind.css";
  3. Use your brand colors (optional):
       npx prism theme --primary "#0d9488"
  4. Add components:
       npx prism add button`);
}
