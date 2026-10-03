// @vitest-environment jsdom
/** Box behavior for the Vue target; mirrors test/components/box.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "box-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("box", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

describe("Box (vue)", () => {
  it("renders a div by default and the `as` element otherwise", () => {
    show(() => h(m.Box, null, () => "a"));
    expect(document.querySelector('[data-slot="box"]')!.tagName).toBe("DIV");
    cleanup();
    show(() => h(m.Box, { as: "section", "aria-label": "Stats", padding: "md" }, () => "a"));
    const region = screen.getByRole("region", { name: "Stats" });
    expect(region.getAttribute("data-slot")).toBe("box");
    expect(region.getAttribute("data-padding")).toBe("md");
  });

  it("exposes the rendered element through a template ref", () => {
    const box = ref<{ $el: HTMLElement } | null>(null);
    show(() => h(m.Box, { as: "nav", ref: box }, () => "a"));
    expect(box.value!.$el.tagName).toBe("NAV");
  });
});
