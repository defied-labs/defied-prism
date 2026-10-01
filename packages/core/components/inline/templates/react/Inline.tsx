import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export type InlineElement = "div" | "span" | "section" | "header" | "footer" | "nav" | "ul" | "ol";

export interface InlineProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: InlineElement;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  /** Wrap items onto new lines (default) or keep them on one line. */
  wrap?: "wrap" | "nowrap";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

/** Horizontal flex layout that wraps. */
export const Inline = forwardRef<HTMLElement, InlineProps>(
  (
    { as = "div", gap = "sm", align = "center", justify = "start", wrap = "wrap", className, ...props },
    ref,
  ) => {
    const Tag = as as ElementType;
    const variants = { gap, align, justify, wrap };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="inline"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Inline.displayName = "Inline";
