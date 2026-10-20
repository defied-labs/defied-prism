import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: "div" | "section" | "article" | "aside";
  variant?: "flat" | "raised" | "outlined" | "sunken";
  padding?: "none" | "sm" | "md" | "lg";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

/** A themed panel: background, border, radius and elevation. */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(
  ({ as = "div", variant = "outlined", padding = "md", className, ...props }, ref) => {
    const Tag = as as ElementType;
    const variants = { variant, padding };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="surface"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Surface.displayName = "Surface";
