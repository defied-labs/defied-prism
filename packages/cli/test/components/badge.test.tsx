// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "badge";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("badge", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Badge", () => {
  it("is plain, non-focusable text with a decorative icon", () => {
    render(h(m.Badge, { status: "success" }, h(m.BadgeIcon, {}, "✓"), "Paid"));
    const badge = screen.getByText("Paid");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-status")).toBe("success");
    expect(badge.hasAttribute("tabindex")).toBe(false);
    expect(badge.hasAttribute("role")).toBe(false);
    expect(badge.querySelector('[data-part="icon"]')?.getAttribute("aria-hidden")).toBe("true");
    expect(badge).toHaveAccessibleName("");
  });
});
