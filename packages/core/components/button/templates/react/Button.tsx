import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useMachine } from "@defied-prism/react";
import {
  buttonMachineDefinition,
  ButtonEvents,
  type ButtonStatus,
  type ButtonData,
} from "@defied-prism/core/components/button";
import styles from "./Button.module.css";

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

    const status = machine.status;
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

    // Build className from compiled styles
    const baseClasses = "{{STYLE_BASE}}";
    const variantClasses: Record<string, string> = {{STYLE_VARIANTS}};
    const hostStateClasses = "{{STYLE_HOST_STATES}}";

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
