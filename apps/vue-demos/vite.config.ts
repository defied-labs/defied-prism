import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// One self-contained ES module (Vue included) that the Next site mounts client-side
export default defineConfig({
  plugins: [vue()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "vue-demos", cssFileName: "vue-demos" },
    cssCodeSplit: false,
  },
});
