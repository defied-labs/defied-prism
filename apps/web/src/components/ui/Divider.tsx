import { forwardRef, type HTMLAttributes, type Ref } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Purely visual: hidden from assistive technology. */
  decorative?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "shrink-0 m-0 [border-width:0] bg-prism-border",
    "variants": {
      "orientation": {
        "horizontal": "w-full [height:1px] [align-self:auto]",
        "vertical": "[width:1px] [height:auto] [align-self:stretch]"
      }
    }
  }
});

/**
 * Horizontal: an `<hr>` (implicit separator). Vertical: a `div` with
 * role="separator" and aria-orientation="vertical". Decorative dividers
 * carry no semantics.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(
  ({ orientation = "horizontal", decorative = false, className, ...props }, ref) => {
    const variants = { orientation };
    const common = {
      "data-slot": "divider",
      ...variantData(variants),
      className: slotClass(slots, "root", variants, className),
    };

    if (orientation === "vertical") {
      return (
        <div
          {...props}
          ref={ref as Ref<HTMLDivElement>}
          {...(decorative
            ? { role: "none", "aria-hidden": true }
            : { role: "separator", "aria-orientation": "vertical" as const })}
          {...common}
        />
      );
    }
    return (
      <hr
        {...props}
        ref={ref as Ref<HTMLHRElement>}
        {...(decorative ? { role: "none", "aria-hidden": true } : {})}
        {...common}
      />
    );
  },
);

Divider.displayName = "Divider";
