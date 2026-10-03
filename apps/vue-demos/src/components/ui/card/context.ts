import { inject, normalizeClass, type InjectionKey } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";

export type CardVariants = { variant: "flat" | "raised" | "outlined"; interactive?: boolean };

export const CardKey: InjectionKey<() => CardVariants> = Symbol("Card");

/** The enclosing card's variants (outlined outside a Card). */
export function useCardVariants(): () => CardVariants {
  return inject(CardKey, () => ({ variant: "outlined" }));
}

/** Attributes of a card part: consumer attrs, then data-slot, variant data and class. */
export function partAttrs(attrs: Record<string, unknown>, slot: string, variants: CardVariants) {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": `card-${slot}`,
    ...variantData(variants),
    class: slotClass(slots, slot, variants, normalizeClass(className)),
  };
}
