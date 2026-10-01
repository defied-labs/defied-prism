/**
 * Framework-agnostic data table logic (sorting, row selection), shared by
 * every adapter.
 */

export type SortDirection = "ascending" | "descending";

export interface SortState {
  /** Column id. */
  column: string;
  direction: SortDirection;
}

export type RowKey = string | number;

/** Default comparator: nullish last, numbers/dates numerically, strings by locale with numeric collation. */
export function compareValues(a: unknown, b: unknown, collator?: Intl.Collator): number {
  const aNil = a === null || a === undefined || (typeof a === "number" && Number.isNaN(a));
  const bNil = b === null || b === undefined || (typeof b === "number" && Number.isNaN(b));
  if (aNil || bNil) return aNil === bNil ? 0 : aNil ? 1 : -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  const c = collator ?? new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return c.compare(String(a), String(b));
}

export interface SortableColumn<Row> {
  id: string;
  /** Returns the value used for sorting. */
  accessor: (row: Row) => unknown;
  /** Custom comparator on accessor values (ascending order). */
  compare?: (a: unknown, b: unknown) => number;
}

/**
 * Returns a new, stably sorted array. Nullish values sort last in both
 * directions. Unknown columns or a null sort return the rows unchanged (a copy).
 */
export function sortRows<Row>(
  rows: readonly Row[],
  sort: SortState | null | undefined,
  columns: readonly SortableColumn<Row>[],
  locale?: string,
): Row[] {
  const column = sort ? columns.find((c) => c.id === sort.column) : undefined;
  if (!sort || !column) return rows.slice();
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  const sign = sort.direction === "descending" ? -1 : 1;
  const isNil = (v: unknown) => v === null || v === undefined || (typeof v === "number" && Number.isNaN(v));
  return rows
    .map((row, index) => ({ row, index, value: column.accessor(row) }))
    .sort((a, b) => {
      const aNil = isNil(a.value);
      const bNil = isNil(b.value);
      if (aNil || bNil) return aNil === bNil ? a.index - b.index : aNil ? 1 : -1;
      const result = column.compare ? column.compare(a.value, b.value) : compareValues(a.value, b.value, collator);
      return result * sign || a.index - b.index;
    })
    .map((entry) => entry.row);
}

/**
 * The next sort after activating a column header: a new column starts
 * ascending; the same column toggles ascending -> descending, then clears
 * (unless `allowUnsorted` is false, in which case it flips back to ascending).
 */
export function nextSort(
  current: SortState | null | undefined,
  column: string,
  { allowUnsorted = true }: { allowUnsorted?: boolean } = {},
): SortState | null {
  if (!current || current.column !== column) return { column, direction: "ascending" };
  if (current.direction === "ascending") return { column, direction: "descending" };
  return allowUnsorted ? null : { column, direction: "ascending" };
}

/** `aria-sort` value for a column header ("none" when sortable but not sorted). */
export function ariaSort(sort: SortState | null | undefined, column: string): SortDirection | "none" {
  return sort && sort.column === column ? sort.direction : "none";
}

export type SelectAllState = boolean | "indeterminate";

/** Select-all checkbox state for the given selectable row keys. */
export function selectAllState(selected: ReadonlySet<RowKey>, keys: readonly RowKey[]): SelectAllState {
  if (keys.length === 0) return false;
  let count = 0;
  for (const key of keys) if (selected.has(key)) count++;
  if (count === 0) return false;
  return count === keys.length ? true : "indeterminate";
}

/** Adds or removes one row key; returns a new set. */
export function toggleRow(selected: ReadonlySet<RowKey>, key: RowKey, on = !selected.has(key)): Set<RowKey> {
  const next = new Set(selected);
  if (on) next.add(key);
  else next.delete(key);
  return next;
}

/**
 * Toggles every key in `keys`: if all are selected they are removed,
 * otherwise all are added. Keys outside `keys` (other pages, disabled rows)
 * are preserved.
 */
export function toggleAll(selected: ReadonlySet<RowKey>, keys: readonly RowKey[]): Set<RowKey> {
  const next = new Set(selected);
  const allOn = selectAllState(selected, keys) === true;
  for (const key of keys) {
    if (allOn) next.delete(key);
    else next.add(key);
  }
  return next;
}
