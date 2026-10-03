import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: "div" | "section" | "main" | "header" | "footer";
  /** Max width: sm 40rem, md 48rem, lg 64rem, xl 80rem, full none. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "box-border w-full [margin-inline:auto] px-prism-4",
    "variants": {
      "size": {
        "sm": "[max-width:40rem]",
        "md": "[max-width:48rem]",
        "lg": "[max-width:64rem]",
        "xl": "[max-width:80rem]",
        "full": "[max-width:none]"
      }
    }
  }
});

/** Centered, max-width page column with inline padding. */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ as = "div", size = "lg", className, ...props }, ref) => {
    const Tag = as as ElementType;
    const variants = { size };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="container"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Container.displayName = "Container";
