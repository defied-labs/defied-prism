import { describe, expect, it } from "vitest";
import {
  Machine,
  type MachineDefinition,
  type MachineEvent,
} from "@defied-prism/core";

describe("Machine Core Contract & Reducer Engine", () => {
  it("executes pure reducer transitions immutably", () => {
    type Status = "idle" | "active";
    type Data = { count: number };
    type Event = MachineEvent<"INCREMENT", { count: number }>;

    const def: MachineDefinition<Status, Data, Event> = {
      states: ["idle", "active"],
      initialState: { status: "idle", data: { count: 0 } },
      transitions: [
        {
          from: ["idle"],
          event: "INCREMENT",
          to: "active",
          reducer: (state) => ({ count: state.data.count + 1 }),
        },
      ],
    };

    const machine = new Machine(def);
    expect(machine.getStatus()).toBe("idle");
    expect(machine.getState().data.count).toBe(0);

    machine.send({ type: "INCREMENT", payload: { count: 1 } });
    expect(machine.getStatus()).toBe("active");
    expect(machine.getState().data.count).toBe(1);
  });

  it("enforces transition guards - throws in dev, returns error in prod", () => {
    type Status = "idle" | "unlocked";
    type Data = { key: string };
    type Event = MachineEvent<"UNLOCK", { key: string }>;

    const def: MachineDefinition<Status, Data, Event> = {
      states: ["idle", "unlocked"],
      initialState: { status: "idle", data: { key: "secret" } },
      transitions: [
        {
          from: ["idle"],
          event: "UNLOCK",
          to: "unlocked",
          guard: (_state, _ctx, event) => event.payload.key === "secret",
          reducer: (state) => state.data,
        },
      ],
    };

    const machine = new Machine(def);

    // Wrong key -> guard rejects (throws in dev)
    expect(() =>
      machine.send({ type: "UNLOCK", payload: { key: "wrong" } }),
    ).toThrow(/Guard condition rejected/);
    expect(machine.getStatus()).toBe("idle");

    // Correct key -> guard allows
    const correctResult = machine.send({
      type: "UNLOCK",
      payload: { key: "secret" },
    });
    expect(correctResult.success).toBe(true);
    expect(machine.getStatus()).toBe("unlocked");
  });

  it("detects ambiguous transitions during construction", () => {
    const invalidDef: any = {
      states: ["idle", "stateA", "stateB"],
      initialState: { status: "idle", data: {} },
      transitions: [
        { from: ["idle"], event: "GO", to: "stateA" },
        { from: ["idle"], event: "GO", to: "stateB" },
      ],
    };

    expect(() => new Machine(invalidDef)).toThrow(/Ambiguous transition/);
  });

  it("validates machine definition structure on construction", () => {
    expect(() => new Machine(null as any)).toThrow(
      /Definition must be an object/,
    );
    expect(() => new Machine({} as any)).toThrow(/initialState/);
    expect(
      () =>
        new Machine({
          states: ["idle"],
          initialState: { status: "idle", data: {} },
          transitions: [{ from: [], event: "FOO", to: "bar" }],
        } as any),
    ).toThrow(/empty "from" list/);
  });

  it("resets machine state to initial snapshot", () => {
    type Status = "off" | "on";
    type Data = { count: number };
    type Event = MachineEvent<"TOGGLE">;

    const def: MachineDefinition<Status, Data, Event> = {
      states: ["off", "on"],
      initialState: { status: "off", data: { count: 0 } },
      transitions: [
        {
          from: ["off"],
          event: "TOGGLE",
          to: "on",
          reducer: () => ({ count: 10 }),
        },
      ],
    };

    const machine = new Machine(def);
    machine.send({ type: "TOGGLE" });
    expect(machine.getStatus()).toBe("on");

    machine.reset();
    expect(machine.getStatus()).toBe("off");
    expect(machine.getState().data.count).toBe(0);
  });

  it("enforces terminal destroy lifecycle", () => {
    type Status = "idle" | "active";
    type Data = { flag: boolean };
    type Event = MachineEvent<"ACTIVATE">;

    const def: MachineDefinition<Status, Data, Event> = {
      states: ["idle", "active"],
      initialState: { status: "idle", data: { flag: true } },
      transitions: [{ from: ["idle"], event: "ACTIVATE", to: "active" }],
    };

    const machine = new Machine(def);
    machine.destroy();

    expect(machine.getLifecycleStatus()).toBe("destroyed");
    expect(() => machine.send({ type: "ACTIVATE" })).toThrow(
      /destroyed machine/,
    );
    expect(() => machine.reset()).toThrow(/destroyed machine/);
  });
});
