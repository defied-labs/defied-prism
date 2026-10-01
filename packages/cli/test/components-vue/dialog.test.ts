// @vitest-environment jsdom
/** Dialog behavior for the Vue target; mirrors test/components/dialog.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, ref, type VNode } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "dialog-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("dialog", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });

function profileDialog(dialogProps: Record<string, unknown> = {}, contentProps: Record<string, unknown> = {}) {
  return h(m.Dialog, dialogProps, () => [
    h(m.DialogTrigger, {}, () => "Edit profile"),
    h(m.DialogContent, contentProps, () => [
      h(m.DialogTitle, {}, () => "Edit profile"),
      h(m.DialogDescription, {}, () => "Update your public details."),
      h("label", {}, ["Name", h("input", { name: "name" })]),
      h(m.DialogFooter, {}, () => [h(m.DialogClose, {}, () => "Cancel"), h("button", {}, "Save")]),
    ]),
  ]);
}

function renderPage(dialog: () => VNode = () => profileDialog()) {
  show(() => h("main", {}, [h("button", {}, "Before"), dialog(), h("button", {}, "After")]));
  return { trigger: screen.getByRole("button", { name: "Edit profile", hidden: true }) };
}

const dialogEl = () => screen.queryByRole("dialog");

describe("Dialog (vue)", () => {
  it("opens from the trigger, which reflects the state", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    expect(dialogEl()).toBeNull();
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger);
    expect(dialogEl()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(dialogEl()!.id);
  });

  it("is named and described by its title and description", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    const dialog = dialogEl()!;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog).toHaveAccessibleName("Edit profile");
    expect(dialog).toHaveAccessibleDescription("Update your public details.");
  });

  it("moves focus in, keeps Tab inside, and returns focus on close", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(document.activeElement).toBe(input);

    await user.tab(); // Cancel
    await user.tab(); // Save
    await user.tab(); // wraps
    expect(document.activeElement).toBe(input);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save" }));

    await user.keyboard("[Escape]");
    expect(dialogEl()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("makes the rest of the page inert and locks scroll while open", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);

    const main = document.querySelector("main")!;
    const appRoot = main.parentElement!;
    expect(appRoot.hasAttribute("inert")).toBe(true);
    expect(appRoot.getAttribute("aria-hidden")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    // Only the dialog's buttons are reachable by role now
    expect(screen.queryByRole("button", { name: "Before" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(appRoot.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on outside click, but an alertdialog does not", async () => {
    const user = userEvent.setup();
    const { trigger } = renderPage();
    await user.click(trigger);
    await user.click(document.querySelector('[data-slot="dialog-overlay"]')!);
    expect(dialogEl()).toBeNull();

    cleanup();
    renderPage(() => profileDialog({ defaultOpen: true }, { role: "alertdialog" }));
    await user.click(document.querySelector('[data-slot="dialog-overlay"]')!);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.keyboard("[Escape]");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("respects closeOnEscape={false}", async () => {
    const user = userEvent.setup();
    renderPage(() => profileDialog({ defaultOpen: true }, { closeOnEscape: false }));
    await user.keyboard("[Escape]");
    expect(dialogEl()).not.toBeNull();
  });

  it("is controllable", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const open = ref(false);
    show(() =>
      h("div", {}, [
        h("span", {}, open.value ? "is-open" : "is-closed"),
        profileDialog({
          open: open.value,
          onOpenChange: (next: boolean) => {
            onOpenChange(next);
            open.value = next;
          },
        }),
      ]),
    );
    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText("is-open", { exact: true })).toBeTruthy();
    await user.keyboard("[Escape]");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports v-model:open", async () => {
    const user = userEvent.setup();
    const open = ref(false);
    show(() => profileDialog({ open: open.value, "onUpdate:open": (next: boolean) => (open.value = next) }));
    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    expect(open.value).toBe(true);
    await user.keyboard("[Escape]");
    expect(open.value).toBe(false);
  });

  it("Escape closes only the topmost of nested dialogs", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Dialog, {}, () => [
        h(m.DialogTrigger, {}, () => "Outer"),
        h(m.DialogContent, {}, () => [
          h(m.DialogTitle, {}, () => "Outer dialog"),
          h(m.Dialog, {}, () => [
            h(m.DialogTrigger, {}, () => "Inner"),
            h(m.DialogContent, {}, () => [
              h(m.DialogTitle, {}, () => "Inner dialog"),
              h(m.DialogClose, {}, () => "Close inner"),
            ]),
          ]),
        ]),
      ]),
    );
    await user.click(screen.getByRole("button", { name: "Outer" }));
    const innerTrigger = screen.getByRole("button", { name: "Inner" });
    await user.click(innerTrigger);
    expect(screen.getByRole("dialog", { name: "Inner dialog" })).toBeInTheDocument();

    await user.keyboard("[Escape]");
    expect(screen.queryByRole("dialog", { name: "Inner dialog" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Outer dialog" })).toBeInTheDocument();
    expect(document.activeElement).toBe(innerTrigger);
  });

  it("supports initialFocus and asChild triggers", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Dialog, {}, () => [
        h(m.DialogTrigger, { asChild: true }, () => h("button", { class: "mine" }, "Delete")),
        h(m.DialogContent, { role: "alertdialog", initialFocus: () => document.getElementById("cancel") }, () => [
          h(m.DialogTitle, {}, () => "Delete project?"),
          h(m.DialogFooter, {}, () => [h("button", {}, "Delete"), h(m.DialogClose, { id: "cancel" }, () => "Keep it")]),
        ]),
      ]),
    );
    const trigger = screen.getByRole("button", { name: "Delete" });
    expect(trigger.className).toBe("mine");
    await user.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Keep it" }));
  });
});

describe("DialogTrigger (vue)", () => {
  it("renders a Prism Button by default, forwarding variant and size", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Dialog, {}, () => [
        h(m.DialogTrigger, {}, () => "Open"),
        h(m.DialogContent, { "aria-label": "Details" }, () => "Body"),
      ]),
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("data-slot")).toBe("dialog-trigger");
    expect(trigger.getAttribute("data-variant")).toBe("outline");
    expect(trigger.getAttribute("data-size")).toBe("md");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    cleanup();

    show(() => h(m.Dialog, {}, () => h(m.DialogTrigger, { variant: "primary", size: "sm" }, () => "Open")));
    const sized = screen.getByRole("button", { name: "Open" });
    expect(sized.getAttribute("data-variant")).toBe("primary");
    expect(sized.getAttribute("data-size")).toBe("sm");
  });

  it("asChild renders the consumer's element with the trigger's ARIA", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Dialog, {}, () => [
        h(m.DialogTrigger, { asChild: true, variant: "primary" }, () => h("a", { href: "#more" }, "More")),
        h(m.DialogContent, { "aria-label": "Details" }, () => "Body"),
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

describe("DialogClose (vue)", () => {
  it("renders a secondary Prism Button by default, or the consumer's element with asChild", async () => {
    const user = userEvent.setup();
    show(() =>
      h(m.Dialog, { defaultOpen: true }, () =>
        h(m.DialogContent, { "aria-label": "Settings" }, () => [
          h(m.DialogClose, {}, () => "Cancel"),
          h(m.DialogClose, { asChild: true }, () => h("a", { href: "#done" }, "Done")),
        ]),
      ),
    );
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.getAttribute("data-slot")).toBe("dialog-close");
    expect(cancel.getAttribute("data-variant")).toBe("secondary");
    const done = screen.getByText("Done");
    expect(done.tagName).toBe("A");
    expect(done.hasAttribute("data-variant")).toBe(false);
    await user.click(done);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
