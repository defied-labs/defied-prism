import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compiles generated Vue SFCs for the Vue contract tests
  plugins: [vue()],
  resolve: {
    dedupe: ["react", "react-dom", "vue"],
  },
  test: {
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/support/setup.ts"],
    // beforeAll hooks generate components (and their registry dependencies)
    // with the real CLI and compile them; multi-file Vue components under a
    // parallel workspace run need more than the 10s default
    hookTimeout: 60_000,
  },
});
