import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";

export type Variants = { orientation: "horizontal" | "vertical"; size: "sm" | "md" };

export interface RadioGroupContextValue {
  name: ComputedRef<string>;
  value: Readonly<Ref<string | null>>;
  setValue: (value: string) => void;
  /** Bumped after every change, so radios resync their native checked state. */
  revision: Readonly<Ref<number>>;
  disabled: () => boolean;
  required: () => boolean;
  invalid: () => boolean;
  variants: ComputedRef<Variants>;
}

export const RadioGroupContext: InjectionKey<RadioGroupContextValue> = Symbol("PrismRadioGroup");

export function useRadioGroup(component: string): RadioGroupContextValue {
  const context = inject(RadioGroupContext, null);
  if (!context) throw new Error(`<${component}> must be used inside <RadioGroup>.`);
  return context;
}
