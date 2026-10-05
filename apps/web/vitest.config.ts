import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@defied-labs/prism-core": path.resolve(__dirname, "../../packages/core"),
      "@defied-labs/prism-react": path.resolve(__dirname, "../../packages/react"),
      "@defied-labs/prism-style-engine": path.resolve(
        __dirname,
        "../../packages/style-engine",
      ),
      "@defied-labs/prism-env": path.resolve(__dirname, "../../packages/env"),
      "@defied-labs/prism-cli": path.resolve(__dirname, "../../packages/cli"),
    },
  },
});
