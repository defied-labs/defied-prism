import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { useControllableState, useFieldControlProps } from "@defied/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "defaultChecked" | "aria-invalid" | "role"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
  /** Submits `value` under this name when on (nothing when off, like a checkbox). */
  name?: string;
  value?: string;
  required?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = "md",
      name,
      value = "on",
      type = "button",
      className,
      children,
      onClick,
      ...ownProps
    },
    ref,
  ) => {
    const { required, ...props } = useFieldControlProps(ownProps);
    const [checked, setChecked] = useControllableState({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    const variants = { size };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        role="switch"
        aria-checked={checked}
        aria-required={required || undefined}
        data-state={checked ? "checked" : "unchecked"}
        data-slot="switch"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setChecked(!checked);
        }}
      >
        <span
          data-slot="switch-track"
          {...variantData(variants)}
          className={slotClass(slots, "track", variants)}
        >
          <span
            data-slot="switch-thumb"
            {...variantData(variants)}
            className={slotClass(slots, "thumb", variants)}
          />
        </span>
        {children}
        {name && checked && <input type="hidden" name={name} value={value} />}
      </button>
    );
  },
);

Switch.displayName = "Switch";
