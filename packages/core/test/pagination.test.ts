import { describe, expect, it } from "vitest";

import { clampPage, paginationRange } from "../components/pagination";

const r = (page: number, count: number, siblings?: number, boundaries?: number) =>
  paginationRange({ page, count, siblings, boundaries });

describe("paginationRange", () => {
  it("shows every page when they fit", () => {
    expect(r(1, 0)).toEqual([]);
    expect(r(1, 1)).toEqual([1]);
    expect(r(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the end near the start", () => {
    expect(r(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 10]);
    expect(r(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 10]);
  });

  it("collapses both sides in the middle", () => {
    expect(r(5, 10)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 10]);
    expect(r(6, 10)).toEqual([1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 10]);
  });

  it("collapses the start near the end", () => {
    expect(r(7, 10)).toEqual([1, "ellipsis-start", 6, 7, 8, 9, 10]);
    expect(r(10, 10)).toEqual([1, "ellipsis-start", 6, 7, 8, 9, 10]);
  });

  it("keeps a constant length once collapsed", () => {
    const lengths = new Set(Array.from({ length: 50 }, (_, i) => r(i + 1, 50).length));
    expect([...lengths]).toEqual([7]);
  });

  it("never hides a single page behind an ellipsis", () => {
    for (let page = 1; page <= 30; page++) {
      const items = r(page, 30, 2, 2);
      items.forEach((item, i) => {
        if (typeof item === "number") return;
        const before = items[i - 1] as number;
        const after = items[i + 1] as number;
        expect(after - before).toBeGreaterThan(2);
      });
    }
  });

  it("honours siblings and boundaries", () => {
    expect(r(10, 20, 2, 2)).toEqual([1, 2, "ellipsis-start", 8, 9, 10, 11, 12, "ellipsis-end", 19, 20]);
    expect(r(10, 20, 0, 1)).toEqual([1, "ellipsis-start", 10, "ellipsis-end", 20]);
    expect(r(10, 20, 1, 0)).toEqual(["ellipsis-start", 9, 10, 11, "ellipsis-end"]);
  });

  it("clamps out-of-range pages", () => {
    expect(r(0, 10)).toEqual(r(1, 10));
    expect(r(99, 10)).toEqual(r(10, 10));
  });
});

describe("clampPage", () => {
  it("clamps into [1, count]", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(3.7, 5)).toBe(3);
    expect(clampPage(Number.NaN, 5)).toBe(1);
    expect(clampPage(4, 0)).toBe(1);
  });
});
