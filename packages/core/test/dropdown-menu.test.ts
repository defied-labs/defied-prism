import { describe, expect, it } from "vitest";

import { isTypeaheadKey, typeaheadIndex } from "../components/dropdown-menu";

const labels = ["Apple", "Apricot", "Banana", "Blueberry", "Éclair", "Cherry"];

describe("typeaheadIndex", () => {
  it("finds the first match from the start when nothing is focused", () => {
    expect(typeaheadIndex(labels, -1, "b")).toBe(2);
  });

  it("a single character cycles through matches after the current item", () => {
    expect(typeaheadIndex(labels, 0, "a")).toBe(1);
    expect(typeaheadIndex(labels, 1, "a")).toBe(0); // wraps
    expect(typeaheadIndex(labels, 2, "b")).toBe(3);
  });

  it("repeating the same character keeps cycling", () => {
    expect(typeaheadIndex(labels, 2, "bb")).toBe(3);
    expect(typeaheadIndex(labels, 3, "bbb")).toBe(2);
  });

  it("a longer buffer matches prefixes, staying on the current item if it still matches", () => {
    expect(typeaheadIndex(labels, 0, "ap")).toBe(0);
    expect(typeaheadIndex(labels, 0, "apr")).toBe(1);
    expect(typeaheadIndex(labels, 2, "blu")).toBe(3);
  });

  it("is case- and accent-insensitive", () => {
    expect(typeaheadIndex(labels, -1, "E")).toBe(4);
    expect(typeaheadIndex(labels, -1, "écl")).toBe(4);
  });

  it("skips disabled items", () => {
    expect(typeaheadIndex(labels, -1, "a", { isDisabled: (i) => i === 0 })).toBe(1);
    expect(typeaheadIndex(labels, -1, "c", { isDisabled: (i) => i === 5 })).toBeNull();
  });

  it("returns null when nothing matches or input is empty", () => {
    expect(typeaheadIndex(labels, 0, "z")).toBeNull();
    expect(typeaheadIndex(labels, 0, "")).toBeNull();
    expect(typeaheadIndex([], -1, "a")).toBeNull();
  });
});

describe("isTypeaheadKey", () => {
  it("accepts printable characters without modifiers", () => {
    expect(isTypeaheadKey({ key: "a" })).toBe(true);
    expect(isTypeaheadKey({ key: "7" })).toBe(true);
    expect(isTypeaheadKey({ key: "ArrowDown" })).toBe(false);
    expect(isTypeaheadKey({ key: "a", ctrlKey: true })).toBe(false);
    expect(isTypeaheadKey({ key: "a", metaKey: true })).toBe(false);
  });
});
