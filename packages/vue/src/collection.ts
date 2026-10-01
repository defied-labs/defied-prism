import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import {
  isInDocumentOrder,
  resolveItemText,
  sameRecord,
  sortByDocumentPosition,
} from "@defied-prism/core";

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
  /** Registered items in DOM order (items without an element last). Reactive. */
  readonly items: Readonly<Ref<R[]>>;
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
 * registration changes and after each update of the root, so items added,
 * removed or reordered after mount keep their DOM order. SSR-safe: nothing
 * registers on the server.
 */
export function useCollection<R extends CollectionRecord = CollectionRecord>(): Collection<R> {
  const version = shallowRef(0);
  const bump = () => version.value++;
  const records = new Map<string, R>();
  const texts = new Map<string, string>();
  let sorted: R[] = [];
  let index = new Map<string, number>();

  // An unchanged item may still have been moved by its parent: check its neighbors
  const outOfPlace = (record: R) => {
    const i = index.get(record.id);
    if (i === undefined) return true;
    const prev = sorted[i - 1];
    const next = sorted[i + 1];
    return !isInDocumentOrder([...(prev ? [prev] : []), record, ...(next ? [next] : [])]);
  };

  const items = computed(() => {
    void version.value;
    sorted = sortByDocumentPosition(records.values());
    index = new Map(sorted.map((record, i) => [record.id, i]));
    return sorted;
  });

  // Each update of the root: re-sort if items moved without re-registering
  const resort = () => {
    if (!isInDocumentOrder(items.value)) bump();
  };
  onMounted(resort);
  onUpdated(resort);

  return {
    items,
    get: (id) => records.get(id),
    register: (record) => {
      const current = records.get(record.id);
      if (sameRecord(current, record)) {
        if (outOfPlace(current!)) bump();
        return;
      }
      records.set(record.id, record);
      bump();
    },
    unregister: (id) => {
      if (records.delete(id)) bump();
    },
    textOf: (value) => texts.get(value),
    rememberText: (value, text) => {
      texts.set(value, text);
    },
  };
}

/**
 * Registers an item with its collection after every render (a no-op when
 * nothing changed) and unregisters it on unmount. The text is `textValue`,
 * else the element's whitespace-collapsed text, else (while the element
 * isn't rendered) the text last rendered for the same value.
 */
export function useCollectionItem<T extends CollectionItemInput>(
  collection: Pick<
    Collection<CollectionRecord<T>>,
    "register" | "unregister" | "textOf" | "rememberText"
  >,
  data: MaybeRefOrGetter<T>,
  el: Readonly<Ref<HTMLElement | null | undefined>>,
): void {
  const { register, unregister, textOf, rememberText } = collection;
  let registeredId: string | undefined;

  const sync = () => {
    const { textValue, disabled, ...rest } = toValue(data);
    const node = el.value ?? null;
    const text = resolveItemText(textValue, node ? node.textContent : null, textOf(rest.value));
    if (node && textValue === undefined) rememberText(rest.value, text);
    if (registeredId !== undefined && registeredId !== rest.id) unregister(registeredId);
    registeredId = rest.id;
    register({ ...rest, textValue: text, disabled: !!disabled, node } as CollectionRecord<T>);
  };

  onMounted(sync);
  onUpdated(sync);
  onBeforeUnmount(() => {
    if (registeredId !== undefined) unregister(registeredId);
  });
}
