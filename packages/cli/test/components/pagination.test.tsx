// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "pagination";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("pagination", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const page = (n: number) => screen.getByRole("button", { name: `Page ${n}` });
const current = () => document.querySelector('[aria-current="page"]');

describe("Pagination", () => {
  it("is a labelled nav with the current page marked", () => {
    render(h(m.Pagination, { count: 10, defaultPage: 5 }));
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(current()).toBe(page(5));
    expect(page(4).hasAttribute("aria-current")).toBe(false);
  });

  it("shows ellipses, hidden from assistive tech", () => {
    const { container } = render(h(m.Pagination, { count: 10, defaultPage: 5 }));
    const ellipses = container.querySelectorAll('[data-slot="pagination-ellipsis"]');
    expect(ellipses).toHaveLength(2);
    for (const e of ellipses) expect(e.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("button", { name: "Page 2" })).toBeNull();
  });

  it("navigates uncontrolled with page, previous and next buttons", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(h(m.Pagination, { count: 10, onPageChange }));
    const previous = screen.getByRole("button", { name: "Previous page" });
    const next = screen.getByRole("button", { name: "Next page" });
    expect(previous).toBeDisabled();
    await user.click(next);
    expect(current()).toBe(page(2));
    await user.click(page(10));
    expect(current()).toBe(page(10));
    expect(next).toBeDisabled();
    await user.click(previous);
    expect(current()).toBe(page(9));
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([2, 10, 9]);
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    render(h(m.Pagination, { count: 3, defaultPage: 2 }));
    page(3).focus();
    await user.keyboard("[Enter]");
    expect(current()).toBe(page(3));
  });

  it("follows a controlled page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(h(m.Pagination, { count: 5, page: 2, onPageChange }));
    await user.click(page(3));
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(current()).toBe(page(2));
    rerender(h(m.Pagination, { count: 5, page: 4, onPageChange }));
    expect(current()).toBe(page(4));
  });

  it("does not fire for the current page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(h(m.Pagination, { count: 5, defaultPage: 3, onPageChange }));
    await user.click(page(3));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("renders links with getHref; edge links lose their href", () => {
    render(h(m.Pagination, { count: 5, defaultPage: 1, getHref: (p: number) => `?page=${p}` }));
    expect(screen.getByRole("link", { name: "Page 3" }).getAttribute("href")).toBe("?page=3");
    expect(screen.getByRole("link", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    const previous = screen.getByRole("link", { name: "Previous page" });
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    expect(previous.hasAttribute("href")).toBe(false);
    expect(screen.getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("?page=2");
  });

  it("supports siblings, boundaries and custom labels", () => {
    render(
      h(m.Pagination, {
        count: 20,
        defaultPage: 10,
        siblings: 2,
        boundaries: 2,
        getPageLabel: (p: number) => `Go to ${p}`,
      }),
    );
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Previous page",
      ...[1, 2, 8, 9, 10, 11, 12, 19, 20].map((p) => `Go to ${p}`),
      "Next page",
    ]);
  });
});
