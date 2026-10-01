import type { MachineDefinition, MachineEvent } from "../../machine";

/**
 * Tooltip behavior, framework-agnostic.
 *
 *   closed --pointer enter--> opening --delay--> open --pointer leave--> closing --delay--> closed
 *
 * Focus opens immediately. Moving the pointer from the trigger into the
 * tooltip during `closing` keeps it open (WCAG 1.4.13: hoverable). Escape,
 * blur and pressing the trigger close it at once. Adapters own the timers:
 * they send DELAY_ELAPSED after the open/close delay.
 */

export type TooltipStatus = "closed" | "opening" | "open" | "closing";

export type TooltipEvent =
  | MachineEvent<"POINTER_ENTER">
  | MachineEvent<"POINTER_LEAVE">
  | MachineEvent<"FOCUS">
  | MachineEvent<"BLUR">
  | MachineEvent<"ESCAPE">
  | MachineEvent<"PRESS">
  | MachineEvent<"DELAY_ELAPSED">;

export const TooltipEvents = {
  pointerEnter: (): TooltipEvent => ({ type: "POINTER_ENTER" }),
  pointerLeave: (): TooltipEvent => ({ type: "POINTER_LEAVE" }),
  focus: (): TooltipEvent => ({ type: "FOCUS" }),
  blur: (): TooltipEvent => ({ type: "BLUR" }),
  escape: (): TooltipEvent => ({ type: "ESCAPE" }),
  press: (): TooltipEvent => ({ type: "PRESS" }),
  delayElapsed: (): TooltipEvent => ({ type: "DELAY_ELAPSED" }),
};

type Data = Record<string, never>;

const dismissals = ["BLUR", "ESCAPE", "PRESS"] as const;

export const tooltipMachineDefinition: MachineDefinition<TooltipStatus, Data, TooltipEvent> = {
  states: ["closed", "opening", "open", "closing"],
  initialState: { status: "closed", data: {} },
  transitions: [
    { from: ["closed"], event: "POINTER_ENTER", to: "opening" },
    { from: ["closed", "opening", "closing"], event: "FOCUS", to: "open" },
    { from: ["opening"], event: "DELAY_ELAPSED", to: "open" },
    { from: ["opening"], event: "POINTER_LEAVE", to: "closed" },
    { from: ["open"], event: "POINTER_LEAVE", to: "closing" },
    { from: ["closing"], event: "POINTER_ENTER", to: "open" },
    { from: ["closing"], event: "DELAY_ELAPSED", to: "closed" },
    ...dismissals.map((event) => ({
      from: ["opening", "open", "closing"] as TooltipStatus[],
      event,
      to: "closed" as const,
    })),
  ],
};

/** Whether the tooltip content is visible in a given status. */
export const isTooltipOpen = (status: TooltipStatus) => status === "open" || status === "closing";
