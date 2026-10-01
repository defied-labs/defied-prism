import { createRef, createElement as h } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slot, mergeProps } from "../src";

describe("mergeProps", () => {
  it("chains handlers child-first and respects preventDefault", () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push("slot") },
      { onClick: () => calls.push("child") },
    );
    merged.onClick({ defaultPrevented: false });
    expect(calls).toEqual(["child", "slot"]);

    const slot = vi.fn();
    mergeProps({ onClick: slot }, { onClick: () => {} }).onClick({ defaultPrevented: true });
    expect(slot).not.toHaveBeenCalled();
  });

  it("combines className and style; child wins elsewhere", () => {
    expect(
      mergeProps(
        { className: "a", style: { color: "red" }, id: "slot", "aria-describedby": "d" },
        { className: "b", style: { margin: 0 }, id: "child" },
      ),
    ).toEqual({
      className: "a b",
      style: { color: "red", margin: 0 },
      id: "child",
      "aria-describedby": "d",
    });
  });
});

describe("Slot", () => {
  it("renders the child with merged props and both refs", () => {
    const slotRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    const onFocus = vi.fn();
    render(
      h(Slot, { ref: slotRef, onFocus, "data-x": "1" } as any, h("button", { ref: childRef }, "Go")),
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.getAttribute("data-x")).toBe("1");
    expect(slotRef.current).toBe(button);
    expect(childRef.current).toBe(button);
    button.focus();
    expect(onFocus).toHaveBeenCalled();
  });
});
