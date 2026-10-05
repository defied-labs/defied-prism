import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { useControllableState, useFieldControlProps } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

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
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "inline-flex items-center gap-prism-2 p-0 [border-width:0] rounded-prism-full bg-transparent text-prism-fg font-prism-sans leading-prism-tight cursor-pointer [--prism-switch-on:0] [&:is(:checked,[aria-checked=true])]:[--prism-switch-on:1] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "size": {
        "sm": "text-prism-sm",
        "md": "text-prism-md"
      }
    }
  },
  "track": {
    "base": "relative inline-flex items-center shrink-0 box-border [padding:2px] rounded-prism-full [background:color-mix(in_srgb,_var(--prism-color-primary)_calc(var(--prism-switch-on,_0)_*_100%),_var(--prism-color-border-strong))] [transition:background-color_var(--prism-duration-fast)_var(--prism-easing-standard)]",
    "variants": {
      "size": {
        "sm": "[width:2rem] [height:1.125rem]",
        "md": "[width:2.75rem] [height:1.5rem]"
      }
    }
  },
  "thumb": {
    "base": "block rounded-prism-full bg-prism-bg shadow-prism-sm [transform:translateX(calc(var(--prism-switch-on,_0)_*_var(--prism-switch-travel)))] [transition:transform_var(--prism-duration-fast)_var(--prism-easing-standard)]",
    "variants": {
      "size": {
        "sm": "[width:0.875rem] [height:0.875rem] [--prism-switch-travel:0.875rem]",
        "md": "[width:1.25rem] [height:1.25rem] [--prism-switch-travel:1.25rem]"
      }
    }
  }
});

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
