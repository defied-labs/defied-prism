// @vitest-environment jsdom
/** Breadcrumb behavior for the Vue target; mirrors test/components/breadcrumb.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "breadcrumb-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("breadcrumb", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const NAMES = ["Home", "Docs", "Guides", "Setup", "Install"];

const trail = (props: Record<string, unknown> = {}) =>
  render({
    render: () =>
      h(m.Breadcrumb, props, () => [
        ...NAMES.slice(0, -1).map((n) =>
          h(m.BreadcrumbItem, { key: n }, () => h(m.BreadcrumbLink, { href: `/${n}` }, () => n)),
        ),
        h(m.BreadcrumbItem, { key: "page" }, () => h(m.BreadcrumbPage, {}, () => "Install")),
      ]),
  });

describe("Breadcrumb (vue)", () => {
  it("is a labelled nav landmark with an ordered list", () => {
    trail();
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.querySelector("ol")).not.toBeNull();
    // Separators are aria-hidden: only the five items are exposed
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("accepts a custom label", () => {
    trail({ "aria-label": "You are here" });
    expect(screen.getByRole("navigation", { name: "You are here" })).toBeInTheDocument();
  });

  it("inserts a hidden separator between items", () => {
    const { container } = trail({ separator: ">" });
    const separators = container.querySelectorAll('[data-slot="breadcrumb-separator"]');
    expect(separators).toHaveLength(4);
    for (const s of separators) {
      expect(s.getAttribute("aria-hidden")).toBe("true");
      expect(s).toHaveTextContent(">");
    }
  });

  it("marks the current page", () => {
    trail();
    const current = screen.getByText("Install");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.tagName).toBe("SPAN");
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("renders a custom link element with asChild", () => {
    const RouterLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup(props, { slots }) {
        return () => h("a", { href: props.to, "data-router": "" }, slots.default?.());
      },
    });
    render({
      render: () =>
        h(m.Breadcrumb, {}, () =>
          h(m.BreadcrumbItem, {}, () =>
            h(m.BreadcrumbLink, { asChild: true }, () => h(RouterLink, { to: "/home" }, () => "Home")),
          ),
        ),
    });
    const link = screen.getByRole("link", { name: "Home" });
    expect(link.getAttribute("href")).toBe("/home");
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.getAttribute("data-slot")).toBe("breadcrumb-link");
  });

  it("collapses middle items and expands them, moving focus", async () => {
    const user = userEvent.setup();
    trail({ maxItems: 3 });
    expect(screen.queryByRole("link", { name: "Docs" })).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show 3 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Docs" }));
  });

  it("respects itemsBeforeCollapse / itemsAfterCollapse", () => {
    trail({ maxItems: 4, itemsBeforeCollapse: 2, itemsAfterCollapse: 1 });
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Guides" })).toBeNull();
    expect(screen.getByRole("button", { name: "Show 2 more" })).toBeInTheDocument();
  });

  it("does not collapse when items fit", () => {
    trail({ maxItems: 5 });
    expect(screen.queryByRole("button")).toBeNull();
  });
});
