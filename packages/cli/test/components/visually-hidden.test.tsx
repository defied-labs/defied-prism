// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "visually-hidden";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("visually-hidden", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("VisuallyHidden", () => {
  it("keeps content in the accessibility tree", () => {
    render(
      h("button", null, h("span", { "aria-hidden": true }, "×"), h(m.VisuallyHidden, null, "Close")),
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    expect(document.querySelector('[data-slot="visually-hidden"]')!.tagName).toBe("SPAN");
  });

  it("is not focusable-revealed by default", () => {
    render(h(m.VisuallyHidden, null, "Hidden"));
    const el = screen.getByText("Hidden");
    expect(el.getAttribute("data-focusable")).toBeNull();
    expect(el.className).not.toContain("focus:");
  });

  it("focusable + asChild: the skip link itself is hidden until focused", async () => {
    const user = userEvent.setup();
    render(
      h(m.VisuallyHidden, { focusable: true, asChild: true }, h("a", { href: "#main" }, "Skip to content")),
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link.getAttribute("data-slot")).toBe("visually-hidden");
    expect(link.getAttribute("data-focusable")).toBe("true");
    // Reveal styles apply on :focus
    expect(link.className).toContain("focus:");
    await user.tab();
    expect(document.activeElement).toBe(link);
  });
});
