// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "empty-state";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("empty-state", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderEmpty(props: Record<string, unknown> = {}) {
  render(
    h(
      m.EmptyState,
      props,
      h(m.EmptyStateIcon, {}, "*"),
      h(m.EmptyStateTitle, {}, "No results"),
      h(m.EmptyStateDescription, {}, "Try another search."),
      h(m.EmptyStateActions, {}, h("button", { type: "button" }, "Clear filters")),
    ),
  );
}

describe("EmptyState", () => {
  it("renders a level-3 heading by default", () => {
    renderEmpty();
    expect(screen.getByRole("heading", { level: 3, name: "No results" })).toBeInTheDocument();
    expect(screen.getByText("Try another search.").tagName).toBe("P");
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("headingLevel changes the heading element", () => {
    renderEmpty({ headingLevel: 2 });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.tagName).toBe("H2");
    expect(heading.getAttribute("data-slot")).toBe("empty-state-title");
  });

  it("hides the decorative icon and shares the size with every slot", () => {
    renderEmpty({ size: "sm" });
    const icon = document.querySelector('[data-slot="empty-state-icon"]')!;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    for (const slot of ["empty-state", "empty-state-icon", "empty-state-title", "empty-state-description", "empty-state-actions"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-size"), slot).toBe("sm");
    }
  });
});
