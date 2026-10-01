import { describe, expect, it } from "vitest";

import {
  clamp,
  fractionToValue,
  keyboardValue,
  pointerFraction,
  snapToStep,
  valueToPercent,
} from "../components/slider";

const range = { min: 0, max: 100, step: 1 };

describe("slider math", () => {
  it("clamps", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("snaps to the step from min, without float drift", () => {
    expect(snapToStep(42.4, range)).toBe(42);
    expect(snapToStep(42.6, range)).toBe(43);
    expect(snapToStep(7, { min: 1, max: 20, step: 5 })).toBe(6);
    expect(snapToStep(0.30000000000000004, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    expect(snapToStep(0.35, { min: 0, max: 1, step: 0.05 })).toBe(0.35);
    expect(snapToStep(150, range)).toBe(100);
    expect(snapToStep(-3, range)).toBe(0);
    // A partial last step: snapping past max clamps to max
    expect(snapToStep(9.8, { min: 0, max: 10, step: 3 })).toBe(9);
    expect(snapToStep(10.9, { min: 0, max: 10, step: 3 })).toBe(10);
  });

  it("converts value <-> percent", () => {
    expect(valueToPercent(25, 0, 100)).toBe(25);
    expect(valueToPercent(15, 10, 20)).toBe(50);
    expect(valueToPercent(50, 10, 20)).toBe(100);
    expect(valueToPercent(5, 5, 5)).toBe(0);
    expect(fractionToValue(0.426, range)).toBe(43);
    expect(fractionToValue(2, range)).toBe(100);
  });

  it("computes the pointer fraction for both orientations", () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 };
    expect(pointerFraction({ x: 150, y: 0 }, rect)).toBe(0.25);
    expect(pointerFraction({ x: 0, y: 0 }, rect)).toBe(0);
    expect(pointerFraction({ x: 999, y: 0 }, rect)).toBe(1);
    expect(pointerFraction({ x: 0, y: 125 }, rect, "vertical")).toBe(0.25);
    expect(pointerFraction({ x: 0, y: 0 }, { left: 0, top: 0, width: 0, height: 0 })).toBe(0);
  });

  it("maps keys to values (APG slider)", () => {
    expect(keyboardValue("ArrowRight", 10, range)).toBe(11);
    expect(keyboardValue("ArrowUp", 10, range)).toBe(11);
    expect(keyboardValue("ArrowLeft", 10, range)).toBe(9);
    expect(keyboardValue("ArrowDown", 10, range)).toBe(9);
    expect(keyboardValue("PageUp", 10, range)).toBe(20);
    expect(keyboardValue("PageDown", 10, range)).toBe(0);
    expect(keyboardValue("PageDown", 5, range)).toBe(0);
    expect(keyboardValue("Home", 50, range)).toBe(0);
    expect(keyboardValue("End", 50, range)).toBe(100);
    expect(keyboardValue("ArrowRight", 100, range)).toBe(100);
    expect(keyboardValue("PageUp", 0, { ...range, largeStep: 25 })).toBe(25);
    expect(keyboardValue("ArrowRight", 0.2, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    expect(keyboardValue("a", 10, range)).toBeNull();
  });
});
