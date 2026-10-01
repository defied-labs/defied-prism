/**
 * Runtime side of recipes, shared by every framework adapter.
 *
 * Generated components receive a `StyleSlots` object (Tailwind lookups, or
 * one class per slot for CSS Modules / vanilla CSS) and use these helpers to
 * build each slot's className and variant `data-*` attributes.
 */

export interface SlotStyles {
  base: string;
  variants: Record<string, Record<string, string>>;
}

export type StyleSlots = Record<string, SlotStyles>;

export type VariantValues = Record<string, string | boolean | null | undefined>;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Class mergers registered for a slots object (Tailwind: tailwind-merge). */
const mergers = new WeakMap<StyleSlots, (classes: string) => string>();

/**
 * Makes `slotClass` resolve conflicts for these slots with `merge`, so a
 * consumer's className (e.g. `bg-red-500`) beats the component's own class
 * for the same property instead of depending on stylesheet order.
 */
export function withClassMerge<S extends StyleSlots>(slots: S, merge: (classes: string) => string): S {
  mergers.set(slots, merge);
  return slots;
}

/** Class name for a slot: base + the classes of each active variant + extra. */
export function slotClass(
  slots: StyleSlots,
  slot: string,
  variants: VariantValues = {},
  ...extra: (string | false | null | undefined)[]
): string {
  const styles = slots[slot];
  const classes: (string | false | null | undefined)[] = [styles?.base];
  if (styles) {
    for (const [dimension, value] of Object.entries(variants)) {
      if (value === false || value == null) continue;
      classes.push(styles.variants[dimension]?.[String(value)]);
    }
  }
  const joined = [...classes, ...extra].filter(Boolean).join(" ");
  const merge = mergers.get(slots);
  return merge ? merge(joined) : joined;
}

/**
 * `data-*` attributes that CSS targets select variants on.
 * `{ size: "md", fullWidth: true }` -> `{ "data-size": "md", "data-full-width": "true" }`
 */
export function variantData(variants: VariantValues): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [dimension, value] of Object.entries(variants)) {
    if (value === false || value == null) continue;
    out[`data-${kebab(dimension)}`] = String(value);
  }
  return out;
}
