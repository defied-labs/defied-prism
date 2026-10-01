import { describe, expect, it, vi } from "vitest";
import { defineComponent, effectScope, h, nextTick, ref } from "vue";
import { fireEvent, render, screen } from "@testing-library/vue";
import { buttonMachineDefinition, ButtonEvents } from "@defied-prism/core";

import {
  Slot,
  mergeProps,
  provideField,
  useControllableState,
  useFieldControlProps,
  useFieldState,
  useMachine,
} from "../src";

describe("useMachine", () => {
  it("subscribes and updates state on send", () => {
    const scope = effectScope();
    const m = scope.run(() => useMachine(buttonMachineDefinition))!;
    expect(m.status.value).toBe("idle");
    m.send(ButtonEvents.focus());
    expect(m.status.value).toBe("focused");
    expect(m.isActive("focused")).toBe(true);
    expect(m.data.value.focused).toBe(true);
    scope.stop();
  });

  it("unsubscribes when its scope is disposed, without destroying the machine", () => {
    const scope = effectScope();
    const m = scope.run(() => useMachine(buttonMachineDefinition))!;
    const instance = m.machine.value;
    scope.stop();
    expect(() => instance.send(ButtonEvents.focus())).not.toThrow();
    expect(m.status.value).toBe("idle");
  });

  it("replaces the machine when the key changes", async () => {
    const key = ref(1);
    const scope = effectScope();
    const m = scope.run(() => useMachine(buttonMachineDefinition, key))!;
    const first = m.machine.value;
    m.send(ButtonEvents.focus());
    key.value = 2;
    await nextTick();
    expect(m.machine.value).not.toBe(first);
    expect(m.status.value).toBe("idle");
    scope.stop();
  });

  it("re-renders a component on transitions", async () => {
    const Comp = defineComponent({
      setup() {
        const { status, send } = useMachine(buttonMachineDefinition);
        return () => h("button", { onFocus: () => send(ButtonEvents.focus()) }, status.value);
      },
    });
    render(Comp);
    await fireEvent.focus(screen.getByRole("button"));
    expect(screen.getByRole("button").textContent).toBe("focused");
  });
});

describe("useControllableState", () => {
  it("is uncontrolled with a default", () => {
    const onChange = vi.fn();
    const state = useControllableState({ value: () => undefined, defaultValue: 1, onChange });
    state.value = 2;
    expect(state.value).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("follows the controlled value and only reports changes", () => {
    const controlled = ref(5);
    const onChange = vi.fn();
    const state = useControllableState({ value: controlled, defaultValue: 0, onChange });
    state.value = 6;
    expect(state.value).toBe(5);
    expect(onChange).toHaveBeenCalledWith(6);
    state.value = 5;
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("field", () => {
  it("links a control to its field; explicit props win", () => {
    const Control = defineComponent({
      setup() {
        const props = useFieldControlProps(() => ({ "aria-describedby": "own" }));
        return () => h("input", props.value);
      },
    });
    const Field = defineComponent({
      setup() {
        const field = useFieldState({ required: true, invalid: true });
        field.setHasDescription(true);
        provideField(field);
        return () => h(Control);
      },
    });
    render(Field);
    const input = screen.getByRole("textbox");
    expect(input.id).toMatch(/-control$/);
    expect(input.getAttribute("aria-describedby")).toMatch(/^own .*-description$/);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input).toBeRequired();
  });

  it("passes props through outside a field", () => {
    const Control = defineComponent({
      setup() {
        const props = useFieldControlProps(() => ({ id: "x" }));
        return () => h("input", props.value);
      },
    });
    render(Control);
    expect(screen.getByRole("textbox").id).toBe("x");
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBeNull();
  });
});

describe("Slot", () => {
  it("merges attributes onto its child; child handlers run first and can prevent", async () => {
    const calls: string[] = [];
    render({
      render: () =>
        h(
          Slot,
          { class: "slot", "data-x": "1", onClick: () => calls.push("slot") },
          () =>
            h(
              "a",
              {
                href: "#",
                class: "child",
                onClick: (e: Event) => {
                  calls.push("child");
                  e.preventDefault();
                },
              },
              "Link",
            ),
        ),
    });
    const link = screen.getByRole("link");
    expect(link.className).toBe("slot child");
    expect(link.getAttribute("data-x")).toBe("1");
    await fireEvent.click(link);
    expect(calls).toEqual(["child"]);
  });

  it("mergeProps keeps child props over slot props", () => {
    expect(mergeProps({ id: "a", title: "s" }, { id: "b" })).toEqual({ id: "b", title: "s" });
  });
});
