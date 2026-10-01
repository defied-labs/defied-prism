/**
 * Recipes: the CSS-target-agnostic style contract of a component.
 *
 * A recipe is plain JSON. Values are literal CSS, optionally containing
 * token references such as "{color.primary}". Every compiler (CSS Modules,
 * vanilla CSS, Tailwind) emits the *same* declarations — only the delivery
 * mechanism differs.
 *
 * A component is made of slots: `base` styles the root slot, `slots` the
 * others (e.g. a dialog's overlay and content). Each slot element gets its
 * own class and carries the component's variant `data-*` attributes.
 *
 * Declaration keys:
 *   - `background`, `paddingInline`, …  CSS properties (camelCase)
 *   - `_hover`, `_focusVisible`, …       interaction/state selectors
 *   - `part:icon`                        a `[data-part="icon"]` descendant
 *   - `slot:content`                     (variant blocks only) another slot
 */

export const RECIPE_STATES = {
  _hover: {
    css: ':hover:enabled:not([aria-disabled="true"])',
    tailwind: "enabled:not-aria-disabled:hover:",
  },
  _active: {
    css: ':active:enabled:not([aria-disabled="true"])',
    tailwind: "enabled:not-aria-disabled:active:",
  },
  _focus: { css: ":focus", tailwind: "focus:" },
  _focusVisible: { css: ":focus-visible", tailwind: "focus-visible:" },
  _disabled: { css: ":disabled", tailwind: "disabled:" },
  _ariaDisabled: { css: '[aria-disabled="true"]', tailwind: "aria-disabled:" },
  _loading: {
    css: '[data-state="loading"]',
    tailwind: "data-[state=loading]:",
  },
  _open: { css: '[data-state="open"]', tailwind: "data-[state=open]:" },
  _closed: { css: '[data-state="closed"]', tailwind: "data-[state=closed]:" },
  /** Hover on any element (links, rows); `_hover` only matches enabled form controls. */
  _hoverAny: {
    css: ':hover:not([aria-disabled="true"])',
    tailwind: "not-aria-disabled:hover:",
  },
  /** Native `:checked` or `aria-checked="true"` (switches, menu items). */
  _checked: {
    css: ':is(:checked,[aria-checked="true"])',
    tailwind: "[&:is(:checked,[aria-checked=true])]:",
  },
  _indeterminate: {
    css: ':is(:indeterminate,[aria-checked="mixed"])',
    tailwind: "[&:is(:indeterminate,[aria-checked=mixed])]:",
  },
  /** A trigger whose popup is open (`aria-expanded="true"`). */
  _expanded: { css: '[aria-expanded="true"]', tailwind: "aria-expanded:" },
  /** Focus anywhere inside (block-link cards, composite rows). */
  _focusWithin: { css: ":focus-within", tailwind: "focus-within:" },
  /** Current item in a set: page, step, date (`aria-current` other than "false"). */
  _current: {
    css: ':is([aria-current]:not([aria-current="false"]))',
    tailwind: "[&:is([aria-current]:not([aria-current=false]))]:",
  },
  /** Every other sibling (table stripes). */
  _even: { css: ":nth-child(even)", tailwind: "even:" },
  _selected: { css: '[aria-selected="true"]', tailwind: "aria-selected:" },
  _highlighted: { css: "[data-highlighted]", tailwind: "data-highlighted:" },
  _invalid: { css: '[aria-invalid="true"]', tailwind: "aria-invalid:" },
  _horizontal: {
    css: '[data-orientation="horizontal"]',
    tailwind: "data-[orientation=horizontal]:",
  },
  _vertical: {
    css: '[data-orientation="vertical"]',
    tailwind: "data-[orientation=vertical]:",
  },
  _placeholder: { css: "::placeholder", tailwind: "placeholder:" },
} as const;

export type RecipeState = keyof typeof RECIPE_STATES;

export type Declarations = {
  [key: string]: string | Declarations;
};

export interface Recipe {
  /** Component name (kebab-case); the vanilla CSS class is `prism-<name>`. */
  name: string;
  /** Root slot. */
  base: Declarations;
  /** Other slots, keyed by camelCase name. */
  slots?: Record<string, Declarations>;
  /** dimension -> value -> declarations, e.g. variant.primary, size.sm */
  variants?: Record<string, Record<string, Declarations>>;
  defaultVariants?: Record<string, string>;
}

/** Class names for one slot in the Tailwind target. */
export interface SlotClasses {
  base: string;
  variants: Record<string, Record<string, string>>;
}
