import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { Collection, CollectionRecord } from "@defied-labs/prism-vue";
import type { ComboboxEvent } from "@defied-labs/prism-core/components/combobox";

export type Size = "sm" | "md" | "lg";

/** What a filter sees of each item. */
export interface ComboboxItemData {
  value: string;
  textValue: string;
  disabled: boolean;
}

/** Decides whether an item matches the typed query. */
export type ComboboxFilter = (item: ComboboxItemData, query: string) => boolean;

export type ItemEntry = CollectionRecord<{
  id: string;
  value: string;
  textValue?: string;
  disabled?: boolean;
  groupId: string | null;
}> &
  ComboboxItemData;

export interface Labelling {
  label?: string;
  labelledBy?: string;
}

export interface ComboboxContextValue {
  open: ComputedRef<boolean>;
  inputValue: ComputedRef<string>;
  highlighted: ComputedRef<string | null>;
  selected: ComputedRef<string | null>;
  /** Registered items that pass the filter, in DOM order. */
  visible: ComputedRef<ItemEntry[]>;
  visibleValues: ComputedRef<Set<string>>;
  visibleGroups: ComputedRef<Set<string>>;
  showList: ComputedRef<boolean>;
  disabled: ComputedRef<boolean | undefined>;
  required: ComputedRef<boolean | undefined>;
  variants: ComputedRef<{ size: Size }>;
  listboxId: string;
  rootRef: Readonly<Ref<HTMLElement | null>>;
  labelling: Readonly<Ref<Labelling>>;
  setLabelling: (labelling: Labelling) => void;
  send: (event: ComboboxEvent) => void;
  type: (value: string) => void;
  choose: (item: ItemEntry | undefined) => void;
  collection: Collection<ItemEntry>;
}

export const ComboboxContext: InjectionKey<ComboboxContextValue> = Symbol("PrismCombobox");

export function useComboboxContext(part: string): ComboboxContextValue {
  const context = inject(ComboboxContext, null);
  if (!context) throw new Error(`<${part}> must be used within <Combobox>`);
  return context;
}

export interface GroupContextValue {
  id: string;
  labelId: string;
  setHasLabel: (has: boolean) => void;
}

export const GroupContext: InjectionKey<GroupContextValue> = Symbol("PrismComboboxGroup");
