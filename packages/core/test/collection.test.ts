import { describe, expect, it } from "vitest";

import {
  compareDocumentPosition,
  isInDocumentOrder,
  normalizeText,
  resolveItemText,
  sameRecord,
  sortByDocumentPosition,
  type PositionedNode,
} from "../lib/collection";

/** Fake nodes ordered by `pos`, answering like Node.compareDocumentPosition. */
const node = (pos: number): PositionedNode & { pos: number } => ({
  pos,
  compareDocumentPosition(other) {
    return (other as unknown as { pos: number }).pos > pos ? 4 : 2;
  },
});

describe("collection ordering", () => {
  it("sorts by DOM position, nodeless records last and stable", () => {
    const records = [
      { value: "c", node: node(3) },
      { value: "y", node: null },
      { value: "a", node: node(1) },
      { value: "x", node: null },
      { value: "b", node: node(2) },
    ];
    expect(sortByDocumentPosition(records).map((r) => r.value)).toEqual(["a", "b", "c", "y", "x"]);
  });

  it("compares nodes", () => {
    const a = node(1);
    expect(compareDocumentPosition(a, node(2))).toBe(-1);
    expect(compareDocumentPosition(node(2), a)).toBe(1);
    expect(compareDocumentPosition(a, a)).toBe(0);
    expect(compareDocumentPosition(null, a)).toBe(1);
    expect(compareDocumentPosition(null, null)).toBe(0);
  });

  it("detects whether records are in order", () => {
    expect(isInDocumentOrder([])).toBe(true);
    expect(isInDocumentOrder([{ node: node(1) }, { node: node(2) }, { node: null }])).toBe(true);
    expect(isInDocumentOrder([{ node: node(2) }, { node: node(1) }])).toBe(false);
    expect(isInDocumentOrder([{ node: null }, { node: node(1) }])).toBe(false);
  });
});

describe("collection text", () => {
  it("normalizes rendered text", () => {
    expect(normalizeText("  Apple\n   pie ")).toBe("Apple pie");
    expect(normalizeText(undefined)).toBe("");
  });

  it("prefers textValue, then rendered text, then remembered text", () => {
    expect(resolveItemText("Explicit", " Rendered ", "Old")).toBe("Explicit");
    expect(resolveItemText(undefined, " Rendered  text ", "Old")).toBe("Rendered text");
    expect(resolveItemText(undefined, null, "Old")).toBe("Old");
    expect(resolveItemText(undefined, null, undefined)).toBe("");
  });
});

describe("sameRecord", () => {
  it("compares own keys shallowly and arrays element-wise", () => {
    const fn = () => {};
    expect(sameRecord(undefined, { a: 1 })).toBe(false);
    expect(sameRecord({ a: 1, k: ["x"], fn }, { a: 1, k: ["x"], fn })).toBe(true);
    expect(sameRecord({ a: 1, k: ["x"] }, { a: 1, k: ["y"] })).toBe(false);
    expect(sameRecord({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(sameRecord({ a: 1 }, { a: 2 })).toBe(false);
  });
});
