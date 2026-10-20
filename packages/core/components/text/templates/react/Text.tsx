import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

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
