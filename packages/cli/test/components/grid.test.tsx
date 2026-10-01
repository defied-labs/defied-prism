// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "grid";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("grid", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const grid = () => document.querySelector('[data-slot="grid"]')!;

describe("Grid", () => {
  it("accepts numeric column counts as aliases", () => {
    const names = { 1: "one", 2: "two", 3: "three", 4: "four", 6: "six", 12: "twelve" } as const;
    for (const [n, name] of Object.entries(names)) {
      render(h(m.Grid, { columns: name }, "x"));
      const byName = grid().className;
      cleanup();
      render(h(m.Grid, { columns: Number(n) }, "x"));
      expect(grid().getAttribute("data-columns")).toBe(name);
      expect(grid().className).toBe(byName);
      cleanup();
    }
  });
});
