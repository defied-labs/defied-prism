import { describe, expect, it } from "vitest";

import { Machine } from "../machine";
import {
  TooltipEvents as E,
  isTooltipOpen,
  tooltipMachineDefinition,
  type TooltipEvent,
  type TooltipStatus,
} from "../components/tooltip";

function run(...events: TooltipEvent[]): TooltipStatus {
  const machine = new Machine(tooltipMachineDefinition);
  for (const event of events) machine.send(event);
  return machine.getStatus();
}

describe("tooltip machine", () => {
  it("opens after the hover delay and closes after the grace period", () => {
    expect(run(E.pointerEnter())).toBe("opening");
    expect(run(E.pointerEnter(), E.delayElapsed())).toBe("open");
    expect(run(E.pointerEnter(), E.delayElapsed(), E.pointerLeave())).toBe("closing");
    expect(run(E.pointerEnter(), E.delayElapsed(), E.pointerLeave(), E.delayElapsed())).toBe("closed");
  });

  it("cancels opening when the pointer leaves first", () => {
    expect(run(E.pointerEnter(), E.pointerLeave(), E.delayElapsed())).toBe("closed");
  });

  it("stays open when the pointer moves into the tooltip (hoverable)", () => {
    expect(run(E.pointerEnter(), E.delayElapsed(), E.pointerLeave(), E.pointerEnter())).toBe("open");
  });

  it("opens immediately on focus", () => {
    expect(run(E.focus())).toBe("open");
    expect(run(E.pointerEnter(), E.focus())).toBe("open");
  });

  it.each([["escape", E.escape()], ["blur", E.blur()], ["press", E.press()]] as const)(
    "%s dismisses immediately",
    (_name, event) => {
      expect(run(E.focus(), event)).toBe("closed");
      expect(run(E.pointerEnter(), event)).toBe("closed");
      expect(run(E.pointerEnter(), E.delayElapsed(), E.pointerLeave(), event)).toBe("closed");
    },
  );

  it("treats closing as still visible", () => {
    expect(isTooltipOpen("open")).toBe(true);
    expect(isTooltipOpen("closing")).toBe(true);
    expect(isTooltipOpen("opening")).toBe(false);
    expect(isTooltipOpen("closed")).toBe(false);
  });
});
