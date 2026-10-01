import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type RefObject,
} from "react";
import {
  isInDocumentOrder,
  resolveItemText,
  sameRecord,
  sortByDocumentPosition,
} from "@defied-prism/core";

/** Layout effect in the browser, plain effect on the server (where neither runs). */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** What an item tells its collection. Extra fields (group, keywords…) pass through. */
export interface CollectionItemInput {
  /** DOM id of the item element; also its key in the collection. */
  id: string;
  value: string;
  /** Explicit text; defaults to the rendered text content. */
  textValue?: string;
  disabled?: boolean;
}

/** A registered item: its data plus resolved text, disabled flag and element. */
export type CollectionRecord<T extends CollectionItemInput = CollectionItemInput> = Omit<
  T,
  "textValue" | "disabled"
> & {
  textValue: string;
  disabled: boolean;
  /** The item's element; null while it isn't rendered (e.g. filtered out). */
  node: HTMLElement | null;
};

export interface Collection<R extends CollectionRecord = CollectionRecord> {
  /** Registered items in DOM order (items without an element last). */
  items: R[];
  /** Looks up a registered item by id (live, not tied to a render). */
  get: (id: string) => R | undefined;
  /** Adds or updates an item; a no-op when nothing changed. */
  register: (record: R) => void;
  unregister: (id: string) => void;
  /** Text last rendered by an item with this value (kept while it's unmounted). */
  textOf: (value: string) => string | undefined;
  /** @internal Remembers an item's rendered text by value. */
  rememberText: (value: string, text: string) => void;
}

/**
 * The root side of a compound component's item collection. Items register
 * through `useCollectionItem`; `items` is re-sorted into DOM order whenever a
 * registration changes, when an item re-renders out of place, and on each
 * commit of the root, so items added, removed or reordered after mount keep
 * their DOM order. Functions are stable; `items` and the returned object
 * change only when the collection does. SSR-safe: nothing registers on the
 * server, and the document is only read in layout effects.
 */
export function useCollection<R extends CollectionRecord = CollectionRecord>(): Collection<R> {
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  const store = useRef<{
    records: Map<string, R>;
    texts: Map<string, string>;
    sorted: R[];
    index: Map<string, number>;
  }>(null as never);
  if (!store.current) {
    store.current = { records: new Map(), texts: new Map(), sorted: [], index: new Map() };
  }

  const api = useMemo(() => {
    const s = store.current;
    // An unchanged item still re-renders when its parent moves it: check its neighbors
    const outOfPlace = (record: R) => {
      const i = s.index.get(record.id);
      if (i === undefined) return true;
      const prev = s.sorted[i - 1];
      const next = s.sorted[i + 1];
      return !isInDocumentOrder([...(prev ? [prev] : []), record, ...(next ? [next] : [])]);
    };
    return {
      get: (id: string) => s.records.get(id),
      register: (record: R) => {
        const current = s.records.get(record.id);
        if (sameRecord(current, record)) {
          if (outOfPlace(current!)) bump();
          return;
        }
        s.records.set(record.id, record);
        bump();
      },
      unregister: (id: string) => {
        if (s.records.delete(id)) bump();
      },
      textOf: (value: string) => s.texts.get(value),
      rememberText: (value: string, text: string) => {
        s.texts.set(value, text);
      },
    };
  }, []);

  const items = useMemo(() => {
    const s = store.current;
    s.sorted = sortByDocumentPosition(s.records.values());
    s.index = new Map(s.sorted.map((record, i) => [record.id, i]));
    return s.sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  // Each commit of the root: re-sort if items moved without re-registering
  useIsomorphicLayoutEffect(() => {
    if (!isInDocumentOrder(items)) bump();
  });

  return useMemo(() => ({ ...api, items }), [api, items]);
}

/**
 * Registers an item with its collection on every render (a no-op when
 * nothing changed) and unregisters it on unmount. The text is `textValue`,
 * else the element's whitespace-collapsed text, else (while the element
 * isn't rendered) the text last rendered for the same value.
 */
export function useCollectionItem<T extends CollectionItemInput>(
  collection: Pick<Collection<CollectionRecord<T>>, "register" | "unregister" | "textOf" | "rememberText">,
  data: T,
  ref: RefObject<HTMLElement | null>,
): void {
  const { register, unregister, textOf, rememberText } = collection;
  useIsomorphicLayoutEffect(() => {
    const { textValue, disabled, ...rest } = data;
    const node = ref.current;
    const text = resolveItemText(textValue, node ? node.textContent : null, textOf(data.value));
    if (node && textValue === undefined) rememberText(data.value, text);
    register({ ...rest, textValue: text, disabled: !!disabled, node } as CollectionRecord<T>);
  });
  useIsomorphicLayoutEffect(() => () => unregister(data.id), [data.id, unregister]);
}
