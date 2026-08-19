import React, { useMemo, useState } from "react";

import { useMachine } from "../../machine/useMachine";
import { ButtonEvents, buttonMachineDefinition } from "@defied-prism/core";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  variantStyles?: Record<string, string>;
  baseClassName?: string;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<string, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-700",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  children,
  className,
  loading = false,
  variant = "default",
  size = "md",
  variantStyles,
  baseClassName,
  disabled,
  onFocus,
  onBlur,
  onMouseDown,
  onMouseUp,
  ...props
}: ButtonProps) {
  const { state, send } = useMachine(buttonMachineDefinition);
  const [isPressed, setIsPressed] = useState(false);

  const isDisabled = disabled || loading;
  const dataState = loading
    ? "loading"
    : state.status === "active" || isPressed
      ? "active"
      : "idle";

  const variantLookup = variantStyles ?? variantClasses;
  const activeVariantClass = variantLookup[variant] ?? "";

  const base = baseClassName ?? baseClasses;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={[
        base,
        activeVariantClass,
        sizeClasses[size] ?? sizeClasses.md,
        loading && "cursor-wait",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      data-state={dataState}
      data-variant={variant}
      aria-busy={loading || undefined}
      onFocus={(event) => {
        send(ButtonEvents.focus);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        send(ButtonEvents.blur);
        onBlur?.(event);
      }}
      onMouseDown={(event) => {
        if (!isDisabled) {
          setIsPressed(true);
          send(ButtonEvents.press);
        }
        onMouseDown?.(event);
      }}
      onMouseUp={(event) => {
        if (!isDisabled) {
          setIsPressed(false);
          send(ButtonEvents.release);
        }
        onMouseUp?.(event);
      }}
    >
      {children}
    </button>
  );
}
