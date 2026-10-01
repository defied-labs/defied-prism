import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useMachine } from "@defied-prism/react";
import {
  buttonMachineDefinition,
  ButtonEvents,
} from "@defied-prism/core/components/button";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Shows a spinner and ignores activation while staying focusable. */
  loading?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
