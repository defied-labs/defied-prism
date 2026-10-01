// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { onDismiss } from "@defied-prism/core";
import { FieldContext, useFieldState } from "@defied-prism/react";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "combobox";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("combobox", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "solid", label: "Solid", disabled: true },
  { value: "svelte", label: "Svelte" },
  { value: "preact", label: "Préact" },
];

type Option = { value: string; label: string; disabled?: boolean };

const renderItem = (o: Option) =>
  h(m.ComboboxItem, { key: o.value, value: o.value, disabled: o.disabled }, o.label);

/** Compound markup from option data (test convenience only). */
function combobox({ options = OPTIONS, emptyMessage, ...props }: Record<string, any> = {}) {
  return h(
    m.Combobox,
    props,
    h(m.ComboboxInput, { "aria-label": "Framework" }),
    h(m.ComboboxContent, {}, (options as Option[]).map(renderItem)),
    h(m.ComboboxEmpty, {}, emptyMessage),
  );
}

function renderCombobox(props: Record<string, unknown> = {}) {
  render(h("form", {}, combobox(props), h("button", { type: "button" }, "Next field")));
  return screen.getByRole("combobox", { name: "Framework" });
}

const listbox = () => screen.queryByRole("listbox");
const optionNames = () => screen.getAllByRole("option").map((o) => o.textContent);
const highlighted = () =>
  document.getElementById(screen.getByRole("combobox").getAttribute("aria-activedescendant") ?? "");

describe("Combobox", () => {
  it("is a labelled, collapsed list-autocomplete combobox", () => {
    const input = renderCombobox();
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-controls")).toBe(false);
    expect(listbox()).toBeNull();
  });

  it("filters as you type, case- and accent-insensitively", async () => {
    const user = userEvent.setup();
    const onInputValueChange = vi.fn();
    const input = renderCombobox({ onInputValueChange });
    await user.type(input, "pre");

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-controls")).toBe(listbox()!.id);
    expect(listbox()).toHaveAccessibleName("Framework");
    expect(optionNames()).toEqual(["Préact"]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("pre");
  });

  it("highlights with arrows via aria-activedescendant, skipping disabled options", async () => {
    const user = userEvent.setup();
    const input = renderCombobox();
    input.focus();

    await user.keyboard("[ArrowDown]");
    expect(listbox()).not.toBeNull();
    expect(highlighted()).toHaveTextContent("React");
    expect(document.activeElement).toBe(input);

    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("Svelte"); // skipped Solid
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(highlighted()).toHaveTextContent("React"); // wrapped
    await user.keyboard("[ArrowUp]");
    expect(highlighted()).toHaveTextContent("Préact");
  });

  it("ArrowUp on a closed list opens at the last enabled option", async () => {
    const user = userEvent.setup();
    const input = renderCombobox();
    input.focus();
    await user.keyboard("[ArrowUp]");
    expect(highlighted()).toHaveTextContent("Préact");
  });

  it("Alt+ArrowDown opens without highlighting", async () => {
    const user = userEvent.setup();
    const input = renderCombobox();
    input.focus();
    await user.keyboard("{Alt>}[ArrowDown]{/Alt}");
    expect(listbox()).not.toBeNull();
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("Enter selects the highlighted option and keeps focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const input = renderCombobox({ onValueChange, name: "framework" });
    await user.type(input, "sv");
    await user.keyboard("[ArrowDown][Enter]");

    expect(onValueChange).toHaveBeenCalledWith("svelte");
    expect(input).toHaveValue("Svelte");
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(input);
    expect(document.querySelector<HTMLInputElement>('input[name="framework"]')!.value).toBe("svelte");
  });

  it("reopening after a selection shows every option with the selection marked", async () => {
    const user = userEvent.setup();
    const input = renderCombobox({ defaultValue: "vue" });
    expect(input).toHaveValue("Vue");
    input.focus();
    await user.keyboard("[ArrowDown]");
    expect(optionNames()).toHaveLength(5);
    expect(highlighted()).toHaveTextContent("Vue");
    expect(screen.getByRole("option", { name: "Vue" }).getAttribute("aria-selected")).toBe("true");
  });

  it("selects by click, keeping focus in the input; disabled options do nothing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const input = renderCombobox({ onValueChange });
    await user.click(input);
    await user.keyboard("[ArrowDown]");

    await user.click(screen.getByRole("option", { name: "Solid" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();

    await user.click(screen.getByRole("option", { name: "Vue" }));
    expect(onValueChange).toHaveBeenCalledWith("vue");
    expect(input).toHaveValue("Vue");
    expect(document.activeElement).toBe(input);
  });

  it("clearing the text clears the selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const input = renderCombobox({ defaultValue: "react", onValueChange });
    await user.clear(input);
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("announces when nothing matches", async () => {
    const user = userEvent.setup();
    const input = renderCombobox({ emptyMessage: "No frameworks found" });
    await user.type(input, "zzz");
    expect(listbox()).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("status")).toHaveTextContent("No frameworks found");
  });

  it("closes on Escape without dismissing an outer layer", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    const off = onDismiss({ inside: () => [], onDismiss: outer, outside: false });
    const input = renderCombobox();
    await user.type(input, "v");
    await user.keyboard("[Escape]");
    expect(listbox()).toBeNull();
    expect(outer).not.toHaveBeenCalled();
    expect(input).toHaveValue("v");
    off();
  });

  it("closes on outside click and when focus leaves", async () => {
    const user = userEvent.setup();
    const input = renderCombobox();
    await user.type(input, "v");
    await user.click(document.body);
    expect(listbox()).toBeNull();

    await user.type(input, "u");
    expect(listbox()).not.toBeNull();
    await user.tab();
    expect(listbox()).toBeNull();
  });

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>("react");
      return h(
        "div",
        {},
        combobox({ value, onValueChange: setValue }),
        h("button", { onClick: () => setValue("svelte") }, "Pick Svelte"),
      );
    }
    render(h(Controlled));
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("React");
    await user.click(screen.getByRole("button", { name: "Pick Svelte" }));
    expect(input).toHaveValue("Svelte");
  });
  it("filters custom item content by textValue or rendered text", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      h(
        m.Combobox,
        { onValueChange },
        h(m.ComboboxInput, { "aria-label": "Framework" }),
        h(
          m.ComboboxContent,
          {},
          h(m.ComboboxItem, { value: "react", textValue: "React" }, h("svg", { "data-testid": "logo" }), "React ⚛"),
          h(m.ComboboxItem, { value: "vue" }, h("b", {}, "V"), "ue"),
        ),
      ),
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "vu");
    expect(optionNames()).toEqual(["Vue"]);
    await user.clear(input);
    await user.type(input, "react");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    await user.keyboard("[ArrowDown][Enter]");
    expect(input).toHaveValue("React");
    expect(onValueChange).toHaveBeenCalledWith("react");
  });

  it("takes a custom filter, or filter={false} to show every item", async () => {
    const user = userEvent.setup();
    const startsWith = (item: { textValue: string }, q: string) =>
      item.textValue.toLowerCase().startsWith(q.toLowerCase());
    const input = renderCombobox({ filter: startsWith });
    await user.type(input, "e");
    expect(listbox()).toBeNull();
    await user.clear(input);
    await user.type(input, "s");
    expect(optionNames()).toEqual(["Solid", "Svelte"]);
    cleanup();

    const server = renderCombobox({ filter: false });
    await user.type(server, "zzz");
    expect(optionNames()).toHaveLength(5);
  });

  it("hides groups without matches and labels groups", async () => {
    const user = userEvent.setup();
    render(
      h(
        m.Combobox,
        {},
        h(m.ComboboxInput, { "aria-label": "Food" }),
        h(
          m.ComboboxContent,
          {},
          h(m.ComboboxGroup, {}, h(m.ComboboxLabel, {}, "Fruit"), h(m.ComboboxItem, { value: "apple" }, "Apple")),
          h(m.ComboboxGroup, {}, h(m.ComboboxLabel, {}, "Veg"), h(m.ComboboxItem, { value: "leek" }, "Leek")),
        ),
      ),
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "lee");
    expect(screen.getByRole("group", { name: "Veg" })).toContainElement(screen.getByRole("option", { name: "Leek" }));
    expect(screen.queryByRole("group", { name: "Fruit" })).toBeNull();
    await user.keyboard("[ArrowDown][Enter]");
    expect(input).toHaveValue("Leek");
  });

  it("follows a controlled input value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [text, setText] = useState("");
      return h(
        "div",
        {},
        combobox({ inputValue: text, onInputValueChange: (v: string) => setText(v.toUpperCase()) }),
        h("output", {}, text),
      );
    }
    render(h(Controlled));
    const input = screen.getByRole("combobox");
    await user.type(input, "vu");
    expect(input).toHaveValue("VU");
    expect(optionNames()).toEqual(["Vue"]);
    await user.keyboard("[ArrowDown][Enter]");
    expect(screen.getByRole("status")).toHaveTextContent("VUE");
  });

  it("integrates with Field and forms: id, description, invalid, required, disabled", () => {
    function Field({ disabled = false }) {
      const field = useFieldState({ invalid: true, required: true, disabled });
      return h(
        "form",
        {},
        h(
          FieldContext.Provider,
          { value: { ...field, hasDescription: true } },
          h("label", { id: field.labelId, htmlFor: field.controlId }, "Framework"),
          h(
            m.Combobox,
            { name: "framework", defaultValue: "vue" },
            h(m.ComboboxInput),
            h(m.ComboboxContent, {}, OPTIONS.map(renderItem)),
          ),
          h("p", { id: field.descriptionId }, "Pick one"),
        ),
      );
    }
    render(h(Field));
    const input = screen.getByRole("combobox", { name: "Framework" });
    expect(input).toHaveValue("Vue");
    expect(input).toHaveAccessibleDescription("Pick one");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(listbox()).toHaveAccessibleName("Framework");
    expect(new FormData(document.querySelector("form")!).get("framework")).toBe("vue");
    cleanup();

    render(h(Field, { disabled: true }));
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(new FormData(document.querySelector("form")!).get("framework")).toBeNull();
  });
});
