import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
