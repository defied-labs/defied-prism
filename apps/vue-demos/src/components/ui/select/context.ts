import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { Collection, CollectionRecord } from "@defied-labs/prism-vue";
import type { SelectItemRecord } from "@defied-labs/prism-core/components/select";

export type Size = "sm" | "md" | "lg";

export type ItemEntry = CollectionRecord<{
  id: string;
  value: string;
  textValue?: string;
  disabled?: boolean;
}> &
  SelectItemRecord;

export interface Labelling {
  label?: string;
  labelledBy?: string;
}

export interface SelectContextValue {
  value: Readonly<Ref<string | null>>;
  open: Readonly<Ref<boolean>>;
  highlighted: Readonly<Ref<string | null>>;
  /** Registered items in DOM order. */
  items: Readonly<Ref<ItemEntry[]>>;
  selected: ComputedRef<ItemEntry | undefined>;
  disabled: ComputedRef<boolean | undefined>;
  required: ComputedRef<boolean | undefined>;
  placeholder: ComputedRef<string>;
  variants: ComputedRef<{ size: Size }>;
  listboxId: string;
  rootRef: Readonly<Ref<HTMLElement | null>>;
  labelling: Readonly<Ref<Labelling>>;
  setLabelling: (labelling: Labelling) => void;
  setValue: (value: string) => void;
  setHighlighted: (value: string | null) => void;
  openAt: (value: string | null) => void;
  close: () => void;
  collection: Collection<ItemEntry>;
}

export const SelectContext: InjectionKey<SelectContextValue> = Symbol("PrismSelect");

export function useSelectContext(part: string): SelectContextValue {
  const context = inject(SelectContext, null);
  if (!context) throw new Error(`<${part}> must be used within <Select>`);
  return context;
}

export interface GroupContextValue {
  labelId: string;
  setHasLabel: (has: boolean) => void;
}

export const GroupContext: InjectionKey<GroupContextValue> = Symbol("PrismSelectGroup");

type Handler = (event: Event) => void;

/** Calls a listener that fell through as an attr (`onClick`, `onKeyDown`, …). */
export function callListener(attrs: Record<string, unknown>, event: string, payload: Event): void {
  const wanted = `on${event}`.toLowerCase();
  for (const [key, listener] of Object.entries(attrs)) {
    if (key.toLowerCase() !== wanted) continue;
    for (const fn of ([] as unknown[]).concat(listener)) {
      if (typeof fn === "function") (fn as Handler)(payload);
    }
  }
}

/** Attrs without the listeners a part handles itself. */
export function withoutListeners(
  attrs: Record<string, unknown>,
  events: string[],
): Record<string, unknown> {
  const skip = new Set(events.map((event) => `on${event}`.toLowerCase()));
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !skip.has(key.toLowerCase())));
}
