import { forwardRef, type AnchorHTMLAttributes, type ReactElement } from "react";
import { Slot } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

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
