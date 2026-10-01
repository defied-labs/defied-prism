import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMachine } from "@defied-prism/react";
import { buttonMachineDefinition, ButtonEvents } from "@defied-prism/core";

describe("useMachine Hook Contract", () => {
  it("subscribes correctly and updates state on send", () => {
    const { result } = renderHook(() => useMachine(buttonMachineDefinition));

    expect(result.current.status).toBe("idle");
    expect(result.current.isActive("idle")).toBe(true);

    act(() => {
      result.current.send(ButtonEvents.focus());
    });

    expect(result.current.status).toBe("focused");
    expect(result.current.isActive("focused")).toBe(true);
    expect(result.current.data.focused).toBe(true);
  });

  it("unsubscribes on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useMachine(buttonMachineDefinition),
    );
    const instance = result.current.machine;

    unmount();

    // Sending event to machine after unmount does not trigger React state updates or throws
    expect(() => instance.send(ButtonEvents.focus())).not.toThrow();
  });

  it("handles machine replacement safely when key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useMachine(buttonMachineDefinition, key),
      { initialProps: { key: 1 } },
    );

    const firstMachine = result.current.machine;

    act(() => {
      result.current.send(ButtonEvents.focus());
    });
    expect(result.current.status).toBe("focused");

    rerender({ key: 2 });
    const secondMachine = result.current.machine;

    expect(firstMachine).not.toBe(secondMachine);
    expect(result.current.status).toBe("idle");
  });

  it("returns TransitionResult from send with success/error info", () => {
    const { result } = renderHook(() => useMachine(buttonMachineDefinition));

    let successResult: any;
    act(() => {
      successResult = result.current.send(ButtonEvents.focus());
    });
    expect(successResult.success).toBe(true);
    expect(successResult.state).toBeDefined();
  });

  it("keeps one machine across re-renders with an inline definition", () => {
    const { result, rerender } = renderHook(() =>
      useMachine({ ...buttonMachineDefinition }),
    );
    const first = result.current.machine;

    act(() => {
      result.current.send(ButtonEvents.focus());
    });
    rerender();

    expect(result.current.machine).toBe(first);
    expect(result.current.status).toBe("focused");
  });

  it("survives StrictMode double-mounting", () => {
    const { result } = renderHook(() => useMachine(buttonMachineDefinition), {
      wrapper: StrictMode,
    });

    act(() => {
      result.current.send(ButtonEvents.focus());
    });

    expect(result.current.machine.isActive()).toBe(true);
    expect(result.current.status).toBe("focused");
  });
});
