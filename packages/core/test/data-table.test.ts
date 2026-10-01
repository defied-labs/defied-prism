import { describe, expect, it } from "vitest";

import {
  ariaSort,
  compareValues,
  nextSort,
  selectAllState,
  sortRows,
  toggleAll,
  toggleRow,
  type SortableColumn,
} from "../components/data-table";

interface Row {
  id: number;
  name: string;
  age: number | null;
  joined?: Date;
}

const rows: Row[] = [
  { id: 1, name: "bob", age: 30, joined: new Date(2020, 0, 1) },
  { id: 2, name: "Alice", age: null, joined: new Date(2019, 0, 1) },
  { id: 3, name: "carol", age: 25, joined: new Date(2021, 0, 1) },
  { id: 4, name: "Dave", age: 30 },
  { id: 5, name: "item 10", age: 5 },
  { id: 6, name: "item 9", age: 5 },
];

const columns: SortableColumn<Row>[] = [
  { id: "name", accessor: (r) => r.name },
  { id: "age", accessor: (r) => r.age },
  { id: "joined", accessor: (r) => r.joined },
  { id: "len", accessor: (r) => r.name, compare: (a, b) => String(a).length - String(b).length },
];

const ids = (list: Row[]) => list.map((r) => r.id);

describe("data-table sorting", () => {
  it("compares values", () => {
    expect(compareValues(1, 2)).toBeLessThan(0);
    expect(compareValues("a", "B")).toBeLessThan(0);
    expect(compareValues("item 9", "item 10")).toBeLessThan(0);
    expect(compareValues(null, 1)).toBeGreaterThan(0);
    expect(compareValues(undefined, null)).toBe(0);
    expect(compareValues(new Date(1), new Date(2))).toBeLessThan(0);
    expect(compareValues(false, true)).toBeLessThan(0);
    expect(compareValues(2n, 1n)).toBeGreaterThan(0);
  });

  it("sorts strings case-insensitively with numeric collation", () => {
    expect(ids(sortRows(rows, { column: "name", direction: "ascending" }, columns))).toEqual([2, 1, 3, 4, 6, 5]);
    expect(ids(sortRows(rows, { column: "name", direction: "descending" }, columns))).toEqual([5, 6, 4, 3, 1, 2]);
  });

  it("is stable and keeps nullish last in both directions", () => {
    expect(ids(sortRows(rows, { column: "age", direction: "ascending" }, columns))).toEqual([5, 6, 3, 1, 4, 2]);
    expect(ids(sortRows(rows, { column: "age", direction: "descending" }, columns))).toEqual([1, 4, 3, 5, 6, 2]);
    expect(ids(sortRows(rows, { column: "joined", direction: "descending" }, columns))).toEqual([3, 1, 2, 4, 5, 6]);
  });

  it("uses custom comparators", () => {
    expect(ids(sortRows(rows, { column: "len", direction: "ascending" }, columns)).slice(0, 2)).toEqual([1, 4]);
  });

  it("returns an unsorted copy without a sort or column", () => {
    const unsorted = sortRows(rows, null, columns);
    expect(unsorted).not.toBe(rows);
    expect(ids(unsorted)).toEqual(ids(rows));
    expect(ids(sortRows(rows, { column: "nope", direction: "ascending" }, columns))).toEqual(ids(rows));
  });

  it("does not mutate input", () => {
    const copy = rows.slice();
    sortRows(rows, { column: "name", direction: "descending" }, columns);
    expect(rows).toEqual(copy);
  });

  it("cycles sort states", () => {
    expect(nextSort(null, "a")).toEqual({ column: "a", direction: "ascending" });
    expect(nextSort({ column: "a", direction: "ascending" }, "a")).toEqual({ column: "a", direction: "descending" });
    expect(nextSort({ column: "a", direction: "descending" }, "a")).toBeNull();
    expect(nextSort({ column: "a", direction: "descending" }, "a", { allowUnsorted: false })).toEqual({
      column: "a",
      direction: "ascending",
    });
    expect(nextSort({ column: "a", direction: "descending" }, "b")).toEqual({ column: "b", direction: "ascending" });
  });

  it("maps to aria-sort", () => {
    expect(ariaSort(null, "a")).toBe("none");
    expect(ariaSort({ column: "b", direction: "ascending" }, "a")).toBe("none");
    expect(ariaSort({ column: "a", direction: "descending" }, "a")).toBe("descending");
  });
});

describe("data-table selection", () => {
  const keys = [1, 2, 3];

  it("derives select-all state", () => {
    expect(selectAllState(new Set(), keys)).toBe(false);
    expect(selectAllState(new Set([2]), keys)).toBe("indeterminate");
    expect(selectAllState(new Set([1, 2, 3]), keys)).toBe(true);
    expect(selectAllState(new Set([9]), keys)).toBe(false);
    expect(selectAllState(new Set([1]), [])).toBe(false);
  });

  it("toggles rows immutably", () => {
    const start = new Set<number | string>([1]);
    const next = toggleRow(start, 2);
    expect([...next]).toEqual([1, 2]);
    expect([...start]).toEqual([1]);
    expect([...toggleRow(next, 1)]).toEqual([2]);
    expect([...toggleRow(next, 1, true)]).toEqual([1, 2]);
  });

  it("toggles all, preserving keys outside the set", () => {
    expect([...toggleAll(new Set([9]), keys)].sort()).toEqual([1, 2, 3, 9]);
    expect([...toggleAll(new Set([1, 9]), keys)].sort()).toEqual([1, 2, 3, 9]);
    expect([...toggleAll(new Set([1, 2, 3, 9]), keys)]).toEqual([9]);
  });
});
