import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: "neutral" | "info" | "success" | "warning" | "danger";
  variant?: "subtle" | "solid" | "outline";
  size?: "sm" | "md";
}

/**
 * A small, non-interactive label. Color alone doesn't carry meaning: make
 * the text say the status ("Failed", not just a red dot).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status = "neutral", variant = "subtle", size = "md", className, ...props }, ref) => {
    const variants = { status, variant, size };
    return (
      <span
        {...props}
        ref={ref}
        data-slot="badge"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);
Badge.displayName = "Badge";

/** Decorative icon: `<Badge><BadgeIcon><CheckIcon /></BadgeIcon>Paid</Badge>` */
export function BadgeIcon({ children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} data-part="icon" aria-hidden="true">
      {children}
    </span>
  );
}
