import { type MachineEvent } from "../../machine";

export type ButtonEvent =
  | MachineEvent<"FOCUS">
  | MachineEvent<"BLUR">
  | MachineEvent<"PRESS">
  | MachineEvent<"RELEASE">
  | MachineEvent<"DISABLE">
  | MachineEvent<"ENABLE">
  | MachineEvent<"START_LOADING">
  | MachineEvent<"STOP_LOADING">;

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
