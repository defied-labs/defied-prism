import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export type BoxElement =
  | "div"
  | "span"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav";

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: BoxElement;
  padding?: "none" | "sm" | "md" | "lg";
  background?: "none" | "subtle" | "muted";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "box-border [min-width:0]",
    "variants": {
      "padding": {
        "none": "p-0",
        "sm": "p-prism-2",
        "md": "p-prism-4",
        "lg": "p-prism-6"
      },
      "background": {
        "none": "bg-transparent",
        "subtle": "bg-prism-bg-subtle text-prism-fg",
        "muted": "bg-prism-muted text-prism-fg"
      }
    }
  }
});

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ as = "div", padding = "none", background = "none", className, ...props }, ref) => {
    const Tag = as as ElementType;
    const variants = { padding, background };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="box"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Box.displayName = "Box";
