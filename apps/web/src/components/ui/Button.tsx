import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useMachine } from "@defied/prism-react";
import {
  buttonMachineDefinition,
  ButtonEvents,
} from "@defied/prism-core/components/button";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative inline-flex items-center justify-center gap-prism-2 [border-width:1px] border-solid font-prism-sans font-prism-medium leading-prism-tight whitespace-nowrap select-none cursor-pointer [transition:background-color_var(--prism-duration-fast)_var(--prism-easing-standard),_border-color_var(--prism-duration-fast)_var(--prism-easing-standard),_color_var(--prism-duration-fast)_var(--prism-easing-standard),_box-shadow_var(--prism-duration-fast)_var(--prism-easing-standard)] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed data-[state=loading]:[cursor:wait] [&_[data-part=icon]]:inline-flex [&_[data-part=icon]]:shrink-0 [&_[data-part=icon]]:[width:1em] [&_[data-part=icon]]:[height:1em] [&_[data-part=spinner]]:inline-block [&_[data-part=spinner]]:shrink-0 [&_[data-part=spinner]]:[width:1em] [&_[data-part=spinner]]:[height:1em] [&_[data-part=spinner]]:rounded-prism-full [&_[data-part=spinner]]:[border-width:2px] [&_[data-part=spinner]]:border-solid [&_[data-part=spinner]]:[border-color:currentColor_transparent_currentColor_currentColor] [&_[data-part=spinner]]:[animation:prism-spin_0.7s_linear_infinite]",
    "variants": {
      "variant": {
        "primary": "bg-prism-primary text-prism-primary-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-primary-hover enabled:not-aria-disabled:active:bg-prism-primary-active",
        "secondary": "bg-prism-secondary text-prism-secondary-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-secondary-hover enabled:not-aria-disabled:active:bg-prism-secondary-active",
        "destructive": "bg-prism-destructive text-prism-destructive-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-destructive-hover enabled:not-aria-disabled:active:bg-prism-destructive-active",
        "outline": "bg-transparent text-prism-fg border-prism-border-strong enabled:not-aria-disabled:hover:bg-prism-ghost-hover enabled:not-aria-disabled:active:bg-prism-ghost-active",
        "ghost": "bg-transparent text-prism-fg border-transparent enabled:not-aria-disabled:hover:bg-prism-ghost-hover enabled:not-aria-disabled:active:bg-prism-ghost-active",
        "link": "bg-transparent text-prism-link border-transparent underline [text-underline-offset:0.25em] enabled:not-aria-disabled:hover:text-prism-link-hover"
      },
      "size": {
        "xs": "min-h-(--prism-control-xs) px-prism-2 text-prism-xs rounded-prism-sm",
        "sm": "min-h-(--prism-control-sm) px-prism-3 text-prism-sm rounded-prism-md",
        "md": "min-h-(--prism-control-md) px-prism-4 text-prism-sm rounded-prism-md",
        "lg": "min-h-(--prism-control-lg) px-prism-5 text-prism-md rounded-prism-lg",
        "xl": "min-h-(--prism-control-xl) px-prism-6 text-prism-lg rounded-prism-lg"
      },
      "fullWidth": {
        "true": "w-full"
      }
    }
  }
});

const isPressKey = (key: string) => key === " " || key === "Enter";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      type = "button",
      className,
      children,
      onClick,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { status, send } = useMachine(buttonMachineDefinition);

    // Props own disabled/loading; mirror them into the machine after render.
    // Events that don't apply to the current state are ignored.
    useEffect(() => {
      send(disabled ? ButtonEvents.disable() : ButtonEvents.enable());
      send(loading ? ButtonEvents.startLoading() : ButtonEvents.stopLoading());
    }, [disabled, loading, send]);

    const variants = { variant, size, fullWidth };
    const inert = disabled || loading;
    const state = disabled ? "disabled" : loading ? "loading" : status;

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        // Loading stays focusable (aria-disabled) so focus isn't lost mid-action
        disabled={disabled}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        data-state={state}
        // A component composing this one (e.g. a dialog trigger) may name the slot
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "button"}
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (inert) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
          if (!inert && event.button === 0) {
            // Capture so the release is seen even if the pointer leaves the button
            event.currentTarget.setPointerCapture?.(event.pointerId);
            send(ButtonEvents.press());
          }
          onPointerDown?.(event);
        }}
        onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
          send(ButtonEvents.release());
          onPointerUp?.(event);
        }}
        onPointerCancel={(event: PointerEvent<HTMLButtonElement>) => {
          send(ButtonEvents.release());
          onPointerCancel?.(event);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (!inert && !event.repeat && isPressKey(event.key)) {
            send(ButtonEvents.press());
          }
          onKeyDown?.(event);
        }}
        onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (isPressKey(event.key)) send(ButtonEvents.release());
          onKeyUp?.(event);
        }}
        onFocus={(event) => {
          send(ButtonEvents.focus());
          onFocus?.(event);
        }}
        onBlur={(event) => {
          send(ButtonEvents.blur());
          onBlur?.(event);
        }}
      >
        {loading && <span data-part="spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

/** Decorative icon slot: `<Button><ButtonIcon><PlusIcon /></ButtonIcon>New</Button>` */
export function ButtonIcon({ children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} data-part="icon" aria-hidden="true">
      {children}
    </span>
  );
}
