// @vitest-environment jsdom
/** Header behavior for the Vue target; mirrors test/components/header.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick, type VNode } from "vue";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "header-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("header", "tailwind", NAMESPACE, "vue");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

/** Makes every `(max-width: …)` query match, as on a phone. */
function stubNarrowViewport() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function siteHeader(headerProps: Record<string, unknown> = {}, navProps: Record<string, unknown> = {}) {
  return h(m.Header, headerProps, () => [
    h(m.HeaderBrand, { href: "/" }, () => "Defied"),
    h(m.HeaderNav, navProps, () => [
      h(m.HeaderMenu, { value: "products" }, () => [
        h(m.HeaderMenuTrigger, {}, () => "Products"),
        h(m.HeaderMenuContent, { columns: 2 }, () => [
          h(
            m.HeaderLink,
            { href: "#prism", description: "Pick your stack." },
            { default: () => "Prism", image: () => h("img", { src: "/p.png", alt: "" }) },
          ),
          h(m.HeaderLink, { href: "#configs" }, () => "Web Configs"),
        ]),
      ]),
      h(m.HeaderMenu, { value: "blog" }, () => [
        h(m.HeaderMenuTrigger, {}, () => "Blog"),
        h(m.HeaderMenuContent, {}, () => h(m.HeaderLink, { href: "#latest" }, () => "Latest posts")),
      ]),
      h(m.HeaderItem, {}, () => h(m.HeaderLink, { href: "#pricing", active: true }, () => "Pricing")),
    ]),
    h(m.HeaderActions, {}, () => h("button", {}, "Sign in")),
    h(m.HeaderToggle),
  ]);
}

async function renderPage(header: () => VNode = () => siteHeader()) {
  render({ render: () => h("div", {}, [header(), h("main", {}, h("button", {}, "Outside"))]) });
  await nextTick(); // the viewport is read on mount
  return {
    // hidden: collapsed, the nav starts hidden
    products: screen.getByRole("button", { name: "Products", hidden: true }),
    blog: screen.getByRole("button", { name: "Blog", hidden: true }),
  };
}

const link = (name: string) => screen.queryByRole("link", { name: new RegExp(name) });
const navEl = () => document.querySelector<HTMLElement>('[data-slot="header-nav"]')!;
const viewport = () => document.querySelector<HTMLElement>('[data-slot="header-viewport"]')!;
const mouse = { pointerType: "mouse" };

describe("Header (vue)", () => {
  it("is a banner with a labelled navigation landmark", async () => {
    await renderPage();
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    expect(link("Pricing")!.getAttribute("aria-current")).toBe("page");
  });

  it("discloses a menu from its trigger, a plain-text button", async () => {
    const user = userEvent.setup();
    const { products } = await renderPage();
    expect(products.tagName).toBe("BUTTON");
    expect(products.textContent).toBe("Products");
    expect(products.getAttribute("aria-expanded")).toBe("false");
    expect(link("Prism")).toBeNull();

    await user.click(products);
    expect(products.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(products.getAttribute("aria-controls")!)).toContainElement(link("Prism"));

    await user.click(products);
    expect(link("Prism")).toBeNull();
  });

  it("renders product entries: image, title and description", async () => {
    const user = userEvent.setup();
    const { products } = await renderPage();
    await user.click(products);
    const prism = link("Prism")!;
    expect(prism.querySelector('[data-part="media"] img')).not.toBeNull();
    expect(prism.querySelector('[data-part="title"]')!.textContent).toBe("Prism");
    expect(prism.querySelector('[data-part="description"]')!.textContent).toBe("Pick your stack.");
    expect(link("Web Configs")!.querySelector("[data-part]")).toBeNull();
  });

  it("shows every menu on one shared surface", async () => {
    const user = userEvent.setup();
    const { products, blog } = await renderPage();
    expect(viewport().getAttribute("data-state")).toBe("closed");
    expect(viewport().getAttribute("aria-hidden")).toBe("true");

    await user.click(products);
    expect(viewport().getAttribute("data-state")).toBe("open");
    await user.click(blog);
    expect(products.getAttribute("aria-expanded")).toBe("false");
    expect(viewport().getAttribute("data-state")).toBe("open");
    expect(document.querySelectorAll('[data-slot="header-viewport"]')).toHaveLength(1);
  });

  it("opens with Enter and Space; Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const { products } = await renderPage();
    products.focus();
    await user.keyboard("[Enter]");
    expect(products.getAttribute("aria-expanded")).toBe("true");

    await user.tab();
    expect(document.activeElement).toBe(link("Prism"));
    await user.keyboard("[Escape]");
    expect(link("Prism")).toBeNull();
    expect(document.activeElement).toBe(products);

    await user.keyboard("[Space]");
    expect(products.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes on an outside click, when focus leaves it, and when a link is followed", async () => {
    const user = userEvent.setup();
    const { products, blog } = await renderPage();
    await user.click(products);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(products.getAttribute("aria-expanded")).toBe("false");

    await user.click(products);
    await user.tab(); // Prism
    await user.tab(); // Web Configs
    await user.tab(); // Blog trigger: out of the menu
    expect(document.activeElement).toBe(blog);
    expect(products.getAttribute("aria-expanded")).toBe("false");

    await user.click(products);
    await user.click(link("Web Configs")!);
    expect(products.getAttribute("aria-expanded")).toBe("false");
  });

  describe("hover", () => {
    it("opens on hover and switches menus as the pointer moves", async () => {
      const { products, blog } = await renderPage();
      await fireEvent.pointerEnter(products.closest("li")!, mouse);
      expect(products.getAttribute("aria-expanded")).toBe("true");

      // Leaving the item, for its menu or a gap, keeps it open
      await fireEvent.pointerLeave(products.closest("li")!, mouse);
      expect(products.getAttribute("aria-expanded")).toBe("true");

      await fireEvent.pointerEnter(blog.closest("li")!, mouse);
      expect(products.getAttribute("aria-expanded")).toBe("false");
      expect(blog.getAttribute("aria-expanded")).toBe("true");
    });

    it("closes when the pointer leaves the nav, or reaches a plain item", async () => {
      const { products } = await renderPage();
      await fireEvent.pointerEnter(products.closest("li")!, mouse);
      await fireEvent.pointerLeave(navEl(), mouse);
      expect(products.getAttribute("aria-expanded")).toBe("false");

      await fireEvent.pointerEnter(products.closest("li")!, mouse);
      await fireEvent.pointerEnter(link("Pricing")!.closest("li")!, mouse);
      expect(products.getAttribute("aria-expanded")).toBe("false");
    });

    it("ignores touch, and keeps a hovered menu open once it's clicked", async () => {
      const { products } = await renderPage();
      await fireEvent.pointerEnter(products.closest("li")!, { pointerType: "touch" });
      expect(products.getAttribute("aria-expanded")).toBe("false");

      await fireEvent.pointerEnter(products.closest("li")!, mouse);
      await fireEvent.click(products);
      expect(products.getAttribute("aria-expanded")).toBe("true");
      await fireEvent.pointerLeave(navEl(), mouse);
      expect(products.getAttribute("aria-expanded")).toBe("true");
    });
  });

  it("supports a controlled open menu", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { products } = await renderPage(() => siteHeader({}, { value: "blog", onValueChange }));
    expect(screen.getByRole("button", { name: "Blog" }).getAttribute("aria-expanded")).toBe("true");
    await user.click(products);
    expect(onValueChange).toHaveBeenCalledWith("products");
    expect(products.getAttribute("aria-expanded")).toBe("false");
  });

  it("shows the whole nav and hides the toggle while it fits", async () => {
    await renderPage();
    expect(document.querySelector<HTMLButtonElement>('[data-slot="header-toggle"]')!.hidden).toBe(true);
    expect(navEl().hasAttribute("data-state")).toBe(false);
    expect(navEl().hasAttribute("inert")).toBe(false);
    expect(document.querySelector('[data-slot="header-close"]')).toBeNull();
    expect(screen.getByRole("banner").getAttribute("data-orientation")).toBe("horizontal");
  });

  describe("collapsed", () => {
    it("slides a full-screen nav in from the toggle and out from its close button", async () => {
      stubNarrowViewport();
      const user = userEvent.setup();
      await renderPage();
      const banner = screen.getByRole("banner");
      const toggle = screen.getByRole("button", { name: "Menu" });
      expect(banner.getAttribute("data-orientation")).toBe("vertical");
      expect(navEl().getAttribute("data-state")).toBe("closed");
      expect(navEl().hasAttribute("inert")).toBe(true);
      expect(toggle.getAttribute("aria-controls")).toBe(navEl().id);

      await user.click(toggle);
      expect(navEl().getAttribute("data-state")).toBe("open");
      expect(navEl().hasAttribute("inert")).toBe(false);
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
      expect(banner.getAttribute("data-state")).toBe("open");
      expect(document.body.style.overflow).toBe("hidden");

      await user.click(screen.getByRole("button", { name: "Close menu" }));
      expect(navEl().getAttribute("data-state")).toBe("closed");
      expect(document.activeElement).toBe(toggle);
      expect(document.body.style.overflow).toBe("");
    });

    it("keeps focus inside while open", async () => {
      stubNarrowViewport();
      const user = userEvent.setup();
      const { products } = await renderPage();
      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(document.activeElement).toBe(products);
      for (let i = 0; i < 5; i++) {
        await user.tab();
        expect(navEl().contains(document.activeElement)).toBe(true);
      }
    });

    it("expands menus in place without hover; Escape closes the menu, then the nav", async () => {
      stubNarrowViewport();
      const user = userEvent.setup();
      const { products } = await renderPage();
      const toggle = screen.getByRole("button", { name: "Menu" });
      await user.click(toggle);

      await fireEvent.pointerEnter(products.closest("li")!, mouse);
      expect(products.getAttribute("aria-expanded")).toBe("false");

      await user.click(products);
      expect(document.querySelector('[data-slot="header-content"]')!.getAttribute("data-orientation")).toBe("vertical");
      expect(viewport().getAttribute("data-state")).toBe("closed");
      await user.keyboard("[Escape]");
      expect(products.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(products);

      await user.keyboard("[Escape]");
      expect(navEl().getAttribute("data-state")).toBe("closed");
      expect(document.activeElement).toBe(toggle);
    });

    it("closes when a link is followed", async () => {
      stubNarrowViewport();
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      await renderPage(() => siteHeader({ onOpenChange }));
      const toggle = screen.getByRole("button", { name: "Menu" });

      await user.click(toggle);
      await user.click(link("Pricing")!);
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  it("renders the consumer's link with asChild", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h(m.Header, {}, () => [
          h(m.HeaderBrand, { asChild: true }, () => h("a", { href: "/", "data-router": "" }, "Home")),
          h(m.HeaderNav, { defaultValue: "p" }, () =>
            h(m.HeaderMenu, { value: "p" }, () => [
              h(m.HeaderMenuTrigger, {}, () => "Products"),
              h(m.HeaderMenuContent, {}, () =>
                h(m.HeaderLink, { asChild: true }, () => h("a", { href: "/prism", "data-router": "" }, "Prism")),
              ),
            ]),
          ),
        ]),
    });
    await nextTick();
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("data-slot")).toBe("header-brand");
    const prism = link("Prism")!;
    expect(prism.hasAttribute("data-router")).toBe(true);
    expect(prism.getAttribute("data-slot")).toBe("header-link");
    await user.click(prism);
    expect(link("Prism")).toBeNull();
  });
});
