// @vitest-environment jsdom
/** Grid behavior for the Vue target; mirrors test/components/grid.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h } from "vue";
import { cleanup, render } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "grid-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("grid", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });
const grid = () => document.querySelector('[data-slot="grid"]')!;

describe("Grid (vue)", () => {
  it("accepts numeric column counts as aliases", () => {
    const names = { 1: "one", 2: "two", 3: "three", 4: "four", 6: "six", 12: "twelve" } as const;
    for (const [n, name] of Object.entries(names)) {
      show(() => h(m.Grid, { columns: name }, () => "x"));
      const byName = grid().className;
      cleanup();
      show(() => h(m.Grid, { columns: Number(n) }, () => "x"));
      expect(grid().getAttribute("data-columns")).toBe(name);
      expect(grid().className).toBe(byName);
      cleanup();
    }
  });

  it("renders the requested element", () => {
    show(() => h(m.Grid, { as: "ul" }, () => h("li", null, "x")));
    expect(grid().tagName).toBe("UL");
  });
});
