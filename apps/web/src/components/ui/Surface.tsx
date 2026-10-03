import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: "div" | "section" | "article" | "aside";
  variant?: "flat" | "raised" | "outlined" | "sunken";
  padding?: "none" | "sm" | "md" | "lg";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "box-border [border-width:1px] border-solid rounded-prism-lg text-prism-fg",
    "variants": {
      "variant": {
        "flat": "bg-prism-bg border-transparent [box-shadow:none]",
        "raised": "bg-prism-bg border-prism-border shadow-prism-md",
        "outlined": "bg-prism-bg border-prism-border [box-shadow:none]",
        "sunken": "bg-prism-bg-subtle border-prism-border [box-shadow:inset_0_1px_2px_0_rgb(0_0_0_/_0.05)]"
      },
      "padding": {
        "none": "p-0",
        "sm": "p-prism-3",
        "md": "p-prism-4",
        "lg": "p-prism-6"
      }
    }
  }
});

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
