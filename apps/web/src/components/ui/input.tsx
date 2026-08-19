import React, { useMemo } from "react";

import { useMachine } from "@defied-prism/react";
import { InputEvents, inputMachineDefinition } from "@defied-prism/core";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
  showClear?: boolean;
}

export function Input({
  className,
  disabled,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  onValueChange,
  showClear = false,
  ...props
}: InputProps) {
  const { state, send } = useMachine(inputMachineDefinition);

  const isControlled = value !== undefined;
  const currentValue = isControlled
    ? (value as string)
    : (state.data.value as string);

  const dataState = disabled
    ? "disabled"
    : state.status === "focused"
      ? "focused"
      : currentValue
        ? "filled"
        : "empty";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    if (!isControlled) {
      send(InputEvents.change(next));
    }

    onValueChange?.(next);
    onChange?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      send(InputEvents.focus());
    }
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      send(InputEvents.blur());
    }
    onBlur?.(event);
  };

  const handleClear = () => {
    if (!isControlled) {
      send(InputEvents.clear());
    }
    onValueChange?.("");
  };

  return (
    <div className="relative inline-flex w-full items-center">
      <input
        {...props}
        type={props.type ?? "text"}
        className={["bg-white text-slate-900 rounded-md px-3 py-2", className]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        value={isControlled ? currentValue : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        data-state={dataState}
        aria-disabled={disabled || undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      {showClear && currentValue ? (
        <button
          type="button"
          aria-label="Clear input"
          onClick={handleClear}
          className="absolute right-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
