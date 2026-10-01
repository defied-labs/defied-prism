// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "avatar";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("avatar", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const root = () => document.querySelector<HTMLElement>('[data-slot="avatar"]')!;
const img = () => document.querySelector<HTMLImageElement>('[data-slot="avatar-image"]');
const fallback = () => document.querySelector<HTMLElement>('[data-slot="avatar-fallback"]');

describe("Avatar", () => {
  it("without src: a named img showing initials", () => {
    render(h(m.Avatar, { alt: "Ada Lovelace" }));
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBe(root());
    expect(root().getAttribute("data-state")).toBe("fallback");
    expect(fallback()).toHaveTextContent("AL");
    expect(fallback()?.getAttribute("aria-hidden")).toBe("true");
    expect(img()).toBeNull();
  });

  it("shows the fallback while loading, then the image once loaded", () => {
    const onStatusChange = vi.fn();
    render(h(m.Avatar, { alt: "Ada Lovelace", src: "/ada.png", onStatusChange }));
    expect(root().getAttribute("data-state")).toBe("loading");
    expect(img()!.hidden).toBe(true);
    expect(img()!.getAttribute("alt")).toBe("");
    expect(fallback()).toHaveTextContent("AL");

    fireEvent.load(img()!);
    expect(root().getAttribute("data-state")).toBe("loaded");
    expect(img()!.hidden).toBe(false);
    expect(fallback()).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith("loaded");
    // Still one accessible image, named once
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("falls back when the image fails, and retries on a new src", () => {
    const { rerender } = render(h(m.Avatar, { alt: "Ada Lovelace", src: "/broken.png" }));
    fireEvent.error(img()!);
    expect(root().getAttribute("data-state")).toBe("fallback");
    expect(img()).toBeNull();
    expect(fallback()).toHaveTextContent("AL");

    rerender(h(m.Avatar, { alt: "Ada Lovelace", src: "/ok.png" }));
    expect(root().getAttribute("data-state")).toBe("loading");
    expect(img()!.getAttribute("src")).toBe("/ok.png");
  });

  it("accepts a custom fallback", () => {
    render(h(m.Avatar, { alt: "Ada Lovelace", fallback: "?" }));
    expect(fallback()).toHaveTextContent("?");
  });

  it('is hidden from assistive technology when alt=""', () => {
    render(h(m.Avatar, { alt: "", fallback: "AL" }));
    expect(root().getAttribute("aria-hidden")).toBe("true");
    expect(root().hasAttribute("role")).toBe(false);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("derives initials", () => {
    expect(m.getInitials("Ada Lovelace")).toBe("AL");
    expect(m.getInitials("  grace  brewster murray hopper ")).toBe("gh");
    expect(m.getInitials("Cher")).toBe("C");
    expect(m.getInitials("")).toBe("");
  });
});
