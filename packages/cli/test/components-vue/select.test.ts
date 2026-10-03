// @vitest-environment jsdom
/** Select behavior for the Vue target; mirrors test/components/select.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { defineComponent, h, nextTick, ref } from "vue";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied/prism-core";
import { provideField, useFieldState } from "@defied/prism-vue";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "select-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("select", "tailwind", NAMESPACE, "vue");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana", disabled: true },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
];

type Option = { value: string; label: string; disabled?: boolean };
type Group = { label: string; options: Option[] };

const renderItem = (o: Option) =>
  h(m.SelectItem, { key: o.value, value: o.value, disabled: o.disabled }, () => o.label);

/** Compound markup from option data (test convenience only). */
function select({ options = OPTIONS, ref: triggerRef, class: className, ...props }: Record<string, any> = {}) {
  return h(m.Select, props, () => [
    h(m.SelectTrigger, { "aria-label": "Fruit", ref: triggerRef, class: className }),
    h(m.SelectContent, {}, () =>
      (options as (Option | Group)[]).map((o, i) =>
        "options" in o
          ? h(m.SelectGroup, { key: i }, () => [h(m.SelectLabel, {}, () => o.label), o.options.map(renderItem)])
          : renderItem(o),
      ),
    ),
  ]);
}

const show = (node: () => unknown) => render({ render: node });

function renderSelect(props: Record<string, unknown> = {}) {
  show(() =>
    h("form", { "aria-label": "Order" }, [
      h("button", { type: "button" }, "Before"),
      select({ name: "fruit", ...props }),
      h("button", { type: "button" }, "After"),
    ]),
  );
  return screen.getByRole("combobox", { name: "Fruit" });
}

const listbox = () => screen.queryByRole("listbox");
const highlighted = () =>
  document.getElementById(screen.getByRole("combobox").getAttribute("aria-activedescendant") ?? "");
const hiddenValue = () => document.querySelector<HTMLInputElement>('input[name="fruit"]')!.value;

async function focused(props: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const combobox = renderSelect(props);
  combobox.focus();
  return { user, combobox };
}

describe("Select (vue)", () => {
  it("is a labelled, collapsed select-only combobox showing the placeholder", () => {
    const combobox = renderSelect({ placeholder: "Pick a fruit" });
    expect(combobox.tagName).toBe("BUTTON");
    expect(combobox.getAttribute("aria-haspopup")).toBe("listbox");
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(combobox.hasAttribute("aria-controls")).toBe(false);
    expect(combobox).toHaveTextContent("Pick a fruit");
    expect(listbox()).toBeNull();
    expect(hiddenValue()).toBe("");
  });

  it("opens on click with the listbox labelled and the selection highlighted", async () => {
    const user = userEvent.setup();
    const combobox = renderSelect({ defaultValue: "blueberry" });
    // Items register on mount; Vue applies the re-render on the next tick
    await nextTick();
    expect(combobox).toHaveTextContent("Blueberry");
    await user.click(combobox);
    expect(combobox.getAttribute("aria-expanded")).toBe("true");
    expect(combobox.getAttribute("aria-controls")).toBe(listbox()!.id);
    expect(listbox()).toHaveAccessibleName("Fruit");
    expect(highlighted()).toHaveTextContent("Blueberry");
    expect(screen.getByRole("option", { name: "Blueberry" }).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(combobox);

    await user.click(combobox);
    expect(listbox()).toBeNull();
  });

  it.each(["[ArrowDown]", "[ArrowUp]", "[Enter]", "[Space]"])(
    "%s opens with the first option highlighted when nothing is selected",
    async (key) => {
      const { user, combobox } = await focused();
      await user.keyboard(key);
      expect(listbox()).not.toBeNull();
      expect(highlighted()).toHaveTextContent("Apple");
      expect(document.activeElement).toBe(combobox);
    },
  );

  it("Home and End open on the first and last option", async () => {
    const { user } = await focused({ defaultValue: "apricot" });
    await user.keyboard("[End]");
    expect(highlighted()).toHaveTextContent("Cherry");
    await user.keyboard("[Escape][Home]");
    expect(highlighted()).toHaveTextContent("Apple");
  });

  it("arrows move the highlight without wrapping, skipping disabled options; Home/End jump", async () => {
    const { user } = await focused();
    await user.keyboard("[ArrowDown]");
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("Blueberry"); // skipped Banana
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("Cherry"); // no wrap
    await user.keyboard("[Home]");
    expect(highlighted()).toHaveTextContent("Apple");
    await user.keyboard("[ArrowUp]");
    expect(highlighted()).toHaveTextContent("Apple");
    await user.keyboard("[End]");
    expect(highlighted()).toHaveTextContent("Cherry");
  });

  it("Enter selects the highlighted option, closes and keeps focus", async () => {
    const onValueChange = vi.fn();
    const { user, combobox } = await focused({ onValueChange });
    await user.keyboard("[ArrowDown][ArrowDown][Enter]");
    expect(onValueChange).toHaveBeenCalledWith("apricot");
    expect(listbox()).toBeNull();
    expect(combobox).toHaveTextContent("Apricot");
    expect(document.activeElement).toBe(combobox);
    expect(hiddenValue()).toBe("apricot");
  });

  it("Space selects the highlighted option", async () => {
    const onValueChange = vi.fn();
    const { user } = await focused({ onValueChange });
    await user.keyboard("[Space][ArrowDown][Space]");
    expect(onValueChange).toHaveBeenCalledWith("apricot");
    expect(listbox()).toBeNull();
  });

  it("Tab selects the highlighted option, closes, and moves focus on (APG)", async () => {
    const onValueChange = vi.fn();
    const { user } = await focused({ onValueChange });
    await user.keyboard("[ArrowDown][End]");
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("Escape closes without changing the selection or closing an outer layer", async () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [document.querySelector("form")], onDismiss: outer });
    const onValueChange = vi.fn();
    const { user, combobox } = await focused({ defaultValue: "apple", onValueChange });
    await user.keyboard("[ArrowDown][ArrowDown][Escape]");
    expect(listbox()).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(combobox).toHaveTextContent("Apple");
    expect(document.activeElement).toBe(combobox);
    expect(outer).not.toHaveBeenCalled();
    off();
  });

  it("an outside click closes without selecting, without closing an outer layer", async () => {
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [document.querySelector("form")], onDismiss: outer });
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const combobox = renderSelect({ onValueChange });
    await user.click(combobox);
    await user.click(screen.getByRole("button", { name: "After" }));
    expect(listbox()).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
    off();
  });

  it("selects by click, keeping focus; disabled options do nothing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const combobox = renderSelect({ onValueChange });
    await user.click(combobox);
    const banana = screen.getByRole("option", { name: "Banana" });
    expect(banana.getAttribute("aria-disabled")).toBe("true");
    await user.click(banana);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();

    await user.hover(screen.getByRole("option", { name: "Cherry" }));
    expect(highlighted()).toHaveTextContent("Cherry");
    await user.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(combobox);
  });

  it("typeahead while closed selects without opening; repeated letters cycle", async () => {
    const onValueChange = vi.fn();
    const { user, combobox } = await focused({ onValueChange });
    await user.keyboard("b");
    expect(listbox()).toBeNull();
    expect(onValueChange).toHaveBeenLastCalledWith("blueberry"); // Banana is disabled
    expect(combobox).toHaveTextContent("Blueberry");
    await new Promise((r) => setTimeout(r, 600));
    await user.keyboard("a");
    expect(combobox).toHaveTextContent("Apple");
    await user.keyboard("a");
    expect(combobox).toHaveTextContent("Apricot");
    expect(hiddenValue()).toBe("apricot");
  });

  it("typeahead while open moves the highlight; Space continues a search", async () => {
    vi.useFakeTimers();
    const combobox = renderSelect({
      options: [
        { value: "ny", label: "New York" },
        { value: "nd", label: "New Delhi" },
        { value: "n", label: "Nairobi" },
      ],
    });
    combobox.focus();
    // Vue renders asynchronously: await each event so the DOM reflects it
    await fireEvent.keyDown(combobox, { key: "ArrowDown" });
    await fireEvent.keyDown(combobox, { key: "n" });
    expect(highlighted()).toHaveTextContent("New Delhi");
    vi.advanceTimersByTime(600);
    for (const key of ["n", "e", "w", " ", "y"]) await fireEvent.keyDown(combobox, { key });
    expect(listbox()).not.toBeNull(); // Space didn't select
    expect(highlighted()).toHaveTextContent("New York");
    vi.advanceTimersByTime(600);
    await fireEvent.keyDown(combobox, { key: " " });
    expect(listbox()).toBeNull();
    expect(combobox).toHaveTextContent("New York");
  });

  it("closes when focus leaves", async () => {
    const { user } = await focused();
    await user.keyboard("[ArrowDown]");
    await fireEvent.blur(screen.getByRole("combobox"), { relatedTarget: document.body });
    expect(listbox()).toBeNull();
  });

  it("renders groups with labelled role=group", async () => {
    const user = userEvent.setup();
    const combobox = renderSelect({
      options: [
        { value: "none", label: "None" },
        { label: "Citrus", options: [{ value: "lemon", label: "Lemon" }, { value: "lime", label: "Lime" }] },
        { label: "Berries", options: [{ value: "cherry", label: "Cherry" }] },
      ],
    });
    await user.click(combobox);
    expect(screen.getByRole("group", { name: "Citrus" })).toContainElement(
      screen.getByRole("option", { name: "Lime" }),
    );
    await user.keyboard("[ArrowDown][ArrowDown][ArrowDown][Enter]");
    expect(combobox).toHaveTextContent("Cherry");
  });

  it("is disabled: not focusable, does not open, hidden input not submitted", async () => {
    const user = userEvent.setup();
    const combobox = renderSelect({ disabled: true, defaultValue: "apple" });
    expect(combobox).toBeDisabled();
    await user.click(combobox);
    expect(listbox()).toBeNull();
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("fruit")).toBeNull();
  });

  it("submits its value with the form through the hidden input", async () => {
    const { user } = await focused({ defaultValue: "cherry" });
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("fruit")).toBe("cherry");
    await user.keyboard("[ArrowDown][Home][Enter]");
    expect(new FormData(form).get("fruit")).toBe("apple");
  });

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    const Controlled = defineComponent(() => {
      const value = ref<string | null>("apple");
      const setValue = (next: string) => (value.value = next);
      return () =>
        h("div", {}, [
          select({ value: value.value, onValueChange: setValue }),
          h("button", { onClick: () => setValue("cherry") }, "Pick cherry"),
          h("output", {}, value.value ?? ""),
        ]);
    });
    render(Controlled);
    const combobox = screen.getByRole("combobox");
    await nextTick(); // items register on mount
    expect(combobox).toHaveTextContent("Apple");
    await user.click(screen.getByRole("button", { name: "Pick cherry" }));
    expect(combobox).toHaveTextContent("Cherry");
    combobox.focus();
    await user.keyboard("[ArrowDown][Home][Enter]");
    expect(screen.getByRole("status")).toHaveTextContent("apple");
  });

  it("follows v-model (modelValue + update:modelValue)", async () => {
    const user = userEvent.setup();
    const Model = defineComponent(() => {
      const value = ref<string | null>("apple");
      return () =>
        h("div", {}, [
          select({ modelValue: value.value, "onUpdate:modelValue": (next: string) => (value.value = next) }),
          h("output", {}, value.value ?? ""),
        ]);
    });
    render(Model);
    const combobox = screen.getByRole("combobox");
    combobox.focus();
    await user.keyboard("[ArrowDown][End][Enter]");
    expect(combobox).toHaveTextContent("Cherry");
    expect(screen.getByRole("status")).toHaveTextContent("cherry");
  });

  it("ignores changes a controlled owner rejects", async () => {
    const { user, combobox } = await focused({ value: "apple", onValueChange: () => {} });
    await user.keyboard("[ArrowDown][End][Enter]");
    expect(combobox).toHaveTextContent("Apple");
  });

  it("integrates with Field: id, description, invalid, required", async () => {
    const Field = defineComponent(() => {
      const field = useFieldState({ invalid: true, required: true });
      field.setHasDescription(true);
      provideField(field);
      return () => [
        h("label", { id: field.labelId, for: field.controlId }, "Country"),
        h(m.Select, {}, () => [
          h(m.SelectTrigger),
          h(m.SelectContent, {}, () => OPTIONS.map(renderItem)),
        ]),
        h("p", { id: field.descriptionId }, "Where you live"),
      ];
    });
    render(Field);
    const combobox = screen.getByRole("combobox", { name: "Country" });
    expect(combobox).toHaveAccessibleDescription("Where you live");
    expect(combobox.getAttribute("aria-invalid")).toBe("true");
    expect(combobox.getAttribute("aria-required")).toBe("true");
    await fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(listbox()).toHaveAccessibleName("Country");
  });

  it("shows the selected item's text while closed, with custom item content", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    show(() =>
      h(m.Select, { defaultValue: "fr", onValueChange }, () => [
        h(m.SelectTrigger, { "aria-label": "Language" }, () => h(m.SelectValue, { placeholder: "Language" })),
        h(m.SelectContent, {}, () => [
          h(m.SelectItem, { value: "en" }, () => [h("span", { "aria-hidden": true }, "🇬🇧"), " English"]),
          h(m.SelectItem, { value: "fr", textValue: "French" }, () => [
            h("svg", { "data-testid": "flag" }),
            "Français",
          ]),
          h(m.SelectItem, { value: "de" }, () => [h("b", {}, "Deu"), "tsch"]),
        ]),
      ]),
    );
    const combobox = screen.getByRole("combobox", { name: "Language" });
    expect(listbox()).toBeNull();
    await nextTick(); // items register on mount
    expect(combobox).toHaveTextContent("French"); // textValue wins
    combobox.focus();
    await user.keyboard("d"); // typeahead on rendered text
    expect(combobox).toHaveTextContent("Deutsch");
    expect(onValueChange).toHaveBeenLastCalledWith("de");
    await user.click(combobox);
    expect(screen.getByRole("option", { name: "Deutsch" }).querySelector("b")).not.toBeNull();
    await user.click(screen.getByRole("option", { name: /English/ }));
    expect(combobox).toHaveTextContent("🇬🇧 English");
  });

  it("SelectValue shows its own placeholder; separators are hidden from AT", () => {
    show(() =>
      h(m.Select, {}, () => [
        h(m.SelectTrigger, { "aria-label": "Fruit" }, () => h(m.SelectValue, { placeholder: "Pick one" })),
        h(m.SelectContent, {}, () => [
          h(m.SelectItem, { value: "a" }, () => "A"),
          h(m.SelectSeparator),
          h(m.SelectItem, { value: "b" }, () => "B"),
        ]),
      ]),
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick one");
    expect(document.querySelector('[data-slot="select-separator"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("follows items added and removed after mount, in DOM order", async () => {
    const user = userEvent.setup();
    const Dynamic = defineComponent(() => {
      const extra = ref(false);
      return () =>
        h("div", {}, [
          select({
            options: extra.value ? [OPTIONS[0], { value: "avocado", label: "Avocado" }, ...OPTIONS.slice(1)] : OPTIONS,
          }),
          h("button", { onClick: () => (extra.value = !extra.value) }, "Toggle"),
        ]);
    });
    render(Dynamic);
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    const combobox = screen.getByRole("combobox");
    combobox.focus();
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("Avocado");
    await user.keyboard("[Escape]");
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    combobox.focus();
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("Apricot");
  });

  it("group without a label has no dangling aria-labelledby", () => {
    show(() =>
      h(m.Select, { defaultOpen: true }, () => [
        h(m.SelectTrigger, { "aria-label": "Fruit" }),
        h(m.SelectContent, {}, () => h(m.SelectGroup, {}, () => h(m.SelectItem, { value: "a" }, () => "A"))),
      ]),
    );
    expect(screen.getByRole("group").hasAttribute("aria-labelledby")).toBe(false);
  });

  it("exposes the trigger element via template ref $el and reflects size", () => {
    const instance = ref<{ $el: HTMLElement } | null>(null);
    renderSelect({ size: "lg", ref: instance });
    expect(instance.value?.$el).toBe(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox").getAttribute("data-size")).toBe("lg");
  });
});
