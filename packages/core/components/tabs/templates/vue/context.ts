import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { Collection, CollectionRecord } from "@defied-prism/vue";

export type Orientation = "horizontal" | "vertical";

export type TabEntry = CollectionRecord<{ id: string; value: string; disabled?: boolean }>;

export interface TabsContextValue {
  value: Readonly<Ref<string | undefined>>;
  select: (value: string) => void;
  baseId: string;
  orientation: ComputedRef<Orientation>;
  activationMode: ComputedRef<"automatic" | "manual">;
  variants: ComputedRef<{ orientation: Orientation; variant: string; size: string }>;
  /** Registered tabs in DOM order. */
  tabs: Collection<TabEntry>;
}

export const TabsContext: InjectionKey<TabsContextValue> = Symbol("PrismTabs");

export function useTabs(part: string): TabsContextValue {
  const context = inject(TabsContext, null);
  if (!context) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return context;
}

export const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${value.replace(/\s+/g, "-")}`;
