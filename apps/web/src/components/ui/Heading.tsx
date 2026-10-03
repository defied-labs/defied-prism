import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "xl" | "lg" | "md" | "sm" | "xs";

/** Size used when `size` is omitted. */
export const DEFAULT_HEADING_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "xl",
  2: "lg",
  3: "md",
  4: "sm",
  5: "xs",
  6: "xs",
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Document outline level: renders h1-h6. */
  level?: HeadingLevel;
  /** Visual size, independent of level. Defaults from the level. */
  size?: HeadingSize;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "m-0 font-prism-sans text-prism-fg [text-wrap:balance]",
    "variants": {
      "size": {
        "display": "text-prism-display leading-prism-tight font-prism-bold [letter-spacing:-0.025em]",
        "xl": "text-prism-3xl leading-prism-tight font-prism-bold [letter-spacing:-0.02em]",
        "lg": "text-prism-2xl leading-prism-tight font-prism-semibold [letter-spacing:-0.015em]",
        "md": "text-prism-xl leading-prism-snug font-prism-semibold [letter-spacing:-0.01em]",
        "sm": "text-prism-lg leading-prism-snug font-prism-semibold [letter-spacing:0]",
        "xs": "text-prism-md leading-prism-snug font-prism-semibold [letter-spacing:0]"
      }
    }
  }
});

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size, className, ...props }, ref) => {
    const Tag = `h${level}` as "h2";
    const variants = { size: size ?? DEFAULT_HEADING_SIZE[level] };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="heading"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Heading.displayName = "Heading";
