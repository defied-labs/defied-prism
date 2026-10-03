// @vitest-environment jsdom
/** Popover behavior for the Vue target; mirrors test/components/popover.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, ref, type VNode } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "popover-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("popover", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

function sharePopover(rootProps: Record<string, unknown> = {}, contentProps: Record<string, unknown> = {}) {
  return h(m.Popover, rootProps, () => [
    h(m.PopoverTrigger, {}, () => "Share"),
    h(m.PopoverContent, { "aria-label": "Share", ...contentProps }, () => [
      h("label", {}, ["Link", h("input", { name: "link" })]),
      h(m.PopoverClose, {}, () => "Done"),
    ]),
  ]);
}

function renderPage(popover: () => VNode = () => sharePopover()) {
  show(() => h("main", {}, [h("button", {}, "Before"), popover(), h("button", {}, "After")]));
  return { trigger: screen.getByRole("button", { name: "Share" }) };
}

const popoverEl = () => screen.queryByRole("dialog");

describe("Popover (vue)", () => {
  it("toggles from the trigger, which reflects the state", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    expect(popoverEl()).toBeNull();
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);

    await user.click(trigger);
    expect(popoverEl()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(popoverEl()!.id);

    await user.click(trigger);
    expect(popoverEl()).toBeNull();
  });

  it("is non-modal: no aria-modal, page stays interactive, no focus trap", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    expect(popoverEl()!.hasAttribute("aria-modal")).toBe(false);
    expect(screen.getByRole("button", { name: "Before" }).hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");

    await user.tab(); // Done
    await user.tab(); // leaves the popover
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("moves focus to the first focusable element on open", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Link" }));
  });

  it("focuses the content itself when it has nothing focusable, or initialFocus", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Popover, {}, () => [
        h(m.PopoverTrigger, {}, () => "Info"),
        h(m.PopoverContent, { "aria-label": "Info" }, () => "Just text"),
      ]),
    );
    await user.click(screen.getByRole("button", { name: "Info" }));
    expect(document.activeElement).toBe(popoverEl());
    cleanup();

    renderPage(() => sharePopover({}, { initialFocus: () => screen.getByRole("button", { name: "Done" }) }));
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Done" }));
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.keyboard("[Escape]");
    expect(popoverEl()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("an outside click closes without stealing focus back", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    const after = screen.getByRole("button", { name: "After" });
    await user.click(after);
    expect(popoverEl()).toBeNull();
    expect(document.activeElement).toBe(after);
  });

  it("clicks inside do not close it", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.click(screen.getByRole("textbox", { name: "Link" }));
    expect(popoverEl()).not.toBeNull();
  });

  it("PopoverClose closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(popoverEl()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("layers above an outer dismissable layer (e.g. a dialog)", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    // Like a dialog containing the popover: clicks within the page are inside it
    const off = onDismiss({ inside: () => [document.querySelector("main")], onDismiss: outer });
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.keyboard("[Escape]");
    expect(popoverEl()).toBeNull();
    expect(outer).not.toHaveBeenCalled();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "After" }));
    expect(popoverEl()).toBeNull();
    expect(outer).not.toHaveBeenCalled();
    off();
  });

  it("supports asChild triggers, composing their handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    show(() =>
      h(m.Popover, {}, () => [
        h(m.PopoverTrigger, { asChild: true }, () => h("a", { href: "#", onClick }, "Details")),
        h(m.PopoverContent, { "aria-label": "Details" }, () => "Body"),
      ]),
    );
    const trigger = screen.getByText("Details");
    await user.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(popoverEl()).not.toBeNull();
  });

  it("works controlled and reports changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const open = ref(false);
    show(() =>
      h("div", {}, [
        sharePopover({
          open: open.value,
          onOpenChange: (next: boolean) => {
            onOpenChange(next);
            open.value = next;
          },
        }),
        h("button", { onClick: () => (open.value = true) }, "Open externally"),
      ]),
    );
    await user.click(screen.getByRole("button", { name: "Open externally" }));
    expect(popoverEl()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    await user.keyboard("[Escape]");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(popoverEl()).toBeNull();
  });

  it("supports v-model:open", async () => {
    const user = userEvent.setup();
    const open = ref(false);
    show(() => sharePopover({ open: open.value, "onUpdate:open": (next: boolean) => (open.value = next) }));
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(open.value).toBe(true);
    await user.keyboard("[Escape]");
    expect(open.value).toBe(false);
  });

  it("stays open when controlled and the owner refuses to close", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage(() => sharePopover({ open: true, onOpenChange: () => {} }));
    await user.keyboard("[Escape]");
    expect(popoverEl()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("reflects side and align as data attributes", () => {
    renderPage(() => sharePopover({ defaultOpen: true }, { side: "left", align: "end" }));
    expect(popoverEl()!.getAttribute("data-side")).toBe("left");
    expect(popoverEl()!.getAttribute("data-align")).toBe("end");
  });
});

describe("PopoverTrigger (vue)", () => {
  it("renders a Prism Button by default, forwarding variant and size", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Popover, {}, () => [
        h(m.PopoverTrigger, {}, () => "Open"),
        h(m.PopoverContent, { "aria-label": "Details" }, () => "Body"),
      ]),
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("data-slot")).toBe("popover-trigger");
    expect(trigger.getAttribute("data-variant")).toBe("outline");
    expect(trigger.getAttribute("data-size")).toBe("md");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    cleanup();

    show(() => h(m.Popover, {}, () => h(m.PopoverTrigger, { variant: "primary", size: "sm" }, () => "Open")));
    const sized = screen.getByRole("button", { name: "Open" });
    expect(sized.getAttribute("data-variant")).toBe("primary");
    expect(sized.getAttribute("data-size")).toBe("sm");
  });

  it("asChild renders the consumer's element with the trigger's ARIA", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Popover, {}, () => [
        h(m.PopoverTrigger, { asChild: true, variant: "primary" }, () => h("a", { href: "#more" }, "More")),
        h(m.PopoverContent, { "aria-label": "Details" }, () => "Body"),
      ]),
    );
    const link = screen.getByText("More");
    expect(link.tagName).toBe("A");
    expect(link.hasAttribute("data-variant")).toBe(false);
    expect(link.getAttribute("aria-haspopup")).toBe("dialog");
    expect(link.getAttribute("aria-expanded")).toBe("false");
    await user.click(link);
    expect(link.getAttribute("aria-expanded")).toBe("true");
  });
});
