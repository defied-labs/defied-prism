import { forwardRef, type HTMLAttributes, type ReactElement } from "react";
import { Slot } from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /**
   * Reveal while focused. Combine with `asChild` so the focusable element
   * itself is hidden: `<VisuallyHidden focusable asChild><a href="#main">Skip to content</a></VisuallyHidden>`.
   */
  focusable?: boolean;
  /** Merge onto the single child element instead of rendering a span. */
  asChild?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap [border-width:0]",
    "variants": {
      "focusable": {
        "true": "focus:[position:static] focus:[width:auto] focus:[height:auto] focus:m-0 focus:[overflow:visible] focus:[clip-path:none] focus:[white-space:normal]"
      }
    }
  }
});

/** Content for screen readers only. */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ focusable = false, asChild = false, className, children, ...props }, ref) => {
    const variants = { focusable };
    const own = {
      "data-slot": "visually-hidden",
      ...variantData(variants),
      className: slotClass(slots, "root", variants, className),
    };
    if (asChild) {
      return (
        <Slot {...props} {...own} ref={ref}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <span {...props} {...own} ref={ref}>
        {children}
      </span>
    );
  },
);

VisuallyHidden.displayName = "VisuallyHidden";
