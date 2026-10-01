import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export type StackElement = "div" | "section" | "article" | "aside" | "header" | "footer" | "nav" | "ul" | "ol";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: StackElement;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
