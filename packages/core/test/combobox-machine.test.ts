import { describe, expect, it } from "vitest";

import { Machine } from "../machine";
import {
  ComboboxEvents as E,
  createComboboxMachineDefinition,
  filterOptions,
  type ComboboxOption,
} from "../components/combobox";

const options: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid", disabled: true },
  { value: "preact", label: "Préact" },
];

const machine = () => new Machine(createComboboxMachineDefinition());

describe("combobox machine", () => {
  it("opens on typing and tracks the input", () => {
    const m = machine();
    m.send(E.input("sv"));
    expect(m.getState()).toEqual({
      status: "open",
      data: { inputValue: "sv", highlighted: null, selected: null },
    });
  });

  it("highlights while open, and forgets the highlight on close", () => {
    const m = machine();
    m.send(E.open("vue"));
    expect(m.getState().data.highlighted).toBe("vue");
    m.send(E.highlight("react"));
    expect(m.getState().data.highlighted).toBe("react");
    m.send(E.close());
    expect(m.getState().data.highlighted).toBeNull();
    // Highlighting while closed is ignored
    expect(m.send(E.highlight("vue")).success).toBe(false);
  });

  it("selecting closes and fills the input with the label", () => {
    const m = machine();
    m.send(E.input("re"));
    m.send(E.select(options[0]!));
    expect(m.getState()).toEqual({
      status: "closed",
      data: { inputValue: "React", highlighted: null, selected: "react" },
    });
  });

  it("clearing the input clears the selection", () => {
    const m = new Machine(createComboboxMachineDefinition({ selected: "vue", inputValue: "Vue" }));
    m.send(E.input(""));
    expect(m.getState().data.selected).toBeNull();
  });

  it("syncs a controlled value in either state", () => {
    const m = machine();
    m.send(E.sync("svelte", "Svelte"));
    expect(m.getState().data).toMatchObject({ selected: "svelte", inputValue: "Svelte" });
    m.send(E.open());
    m.send(E.sync(null, ""));
    expect(m.getState()).toMatchObject({ status: "open", data: { selected: null } });
  });
});

describe("filterOptions", () => {
  it("matches case- and accent-insensitively", () => {
    expect(filterOptions(options, { inputValue: "PREA", selected: null }).map((o) => o.value)).toEqual([
      "preact",
    ]);
    expect(filterOptions(options, { inputValue: "s", selected: null }).map((o) => o.value)).toEqual([
      "svelte",
      "solid",
    ]);
  });

  it("shows everything for an empty query or the selected label", () => {
    expect(filterOptions(options, { inputValue: "  ", selected: null })).toHaveLength(5);
    expect(filterOptions(options, { inputValue: "Vue", selected: "vue" })).toHaveLength(5);
    expect(filterOptions(options, { inputValue: "Vue", selected: null })).toHaveLength(1);
  });

  it("accepts a custom matcher", () => {
    const startsWith = (o: ComboboxOption, q: string) => o.label.toLowerCase().startsWith(q.toLowerCase());
    expect(filterOptions(options, { inputValue: "e", selected: null }, startsWith)).toEqual([]);
  });
});
