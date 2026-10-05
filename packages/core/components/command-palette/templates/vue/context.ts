import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { Collection, CollectionRecord } from "@defied-labs/prism-vue";

export type Size = "sm" | "md" | "lg";

export type ItemRecord = CollectionRecord<{
  /** DOM id of the option element. */
  id: string;
  value: string;
  textValue?: string;
  keywords?: readonly string[];
  disabled?: boolean;
  group?: string;
  /** Runs the item's own `select` handler. */
  run: () => void;
}>;

export interface CommandPaletteContext {
  variants: ComputedRef<{ size: Size }>;
  label: ComputedRef<string>;
  listboxId: string;
  query: Ref<string>;
  hasResults: ComputedRef<boolean>;
  /** The highlighted item's id, while it is visible. */
  highlightedId: ComputedRef<string | null>;
  setHighlighted: (id: string) => void;
  isItemVisible: (id: string) => boolean;
  isGroupVisible: (group: string) => boolean;
  collection: Collection<ItemRecord>;
  choose: (id: string) => void;
  onInputKeyDown: (event: KeyboardEvent) => void;
  inputRef: Ref<HTMLInputElement | null>;
}

export const CommandPaletteKey: InjectionKey<CommandPaletteContext> = Symbol("PrismCommandPalette");
export const CommandGroupKey: InjectionKey<string> = Symbol("PrismCommandGroup");

export function usePalette(part: string): CommandPaletteContext {
  const context = inject(CommandPaletteKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <CommandPalette>`);
  return context;
}

type Handler = (event: Event) => void;

/** Calls a listener that fell through as an attr (`onClick`, `onKeydown`, …). */
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
export function withoutListeners(attrs: Record<string, unknown>, events: string[]): Record<string, unknown> {
  const skip = new Set(events.map((event) => `on${event}`.toLowerCase()));
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !skip.has(key.toLowerCase())));
}
