import { describe, expect, it } from "vitest";
import {
  Machine,
  buttonMachineDefinition,
  ButtonEvents,
} from "@defied-labs/prism-core";

describe("buttonMachine coherent state model", () => {
  it("handles idle -> focus -> press -> release -> blur cycle", () => {
    const machine = new Machine(buttonMachineDefinition);
    expect(machine.getStatus()).toBe("idle");

    machine.send(ButtonEvents.focus());
    expect(machine.getStatus()).toBe("focused");
    expect(machine.getState().data.focused).toBe(true);

    machine.send(ButtonEvents.press());
    expect(machine.getStatus()).toBe("pressed");
    expect(machine.getState().data.pressed).toBe(true);

    machine.send(ButtonEvents.release());
    expect(machine.getStatus()).toBe("focused");
    expect(machine.getState().data.pressed).toBe(false);

    machine.send(ButtonEvents.blur());
    expect(machine.getStatus()).toBe("idle");
    expect(machine.getState().data.focused).toBe(false);
  });

  it("handles disable and loading transitions", () => {
    const machine = new Machine(buttonMachineDefinition);
    machine.send({ type: "START_LOADING" });
    expect(machine.getStatus()).toBe("loading");
    expect(machine.getState().data.loading).toBe(true);

    machine.send(ButtonEvents.disable());
    expect(machine.getStatus()).toBe("disabled");
    expect(machine.getState().data.disabled).toBe(true);
    expect(machine.getState().data.loading).toBe(false);

    machine.send(ButtonEvents.enable());
    expect(machine.getStatus()).toBe("idle");
    expect(machine.getState().data.disabled).toBe(false);
  });
});
