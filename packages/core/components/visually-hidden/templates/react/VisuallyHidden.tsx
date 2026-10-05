import { forwardRef, type HTMLAttributes, type ReactElement } from "react";
import { Slot } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

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
