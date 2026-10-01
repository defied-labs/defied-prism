// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "divider";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("divider", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Divider", () => {
  it("horizontal: an <hr> separator", () => {
    render(h(m.Divider));
    const sep = screen.getByRole("separator");
    expect(sep.tagName).toBe("HR");
    expect(sep.getAttribute("aria-orientation")).toBeNull();
  });

  it("vertical: div role=separator with aria-orientation", () => {
    render(h(m.Divider, { orientation: "vertical" }));
    const sep = screen.getByRole("separator");
    expect(sep.tagName).toBe("DIV");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.getAttribute("data-orientation")).toBe("vertical");
  });

  it("decorative: no separator semantics in either orientation", () => {
    for (const orientation of ["horizontal", "vertical"]) {
      render(h(m.Divider, { orientation, decorative: true }));
      expect(screen.queryByRole("separator")).toBeNull();
      const el = document.querySelector('[data-slot="divider"]')!;
      expect(el.getAttribute("aria-hidden")).toBe("true");
      expect(el.getAttribute("aria-orientation")).toBeNull();
      cleanup();
    }
  });
});
