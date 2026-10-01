import type { MachineDefinition, MachineEvent } from "../../machine";

/**
 * Combobox (list autocomplete) behavior, framework-agnostic.
 *
 * The machine owns what the user typed, which option is highlighted and
 * which is selected. Adapters translate DOM events into these events and
 * compute visible options with `filterOptions`.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type ComboboxStatus = "closed" | "open";

export interface ComboboxData {
  readonly inputValue: string;
  readonly highlighted: string | null;
  readonly selected: string | null;
}

export type ComboboxEvent =
  | MachineEvent<"OPEN", { highlighted: string | null }>
  | MachineEvent<"CLOSE">
  | MachineEvent<"INPUT", { value: string }>
  | MachineEvent<"HIGHLIGHT", { value: string | null }>
  | MachineEvent<"SELECT", { value: string; label: string }>
  | MachineEvent<"SYNC", { selected: string | null; inputValue: string }>;

export const ComboboxEvents = {
  open: (highlighted: string | null = null): ComboboxEvent => ({
    type: "OPEN",
    payload: { highlighted },
  }),
  close: (): ComboboxEvent => ({ type: "CLOSE" }),
  input: (value: string): ComboboxEvent => ({ type: "INPUT", payload: { value } }),
  highlight: (value: string | null): ComboboxEvent => ({ type: "HIGHLIGHT", payload: { value } }),
  select: (option: ComboboxOption): ComboboxEvent => ({
    type: "SELECT",
    payload: { value: option.value, label: option.label },
  }),
  /** Align with a controlled value from outside. */
  sync: (selected: string | null, inputValue: string): ComboboxEvent => ({
    type: "SYNC",
    payload: { selected, inputValue },
  }),
};

export function createComboboxMachineDefinition(
  initial: Partial<ComboboxData> & { open?: boolean } = {},
): MachineDefinition<ComboboxStatus, ComboboxData, ComboboxEvent> {
  return {
    states: ["closed", "open"],
    initialState: {
      status: initial.open ? "open" : "closed",
      data: {
        inputValue: initial.inputValue ?? "",
        highlighted: initial.highlighted ?? null,
        selected: initial.selected ?? null,
      },
    },
    transitions: [
      {
        from: ["closed", "open"],
        event: "OPEN",
        to: "open",
        reducer: (state, _ctx, event) => ({
          ...state.data,
          highlighted: event.type === "OPEN" ? event.payload.highlighted : null,
        }),
      },
      {
        from: ["open"],
        event: "CLOSE",
        to: "closed",
        reducer: (state) => ({ ...state.data, highlighted: null }),
      },
      {
        // Typing opens the list; a cleared input also clears the selection
        from: ["closed", "open"],
        event: "INPUT",
        to: "open",
        reducer: (state, _ctx, event) => {
          const value = event.type === "INPUT" ? event.payload.value : "";
          return {
            inputValue: value,
            highlighted: null,
            selected: value === "" ? null : state.data.selected,
          };
        },
      },
      {
        from: ["open"],
        event: "HIGHLIGHT",
        to: "open",
        reducer: (state, _ctx, event) => ({
          ...state.data,
          highlighted: event.type === "HIGHLIGHT" ? event.payload.value : null,
        }),
      },
      {
        from: ["closed", "open"],
        event: "SELECT",
        to: "closed",
        reducer: (_state, _ctx, event) =>
          event.type === "SELECT"
            ? { inputValue: event.payload.label, highlighted: null, selected: event.payload.value }
            : _state.data,
      },
      {
        from: ["closed"],
        event: "SYNC",
        to: "closed",
        reducer: (state, _ctx, event) =>
          event.type === "SYNC"
            ? { ...state.data, selected: event.payload.selected, inputValue: event.payload.inputValue }
            : state.data,
      },
      {
        from: ["open"],
        event: "SYNC",
        to: "open",
        reducer: (state, _ctx, event) =>
          event.type === "SYNC"
            ? { ...state.data, selected: event.payload.selected, inputValue: event.payload.inputValue }
            : state.data,
      },
    ],
  };
}

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();

/** Default filter: case- and accent-insensitive "contains" on the label. */
export function matchesQuery(option: ComboboxOption, query: string): boolean {
  return normalize(option.label).includes(normalize(query.trim()));
}

/**
 * Options to show for the current input. Right after a selection the input
 * holds the selected label; reopening should then show every option, not
 * just the one that matches.
 */
export function filterOptions(
  options: readonly ComboboxOption[],
  data: Pick<ComboboxData, "inputValue" | "selected">,
  matches: (option: ComboboxOption, query: string) => boolean = matchesQuery,
): ComboboxOption[] {
  const selectedLabel = options.find((o) => o.value === data.selected)?.label;
  const query = data.inputValue === selectedLabel ? "" : data.inputValue;
  if (!query.trim()) return [...options];
  return options.filter((option) => matches(option, query));
}
