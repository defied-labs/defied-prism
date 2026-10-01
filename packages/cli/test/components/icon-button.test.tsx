// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "icon-button";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("icon-button", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const icon = h("svg", { "data-testid": "icon", viewBox: "0 0 16 16" });
const button = () => screen.getByRole("button");

describe("IconButton", () => {
  it("is named by aria-label; the icon is hidden from assistive tech", () => {
    render(h(m.IconButton, { "aria-label": "Delete" }, icon));
    expect(button()).toHaveAccessibleName("Delete");
    expect(button().getAttribute("type")).toBe("button");
    expect(screen.getByTestId("icon").closest('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
    expect(button().getAttribute("data-state")).toBe("idle");
    expect(button().getAttribute("data-variant")).toBe("ghost");
  });

  it("activates on click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(h(m.IconButton, { "aria-label": "Add", onClick }, icon));
    await user.click(button());
    await user.keyboard("[Enter][Space]");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("loading: spinner replaces the icon, stays focusable, ignores activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(h(m.IconButton, { "aria-label": "Save", loading: true, onClick }, icon));
    expect(screen.queryByTestId("icon")).toBeNull();
    expect(button().querySelector('[data-part="spinner"]')).not.toBeNull();
    expect(button().getAttribute("aria-busy")).toBe("true");
    expect(button().getAttribute("aria-disabled")).toBe("true");
    expect(button()).toHaveAccessibleName("Save");
    await user.tab();
    expect(document.activeElement).toBe(button());
    await user.keyboard("[Enter]");
    await user.click(button());
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading doesn't submit a form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    render(h("form", { onSubmit }, h(m.IconButton, { "aria-label": "Go", type: "submit", loading: true }, icon)));
    await user.click(button());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(h(m.IconButton, { "aria-label": "x", disabled: true, onClick }, icon));
    await user.click(button());
    expect(onClick).not.toHaveBeenCalled();
    expect(button().getAttribute("data-state")).toBe("disabled");
  });

  it("forwards refs", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(h(m.IconButton, { "aria-label": "x", ref }, icon));
    expect(ref.current).toBe(button());
  });
});
