import { forwardRef, type AnchorHTMLAttributes, type ReactElement } from "react";
import { Slot } from "@defied/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: "primary" | "neutral" | "muted";
  underline?: "always" | "hover" | "none";
  /** Open in a new tab (rel="noopener noreferrer") and announce it. */
  external?: boolean;
  /** Text announced for external links. */
  externalLabel?: string;
  /** Merge onto the single child, e.g. a router `<Link>`. */
  asChild?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "rounded-prism-sm [text-underline-offset:0.2em] cursor-pointer [transition:color_var(--prism-duration-fast)_var(--prism-easing-standard)] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] [&_[data-part=external-hint]]:absolute [&_[data-part=external-hint]]:[width:1px] [&_[data-part=external-hint]]:[height:1px] [&_[data-part=external-hint]]:p-0 [&_[data-part=external-hint]]:[margin:-1px] [&_[data-part=external-hint]]:overflow-hidden [&_[data-part=external-hint]]:[clip-path:inset(50%)] [&_[data-part=external-hint]]:whitespace-nowrap [&_[data-part=external-hint]]:[border-width:0]",
    "variants": {
      "tone": {
        "primary": "text-prism-link not-aria-disabled:hover:text-prism-link-hover",
        "neutral": "text-prism-fg",
        "muted": "text-prism-muted-fg"
      },
      "underline": {
        "always": "underline",
        "hover": "no-underline not-aria-disabled:hover:underline focus-visible:underline",
        "none": "no-underline"
      }
    }
  }
});

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      tone = "primary",
      underline = "always",
      external = false,
      externalLabel = "(opens in a new tab)",
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = { tone, underline };
    const own = {
      ...(external
        ? {
            target: props.target ?? "_blank",
            rel: [...new Set([...(props.rel?.split(/\s+/) ?? []), "noopener", "noreferrer"])]
              .filter(Boolean)
              .join(" "),
          }
        : {}),
      "data-slot": "link",
      ...variantData(variants),
      className: slotClass(slots, "root", variants, className),
    };
    const hint = external && (
      <span data-part="external-hint">{externalLabel}</span>
    );

    if (asChild) {
      return (
        <Slot {...props} {...own} ref={ref}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <a {...props} {...own} ref={ref}>
        {children}
        {hint && " "}
        {hint}
      </a>
    );
  },
);

Link.displayName = "Link";
