import { describe, expect, it } from "vitest";

import {
  normalizeText,
  selectKeyAction,
  sortByDocumentPosition,
  typeaheadIndex,
  type PositionedNode,
} from "../components/select";

/** Fake nodes ordered by `pos`, answering like Node.compareDocumentPosition. */
const node = (pos: number): PositionedNode & { pos: number } => ({
  pos,
  compareDocumentPosition(other) {
    return (other as unknown as { pos: number }).pos > pos ? 4 : 2;
  },
});

describe("select item collection", () => {
  it("orders registered items by DOM position, not registration order", () => {
    const records = [
      { value: "c", node: node(3) },
      { value: "a", node: node(1) },
      { value: "x", node: null },
      { value: "b", node: node(2) },
    ];
    expect(sortByDocumentPosition(records).map((r) => r.value)).toEqual(["a", "b", "c", "x"]);
  });

  it("normalizes rendered text", () => {
    expect(normalizeText("  Apple\n   pie ")).toBe("Apple pie");
    expect(normalizeText(null)).toBe("");
  });

  it("re-exports typeahead", () => {
    expect(typeaheadIndex(["None", "Apple", "Carrot"], 0, "c")).toBe(2);
  });
});

describe("selectKeyAction", () => {
  const closed = (key: string, extra = {}, typing = false) => selectKeyAction({ key, ...extra }, false, typing);
  const open = (key: string, extra = {}, typing = false) => selectKeyAction({ key, ...extra }, true, typing);

  it("closed: arrows, Enter and Space open; Home/End open at the edges", () => {
    expect(closed("ArrowDown")).toBe("open");
    expect(closed("ArrowUp")).toBe("open");
    expect(closed("Enter")).toBe("open");
    expect(closed(" ")).toBe("open");
    expect(closed("Home")).toBe("openFirst");
    expect(closed("End")).toBe("openLast");
  });

  it("closed: printable characters typeahead-select; Space continues a search", () => {
    expect(closed("c")).toBe("typeahead");
    expect(closed(" ", {}, true)).toBe("typeahead");
    expect(closed("c", { ctrlKey: true })).toBeNull();
    expect(closed("Tab")).toBeNull();
    expect(closed("Escape")).toBeNull();
  });

  it("open: navigation, selection, Tab, Escape", () => {
    expect(open("ArrowDown")).toBe("navigate");
    expect(open("ArrowUp")).toBe("navigate");
    expect(open("Home")).toBe("navigate");
    expect(open("End")).toBe("navigate");
    expect(open("Enter")).toBe("select");
    expect(open(" ")).toBe("select");
    expect(open("ArrowUp", { altKey: true })).toBe("select");
    expect(open("Tab")).toBe("selectAndBlur");
    expect(open("Escape")).toBe("close");
    expect(open("x")).toBe("typeahead");
    expect(open(" ", {}, true)).toBe("typeahead");
    expect(open("Shift")).toBeNull();
  });
});
