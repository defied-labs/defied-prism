/**
 * Tailwind support for generated components: class merging that knows
 * Prism's token scales, so `text-prism-fg` is a color and `text-prism-md` a
 * font size.
 *
 *   import { tailwindSlots } from "@defied/prism-core/tailwind";
 *   const slots = tailwindSlots({ root: { base: "bg-prism-primary px-prism-4", variants: {} } });
 *   slotClass(slots, "root", {}, "bg-red-500"); // "px-prism-4 bg-red-500"
 */
import { extendTailwindMerge } from "tailwind-merge";
import { scales, themes } from "@defied/prism-tokens";

import { withClassMerge, type StyleSlots } from "./lib/slots";

// Theme keys as tailwind.css names them: `prism-primary`, `prism-4`…
const keys = (scale: Record<string, string>) => Object.keys(scale).map((key) => `prism-${key}`);

/** tailwind-merge extended with Prism's theme (see @defied/prism-tokens/tailwind.css). */
export const prismTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: keys(themes.light),
      spacing: keys(scales.space),
      radius: keys(scales.radius),
      font: keys(scales.font),
      text: keys(scales.text),
      leading: keys(scales.leading),
      "font-weight": keys(scales.weight),
      shadow: keys(scales.shadow),
      ease: keys(scales.easing),
    },
  },
});

/** Marks generated Tailwind slots so `slotClass` merges consumer classes. */
export function tailwindSlots<S extends StyleSlots>(slots: S): S {
  return withClassMerge(slots, prismTwMerge);
}
