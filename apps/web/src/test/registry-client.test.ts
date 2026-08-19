import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { LocalRegistryClient } from "../../../../packages/cli/src/registry/RegistryClient";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("LocalRegistryClient", () => {
  it("parses registry style files into a style definition object", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "prism-registry-"));
    tempDirs.push(tempDir);

    const componentDir = path.join(tempDir, "components", "button");
    await fs.mkdir(componentDir, { recursive: true });

    await fs.writeFile(
      path.join(componentDir, "style.ts"),
      `import { defineStyle, bg, text, rounded } from "@defied-prism/style-engine";

export default defineStyle({
  base: [bg("blue-500"), text("white"), rounded("md")],
});
`,
      "utf8",
    );

    const client = new LocalRegistryClient(tempDir);
    const style = await client.getStyle("button");

    expect(style).toBeDefined();
    expect(style.base).toHaveLength(3);
    expect(style.base[0]).toMatchObject({ property: "background", value: "blue-500" });
    expect(style.base[1]).toMatchObject({ property: "color", value: "white" });
    expect(style.base[2]).toMatchObject({ property: "borderRadius", value: "md" });
  });
});
