import { inject, normalizeClass, useAttrs, type InjectionKey } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type EmptyStateVariants = { size: "sm" | "md" };

export interface EmptyStateContext {
  variants: () => EmptyStateVariants;
  headingLevel: () => HeadingLevel;
}

export const EmptyStateKey: InjectionKey<EmptyStateContext> = Symbol("EmptyState");

const fallback: EmptyStateContext = { variants: () => ({ size: "md" }), headingLevel: () => 3 };

/** Attrs for an EmptyState part, read in the render so changes re-render it. */
export function usePartAttrs(slot: "icon" | "title" | "description" | "actions") {
  const context = inject(EmptyStateKey, fallback);
  const attrs = useAttrs();
  return {
    context,
    partAttrs: () => {
      const { class: className, ...rest } = attrs;
      const variants = context.variants();
      return {
        ...rest,
        "data-slot": `empty-state-${slot}`,
        ...variantData(variants),
        class: slotClass(slots, slot, variants, normalizeClass(className)),
      };
    },
  };
}
