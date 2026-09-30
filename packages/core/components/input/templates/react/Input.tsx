import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { useMachine } from "@defied-prism/react";
import {
  inputMachineDefinition,
  InputEvents,
  type InputStatus,
  type InputData,
} from "@defied-prism/core/components/input";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      variant = "outlined",
      size = "md",
      fullWidth = false,
      disabled,
      required,
      id: providedId,
      className = "",
      onChange,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const machine = useMachine(inputMachineDefinition);

    // Sync disabled prop to machine
    if (disabled && machine.getStatus() !== "disabled") {
      machine.send(InputEvents.disable());
    } else if (!disabled && machine.getStatus() === "disabled") {
      machine.send(InputEvents.enable());
    }

    const status = machine.getStatus();
    const data = machine.getData();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      machine.send(InputEvents.change(e.target.value));
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      machine.send(InputEvents.blur());
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      machine.send(InputEvents.focus());
      onFocus?.(e);
    };

    const hasValue = data.value.length > 0;
    const isFocused = data.focused;

    // Build className from compiled styles
    const baseClasses = "{{STYLE_BASE}}";
    const variantClasses = JSON.parse("{{STYLE_VARIANTS}}");
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

    const wrapperClassName = ["relative", fullWidth ? "w-full" : ""]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={computedClassName}
          disabled={data.disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            [error && errorId, hint && hintId].filter(Boolean).join(" ") ||
            undefined
          }
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          value={data.value}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={hintId}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
