// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "box";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("box", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Box", () => {
  it("renders a div by default and the `as` element otherwise", () => {
    render(h(m.Box, null, "a"));
    expect(document.querySelector('[data-slot="box"]')!.tagName).toBe("DIV");
    cleanup();
    render(h(m.Box, { as: "section", "aria-label": "Stats", padding: "md" }, "a"));
    const region = screen.getByRole("region", { name: "Stats" });
    expect(region.getAttribute("data-slot")).toBe("box");
    expect(region.getAttribute("data-padding")).toBe("md");
  });

  it("forwards refs to the rendered element", () => {
    let node: HTMLElement | null = null;
    render(h(m.Box, { as: "nav", ref: (el: HTMLElement | null) => void (node = el) }, "a"));
    expect(node!.tagName).toBe("NAV");
  });
});
