import { describe, expect, it } from "vitest";
import {
  Machine,
  inputMachineDefinition,
  InputEvents,
} from "@defied-labs/prism-core";

describe("inputMachine coherent focus/blur/change cycle", () => {
  it("handles empty input focus -> blur -> focus cycle", () => {
    const machine = new Machine(inputMachineDefinition);
    expect(machine.getStatus()).toBe("empty");
    expect(machine.getState().data.focused).toBe(false);

    machine.send(InputEvents.focus());
    expect(machine.getStatus()).toBe("focusedEmpty");
    expect(machine.getState().data.focused).toBe(true);

    machine.send(InputEvents.blur());
    expect(machine.getStatus()).toBe("empty");
    expect(machine.getState().data.focused).toBe(false);

    machine.send(InputEvents.focus());
    expect(machine.getStatus()).toBe("focusedEmpty");
    expect(machine.getState().data.focused).toBe(true);
  });

  it("handles filled input focus -> change -> blur -> focus cycle", () => {
    const machine = new Machine(inputMachineDefinition);
    machine.send(InputEvents.focus());
    expect(machine.getStatus()).toBe("focusedEmpty");

    machine.send(InputEvents.change("hello"));
    expect(machine.getStatus()).toBe("focusedFilled");
    expect(machine.getState().data.value).toBe("hello");

    machine.send(InputEvents.blur());
    expect(machine.getStatus()).toBe("filled");
    expect(machine.getState().data.focused).toBe(false);
    expect(machine.getState().data.value).toBe("hello");

    machine.send(InputEvents.focus());
    expect(machine.getStatus()).toBe("focusedFilled");
    expect(machine.getState().data.focused).toBe(true);
    expect(machine.getState().data.value).toBe("hello");
  });
});
