import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

export type StackElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "nav" | "ul" | "ol";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: StackElement;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex flex-col [min-width:0]",
    "variants": {
      "gap": {
        "none": "[gap:0]",
        "xs": "gap-prism-1",
        "sm": "gap-prism-2",
        "md": "gap-prism-4",
        "lg": "gap-prism-6",
        "xl": "gap-prism-8"
      },
      "align": {
        "start": "items-start",
        "center": "items-center",
        "end": "items-end",
        "stretch": "items-stretch"
      },
      "justify": {
        "start": "justify-start",
        "center": "justify-center",
        "end": "justify-end",
        "between": "justify-between"
      }
    }
  }
});

/** Vertical flex layout. */
export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ as = "div", gap = "md", align = "stretch", justify = "start", className, ...props }, ref) => {
    const Tag = as as ElementType;
    const variants = { gap, align, justify };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="stack"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Stack.displayName = "Stack";
