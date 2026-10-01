// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "dropdown-menu";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("dropdown-menu", "tailwind", NAMESPACE);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

interface Handlers {
  onNew?: (event: Event) => void;
  onOpen?: (event: Event) => void;
  onCheckedChange?: (checked: boolean) => void;
  onSortChange?: (value: string) => void;
}

function fileMenu(rootProps: Record<string, unknown> = {}, handlers: Handlers = {}) {
  return h(
    m.DropdownMenu,
    rootProps,
    h(m.DropdownMenuTrigger, {}, "File"),
    h(
      m.DropdownMenuContent,
      {},
      h(m.DropdownMenuItem, { onSelect: handlers.onNew }, "New"),
      h(m.DropdownMenuItem, { onSelect: handlers.onOpen }, "Open"),
      h(m.DropdownMenuItem, { disabled: true }, "Delete"),
      h(m.DropdownMenuItem, {}, "Download"),
      h(m.DropdownMenuSeparator),
      h(
        m.DropdownMenuGroup,
        {},
        h(m.DropdownMenuLabel, {}, "View"),
        h(m.DropdownMenuCheckboxItem, { onCheckedChange: handlers.onCheckedChange }, "Show hidden"),
      ),
      h(
        m.DropdownMenuRadioGroup,
        { defaultValue: "name", onValueChange: handlers.onSortChange },
        h(m.DropdownMenuLabel, {}, "Sort by"),
        h(m.DropdownMenuRadioItem, { value: "name" }, "Name"),
        h(m.DropdownMenuRadioItem, { value: "date" }, "Date"),
      ),
      h(m.DropdownMenuItem, {}, "Exit"),
    ),
  );
}

function renderPage(menu = fileMenu()) {
  render(h("main", {}, h("button", {}, "Before"), menu, h("button", {}, "After")));
  return { trigger: screen.getByRole("button", { name: "File" }) };
}

const menuEl = () => screen.queryByRole("menu");
const focused = () => document.activeElement;
const item = (name: string) => {
  const found = (["menuitem", "menuitemcheckbox", "menuitemradio"] as const).flatMap((role) =>
    screen.queryAllByRole(role, { name }),
  );
  expect(found, name).toHaveLength(1);
  return found[0]!;
};

async function openWith(key: string) {
  const user = userEvent.setup();
  const { trigger } = renderPage();
  trigger.focus();
  await user.keyboard(key);
  return { user, trigger };
}

describe("DropdownMenu", () => {
  it("is a menu button that reflects its state", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menuEl()).toBeNull();

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(menuEl()!.id);
    expect(menuEl()).toHaveAccessibleName("File");
    expect(focused()).toBe(item("New"));
    expect(item("New").tabIndex).toBe(-1);

    await user.click(trigger);
    expect(menuEl()).toBeNull();
  });

  it.each(["[Enter]", "[Space]", "[ArrowDown]"])("%s on the trigger opens on the first item", async (key) => {
    await openWith(key);
    expect(menuEl()).not.toBeNull();
    expect(focused()).toBe(item("New"));
  });

  it("ArrowUp on the trigger opens on the last item", async () => {
    await openWith("[ArrowUp]");
    expect(focused()).toBe(item("Exit"));
  });

  it("arrows rove focus, wrap and skip disabled items; Home/End jump", async () => {
    const { user } = await openWith("[Enter]");
    await user.keyboard("[ArrowDown]");
    expect(focused()).toBe(item("Open"));
    await user.keyboard("[ArrowDown]");
    expect(focused()).toBe(item("Download")); // skipped Delete
    expect(item("Download").hasAttribute("data-highlighted")).toBe(true);
    await user.keyboard("[ArrowUp]");
    expect(focused()).toBe(item("Open"));
    await user.keyboard("[End]");
    expect(focused()).toBe(item("Exit"));
    await user.keyboard("[ArrowDown]");
    expect(focused()).toBe(item("New")); // wrapped
    await user.keyboard("[ArrowUp]");
    expect(focused()).toBe(item("Exit"));
    await user.keyboard("[Home]");
    expect(focused()).toBe(item("New"));
  });

  it("typeahead jumps to the next item starting with the typed characters", async () => {
    const { user } = await openWith("[Enter]");
    await user.keyboard("d");
    expect(focused()).toBe(item("Download")); // Delete is disabled
    await user.keyboard("[ArrowUp]");
    await new Promise((r) => setTimeout(r, 600)); // buffer resets
    await user.keyboard("s");
    expect(focused()).toBe(item("Show hidden"));
    await new Promise((r) => setTimeout(r, 600));
    await user.keyboard("da");
    expect(focused()).toBe(item("Date"));
  });

  it("typeahead buffer resets after a pause (fake timers)", () => {
    vi.useFakeTimers();
    renderPage(fileMenu({ defaultOpen: true }));
    const menu = menuEl()!;
    fireEvent.keyDown(menu, { key: "e" });
    expect(focused()).toBe(item("Exit"));
    fireEvent.keyDown(menu, { key: "n" }); // "en" matches nothing
    expect(focused()).toBe(item("Exit"));
    vi.advanceTimersByTime(600);
    fireEvent.keyDown(menu, { key: "n" });
    expect(focused()).toBe(item("New"));
  });

  it("Enter activates an item, closes and returns focus to the trigger", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    const { trigger } = renderPage(fileMenu({}, { onOpen }));
    trigger.focus();
    await user.keyboard("[Enter][ArrowDown][Enter]");
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("Space activates an item too", async () => {
    const onNew = vi.fn();
    const user = userEvent.setup();
    const { trigger } = renderPage(fileMenu({}, { onNew }));
    trigger.focus();
    await user.keyboard("[Enter]");
    await user.keyboard("[Space]");
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(menuEl()).toBeNull();
  });

  it("clicking an item activates it; preventDefault in onSelect keeps the menu open", async () => {
    const user = userEvent.setup();
    const onNew = vi.fn((event: Event) => event.preventDefault());
    const onOpen = vi.fn();
    const { trigger } = renderPage(fileMenu({}, { onNew, onOpen }));
    await user.click(trigger);
    await user.click(item("New"));
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(menuEl()).not.toBeNull();
    await user.click(item("Open"));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("disabled items are announced and cannot be activated", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    const del = item("Delete");
    expect(del.getAttribute("aria-disabled")).toBe("true");
    await user.click(del);
    expect(menuEl()).not.toBeNull();
  });

  it("checkbox items toggle: Space keeps the menu open, Enter closes", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { trigger } = renderPage(fileMenu({}, { onCheckedChange }));
    trigger.focus();
    await user.keyboard("[Enter]s");
    const checkbox = item("Show hidden");
    expect(checkbox.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    await user.keyboard("[Space]");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(item("Show hidden").getAttribute("aria-checked")).toBe("true");
    expect(menuEl()).not.toBeNull();
    expect(focused()).toBe(item("Show hidden"));

    await user.keyboard("[Enter]");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("radio items are exclusive within their group", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    const { trigger } = renderPage(fileMenu({}, { onSortChange }));
    await user.click(trigger);
    expect(item("Name").getAttribute("aria-checked")).toBe("true");
    expect(item("Date").getAttribute("aria-checked")).toBe("false");
    await user.click(item("Date"));
    expect(onSortChange).toHaveBeenCalledWith("date");
    await user.click(trigger);
    expect(item("Name").getAttribute("aria-checked")).toBe("false");
    expect(item("Date").getAttribute("aria-checked")).toBe("true");
  });

  it("groups are named by their label; the separator is exposed", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    expect(screen.getByRole("group", { name: "View" })).toContainElement(item("Show hidden"));
    expect(screen.getByRole("group", { name: "Sort by" })).toContainElement(item("Date"));
    expect(screen.getByRole("separator")).toBeDefined();
  });

  it("Escape closes and returns focus to the trigger, without closing an outer layer", async () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [document.querySelector("main")], onDismiss: outer });
    const { user, trigger } = await openWith("[Enter]");
    await user.keyboard("[ArrowDown][Escape]");
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(trigger);
    expect(outer).not.toHaveBeenCalled();
    off();
  });

  it("Tab closes the menu and moves on from the trigger", async () => {
    const { user } = await openWith("[Enter]");
    await user.tab();
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("Shift+Tab closes and returns focus to the trigger", async () => {
    const { user, trigger } = await openWith("[Enter]");
    await user.tab({ shift: true });
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("an outside click closes the menu without an outer layer closing", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [document.querySelector("main")], onDismiss: outer });
    const { trigger } = renderPage();
    await user.click(trigger);
    const after = screen.getByRole("button", { name: "After" });
    await user.click(after);
    expect(menuEl()).toBeNull();
    expect(focused()).toBe(after);
    expect(outer).not.toHaveBeenCalled();
    off();
  });

  it("hovering an item focuses it", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.hover(item("Download"));
    expect(focused()).toBe(item("Download"));
    await user.hover(item("Delete")); // disabled: not focused
    expect(focused()).not.toBe(item("Delete"));
  });

  it("supports asChild triggers and controlled open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return h(
        m.DropdownMenu,
        {
          open,
          onOpenChange: (next: boolean) => {
            onOpenChange(next);
            setOpen(next);
          },
        },
        h(m.DropdownMenuTrigger, { asChild: true }, h("button", { className: "mine" }, "Actions")),
        h(m.DropdownMenuContent, {}, h(m.DropdownMenuItem, {}, "Rename")),
      );
    }
    render(h(Controlled));
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.className).toBe("mine");
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(focused()).toBe(item("Rename"));
    await user.keyboard("[Enter]");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(menuEl()).toBeNull();
  });

  it("composes user onKeyDown on the content", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault());
    render(
      h(
        m.DropdownMenu,
        { defaultOpen: true },
        h(m.DropdownMenuTrigger, {}, "File"),
        h(m.DropdownMenuContent, { onKeyDown }, h(m.DropdownMenuItem, {}, "A"), h(m.DropdownMenuItem, {}, "B")),
      ),
    );
    await user.keyboard("[ArrowDown]");
    expect(onKeyDown).toHaveBeenCalled();
    expect(focused()).toBe(item("A"));
  });
});

describe("DropdownMenuTrigger", () => {
  it("renders a Prism Button by default, forwarding variant and size", async () => {
    const user = userEvent.setup();
    render(h(m.DropdownMenu, {}, h(m.DropdownMenuTrigger, {}, "Open"), h(m.DropdownMenuContent, {}, h(m.DropdownMenuItem, {}, "Rename"))));
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("data-slot")).toBe("dropdown-menu-trigger");
    expect(trigger.getAttribute("data-variant")).toBe("outline");
    expect(trigger.getAttribute("data-size")).toBe("md");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    cleanup();

    render(h(m.DropdownMenu, {}, h(m.DropdownMenuTrigger, { variant: "primary", size: "sm" }, "Open")));
    const sized = screen.getByRole("button", { name: "Open" });
    expect(sized.getAttribute("data-variant")).toBe("primary");
    expect(sized.getAttribute("data-size")).toBe("sm");
  });

  it("asChild renders the consumer's element with the trigger's ARIA", async () => {
    const user = userEvent.setup();
    render(
      h(
        m.DropdownMenu,
        {},
        h(m.DropdownMenuTrigger, { asChild: true, variant: "primary" }, h("a", { href: "#more" }, "More")),
        h(m.DropdownMenuContent, {}, h(m.DropdownMenuItem, {}, "Rename")),
      ),
    );
    const link = screen.getByText("More");
    expect(link.tagName).toBe("A");
    expect(link.hasAttribute("data-variant")).toBe(false);
    expect(link.getAttribute("aria-haspopup")).toBe("menu");
    expect(link.getAttribute("aria-expanded")).toBe("false");
    await user.click(link);
    expect(link.getAttribute("aria-expanded")).toBe("true");
  });
});
