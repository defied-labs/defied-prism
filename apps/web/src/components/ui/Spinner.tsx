import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "inline-flex items-center justify-center",
    "variants": {}
  },
  "indicator": {
    "base": "inline-block shrink-0 rounded-prism-full [border-width:2px] border-solid [border-color:currentColor_transparent_currentColor_currentColor] [animation:prism-spin_0.7s_linear_infinite]",
    "variants": {
      "size": {
        "xs": "[width:0.75rem] [height:0.75rem]",
        "sm": "[width:1rem] [height:1rem]",
        "md": "[width:1.5rem] [height:1.5rem]",
        "lg": "[width:2rem] [height:2rem]"
      }
    }
  },
  "label": {
    "base": "absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border-width:0]",
    "variants": {}
  }
});

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg";
  /** Announced text (visually hidden). */
  label?: string;
}

/**
 * A polite status region: the visually hidden label is announced when the
 * spinner appears. Its color follows `currentColor`.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = "md", label = "Loading", className, ...props }, ref) => {
    const variants = { size };
    return (
      <span
        role="status"
        {...props}
        ref={ref}
        data-slot="spinner"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      >
        <span
          aria-hidden="true"
          data-slot="spinner-indicator"
          {...variantData(variants)}
          className={slotClass(slots, "indicator", variants)}
        />
        <span
          data-slot="spinner-label"
          {...variantData(variants)}
          className={slotClass(slots, "label", variants)}
        >
          {label}
        </span>
      </span>
    );
  },
);
Spinner.displayName = "Spinner";
