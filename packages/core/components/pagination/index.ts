/**
 * Pagination range logic, framework-agnostic.
 *
 * `paginationRange` lists what a pager shows: page numbers plus ellipses
 * standing in for runs of hidden pages. The list always has the same length
 * once pages collapse, so controls don't jump around as the page changes.
 */

export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

export interface PaginationRangeOptions {
  /** Current page, 1-based. Clamped to [1, count]. */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Pages shown on each side of the current page (default 1). */
  siblings?: number;
  /** Pages always shown at the start and end (default 1). */
  boundaries?: number;
}

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

/** Clamp a page number into [1, count] (1 when there are no pages). */
export function clampPage(page: number, count: number): number {
  const max = Math.max(1, Math.floor(count));
  if (!Number.isFinite(page)) return 1;
  return Math.min(max, Math.max(1, Math.floor(page)));
}

/**
 * Items to render. An ellipsis only replaces two or more pages: hiding a
 * single page behind "…" takes the same space as showing it.
 */
export function paginationRange({
  page,
  count,
  siblings = 1,
  boundaries = 1,
}: PaginationRangeOptions): PaginationItem[] {
  const total = Math.max(0, Math.floor(count));
  if (total === 0) return [];
  const s = Math.max(0, Math.floor(siblings));
  const b = Math.max(0, Math.floor(boundaries));
  const current = clampPage(page, total);

  // boundaries on both ends, siblings on both sides, current, two ellipses
  if (total <= 2 * b + 2 * s + 3) return range(1, total);

  const start = range(1, b);
  const end = range(total - b + 1, total);

  const siblingsStart = Math.max(Math.min(current - s, total - b - 2 * s - 1), b + 2);
  const siblingsEnd = Math.min(Math.max(current + s, b + 2 * s + 2), total - b - 1);

  return [
    ...start,
    siblingsStart > b + 2 ? "ellipsis-start" : b + 1,
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < total - b - 1 ? "ellipsis-end" : total - b,
    ...end,
  ];
}
