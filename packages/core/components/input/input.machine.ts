import { type MachineDefinition, type MachineEvent } from "../../machine";
import { type MachineState } from "../../machine/types";

/**
 * Input Machine - Strictly typed state machine for input behavior
 *
 * States: empty | focusedEmpty | filled | focusedFilled | disabled
 *
 * Events:
 * - FOCUS: Input gains focus
 * - BLUR: Input loses focus
 * - CHANGE: Input value changed
 * - CLEAR: Input cleared
 * - DISABLE: Input disabled
 * - ENABLE: Input enabled
 */

// ----- Types -----

export type InputStatus =
  | "empty"
  | "focusedEmpty"
  | "filled"
  | "focusedFilled"
  | "disabled";

export interface InputData {
  readonly value: string;
  readonly focused: boolean;
  readonly disabled: boolean;
}

export type InputEvent =
  | MachineEvent<"FOCUS">
  | MachineEvent<"BLUR">
  | MachineEvent<"CHANGE", { value: string }>
  | MachineEvent<"CLEAR">
  | MachineEvent<"DISABLE">
  | MachineEvent<"ENABLE">;

// ----- Event Constructors -----

export const InputEvents = {
  focus: () =>
    ({ type: "FOCUS" as const, payload: undefined }) as MachineEvent<"FOCUS">,
  blur: () =>
    ({ type: "BLUR" as const, payload: undefined }) as MachineEvent<"BLUR">,
  change: (value: string) =>
    ({ type: "CHANGE" as const, payload: { value } }) as MachineEvent<
      "CHANGE",
      { value: string }
    >,
  clear: () =>
    ({ type: "CLEAR" as const, payload: undefined }) as MachineEvent<"CLEAR">,
  disable: () =>
    ({
      type: "DISABLE" as const,
      payload: undefined,
    }) as MachineEvent<"DISABLE">,
  enable: () =>
    ({ type: "ENABLE" as const, payload: undefined }) as MachineEvent<"ENABLE">,
} as const;

// ----- Machine Definition -----

export const inputMachineDefinition: MachineDefinition<
  InputStatus,
  InputData,
  InputEvent
> = {
  states: ["empty", "focusedEmpty", "filled", "focusedFilled", "disabled"],

  initialState: {
    status: "empty",
    data: {
      value: "",
      focused: false,
      disabled: false,
    },
  },

  context: {},

  transitions: [
    // Empty state transitions
    {
      from: ["empty"],
      event: "FOCUS",
      to: "focusedEmpty",
      metadata: { description: "Empty input gains focus" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        focused: true,
      }),
    },
    {
      from: ["empty"],
      event: "CHANGE",
      to: "focusedFilled",
      metadata: {
        description: "Empty input changed to non-empty while focused",
      },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length > 0,
      reducer: (
        state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => {
        if (!isChangeEvent(event)) return state.data;
        return {
          ...state.data,
          value: event.payload.value,
          focused: true,
        };
      },
    },
    {
      from: ["empty"],
      event: "CHANGE",
      to: "empty",
      metadata: { description: "Empty input changed but remains empty" },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length === 0,
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        value: "",
      }),
    },
    // focusedEmpty transitions
    {
      from: ["focusedEmpty"],
      event: "BLUR",
      to: "empty",
      metadata: { description: "Focused empty input loses focus" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        focused: false,
      }),
    },
    {
      from: ["focusedEmpty"],
      event: "CHANGE",
      to: "focusedFilled",
      metadata: { description: "Focused empty input changed to non-empty" },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length > 0,
      reducer: (
        state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => {
        if (!isChangeEvent(event)) return state.data;
        return {
          ...state.data,
          value: event.payload.value,
        };
      },
    },
    {
      from: ["focusedEmpty"],
      event: "CHANGE",
      to: "focusedEmpty",
      metadata: {
        description: "Focused empty input changed but remains empty",
      },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length === 0,
      reducer: (
        state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => {
        if (!isChangeEvent(event)) return state.data;
        return {
          ...state.data,
          value: event.payload.value,
        };
      },
    },
    // focusedFilled transitions
    {
      from: ["focusedFilled"],
      event: "CHANGE",
      to: "focusedFilled",
      metadata: { description: "Focused filled input value changed" },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length > 0,
      reducer: (
        state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => {
        if (!isChangeEvent(event)) return state.data;
        return {
          ...state.data,
          value: event.payload.value,
        };
      },
    },
    {
      from: ["focusedFilled"],
      event: "CHANGE",
      to: "focusedEmpty",
      metadata: { description: "Focused filled input cleared" },
      guard: (
        _state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => isChangeEvent(event) && event.payload.value.length === 0,
      reducer: (
        state: MachineState<InputStatus, InputData>,
        _ctx: unknown,
        event: InputEvent,
      ) => {
        if (!isChangeEvent(event)) return state.data;
        return {
          ...state.data,
          value: event.payload.value,
        };
      },
    },
    {
      from: ["focusedFilled"],
      event: "BLUR",
      to: "filled",
      metadata: { description: "Focused filled input loses focus" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        focused: false,
      }),
    },
    {
      from: ["focusedFilled"],
      event: "CLEAR",
      to: "focusedEmpty",
      metadata: {
        description: "Focused filled input cleared via clear action",
      },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        value: "",
      }),
    },
    // filled transitions
    {
      from: ["filled"],
      event: "FOCUS",
      to: "focusedFilled",
      metadata: { description: "Filled input gains focus" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        focused: true,
      }),
    },
    {
      from: ["filled"],
      event: "CLEAR",
      to: "empty",
      metadata: { description: "Filled input cleared" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        value: "",
      }),
    },
    // Disable transitions from any active state
    {
      from: ["empty", "focusedEmpty", "filled", "focusedFilled"],
      event: "DISABLE",
      to: "disabled",
      metadata: { description: "Input disabled from any active state" },
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        disabled: true,
        focused: false,
      }),
    },
    // Enable transitions - guard to return to correct state
    {
      from: ["disabled"],
      event: "ENABLE",
      to: "empty",
      metadata: { description: "Disabled empty input enabled" },
      guard: (state: MachineState<InputStatus, InputData>) =>
        state.data.value.length === 0,
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        disabled: false,
      }),
    },
    {
      from: ["disabled"],
      event: "ENABLE",
      to: "filled",
      metadata: { description: "Disabled filled input enabled" },
      guard: (state: MachineState<InputStatus, InputData>) =>
        state.data.value.length > 0,
      reducer: (state: MachineState<InputStatus, InputData>) => ({
        ...state.data,
        disabled: false,
      }),
    },
  ],
};

// ----- Type Guards -----

function isChangeEvent(
  event: InputEvent,
): event is MachineEvent<"CHANGE", { value: string }> {
  return event.type === "CHANGE";
}

// ----- Factory -----

import { Machine } from "../../machine";

export const createInputMachine = () => {
  return new Machine(inputMachineDefinition);
};
