import {
  computed,
  inject,
  provide,
  reactive,
  ref,
  toValue,
  useId,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";

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

export const FieldContext: InjectionKey<FieldState> = Symbol("PrismField");

export interface FieldOptions {
  /** Id for the control; generated when omitted. */
  id?: MaybeRefOrGetter<string | undefined>;
  invalid?: MaybeRefOrGetter<boolean | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  required?: MaybeRefOrGetter<boolean | undefined>;
}

/** Reactive state for a Field root. Share it with `provideField(state)`. */
export function useFieldState(options: FieldOptions = {}): FieldState {
  const generated = useId();
  const hasDescription = ref(false);
  const hasError = ref(false);

  return reactive({
    controlId: computed(() => toValue(options.id) ?? `${generated}-control`),
    labelId: `${generated}-label`,
    descriptionId: `${generated}-description`,
    errorId: `${generated}-error`,
    // A rendered error message marks the field invalid
    invalid: computed(() => !!toValue(options.invalid) || hasError.value),
    disabled: computed(() => !!toValue(options.disabled)),
    required: computed(() => !!toValue(options.required)),
    hasDescription,
    hasError,
    setHasDescription: (value: boolean) => {
      hasDescription.value = value;
    },
    setHasError: (value: boolean) => {
      hasError.value = value;
    },
  }) as FieldState;
}

export function provideField(state: FieldState): void {
  provide(FieldContext, state);
}

/** The surrounding Field, if any. */
export function useField(): FieldState | null {
  return inject(FieldContext, null);
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
export function useFieldControlProps<P extends FieldControlProps>(
  props: MaybeRefOrGetter<P>,
): ComputedRef<P> {
  const field = useField();
  return computed<P>(() => mergeFieldControlProps(field, toValue(props)));
}

/**
 * The merge behind `useFieldControlProps`, for calling during render.
 * Fallthrough attrs aren't reactive inside a `computed`, so a control that
 * reads `aria-*` from `useAttrs()` merges with `useField()` here instead.
 */
export function mergeFieldControlProps<P extends FieldControlProps>(
  field: FieldState | null,
  own: P,
): P {
  if (!field) return own;

  const describedBy = [
    own["aria-describedby"],
    field.hasDescription ? field.descriptionId : undefined,
    field.hasError ? field.errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...own,
    id: own.id ?? field.controlId,
    disabled: own.disabled ?? (field.disabled || undefined),
    required: own.required ?? (field.required || undefined),
    "aria-describedby": describedBy || undefined,
    "aria-invalid": own["aria-invalid"] ?? (field.invalid || undefined),
  };
}
