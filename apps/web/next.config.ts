import "@defied/prism-env/web";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appDir, "../..");
const turbopackRoot = existsSync(join(workspaceRoot, "packages")) ? workspaceRoot : appDir;

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  turbopack: {
    root: turbopackRoot,
  },
};

// Compiles content/docs (MDX) for the /docs site
const withMDX = createMDX();

export default withMDX(nextConfig);
