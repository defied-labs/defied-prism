import { forwardRef, type LabelHTMLAttributes } from "react";
import { useField } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: "sm" | "md";
  /** Shows a required marker. Defaults to the surrounding Field's `required`. */
  required?: boolean;
  /** Disabled look. Defaults to the surrounding Field's `disabled`. */
  disabled?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "inline-flex items-baseline gap-prism-1 font-prism-sans font-prism-medium leading-prism-tight text-prism-fg [&_[data-part=required-indicator]]:text-prism-danger-fg",
    "variants": {
      "size": {
        "sm": "text-prism-xs",
        "md": "text-prism-sm"
      },
      "dimmed": {
        "true": "opacity-(--prism-opacity-disabled) cursor-not-allowed"
      }
    }
  }
});

/**
 * A form label. Inside a Field it labels the Field's control automatically
 * (id = field.labelId, htmlFor = field.controlId) unless given explicitly.
 * The required asterisk is visual only: the control carries `required`.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ size = "md", required, disabled, id, htmlFor, className, children, ...props }, ref) => {
    const field = useField();
    const isRequired = required ?? field?.required ?? false;
    const variants = { size, dimmed: disabled ?? field?.disabled ?? false };
    return (
      <label
        {...props}
        ref={ref}
        id={id ?? field?.labelId}
        htmlFor={htmlFor ?? field?.controlId}
        data-slot="label"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
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

Label.displayName = "Label";
