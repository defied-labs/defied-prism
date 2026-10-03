// @vitest-environment jsdom
/** Divider behavior for the Vue target; mirrors test/components/divider.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "divider-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("divider", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

describe("Divider (vue)", () => {
  it("horizontal: an <hr> separator", () => {
    show(() => h(m.Divider));
    const sep = screen.getByRole("separator");
    expect(sep.tagName).toBe("HR");
    expect(sep.getAttribute("aria-orientation")).toBeNull();
  });

  it("vertical: div role=separator with aria-orientation", () => {
    show(() => h(m.Divider, { orientation: "vertical" }));
    const sep = screen.getByRole("separator");
    expect(sep.tagName).toBe("DIV");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.getAttribute("data-orientation")).toBe("vertical");
  });

  it("decorative: no separator semantics in either orientation", () => {
    for (const orientation of ["horizontal", "vertical"]) {
      show(() => h(m.Divider, { orientation, decorative: true }));
      expect(screen.queryByRole("separator")).toBeNull();
      const el = document.querySelector('[data-slot="divider"]')!;
      expect(el.getAttribute("aria-hidden")).toBe("true");
      expect(el.getAttribute("aria-orientation")).toBeNull();
      cleanup();
    }
  });
});
