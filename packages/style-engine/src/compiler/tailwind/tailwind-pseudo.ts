import { isPseudoClass, isPseudoElement } from "../../parser/StyleParser";

/**
 * Tailwind pseudo-class/element prefix mapping
 * https://tailwindcss.com/docs/hover-focus-and-other-states
 */
export const TAILWIND_PSEUDO_PREFIX: Record<string, string> = {
  "::before": "before:",
  "::after": "after:",
  ":hover": "hover:",
  ":focus": "focus:",
  ":focus-visible": "focus-visible:",
  ":focus-within": "focus-within:",
  ":active": "active:",
  ":disabled": "disabled:",
  ":placeholder": "placeholder:",
  ":placeholder-shown": "placeholder-shown:",
  ":first-child": "first-child:",
  ":last-child": "last-child:",
  ":odd": "odd:",
  ":even": "even:",
};

/**
 * Get Tailwind prefix for a pseudo-class/element name
 */
export function tailwindPrefixFor(name: string): string | undefined {
  if (isPseudoClass(name) || isPseudoElement(name)) {
    return TAILWIND_PSEUDO_PREFIX[name];
  }
  return undefined;
}
