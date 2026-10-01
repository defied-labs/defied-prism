/**
 * Select-only combobox (WAI-ARIA APG) behavior, framework-agnostic.
 *
 * Focus stays on the combobox element; the highlighted option is conveyed
 * with aria-activedescendant. Adapters map keys with `selectKeyAction` and
 * move the highlight with `nextIndex` and `typeaheadIndex`.
 */
export { TYPEAHEAD_TIMEOUT, isTypeaheadKey, typeaheadIndex } from "../dropdown-menu";

/** A registered item: what the adapter knows about each rendered option. */
export interface SelectItemRecord {
  value: string;
  /** Text used for typeahead and shown in the trigger. */
  textValue: string;
  disabled: boolean;
}

/** Item ordering and text now live in the shared collection primitive. */
export { normalizeText, sortByDocumentPosition, type PositionedNode } from "../../lib/collection";

export type SelectAction =
  /** Open, highlighting the selected option (or the first enabled one). */
  | "open"
  | "openFirst"
  | "openLast"
  /** Closed: select the next matching option without opening. */
  | "typeahead"
  /** Open: move the highlight (arrows, Home/End). */
  | "navigate"
  /** Open: select the highlighted option and close, keeping focus. */
  | "select"
  /** Open: select the highlighted option and close, letting focus move on (Tab). */
  | "selectAndBlur"
  | "close"
  | null;

export interface KeyInput {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * What a key press does, per the APG select-only combobox:
 *
 * Closed: ArrowDown / ArrowUp / Enter / Space open; Home / End open on the
 * first / last option; printable characters select by typeahead.
 * Open: arrows, Home / End move; Enter / Space / Alt+ArrowUp select and
 * close; Tab selects and closes (focus moves on); Escape closes; printable
 * characters move by typeahead. Space continues a typeahead search that is
 * in progress (`typing`).
 */
export function selectKeyAction(event: KeyInput, open: boolean, typing = false): SelectAction {
  const { key, altKey = false, ctrlKey = false, metaKey = false } = event;
  const printable = key.length === 1 && !ctrlKey && !metaKey && !altKey;

  if (!open) {
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter") return "open";
    if (key === " ") return typing ? "typeahead" : "open";
    if (key === "Home") return "openFirst";
    if (key === "End") return "openLast";
    return printable ? "typeahead" : null;
  }

  if (key === "ArrowUp" && altKey) return "select";
  if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") return "navigate";
  if (key === "Enter") return "select";
  if (key === " ") return typing ? "typeahead" : "select";
  if (key === "Tab") return "selectAndBlur";
  if (key === "Escape") return "close";
  return printable ? "typeahead" : null;
}
