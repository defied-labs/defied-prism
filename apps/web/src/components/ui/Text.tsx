import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: "p" | "span" | "div";
  size?: "lg" | "md" | "sm" | "xs";
  tone?: "body" | "lead" | "muted" | "success" | "warning" | "danger";
  weight?: "regular" | "medium" | "semibold" | "bold";
  /** Single line, cut off with an ellipsis. */
  truncate?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "m-0 font-prism-sans",
    "variants": {
      "size": {
        "lg": "text-prism-lg",
        "md": "text-prism-md",
        "sm": "text-prism-sm",
        "xs": "text-prism-xs"
      },
      "tone": {
        "body": "text-prism-fg leading-prism-normal",
        "lead": "text-prism-muted-fg [line-height:1.625]",
        "muted": "text-prism-muted-fg leading-prism-normal",
        "success": "text-prism-success-fg leading-prism-normal",
        "warning": "text-prism-warning-fg leading-prism-normal",
        "danger": "text-prism-danger-fg leading-prism-normal"
      },
      "weight": {
        "regular": "font-prism-regular",
        "medium": "font-prism-medium",
        "semibold": "font-prism-semibold",
        "bold": "font-prism-bold"
      },
      "truncate": {
        "true": "overflow-hidden [text-overflow:ellipsis] whitespace-nowrap"
      }
    }
  }
});

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    { as = "p", size = "md", tone = "body", weight = "regular", truncate = false, className, ...props },
    ref,
  ) => {
    const Tag = as as ElementType;
    const variants = { size, tone, weight, truncate };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="text"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Text.displayName = "Text";
