import { createRef } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useComposedRefs, useControllableState } from "../src";

describe("useControllableState", () => {
  it("manages its own state when uncontrolled and reports changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a", onChange }),
    );
    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("follows the value prop when controlled", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: "a", onChange }),
      { initialProps: { value: "x" } },
    );
    act(() => result.current[1]("y"));
    expect(result.current[0]).toBe("x"); // parent hasn't accepted it yet
    expect(onChange).toHaveBeenCalledWith("y");
    rerender({ value: "y" });
    expect(result.current[0]).toBe("y");
  });

  it("does not report a change to the same value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("useComposedRefs", () => {
  it("assigns object and callback refs", () => {
    const objectRef = createRef<HTMLDivElement>();
    const callback = vi.fn();
    const { result } = renderHook(() => useComposedRefs(objectRef, callback, undefined));
    const node = document.createElement("div");
    result.current(node);
    expect(objectRef.current).toBe(node);
    expect(callback).toHaveBeenCalledWith(node);
  });
});
