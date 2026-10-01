import { tailwindSlots } from "@defied-prism/core/tailwind";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { FieldContext, useField, useFieldState } from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex gap-prism-1-5 font-prism-sans [min-width:0]",
    "variants": {
      "orientation": {
        "vertical": "flex-col",
        "horizontal": "flex-row flex-wrap items-center gap-x-prism-3"
      }
    }
  },
  "label": {
    "base": "inline-flex items-baseline gap-prism-1 text-prism-sm font-prism-medium leading-prism-tight text-prism-fg [&_[data-part=required-indicator]]:text-prism-danger-fg",
    "variants": {}
  },
  "description": {
    "base": "m-0 text-prism-xs leading-prism-normal text-prism-muted-fg",
    "variants": {}
  },
  "error": {
    "base": "m-0 text-prism-xs leading-prism-normal text-prism-danger-fg",
    "variants": {}
  },
  "group": {
    "base": "flex flex-col gap-prism-4 [min-width:0] m-0 p-0 [border-width:0] font-prism-sans",
    "variants": {}
  },
  "legend": {
    "base": "p-0 mb-prism-2 text-prism-md font-prism-semibold leading-prism-tight text-prism-fg",
    "variants": {}
  }
});

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  /** Id for the control; generated when omitted. */
  controlId?: string;
  /** Marks the control invalid. A rendered FieldError does this too. */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Connects a label, description and error message to the Prism form control
 * inside it (id, aria-describedby, aria-invalid, disabled, required).
 */
const GroupDisabledContext = createContext(false);

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  (
    { orientation = "vertical", controlId, invalid, disabled, required, className, children, ...props },
    ref,
  ) => {
    // A disabled FieldGroup disables its controls natively; tell the Field so labels dim too
    const groupDisabled = useContext(GroupDisabledContext);
    const field = useFieldState({ id: controlId, invalid, disabled: disabled || groupDisabled, required });
    const variants = { orientation };
    return (
      <FieldContext.Provider value={field}>
        <div
          {...props}
          ref={ref}
          data-slot="field"
          data-invalid={field.invalid || undefined}
          data-disabled={field.disabled || undefined}
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows the required marker. Defaults to the Field's `required`. */
  required?: boolean;
}

/** Labels the Field's control. The asterisk is visual; the control carries `required`. */
export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ required, id, htmlFor, className, children, ...props }, ref) => {
    const field = useField();
    const isRequired = required ?? field?.required ?? false;
    return (
      <label
        {...props}
        ref={ref}
        id={id ?? field?.labelId}
        htmlFor={htmlFor ?? field?.controlId}
        data-slot="field-label"
        {...variantData({})}
        className={slotClass(slots, "label", {}, className)}
      >
        {children}
        {isRequired && (
          <span data-part="required-indicator" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);
FieldLabel.displayName = "FieldLabel";

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

/** Help text, referenced by the control's aria-describedby. */
export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    const field = useField();
    const setHasDescription = field?.setHasDescription;
    useEffect(() => {
      if (!setHasDescription) return;
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return (
      <p
        {...props}
        ref={ref}
        id={field?.descriptionId}
        data-slot="field-description"
        {...variantData({})}
        className={slotClass(slots, "description", {}, className)}
      >
        {children}
      </p>
    );
  },
);
FieldDescription.displayName = "FieldDescription";

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

/**
 * Validation message. While it has content it marks the control invalid and
 * is added to its aria-describedby. The element is always rendered as a
 * polite live region (not role="alert"), so the message is announced when it
 * appears or changes, without interrupting, and several errors appearing at
 * once on submit don't each shout over each other; focus moves to the first
 * invalid control anyway (see Form), which reads the message as description.
 */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, ...props }, ref) => {
    const field = useField();
    const setHasError = field?.setHasError;
    const hasContent = children != null && children !== false && children !== "";
    useEffect(() => {
      if (!setHasError) return;
      setHasError(hasContent);
      return () => setHasError(false);
    }, [setHasError, hasContent]);
    return (
      <p
        aria-live="polite"
        {...props}
        ref={ref}
        id={field?.errorId}
        data-slot="field-error"
        {...variantData({})}
        className={slotClass(slots, "error", {}, className)}
      >
        {children}
      </p>
    );
  },
);
FieldError.displayName = "FieldError";

export interface FieldGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Caption for the group, rendered as its <legend>. */
  legend?: ReactNode;
}

/** A <fieldset> grouping related fields; `disabled` disables every control in it. */
export const FieldGroup = forwardRef<HTMLFieldSetElement, FieldGroupProps>(
  ({ legend, className, children, ...props }, ref) => {
    const disabled = useContext(GroupDisabledContext) || !!props.disabled;
    return (
      <GroupDisabledContext.Provider value={disabled}>
        <fieldset
          {...props}
          ref={ref}
          data-slot="field-group"
          {...variantData({})}
          className={slotClass(slots, "group", {}, className)}
        >
          {legend != null && (
            <legend data-slot="field-legend" {...variantData({})} className={slotClass(slots, "legend", {})}>
              {legend}
            </legend>
          )}
          {children}
        </fieldset>
      </GroupDisabledContext.Provider>
    );
  },
);
FieldGroup.displayName = "FieldGroup";
