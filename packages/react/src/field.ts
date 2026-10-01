import { createContext, useContext, useId, useMemo, useState } from "react";

/**
 * The link between a Field (label, description, error) and the control
 * inside it. Every Prism form control calls `useFieldControlProps`, so any
 * control dropped into any Field is labelled, described and validated the
 * same way.
 */
export interface FieldState {
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  hasDescription: boolean;
  hasError: boolean;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;
}

export const FieldContext = createContext<FieldState | null>(null);

export interface FieldOptions {
  /** Id for the control; generated when omitted. */
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}

/** State for a Field root. Provide it with `<FieldContext.Provider value={…}>`. */
export function useFieldState({
  id,
  invalid = false,
  disabled = false,
  required = false,
}: FieldOptions = {}): FieldState {
  const generated = useId();
  const controlId = id ?? `${generated}-control`;
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  return useMemo(
    () => ({
      controlId,
      labelId: `${generated}-label`,
      descriptionId: `${generated}-description`,
      errorId: `${generated}-error`,
      // A rendered error message marks the field invalid
      invalid: invalid || hasError,
      disabled,
      required,
      hasDescription,
      hasError,
      setHasDescription,
      setHasError,
    }),
    [controlId, generated, invalid, disabled, required, hasDescription, hasError],
  );
}

/** The surrounding Field, if any. */
export function useField(): FieldState | null {
  return useContext(FieldContext);
}

export interface FieldControlProps {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

/**
 * Merges a control's own props with its Field: id, description/error
 * references, invalid, disabled and required. Explicit props win; outside a
 * Field the props pass through unchanged.
 */
export function useFieldControlProps<P extends FieldControlProps>(props: P): P {
  const field = useField();
  if (!field) return props;

  const describedBy = [
    props["aria-describedby"],
    field.hasDescription ? field.descriptionId : undefined,
    field.hasError ? field.errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...props,
    id: props.id ?? field.controlId,
    disabled: props.disabled ?? (field.disabled || undefined),
    required: props.required ?? (field.required || undefined),
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
  };
}
