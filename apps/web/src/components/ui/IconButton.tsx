import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only button has no visible text to name it. */
  "aria-label": string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative inline-flex items-center justify-center shrink-0 box-border p-0 [border-width:1px] border-solid [line-height:1] select-none cursor-pointer [transition:background-color_var(--prism-duration-fast)_var(--prism-easing-standard),_border-color_var(--prism-duration-fast)_var(--prism-easing-standard),_color_var(--prism-duration-fast)_var(--prism-easing-standard),_box-shadow_var(--prism-duration-fast)_var(--prism-easing-standard)] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed data-[state=loading]:[cursor:wait] [&_[data-part=icon]]:inline-flex [&_[data-part=icon]]:items-center [&_[data-part=icon]]:justify-center [&_[data-part=icon]]:[width:1.25em] [&_[data-part=icon]]:[height:1.25em] [&_[data-part=spinner]]:inline-block [&_[data-part=spinner]]:[width:1em] [&_[data-part=spinner]]:[height:1em] [&_[data-part=spinner]]:rounded-prism-full [&_[data-part=spinner]]:[border-width:2px] [&_[data-part=spinner]]:border-solid [&_[data-part=spinner]]:[border-color:currentColor_transparent_currentColor_currentColor] [&_[data-part=spinner]]:[animation:prism-spin_0.7s_linear_infinite]",
    "variants": {
      "variant": {
        "primary": "bg-prism-primary text-prism-primary-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-primary-hover enabled:not-aria-disabled:active:bg-prism-primary-active",
        "secondary": "bg-prism-secondary text-prism-secondary-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-secondary-hover enabled:not-aria-disabled:active:bg-prism-secondary-active",
        "destructive": "bg-prism-destructive text-prism-destructive-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-destructive-hover enabled:not-aria-disabled:active:bg-prism-destructive-active",
        "outline": "bg-transparent text-prism-fg border-prism-border-strong enabled:not-aria-disabled:hover:bg-prism-ghost-hover enabled:not-aria-disabled:active:bg-prism-ghost-active",
        "ghost": "bg-transparent text-inherit border-transparent enabled:not-aria-disabled:hover:bg-prism-ghost-hover enabled:not-aria-disabled:active:bg-prism-ghost-active"
      },
      "size": {
        "xs": "w-(--prism-control-xs) h-(--prism-control-xs) text-prism-sm rounded-prism-sm",
        "sm": "w-(--prism-control-sm) h-(--prism-control-sm) text-prism-sm rounded-prism-md",
        "md": "w-(--prism-control-md) h-(--prism-control-md) text-prism-md rounded-prism-md",
        "lg": "w-(--prism-control-lg) h-(--prism-control-lg) text-prism-lg rounded-prism-lg",
        "xl": "w-(--prism-control-xl) h-(--prism-control-xl) text-prism-xl rounded-prism-lg"
      }
    }
  }
});

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
