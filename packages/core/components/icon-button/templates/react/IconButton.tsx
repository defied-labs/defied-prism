import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only button has no visible text to name it. */
  "aria-label": string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "ghost",
      size = "md",
      loading = false,
      disabled = false,
      type = "button",
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const variants = { variant, size };
    const inert = disabled || loading;

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        // Loading stays focusable (aria-disabled) so focus isn't lost mid-action
        disabled={disabled}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        data-state={disabled ? "disabled" : loading ? "loading" : "idle"}
        // A component composing this one (e.g. a dialog trigger) may name the slot
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "icon-button"}
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (inert) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {loading ? (
          <span data-part="spinner" aria-hidden="true" />
        ) : (
          <span data-part="icon" aria-hidden="true">
            {children}
          </span>
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
