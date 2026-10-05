import { inject, normalizeClass, type InjectionKey } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";

export type AlertVariants = { status: "neutral" | "info" | "success" | "warning" | "danger" };

export const AlertKey: InjectionKey<() => AlertVariants> = Symbol("Alert");

/** The enclosing alert's variants (neutral outside an Alert). */
export function useAlertVariants(): () => AlertVariants {
  return inject(AlertKey, () => ({ status: "neutral" }));
}

/** Attributes of an alert part: defaults, consumer attrs, then data-slot, variant data and class. */
export function partAttrs(
  attrs: Record<string, unknown>,
  slot: string,
  variants: AlertVariants,
  defaults: Record<string, unknown> = {},
) {
  const { class: className, ...rest } = attrs;
  return {
    ...defaults,
    ...rest,
    "data-slot": `alert-${slot}`,
    ...variantData(variants),
    class: slotClass(slots, slot, variants, normalizeClass(className)),
  };
}
