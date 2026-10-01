import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { missingStylesheetImports } from "../src/commands/stylesheet-check";

const dirs: string[] = [];
const project = (files: Record<string, string>) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "prism-css-"));
  dirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("missingStylesheetImports", () => {
  it("tailwind needs both tokens.css and tailwind.css", async () => {
    const cwd = project({ "src/index.css": '@import "tailwindcss";\n@import "@defied-prism/tokens/tokens.css";' });
    const missing = await missingStylesheetImports("tailwind", cwd);
    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain("tailwind.css");
    expect(await missingStylesheetImports("css", cwd)).toEqual([]);
  });

  it("finds imports anywhere in the project, but not in node_modules", async () => {
    const cwd = project({
      "app/styles/globals.css": '@import "@defied-prism/tokens/tokens.css";\n@import "@defied-prism/tokens/tailwind.css";',
      "node_modules/x/a.css": "",
    });
    expect(await missingStylesheetImports("tailwind", cwd)).toEqual([]);
    const bare = project({ "node_modules/x/a.css": '@import "@defied-prism/tokens/tokens.css";' });
    expect(await missingStylesheetImports("css", bare)).toHaveLength(1);
  });
});
