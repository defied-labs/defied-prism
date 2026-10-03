// @vitest-environment jsdom
/** Tabs behavior for the Vue target; mirrors test/components/tabs.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "tabs-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("tabs", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const VALUES = ["account", "billing", "team", "danger"];
const show = (node: () => unknown) => render({ render: node });

function tabs(props: Record<string, unknown> = {}, disabled: string[] = [], values = VALUES) {
  return h(m.Tabs, { defaultValue: "account", ...props }, () => [
    h(m.TabList, { "aria-label": "Settings" }, () =>
      values.map((v) => h(m.Tab, { key: v, value: v, disabled: disabled.includes(v) }, () => v)),
    ),
    ...values.map((v) => h(m.TabPanel, { key: v, value: v }, () => `${v} panel`)),
  ]);
}

async function renderTabs(props: Record<string, unknown> = {}, disabled: string[] = []) {
  const result = show(() => tabs(props, disabled));
  await nextTick(); // tabs register on mount
  return result;
}

/** Fake layout: tabs 80px wide, 90px apart, 36px tall. */
function mockLayout(values: string[]) {
  const tabIndex = (el: HTMLElement) =>
    el.getAttribute("role") === "tab" ? values.indexOf(el.dataset.value ?? "") : -1;
  const spies = [
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      return tabIndex(this) >= 0 ? 80 : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      return tabIndex(this) >= 0 ? 36 : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
      return Math.max(0, tabIndex(this)) * 90;
    }),
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(0),
  ];
  return () => spies.forEach((spy) => spy.mockRestore());
}

const tab = (name: string) => screen.getByRole("tab", { name });
const selected = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true");

describe("Tabs (vue)", () => {
  it("wires tabs and panels together", async () => {
    await renderTabs();
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
    await renderTabs();
    expect(tab("account").tabIndex).toBe(0);
    expect(tab("billing").tabIndex).toBe(-1);
    await user.tab();
    expect(document.activeElement).toBe(tab("account"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"));
  });

  it("selects on click", async () => {
    const user = userEvent.setup();
    await renderTabs();
    await user.click(tab("team"));
    expect(selected()).toBe(tab("team"));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("team panel");
  });

  it("automatic activation: arrows move focus and select, wrapping, Home/End", async () => {
    const user = userEvent.setup();
    await renderTabs();
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
    await renderTabs({ activationMode: "manual" });
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
    await renderTabs({}, ["billing", "team"]);
    tab("account").focus();
    await user.keyboard("[ArrowRight]");
    expect(selected()).toBe(tab("danger"));
    await user.click(tab("billing"));
    expect(selected()).toBe(tab("danger"));
  });

  it("vertical orientation uses Up/Down and ignores Left/Right", async () => {
    const user = userEvent.setup();
    await renderTabs({ orientation: "vertical" });
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
    const value = ref("account");
    show(() => tabs({ value: value.value, defaultValue: undefined, onValueChange }));
    await nextTick();

    await user.click(tab("billing"));
    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(selected()).toBe(tab("account"));

    value.value = "billing";
    await nextTick();
    expect(selected()).toBe(tab("billing"));
  });

  it("v-model: update:modelValue drives the selection", async () => {
    const user = userEvent.setup();
    const value = ref("account");
    show(() =>
      tabs({
        modelValue: value.value,
        defaultValue: undefined,
        "onUpdate:modelValue": (next: string) => (value.value = next),
      }),
    );
    await nextTick();
    tab("account").focus();
    await user.keyboard("[ArrowRight]");
    expect(value.value).toBe("billing");
    expect(selected()).toBe(tab("billing"));
  });

  it("keeps the first enabled tab reachable when nothing is selected", async () => {
    await renderTabs({ defaultValue: undefined }, ["account"]);
    expect(selected()).toBeUndefined();
    expect(tab("billing").tabIndex).toBe(0);
  });

  it("composes user handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    show(() =>
      h(m.Tabs, { defaultValue: "a" }, () =>
        h(m.TabList, { "aria-label": "x" }, () => [
          h(m.Tab, { value: "a" }, () => "a"),
          h(m.Tab, { value: "b", onClick }, () => "b"),
        ]),
      ),
    );
    await user.click(tab("b"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(selected()).toBe(tab("b"));
  });

  it("a handler that prevents default stops selection", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Tabs, { defaultValue: "a" }, () =>
        h(m.TabList, { "aria-label": "x" }, () => [
          h(m.Tab, { value: "a" }, () => "a"),
          h(m.Tab, { value: "b", onClick: (e: MouseEvent) => e.preventDefault() }, () => "b"),
        ]),
      ),
    );
    await user.click(tab("b"));
    expect(selected()).toBe(tab("a"));
  });
  it("slides an indicator to the selected tab and a highlight to the hovered one", async () => {
    const restore = mockLayout(["account", "billing", "team", "danger"]);
    try {
      const user = userEvent.setup();
      await renderTabs();
      const list = screen.getByRole("tablist");
      const indicator = () => list.querySelector<HTMLElement>('[data-slot="tabs-indicator"]')!;
      const highlight = () => list.querySelector<HTMLElement>('[data-slot="tabs-highlight"]')!;
      expect(indicator().getAttribute("aria-hidden")).toBe("true");
      expect(indicator().style.transform).toBe("translate(0px, 0px)");
      expect(indicator().style.width).toBe("80px");
      // The indicator takes over from the selected tab's static styling
      expect(list.style.getPropertyValue("--prism-tabs-selected")).toBe("transparent");
      expect(highlight().getAttribute("data-state")).toBe("closed");

      await user.hover(tab("team"));
      expect(highlight().getAttribute("data-state")).toBe("open");
      expect(highlight().style.transform).toBe("translate(180px, 0px)");
      await user.unhover(list);
      expect(highlight().getAttribute("data-state")).toBe("closed");
      expect(highlight().style.transform).toBe("translate(0px, 0px)");

      await user.click(tab("billing"));
      expect(indicator().style.transform).toBe("translate(90px, 0px)");
    } finally {
      restore();
    }
  });

  it("keeps the static selected styling until the tabs are measured", async () => {
    await renderTabs();
    const list = screen.getByRole("tablist");
    expect(list.querySelector('[data-slot="tabs-indicator"]')).toBeNull();
    expect(list.style.getPropertyValue("--prism-tabs-selected")).toBe("");
  });
});
