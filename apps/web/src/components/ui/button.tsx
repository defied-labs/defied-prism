import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useMachine } from "@defied-prism/react";
import {
  buttonMachineDefinition,
  ButtonEvents,
} from "@defied-prism/core/components/button";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      onClick,
      ...props
    },
    ref,
  ) => {
    const machine = useMachine(buttonMachineDefinition);

    // Sync loading prop to machine
    if (loading && machine.status !== "loading") {
      machine.send(ButtonEvents.startLoading());
    } else if (!loading && machine.status === "loading") {
      machine.send(ButtonEvents.stopLoading());
    }

    // Sync disabled prop to machine
    if (disabled && machine.status !== "disabled") {
      machine.send(ButtonEvents.disable());
    } else if (!disabled && machine.status === "disabled") {
      machine.send(ButtonEvents.enable());
    }

    const data = machine.data;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!data.disabled && !data.loading) {
        machine.send(ButtonEvents.press());
        onClick?.(e);
        // Release after click
        setTimeout(() => machine.send(ButtonEvents.release()), 0);
      }
    };

    const handleMouseDown = () => {
      if (!data.disabled && !data.loading) {
        machine.send(ButtonEvents.press());
      }
    };

    const handleMouseUp = () => {
      machine.send(ButtonEvents.release());
    };

    const handleMouseEnter = () => {
      if (!data.disabled && !data.loading) {
        machine.send(ButtonEvents.focus());
      }
    };

    const handleMouseLeave = () => {
      machine.send(ButtonEvents.blur());
    };

    const handleFocus = () => {
      if (!data.disabled && !data.loading) {
        machine.send(ButtonEvents.focus());
      }
    };

    const handleBlur = () => {
      machine.send(ButtonEvents.blur());
    };

    const baseClasses = "flex inline-flex items-center justify-center font-[var(--font-sans, system-ui, sans-serif)] font-medium border-0 outline-none cursor-pointer transition-all 150ms ease whitespace-nowrap select-none";
    const variantClasses: Record<string, string> = {"primary-sm":"px-[spacing-2] py-[spacing-1] text-[0.875rem] rounded-md gap-[spacing-2] bg-color-primary text-color-primary-foreground","primary-md":"px-[spacing-4] py-[spacing-2] text-[1rem] rounded-md gap-[spacing-2] bg-color-primary text-color-primary-foreground","primary-lg":"px-[spacing-6] py-[spacing-3] text-[1.125rem] rounded-md gap-[spacing-3] bg-color-primary text-color-primary-foreground","secondary-sm":"px-[spacing-2] py-[spacing-1] text-[0.875rem] rounded-md gap-[spacing-2] bg-color-secondary text-color-secondary-foreground","secondary-md":"px-[spacing-4] py-[spacing-2] text-[1rem] rounded-md gap-[spacing-2] bg-color-secondary text-color-secondary-foreground","secondary-lg":"px-[spacing-6] py-[spacing-3] text-[1.125rem] rounded-md gap-[spacing-3] bg-color-secondary text-color-secondary-foreground","outline-sm":"px-[spacing-2] py-[spacing-1] text-[0.875rem] rounded-md gap-[spacing-2] bg-transparent border border-1px solid var(--color-border) text-color-text","outline-md":"px-[spacing-4] py-[spacing-2] text-[1rem] rounded-md gap-[spacing-2] bg-transparent border border-1px solid var(--color-border) text-color-text","outline-lg":"px-[spacing-6] py-[spacing-3] text-[1.125rem] rounded-md gap-[spacing-3] bg-transparent border border-1px solid var(--color-border) text-color-text","ghost-sm":"px-[spacing-2] py-[spacing-1] text-[0.875rem] rounded-md gap-[spacing-2] bg-transparent text-color-text","ghost-md":"px-[spacing-4] py-[spacing-2] text-[1rem] rounded-md gap-[spacing-2] bg-transparent text-color-text","ghost-lg":"px-[spacing-6] py-[spacing-3] text-[1.125rem] rounded-md gap-[spacing-3] bg-transparent text-color-text"};
    const hostStateClasses = "";

    const variantKey = `${variant}-${size}`;
    const computedClassName = [
      baseClasses,
      variantClasses[variantKey] || "",
      hostStateClasses,
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={computedClassName}
        disabled={data.disabled || data.loading}
        aria-busy={data.loading}
        aria-disabled={data.disabled}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >

        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
