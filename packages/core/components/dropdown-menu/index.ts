/**
 * Typeahead for menus and listboxes, framework-agnostic.
 *
 * Adapters keep a short-lived buffer of typed characters (reset after
 * `TYPEAHEAD_TIMEOUT` ms of inactivity) and ask where it leads.
 */

/** How long typed characters accumulate into one search, in ms. */
export const TYPEAHEAD_TIMEOUT = 500;

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase();

export interface TypeaheadOptions {
  isDisabled?: (index: number) => boolean;
}

/**
 * Index of the item the typed `buffer` leads to, or null if nothing matches.
 *
 * - A single character (or the same character repeated) cycles through the
 *   items starting with it, beginning after `current`.
 * - A longer buffer matches item prefixes, starting at `current`, so typing
 *   "ap" stays on "Apple" once "a" found it.
 * - Case- and accent-insensitive; disabled items are skipped.
 */
export function typeaheadIndex(
  labels: readonly string[],
  current: number,
  buffer: string,
  { isDisabled = () => false }: TypeaheadOptions = {},
): number | null {
  const count = labels.length;
  const typed = normalize(buffer);
  if (count === 0 || typed === "") return null;

  const repeated = [...typed].every((char) => char === typed[0]);
  const search = repeated ? typed[0]! : typed;
  const first = current < 0 ? 0 : repeated ? current + 1 : current;

  for (let i = 0; i < count; i++) {
    const index = (first + i) % count;
    if (!isDisabled(index) && normalize(labels[index]!).startsWith(search)) return index;
  }
  return null;
}

/** Whether a key press is a printable character that should feed typeahead. */
export function isTypeaheadKey(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}
