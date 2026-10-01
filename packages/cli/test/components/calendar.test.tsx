// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "calendar";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("calendar", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderCalendar(props: Record<string, unknown> = {}) {
  return render(h(m.Calendar, { today: "2024-01-10", ...props }));
}

const heading = () => screen.getByRole("heading");
const cell = (iso: string) => document.querySelector<HTMLElement>(`[data-date="${iso}"]`)!;
const focusedISO = () => (document.activeElement as HTMLElement).getAttribute("data-date");
const tabStops = () => [...document.querySelectorAll('[role="gridcell"][tabindex="0"]')];

describe("Calendar", () => {
  it("renders a labelled month grid with weekday headers", () => {
    renderCalendar({ defaultValue: "2024-01-15" });
    expect(heading()).toHaveTextContent("January 2024");
    const grid = screen.getByRole("grid", { name: "January 2024" });
    expect(grid).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "January 2024" })).toBeInTheDocument();
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((th) => th.textContent)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(headers[0]!.getAttribute("abbr")).toBe("Sunday");
    expect(screen.getByRole("gridcell", { name: "Monday, January 15, 2024" })).toHaveAttribute("aria-selected", "true");
  });

  it("marks today", () => {
    renderCalendar();
    expect(cell("2024-01-10").getAttribute("aria-current")).toBe("date");
    expect(cell("2024-01-10").querySelector('[data-part="today"]')).not.toBeNull();
    expect(cell("2024-01-11").hasAttribute("aria-current")).toBe(false);
  });

  it("uses a single roving tab stop, starting at the selected date or today", async () => {
    const user = userEvent.setup();
    renderCalendar({ defaultValue: "2024-01-20" });
    expect(tabStops()).toEqual([cell("2024-01-20")]);
    await user.tab(); // previous month
    await user.tab(); // next month
    await user.tab();
    expect(focusedISO()).toBe("2024-01-20");
    cleanup();
    renderCalendar();
    expect(tabStops()).toEqual([cell("2024-01-10")]);
  });

  // Dozens of simulated key presses, each a full re-render: slow under a
  // loaded parallel run, so it gets more than the default 5s
  it("navigates with arrows, Home/End and pages, changing months", { timeout: 20_000 }, async () => {
    const user = userEvent.setup();
    renderCalendar({ defaultValue: "2024-01-31" });
    cell("2024-01-31").focus();
    await user.keyboard("[ArrowRight]");
    expect(focusedISO()).toBe("2024-02-01");
    expect(heading()).toHaveTextContent("February 2024");
    await user.keyboard("[ArrowLeft]");
    expect(focusedISO()).toBe("2024-01-31");
    await user.keyboard("[ArrowUp]");
    expect(focusedISO()).toBe("2024-01-24");
    await user.keyboard("[ArrowDown]");
    expect(focusedISO()).toBe("2024-01-31");
    await user.keyboard("[Home]");
    expect(focusedISO()).toBe("2024-01-28");
    await user.keyboard("[End]");
    expect(focusedISO()).toBe("2024-02-03");
    await user.keyboard("[PageUp]");
    expect(focusedISO()).toBe("2024-01-03");
    cell("2024-01-31").focus();
    await user.keyboard("[PageDown]");
    expect(focusedISO()).toBe("2024-02-29");
    await user.keyboard("{Shift>}[PageDown]{/Shift}");
    expect(focusedISO()).toBe("2025-02-28");
    expect(heading()).toHaveTextContent("February 2025");
    await user.keyboard("{Shift>}[PageUp]{/Shift}");
    expect(focusedISO()).toBe("2024-02-28");
    expect(tabStops()).toHaveLength(1);
  });

  it("selects with Enter, Space and click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCalendar({ onValueChange });
    cell("2024-01-10").focus();
    await user.keyboard("[ArrowRight][Enter]");
    expect(onValueChange).toHaveBeenLastCalledWith("2024-01-11");
    expect(cell("2024-01-11")).toHaveAttribute("aria-selected", "true");
    await user.keyboard("[ArrowRight][Space]");
    expect(onValueChange).toHaveBeenLastCalledWith("2024-01-12");
    await user.click(cell("2024-01-20"));
    expect(onValueChange).toHaveBeenLastCalledWith("2024-01-20");
    expect(cell("2024-01-12")).toHaveAttribute("aria-selected", "false");
  });

  it("supports controlled value and month", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onMonthChange = vi.fn();
    renderCalendar({ value: "2024-03-05", onValueChange, month: "2024-03-01", onMonthChange });
    expect(heading()).toHaveTextContent("March 2024");
    await user.click(cell("2024-03-06"));
    expect(onValueChange).toHaveBeenCalledWith("2024-03-06");
    expect(cell("2024-03-05")).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenCalledWith("2024-04-01");
    expect(heading()).toHaveTextContent("March 2024");
  });

  it("navigates months with named buttons", async () => {
    const user = userEvent.setup();
    renderCalendar({ defaultMonth: "2024-12-10" });
    const next = screen.getByRole("button", { name: "Next month" });
    // A Prism IconButton sized with the calendar
    expect(next.getAttribute("data-slot")).toBe("calendar-nav-button");
    expect(next.getAttribute("data-variant")).toBe("ghost");
    expect(next.getAttribute("data-size")).toBe("md");
    await user.click(next);
    expect(heading()).toHaveTextContent("January 2025");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(heading()).toHaveTextContent("November 2024");
    expect(tabStops()).toHaveLength(1);
    expect(heading()).toHaveAttribute("aria-live", "polite");
  });

  it("respects min/max: disables dates, clamps focus and month buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCalendar({ min: "2024-01-05", max: "2024-02-10", onValueChange });
    expect(cell("2024-01-04")).toHaveAttribute("aria-disabled", "true");
    expect(cell("2024-01-05")).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await user.click(cell("2024-01-04"));
    expect(onValueChange).not.toHaveBeenCalled();

    cell("2024-01-10").focus();
    await user.keyboard("[PageDown]");
    expect(focusedISO()).toBe("2024-02-10");
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    await user.keyboard("[ArrowRight]");
    expect(focusedISO()).toBe("2024-02-10");
  });

  it("keeps disabled dates focusable but not selectable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCalendar({ onValueChange, isDateDisabled: (d: string) => d === "2024-01-11" });
    cell("2024-01-10").focus();
    await user.keyboard("[ArrowRight]");
    expect(focusedISO()).toBe("2024-01-11");
    expect(cell("2024-01-11")).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("[Enter]");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("localizes labels and week start", () => {
    renderCalendar({ locale: "fr-FR", weekStartsOn: 1, defaultValue: "2024-01-15" });
    expect(heading()).toHaveTextContent(/janvier 2024/i);
    const headers = screen.getAllByRole("columnheader");
    expect(headers[0]!.getAttribute("abbr")).toBe("lundi");
    // Jan 1 2024 is a Monday: first cell of the first row
    const firstRow = screen.getAllByRole("row")[1]!;
    expect(firstRow.querySelector("[data-date]")!.getAttribute("data-date")).toBe("2024-01-01");
    expect(firstRow.querySelector('[role="gridcell"]')).toBe(cell("2024-01-01"));
  });

  it("Home/End follow the configured week start", async () => {
    const user = userEvent.setup();
    renderCalendar({ weekStartsOn: 1 });
    cell("2024-01-10").focus();
    await user.keyboard("[Home]");
    expect(focusedISO()).toBe("2024-01-08");
    await user.keyboard("[End]");
    expect(focusedISO()).toBe("2024-01-14");
  });

  it("is inert when disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCalendar({ disabled: true, onValueChange });
    expect(tabStops()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    await user.click(cell("2024-01-12"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("composes user handlers and forwards props", async () => {
    const onKeyDown = vi.fn();
    render(h(m.Calendar, { today: "2024-01-10", "aria-label": "Start date", onKeyDown, id: "cal" }));
    const group = screen.getByRole("group", { name: "Start date" });
    expect(group.id).toBe("cal");
    cell("2024-01-10").focus();
    await userEvent.setup().keyboard("[ArrowRight]");
    expect(onKeyDown).toHaveBeenCalled();
    expect(focusedISO()).toBe("2024-01-11");
  });
});
