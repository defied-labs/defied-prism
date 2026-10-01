/**
 * Collections: compound components whose items register with the root
 * (`<Select><SelectItem/>…`). Items register in whatever order effects run;
 * the collection is presented in DOM order. Framework-agnostic: adapters own
 * registration, this module owns ordering, text and change detection.
 */

/** The subset of `Node` needed to order items by DOM position. */
export interface PositionedNode {
  compareDocumentPosition(other: PositionedNode): number;
}

/** Node.DOCUMENT_POSITION_FOLLOWING, without touching the DOM globals. */
const FOLLOWING = 4;

/** Compare two nodes by document position; missing nodes sort last. */
export function compareDocumentPosition(a: PositionedNode | null, b: PositionedNode | null): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & FOLLOWING ? -1 : 1;
}

/**
 * Records in DOM order. Records without a node (not rendered, or not yet
 * attached) sort last, keeping their relative order.
 */
export function sortByDocumentPosition<T extends { node: PositionedNode | null }>(
  records: Iterable<T>,
): T[] {
  return [...records].sort((a, b) => compareDocumentPosition(a.node, b.node));
}

/** Whether `records` are already in DOM order (cheap check before re-sorting). */
export function isInDocumentOrder(records: readonly { node: PositionedNode | null }[]): boolean {
  for (let i = 1; i < records.length; i++) {
    if (compareDocumentPosition(records[i - 1]!.node, records[i]!.node) > 0) return false;
  }
  return true;
}

/** Whitespace-collapsed text of an item, for typeahead, filtering and display. */
export const normalizeText = (text: string | null | undefined): string =>
  (text ?? "").replace(/\s+/g, " ").trim();

/**
 * An item's text: an explicit `textValue` wins; otherwise its rendered text;
 * otherwise (not rendered, e.g. filtered out) the text last remembered.
 */
export function resolveItemText(
  textValue: string | undefined,
  rendered: string | null | undefined,
  remembered: string | undefined,
): string {
  if (textValue !== undefined) return textValue;
  if (rendered != null) return normalizeText(rendered);
  return remembered ?? "";
}

/**
 * Shallow equality for registration records: own keys compared with
 * `Object.is`, arrays (e.g. keywords) compared element-wise, so re-registering
 * an unchanged item is a no-op.
 */
export function sameRecord<T extends object>(a: T | undefined, b: T): boolean {
  if (!a) return false;
  if (a === b) return true;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((key) => {
    const x = (a as Record<string, unknown>)[key];
    const y = (b as Record<string, unknown>)[key];
    if (Object.is(x, y)) return true;
    return (
      Array.isArray(x) &&
      Array.isArray(y) &&
      x.length === y.length &&
      x.every((v, i) => Object.is(v, y[i]))
    );
  });
}
