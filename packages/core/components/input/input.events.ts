import { type MachineEvent } from "@defied-prism/core/machine";

export type InputEvent =
  | MachineEvent<"FOCUS">
  | MachineEvent<"BLUR">
  | MachineEvent<"CHANGE", { value: string }>
  | MachineEvent<"CLEAR">
  | MachineEvent<"DISABLE">
  | MachineEvent<"ENABLE">;

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
