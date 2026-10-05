import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addStylesheetImports, detectPackageManager, initCommand } from "../src/commands/init";

describe("addStylesheetImports", () => {
  it("inserts after the tailwind import, in order", () => {
    const css = `@import "tailwindcss";\n\nbody {}\n`;
    expect(addStylesheetImports(css, "tailwind", "./prism-theme.css")).toBe(
      `@import "tailwindcss";\n@import "@defied-labs/prism-tokens/tokens.css";\n@import "@defied-labs/prism-tokens/tailwind.css";\n@import "./prism-theme.css";\n\nbody {}\n`,
    );
  });

  it("prepends without tailwind, skips tailwind.css for other stylings", () => {
    expect(addStylesheetImports("body {}\n", "css")).toBe(`@import "@defied-labs/prism-tokens/tokens.css";\nbody {}\n`);
  });

  it("is idempotent", () => {
    const once = addStylesheetImports(`@import "tailwindcss";\n`, "tailwind", "./prism-theme.css");
    expect(addStylesheetImports(once, "tailwind", "./prism-theme.css")).toBe(once);
  });
});

describe("initCommand", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(join(tmpdir(), "prism-init-"));
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("writes config, theme and stylesheet imports", async () => {
    await fs.mkdir(join(dir, "src"));
    await fs.writeFile(join(dir, "src/index.css"), `@import "tailwindcss";\n`);
    await initCommand({ cwd: dir, primary: "#0d9488", install: false });

    expect(JSON.parse(await fs.readFile(join(dir, "prism.json"), "utf8")).styling).toBe("tailwind");
    expect(await fs.readFile(join(dir, "src/prism-theme.css"), "utf8")).toContain("--");
    expect(await fs.readFile(join(dir, "src/index.css"), "utf8")).toContain(`@import "./prism-theme.css";`);
  });

  it("refuses to overwrite prism.json and rejects bad colors before writing", async () => {
    await expect(initCommand({ cwd: dir, primary: "nope", install: false })).rejects.toThrow(/Unsupported color/);
    await expect(fs.access(join(dir, "prism.json"))).rejects.toThrow();
    await initCommand({ cwd: dir, install: false });
    await expect(initCommand({ cwd: dir, install: false })).rejects.toThrow(/already exists/);
  });

  it("detects the package manager from the lockfile", async () => {
    expect(detectPackageManager(dir)).toBe("npm");
    await fs.writeFile(join(dir, "pnpm-lock.yaml"), "");
    expect(detectPackageManager(dir)).toBe("pnpm");
  });
});
