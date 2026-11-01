// @vitest-environment jsdom
/** Table behavior for the Vue target; mirrors test/components/table.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "table-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("table", "tailwind", NAMESPACE, "vue");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

async function renderTable(props: Record<string, unknown> = {}, caption = true) {
  const result = render({
    render: () =>
      h(m.Table, props, () => [
        caption ? h(m.TableCaption, {}, () => "Invoices") : null,
        h(m.TableHeader, {}, () =>
          h(m.TableRow, {}, () => [h(m.TableHead, {}, () => "Invoice"), h(m.TableHead, {}, () => "Amount")]),
        ),
        h(m.TableBody, {}, () =>
          ["A", "B", "C", "D"].map((id) =>
            h(m.TableRow, { key: id }, () => [h(m.TableHead, { scope: "row" }, () => id), h(m.TableCell, {}, () => "$1")]),
          ),
        ),
      ]),
  });
  // Overflow is measured after mount, like a React effect
  await nextTick();
  return result;
}

function mockOverflow(overflow: boolean) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(overflow ? 800 : 300);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
}

const scroll = () => document.querySelector<HTMLElement>('[data-slot="table-scroll"]')!;

describe("Table (vue)", () => {
  it("is a table named by its caption, with column and row headers", async () => {
    await renderTable();
    const table = screen.getByRole("table", { name: "Invoices" });
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("rowheader")).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: "Invoice" }).getAttribute("scope")).toBe("col");
    expect(table.parentElement).toBe(scroll());
  });

  it("the scroll container adds no tab stop or landmark when the table fits", async () => {
    mockOverflow(false);
    await renderTable();
    expect(scroll().hasAttribute("tabindex")).toBe(false);
    expect(scroll().hasAttribute("role")).toBe(false);
  });

  it("becomes a focusable region named by the caption when it overflows", async () => {
    mockOverflow(true);
    await renderTable();
    const region = screen.getByRole("region", { name: "Invoices" });
    expect(region).toBe(scroll());
    await userEvent.setup().tab();
    expect(region).toHaveFocus();
  });

  it("names the region from scrollLabel or aria-label without a caption", async () => {
    mockOverflow(true);
    await renderTable({ "aria-label": "Orders" }, false);
    expect(screen.getByRole("region", { name: "Orders" })).toBeInTheDocument();
    cleanup();
    await renderTable({ scrollLabel: "Scrollable invoices" });
    expect(screen.getByRole("region", { name: "Scrollable invoices" })).toBeInTheDocument();
  });

  it("re-measures on resize", async () => {
    mockOverflow(false);
    await renderTable();
    expect(screen.queryByRole("region")).toBeNull();
    vi.restoreAllMocks();
    mockOverflow(true);
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    expect(screen.getByRole("region", { name: "Invoices" })).toBeInTheDocument();
  });

  it("striping is a variant on the body (rows stripe via :nth-child in CSS)", async () => {
    await renderTable();
    expect(document.querySelector('[data-slot="table-body"]')!.hasAttribute("data-striped")).toBe(false);
    cleanup();
    await renderTable({ striped: true });
    expect(document.querySelector('[data-slot="table-body"]')!.getAttribute("data-striped")).toBe("true");
  });

  it("propagates density to every part", async () => {
    await renderTable({ density: "compact" });
    for (const el of document.querySelectorAll("[data-slot]")) {
      expect(el.getAttribute("data-density"), el.getAttribute("data-slot")!).toBe("compact");
    }
  });

  it("lets a caller-supplied data-slot win on every part; the root's also names the scroll container", async () => {
    const s = (slot: string) => ({ "data-slot": slot });
    render({
      render: () =>
        h(m.Table, s("x"), () => [
          h(m.TableCaption, s("x-caption"), () => "Cap"),
          h(m.TableHeader, s("x-header"), () => h(m.TableRow, s("x-row"), () => h(m.TableHead, s("x-head"), () => "H"))),
          h(m.TableBody, s("x-body"), () => h(m.TableRow, {}, () => h(m.TableCell, s("x-cell"), () => "C"))),
          h(m.TableFooter, s("x-footer"), () => h(m.TableRow, {}, () => h(m.TableCell, {}, () => "F"))),
        ]),
    });
    await nextTick();
    for (const [tag, slot] of [
      ["table", "x"], ["div", "x-scroll"], ["caption", "x-caption"], ["thead", "x-header"], ["tbody", "x-body"],
      ["tfoot", "x-footer"], ["tr", "x-row"], ["th", "x-head"], ["td", "x-cell"],
    ]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.tagName.toLowerCase(), slot).toBe(tag);
    }
    expect(document.querySelector('[data-slot="table-row"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="table-cell"]')).not.toBeNull();
  });
});
