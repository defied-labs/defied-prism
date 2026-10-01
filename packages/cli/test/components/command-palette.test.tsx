// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "command-palette";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("command-palette", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const items = [
  { value: "new", label: "New file", group: "File" },
  { value: "open", label: "Open file", group: "File" },
  { value: "close", label: "Close file", group: "File", disabled: true },
  { value: "theme", label: "Toggle theme", group: "View", keywords: ["dark mode"] },
  { value: "help", label: "Help" },
];
type ItemData = (typeof items)[number] & { onSelect?: () => void };

/** Build compound children from item data, grouping by first appearance. */
function paletteChildren(list: ItemData[] = items, emptyMessage: ReactNode = "No results") {
  const item = (i: ItemData) =>
    h(m.CommandItem, { key: i.value, value: i.value, keywords: i.keywords, disabled: i.disabled, onSelect: i.onSelect }, i.label);
  const groups: [string | undefined, ItemData[]][] = [];
  for (const i of list) {
    const g = groups.find(([heading]) => heading === i.group);
    if (g) g[1].push(i);
    else groups.push([i.group, [i]]);
  }
  return [
    h(m.CommandInput, { key: "input" }),
    h(
      m.CommandList,
      { key: "list" },
      groups.map(([heading, members], index) =>
        h(m.CommandGroup, { key: heading ?? `none-${index}`, heading }, members.map(item)),
      ),
    ),
    h(m.CommandEmpty, { key: "empty" }, emptyMessage),
  ];
}

function palette({ items: list, emptyMessage = "No results", ...props }: Record<string, unknown> = {}) {
  return h(m.CommandPalette, props, ...paletteChildren(list as ItemData[] | undefined, emptyMessage as ReactNode));
}

const input = () => screen.getByRole("combobox");
const highlighted = () => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : null;
};

function renderPalette(props: Record<string, unknown> = {}) {
  return render(
    h("div", {}, h("button", {}, "Outside"), palette({ defaultOpen: true, ...props })),
  );
}

describe("CommandPalette", () => {
  it("is a named modal dialog with a combobox controlling a listbox", () => {
    renderPalette();
    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(input());
    const listbox = screen.getByRole("listbox");
    expect(input().getAttribute("aria-controls")).toBe(listbox.id);
    expect(input().getAttribute("aria-expanded")).toBe("true");
    // The page behind is inert
    expect(screen.queryByRole("button", { name: "Outside" })).toBeNull();
  });

  it("renders labelled groups", () => {
    renderPalette();
    const groups = screen.getAllByRole("group");
    expect(groups.map((g) => g.getAttribute("aria-labelledby") && document.getElementById(g.getAttribute("aria-labelledby")!)?.textContent)).toEqual(["File", "View", null]);
    expect(screen.getByRole("group", { name: "File" }).querySelectorAll('[role="option"]')).toHaveLength(3);
  });

  it("navigates with arrows, Home and End, skipping disabled items and wrapping", async () => {
    const user = userEvent.setup();
    renderPalette();
    expect(highlighted()).toBe("New file");
    await user.keyboard("[ArrowDown]");
    expect(highlighted()).toBe("Open file");
    await user.keyboard("[ArrowDown]");
    expect(highlighted()).toBe("Toggle theme");
    await user.keyboard("[End]");
    expect(highlighted()).toBe("Help");
    await user.keyboard("[ArrowDown]");
    expect(highlighted()).toBe("New file");
    await user.keyboard("[ArrowUp]");
    expect(highlighted()).toBe("Help");
    await user.keyboard("[Home]");
    expect(highlighted()).toBe("New file");
    expect(screen.getByRole("option", { name: "New file" }).getAttribute("aria-selected")).toBe("true");
  });

  it("filters by label and keywords and highlights the first match", async () => {
    const user = userEvent.setup();
    renderPalette();
    await user.type(input(), "dark");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Toggle theme"]);
    // Groups without matches are not rendered
    expect(screen.getAllByRole("group").map((g) => g.textContent)).toEqual(["ViewToggle theme"]);
    expect(highlighted()).toBe("Toggle theme");
    await user.clear(input());
    await user.type(input(), "FILE");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("shows an empty state", async () => {
    const user = userEvent.setup();
    renderPalette({ emptyMessage: "Nothing found" });
    await user.type(input(), "zzz");
    // The listbox stays mounted (empty) so aria-controls stays valid
    const listbox = screen.getByRole("listbox");
    expect(input().getAttribute("aria-controls")).toBe(listbox.id);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.queryAllByRole("group")).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing found");
    expect(input().getAttribute("aria-expanded")).toBe("false");
    expect(input().hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("runs the highlighted command on Enter and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const itemSelect = vi.fn();
    renderPalette({
      onSelect,
      onOpenChange,
      items: items.map((i) => (i.value === "open" ? { ...i, onSelect: itemSelect } : i)),
    });
    await user.keyboard("[ArrowDown][Enter]");
    expect(itemSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("open");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("selects on click; disabled items do nothing", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderPalette({ onSelect, closeOnSelect: false });
    await user.click(screen.getByRole("option", { name: "Close file" }));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("option", { name: "Help" }));
    expect(onSelect).toHaveBeenCalledWith("help");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.activeElement).toBe(input());
  });

  it("closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    const Trigger = () => h("button", {}, "Open palette");
    const { rerender } = render(h("div", {}, h(Trigger), palette({ open: false })));
    const trigger = screen.getByRole("button", { name: "Open palette" });
    trigger.focus();
    const onOpenChange = vi.fn();
    rerender(h("div", {}, h(Trigger), palette({ open: true, onOpenChange })));
    expect(document.activeElement).toBe(input());
    await user.keyboard("[Escape]");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(h("div", {}, h(Trigger), palette({ open: false, onOpenChange })));
    expect(document.activeElement).toBe(trigger);
  });

  it("clears the query when reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(palette({ open: true }));
    await user.type(input(), "help");
    rerender(palette({ open: false }));
    rerender(palette({ open: true }));
    expect(input()).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(5);
  });

  it("closes on an outside click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });
    await user.click(document.querySelector('[data-slot="command-palette-overlay"]')!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders custom item content, searching its text or textValue", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      h(
        m.CommandPalette,
        { defaultOpen: true, onSelect },
        h(m.CommandInput, {}),
        h(
          m.CommandList,
          {},
          h(
            m.CommandItem,
            { value: "profile" },
            h("span", { "data-testid": "icon", "aria-hidden": "true" }),
            h("strong", {}, "Profile"),
            h("kbd", {}, "P"),
          ),
          h(m.CommandSeparator, {}),
          h(m.CommandItem, { value: "billing", textValue: "Billing invoices" }, h("em", {}, "Money")),
        ),
      ),
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="command-palette-separator"]')).not.toBeNull();
    await user.type(input(), "invoices");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Money"]);
    expect(document.querySelector('[data-slot="command-palette-separator"]')).toBeNull();
    await user.clear(input());
    await user.type(input(), "profile");
    expect(highlighted()).toBe("ProfileP");
    await user.keyboard("[Enter]");
    expect(onSelect).toHaveBeenCalledWith("profile");
  });

  it("orders items by DOM position, including items added later", async () => {
    const user = userEvent.setup();
    const list = (extra: boolean) =>
      h(
        m.CommandPalette,
        { open: true },
        h(m.CommandInput, {}),
        h(
          m.CommandList,
          {},
          h(m.CommandItem, { value: "a" }, "Alpha"),
          extra ? h(m.CommandItem, { value: "b" }, "Beta") : null,
          h(m.CommandItem, { value: "c" }, "Gamma"),
        ),
      );
    const { rerender } = render(list(false));
    rerender(list(true));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Alpha", "Beta", "Gamma"]);
    await user.keyboard("[ArrowDown]");
    expect(highlighted()).toBe("Beta");
  });

  it("toggles with a global shortcut (mod = Ctrl off macOS)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(h("div", {}, h("button", {}, "Outside"), palette({ shortcut: "mod+k", onOpenChange })));
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.keyboard("k");
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.activeElement).toBe(input());
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("has no shortcut by default", async () => {
    const user = userEvent.setup();
    render(palette({}));
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
