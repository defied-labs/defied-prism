import React from "react";
import { useMachine } from "@defied-prism/react";
import { ButtonEvents, buttonMachineDefinition } from "@defied-prism/core";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  loading = false,
  variant = "default",
  size = "md",
  disabled,
  onFocus,
  onBlur,
  onMouseDown,
  onMouseUp,
  ...props
}: ButtonProps) {
  const { data, status, send } = useMachine(buttonMachineDefinition);

  const isDisabled = disabled || loading;
  const dataState = loading
    ? "loading"
    : status === "pressed"
      ? "active"
      : "idle";

  const sizeClass =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : "h-10 px-4 text-sm";

  const variantStyles: Record<string, string> = {
    secondary: "bg-secondary text-black hover:bg-secondary/80",
    ghost: "bg-transparent text-primary"
  };

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={[
        "flex items-center justify-center rounded-md px-4 py-2 bg-primary text-white transition-colors",
        "hover:bg-primary/80",
        variantStyles[variant],
        sizeClass,
        loading ? "cursor-wait" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")
      }
      disabled={isDisabled}
      data-state={dataState}
      data-variant={variant}
      aria-busy={loading || undefined}
      onFocus={(event) => {
        send(ButtonEvents.focus());
        onFocus?.(event);
      }}
      onBlur={(event) => {
        send(ButtonEvents.blur());
        onBlur?.(event);
      }}
      onMouseDown={(event) => {
        if (!isDisabled) {
          send(ButtonEvents.press());
        }
        onMouseDown?.(event);
      }}
      onMouseUp={(event) => {
        if (!isDisabled) {
          send(ButtonEvents.release());
        }
        onMouseUp?.(event);
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}