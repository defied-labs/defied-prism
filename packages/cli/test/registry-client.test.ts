import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { LocalRegistryClient } from "../src/registry/RegistryClient";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("LocalRegistryClient", () => {
  it("reads recipe.json into a validated recipe", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-registry-"));
    tempDirs.push(tempDir);

    const componentDir = path.join(tempDir, "components", "button");
    await fs.mkdir(componentDir, { recursive: true });

    await fs.writeFile(
      path.join(componentDir, "recipe.json"),
      JSON.stringify({ name: "button", base: { background: "{color.primary}" } }),
      "utf8",
    );

    const client = new LocalRegistryClient(tempDir);
    const recipe = await client.getRecipe("button");

    expect(recipe.base).toEqual({ background: "{color.primary}" });
  });

  it("never executes a style.ts shipped by the registry", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-registry-"));
    tempDirs.push(tempDir);
    const componentDir = path.join(tempDir, "components", "evil");
    await fs.mkdir(componentDir, { recursive: true });
    await fs.writeFile(
      path.join(componentDir, "style.ts"),
      `globalThis.__pwned = true; export default { base: [] };`,
      "utf8",
    );

    const client = new LocalRegistryClient(tempDir);
    await expect(client.getRecipe("evil")).rejects.toThrow(/recipe\.json not found/);
    expect((globalThis as any).__pwned).toBeUndefined();
  });
});
