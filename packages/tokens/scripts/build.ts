import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildTailwindCss, buildTokensCss, buildTokensJson } from "../src/index";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
await mkdir(dist, { recursive: true });
await writeFile(path.join(dist, "tokens.css"), buildTokensCss());
await writeFile(path.join(dist, "tailwind.css"), buildTailwindCss());
await writeFile(path.join(dist, "tokens.json"), JSON.stringify(buildTokensJson(), null, 2) + "\n");
console.log("✓ tokens.css, tailwind.css, tokens.json");
