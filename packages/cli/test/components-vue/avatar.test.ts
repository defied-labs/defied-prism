// @vitest-environment jsdom
/** Avatar behavior for the Vue target; mirrors test/components/avatar.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h } from "vue";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
// @testing-library/vue bundles dom-testing-library 9, whose role map still treats
// <img alt=""> as an img; v10 (what the React tests use) maps it to presentation.
import { screen as dom10 } from "@testing-library/dom";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "avatar-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("avatar", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

const root = () => document.querySelector<HTMLElement>('[data-slot="avatar"]')!;
const img = () => document.querySelector<HTMLImageElement>('[data-slot="avatar-image"]');
const fallback = () => document.querySelector<HTMLElement>('[data-slot="avatar-fallback"]');

describe("Avatar (vue)", () => {
  it("without src: a named img showing initials", () => {
    show(() => h(m.Avatar, { alt: "Ada Lovelace" }));
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBe(root());
    expect(root().getAttribute("data-state")).toBe("fallback");
    expect(fallback()).toHaveTextContent("AL");
    expect(fallback()?.getAttribute("aria-hidden")).toBe("true");
    expect(img()).toBeNull();
  });

  it("shows the fallback while loading, then the image once loaded", async () => {
    const onStatusChange = vi.fn();
    show(() => h(m.Avatar, { alt: "Ada Lovelace", src: "/ada.png", onStatusChange }));
    expect(root().getAttribute("data-state")).toBe("loading");
    expect(img()!.hidden).toBe(true);
    expect(img()!.getAttribute("alt")).toBe("");
    expect(fallback()).toHaveTextContent("AL");

    await fireEvent.load(img()!);
    expect(root().getAttribute("data-state")).toBe("loaded");
    expect(img()!.hidden).toBe(false);
    expect(fallback()).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith("loaded");
    // Still one accessible image, named once
    expect(dom10.getAllByRole("img")).toHaveLength(1);
  });

  it("falls back when the image fails, and retries on a new src", async () => {
    const { rerender } = render(m.Avatar, { props: { alt: "Ada Lovelace", src: "/broken.png" } });
    await fireEvent.error(img()!);
    expect(root().getAttribute("data-state")).toBe("fallback");
    expect(img()).toBeNull();
    expect(fallback()).toHaveTextContent("AL");

    await rerender({ alt: "Ada Lovelace", src: "/ok.png" });
    expect(root().getAttribute("data-state")).toBe("loading");
    expect(img()!.getAttribute("src")).toBe("/ok.png");
  });

  it("accepts a custom fallback", () => {
    show(() => h(m.Avatar, { alt: "Ada Lovelace", fallback: "?" }));
    expect(fallback()).toHaveTextContent("?");
  });

  it("accepts a fallback slot", () => {
    show(() => h(m.Avatar, { alt: "Ada Lovelace" }, { fallback: () => "AdaL" }));
    expect(fallback()).toHaveTextContent("AdaL");
  });

  it('is hidden from assistive technology when alt=""', () => {
    show(() => h(m.Avatar, { alt: "", fallback: "AL" }));
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
