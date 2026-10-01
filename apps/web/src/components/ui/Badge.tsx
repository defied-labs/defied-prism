import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "inline-flex items-center gap-prism-1 [border-width:1px] border-solid rounded-prism-full font-prism-sans font-prism-medium leading-prism-tight whitespace-nowrap align-middle [&_[data-part=icon]]:inline-flex [&_[data-part=icon]]:shrink-0 [&_[data-part=icon]]:[width:1em] [&_[data-part=icon]]:[height:1em]",
    "variants": {
      "status": {
        "neutral": "[--badge-bg:var(--prism-color-neutral-bg)] [--badge-fg:var(--prism-color-neutral-fg)] [--badge-border:var(--prism-color-neutral-border)] [--badge-solid:var(--prism-color-neutral-solid)]",
        "info": "[--badge-bg:var(--prism-color-info-bg)] [--badge-fg:var(--prism-color-info-fg)] [--badge-border:var(--prism-color-info-border)] [--badge-solid:var(--prism-color-info-solid)]",
        "success": "[--badge-bg:var(--prism-color-success-bg)] [--badge-fg:var(--prism-color-success-fg)] [--badge-border:var(--prism-color-success-border)] [--badge-solid:var(--prism-color-success-solid)]",
        "warning": "[--badge-bg:var(--prism-color-warning-bg)] [--badge-fg:var(--prism-color-warning-fg)] [--badge-border:var(--prism-color-warning-border)] [--badge-solid:var(--prism-color-warning-solid)]",
        "danger": "[--badge-bg:var(--prism-color-danger-bg)] [--badge-fg:var(--prism-color-danger-fg)] [--badge-border:var(--prism-color-danger-border)] [--badge-solid:var(--prism-color-danger-solid)]"
      },
      "variant": {
        "subtle": "[background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-border)]",
        "solid": "[background:var(--badge-solid)] text-prism-solid-fg border-transparent",
        "outline": "bg-transparent [color:var(--badge-fg)] [border-color:var(--badge-border)]"
      },
      "size": {
        "sm": "text-prism-xs px-prism-1-5 [min-height:1.25rem]",
        "md": "text-prism-sm px-prism-2 [min-height:1.5rem]"
      }
    }
  }
});

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
