import { type MachineDefinition, type MachineEvent } from "../../machine";
import { type MachineState } from "../../machine/types";

/**
 * Button Machine - Strictly typed state machine for button behavior
 *
 * States: idle | focused | pressed | disabled | loading
 *
 * Events:
 * - FOCUS: Mouse/focus enters button
 * - BLUR: Mouse/focus leaves button
 * - PRESS: Button pressed (mousedown/touchstart)
 * - RELEASE: Button released (mouseup/touchend)
 * - DISABLE: Button disabled
 * - ENABLE: Button enabled
 * - START_LOADING: Async operation started
 * - STOP_LOADING: Async operation completed
 */

// ----- Types -----

export type ButtonStatus =
  | "idle"
  | "focused"
  | "pressed"
  | "disabled"
  | "loading";

export interface ButtonData {
  readonly pressed: boolean;
  readonly focused: boolean;
  readonly loading: boolean;
  readonly disabled: boolean;
}

export type ButtonEvent =
  | MachineEvent<"FOCUS">
  | MachineEvent<"BLUR">
  | MachineEvent<"PRESS">
  | MachineEvent<"RELEASE">
  | MachineEvent<"DISABLE">
  | MachineEvent<"ENABLE">
  | MachineEvent<"START_LOADING">
  | MachineEvent<"STOP_LOADING">;

// ----- Event Constructors -----

export const ButtonEvents = {
  focus: () =>
    ({ type: "FOCUS" as const, payload: undefined }) as MachineEvent<"FOCUS">,
  blur: () =>
    ({ type: "BLUR" as const, payload: undefined }) as MachineEvent<"BLUR">,
  press: () =>
    ({ type: "PRESS" as const, payload: undefined }) as MachineEvent<"PRESS">,
  release: () =>
    ({
      type: "RELEASE" as const,
      payload: undefined,
    }) as MachineEvent<"RELEASE">,
  disable: () =>
    ({
      type: "DISABLE" as const,
      payload: undefined,
    }) as MachineEvent<"DISABLE">,
  enable: () =>
    ({ type: "ENABLE" as const, payload: undefined }) as MachineEvent<"ENABLE">,
  startLoading: () =>
    ({
      type: "START_LOADING" as const,
      payload: undefined,
    }) as MachineEvent<"START_LOADING">,
  stopLoading: () =>
    ({
      type: "STOP_LOADING" as const,
      payload: undefined,
    }) as MachineEvent<"STOP_LOADING">,
} as const;

// ----- Machine Definition -----

export const buttonMachineDefinition: MachineDefinition<
  ButtonStatus,
  ButtonData,
  ButtonEvent
> = {
  states: ["idle", "focused", "pressed", "disabled", "loading"],

  initialState: {
    status: "idle",
    data: {
      pressed: false,
      focused: false,
      loading: false,
      disabled: false,
    },
  },

  context: {},

  transitions: [
    {
      from: ["idle"],
      event: "FOCUS",
      to: "focused",
      metadata: { description: "Button gains focus" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        focused: true,
      }),
    },
    {
      from: ["focused"],
      event: "BLUR",
      to: "idle",
      metadata: { description: "Button loses focus" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        focused: false,
      }),
    },
    {
      from: ["idle", "focused"],
      event: "PRESS",
      to: "pressed",
      metadata: { description: "Button pressed down" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        pressed: true,
      }),
    },
    {
      from: ["pressed"],
      event: "RELEASE",
      to: "focused",
      metadata: { description: "Button released while focused" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        pressed: false,
      }),
    },
    {
      from: ["pressed"],
      event: "BLUR",
      to: "idle",
      metadata: { description: "Button released and blurred" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        pressed: false,
        focused: false,
      }),
    },
    {
      from: ["idle", "focused", "pressed", "loading"],
      event: "DISABLE",
      to: "disabled",
      metadata: { description: "Button disabled from any active state" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        disabled: true,
        pressed: false,
        focused: false,
        loading: false,
      }),
    },
    {
      from: ["disabled"],
      event: "ENABLE",
      to: "idle",
      metadata: { description: "Button enabled, returns to idle" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        disabled: false,
      }),
    },
    {
      from: ["idle", "focused", "pressed"],
      event: "START_LOADING",
      to: "loading",
      metadata: { description: "Async operation started" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        loading: true,
        pressed: false,
      }),
    },
    {
      from: ["loading"],
      event: "STOP_LOADING",
      to: "idle",
      metadata: { description: "Async operation completed" },
      reducer: (state: MachineState<ButtonStatus, ButtonData>) => ({
        ...state.data,
        loading: false,
      }),
    },
  ],
};

// ----- Factory -----

import { Machine } from "@defied-prism/core/machine";

export const createButtonMachine = () => {
  return new Machine(buttonMachineDefinition);
};
