// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "tabs";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("tabs", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderTabs(props: Record<string, unknown> = {}, disabled: string[] = []) {
  const values = ["account", "billing", "team", "danger"];
  return render(
    h(
      m.Tabs,
      { defaultValue: "account", ...props },
      h(
        m.TabList,
        { "aria-label": "Settings" },
        ...values.map((v) => h(m.Tab, { key: v, value: v, disabled: disabled.includes(v) }, v)),
      ),
      ...values.map((v) => h(m.TabPanel, { key: v, value: v }, `${v} panel`)),
    ),
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });
const selected = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true");

describe("Tabs", () => {
  it("wires tabs and panels together", () => {
    renderTabs();
    const account = tab("account");
    const panel = screen.getByRole("tabpanel");
    expect(account.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(account.id);
    expect(panel).toHaveTextContent("account panel");
    // Inactive panels are hidden from everyone
    expect(screen.queryByText("billing panel")).not.toBeVisible();
  });

  it("uses a roving tabindex", async () => {
    const user = userEvent.setup();
    renderTabs();
    expect(tab("account").tabIndex).toBe(0);
    expect(tab("billing").tabIndex).toBe(-1);
    await user.tab();
    expect(document.activeElement).toBe(tab("account"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"));
  });

  it("selects on click", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(tab("team"));
    expect(selected()).toBe(tab("team"));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("team panel");
  });

  it("automatic activation: arrows move focus and select, wrapping, Home/End", async () => {
    const user = userEvent.setup();
    renderTabs();
    tab("account").focus();

    await user.keyboard("[ArrowRight]");
    expect(document.activeElement).toBe(tab("billing"));
    expect(selected()).toBe(tab("billing"));

    await user.keyboard("[End]");
    expect(selected()).toBe(tab("danger"));
    await user.keyboard("[ArrowRight]");
    expect(selected()).toBe(tab("account"));
    await user.keyboard("[ArrowLeft]");
    expect(selected()).toBe(tab("danger"));
    await user.keyboard("[Home]");
    expect(selected()).toBe(tab("account"));
  });

  it("manual activation: arrows move focus only; Enter and Space select", async () => {
    const user = userEvent.setup();
    renderTabs({ activationMode: "manual" });
    tab("account").focus();

    await user.keyboard("[ArrowRight]");
    expect(document.activeElement).toBe(tab("billing"));
    expect(selected()).toBe(tab("account"));

    await user.keyboard("[Enter]");
    expect(selected()).toBe(tab("billing"));
    await user.keyboard("[ArrowRight][Space]");
    expect(selected()).toBe(tab("team"));
  });

  it("skips disabled tabs", async () => {
    const user = userEvent.setup();
    renderTabs({}, ["billing", "team"]);
    tab("account").focus();
    await user.keyboard("[ArrowRight]");
    expect(selected()).toBe(tab("danger"));
    await user.click(tab("billing"));
    expect(selected()).toBe(tab("danger"));
  });

  it("vertical orientation uses Up/Down and ignores Left/Right", async () => {
    const user = userEvent.setup();
    renderTabs({ orientation: "vertical" });
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
    tab("account").focus();
    await user.keyboard("[ArrowRight]");
    expect(selected()).toBe(tab("account"));
    await user.keyboard("[ArrowDown]");
    expect(selected()).toBe(tab("billing"));
    await user.keyboard("[ArrowUp]");
    expect(selected()).toBe(tab("account"));
  });

  it("controlled: reports changes and follows the value prop", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderTabs({ value: "account", defaultValue: undefined, onValueChange });

    await user.click(tab("billing"));
    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(selected()).toBe(tab("account"));

    rerender(
      h(
        m.Tabs,
        { value: "billing", onValueChange },
        h(m.TabList, { "aria-label": "Settings" }, h(m.Tab, { value: "account" }, "account"), h(m.Tab, { value: "billing" }, "billing")),
        h(m.TabPanel, { value: "account" }, "a"),
        h(m.TabPanel, { value: "billing" }, "b"),
      ),
    );
    expect(selected()).toBe(tab("billing"));
  });

  it("keeps the first enabled tab reachable when nothing is selected", () => {
    renderTabs({ defaultValue: undefined }, ["account"]);
    expect(selected()).toBeUndefined();
    expect(tab("billing").tabIndex).toBe(0);
  });

  it("composes user handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      h(
        m.Tabs,
        { defaultValue: "a" },
        h(m.TabList, { "aria-label": "x" }, h(m.Tab, { value: "a" }, "a"), h(m.Tab, { value: "b", onClick }, "b")),
      ),
    );
    await user.click(tab("b"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(selected()).toBe(tab("b"));
  });
});
