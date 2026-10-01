import { describe, expect, it, vi } from "vitest";
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

  it("reports guard rejections through the result without throwing", () => {
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

    // Wrong key -> guard rejects
    const rejected = machine.send({ type: "UNLOCK", payload: { key: "wrong" } });
    expect(rejected).toEqual({
      success: false,
      error: { code: "GUARD_REJECTED", state: "idle", event: "UNLOCK" },
    });
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
    expect(machine.send({ type: "ACTIVATE" })).toEqual({
      success: false,
      error: { code: "MACHINE_DESTROYED" },
    });
    expect(machine.getStatus()).toBe("idle");
    expect(() => machine.reset()).toThrow(/destroyed machine/);
  });

  it("ignores events with no transition from the current state", () => {
    type Event = MachineEvent<"GO"> | MachineEvent<"STRAY">;
    const machine = new Machine<"a" | "b", { n: number }, Event>({
      states: ["a", "b"],
      initialState: { status: "a", data: { n: 0 } },
      transitions: [{ from: ["a"], event: "GO", to: "b" }],
    });
    const listener = vi.fn();
    machine.subscribe(listener);

    expect(machine.send({ type: "STRAY" })).toEqual({
      success: false,
      error: { code: "NO_TRANSITION", state: "a", event: "STRAY" },
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it("returns a stable, frozen snapshot until the next transition", () => {
    const machine = new Machine<"a" | "b", { n: number }, MachineEvent<"GO">>({
      states: ["a", "b"],
      initialState: { status: "a", data: { n: 0 } },
      transitions: [
        { from: ["a"], event: "GO", to: "b", reducer: (s) => ({ n: s.data.n + 1 }) },
      ],
    });

    const first = machine.getState();
    expect(machine.getState()).toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.data)).toBe(true);

    machine.send({ type: "GO" });
    expect(machine.getState()).not.toBe(first);
    expect(machine.getState().data.n).toBe(1);
  });

  it("keeps non-cloneable data such as functions", () => {
    const onDone = () => "done";
    const machine = new Machine<"a", { onDone: () => string }, MachineEvent<"NOOP">>({
      states: ["a"],
      initialState: { status: "a", data: { onDone } },
      transitions: [{ from: ["a"], event: "NOOP", to: "a" }],
    });

    expect(machine.send({ type: "NOOP" }).success).toBe(true);
    expect(machine.getState().data.onDone).toBe(onDone);
  });
});
