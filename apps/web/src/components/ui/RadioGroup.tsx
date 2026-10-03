import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  useControllableState,
  useField,
  useFieldControlProps,
} from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex gap-prism-3 font-prism-sans",
    "variants": {
      "orientation": {
        "horizontal": "flex-row flex-wrap",
        "vertical": "flex-col flex-nowrap"
      }
    }
  },
  "item": {
    "base": "inline-flex items-center gap-prism-2 text-prism-fg leading-prism-tight",
    "variants": {
      "size": {
        "sm": "text-prism-sm",
        "md": "text-prism-md"
      }
    }
  },
  "control": {
    "base": "relative inline-flex shrink-0 [&_[data-part=indicator]]:absolute [&_[data-part=indicator]]:[inset:0.3em] [&_[data-part=indicator]]:rounded-prism-full [&_[data-part=indicator]]:bg-prism-primary-fg [&_[data-part=indicator]]:pointer-events-none [&_[data-part=indicator]]:[animation:prism-pop-in_var(--prism-duration-normal)_var(--prism-easing-emphasized)]",
    "variants": {
      "size": {
        "sm": "text-prism-sm",
        "md": "text-prism-md"
      }
    }
  },
  "radio": {
    "base": "appearance-none box-border block m-0 [border-width:1px] border-solid border-prism-border-strong rounded-prism-full bg-prism-bg cursor-pointer [transition:border-color_var(--prism-duration-normal)_var(--prism-easing-standard),_background-color_var(--prism-duration-normal)_var(--prism-easing-standard)] enabled:not-aria-disabled:hover:border-prism-fg [&:is(:checked,[aria-checked=true])]:border-prism-primary [&:is(:checked,[aria-checked=true])]:bg-prism-primary focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] aria-invalid:border-prism-danger-solid disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "size": {
        "sm": "[width:1rem] [height:1rem]",
        "md": "[width:1.25rem] [height:1.25rem]"
      }
    }
  }
});

type Variants = { orientation: "horizontal" | "vertical"; size: "sm" | "md" };

interface RadioGroupContextValue {
  name: string;
  value: string | null;
  setValue: (value: string) => void;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  variants: Variants;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup(component: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error(`<${component}> must be used inside <RadioGroup>.`);
  return context;
}

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "aria-invalid" | "role"> {
  /** Selected value (controlled); `null` for none. */
  value?: string | null;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Form field name shared by the radios; generated when omitted. */
  name?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  required?: boolean;
  children?: ReactNode;
}

/**
 * Native radios sharing a `name`: the browser provides arrow-key selection,
 * a single tab stop and form submission. Name it with aria-label,
 * aria-labelledby or a surrounding Field.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      name: nameProp,
      orientation = "vertical",
      size = "md",
      disabled: disabledProp,
      required: requiredProp,
      className,
      children,
      ...ownProps
    },
    ref,
  ) => {
    const field = useField();
    const {
      disabled = false,
      required = false,
      "aria-invalid": ariaInvalid,
      ...props
    } = useFieldControlProps({ ...ownProps, disabled: disabledProp, required: requiredProp });
    const [value, setValue] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: (next) => {
        if (next !== null) onValueChange?.(next);
      },
    });
    const generatedName = useId();
    const variants: Variants = { orientation, size };
    const invalid = ariaInvalid === true || ariaInvalid === "true";
    const labelledBy =
      props["aria-labelledby"] ??
      (field && !props["aria-label"] ? field.labelId : undefined);

    return (
      <RadioGroupContext.Provider
        value={{
          name: nameProp ?? generatedName,
          value,
          setValue,
          disabled,
          required,
          invalid,
          variants,
        }}
      >
        <div
          {...props}
          ref={ref}
          role="radiogroup"
          aria-labelledby={labelledBy}
          aria-orientation={orientation}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          data-slot="radio-group"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "checked" | "defaultChecked" | "name" | "children"
  > {
  value: string;
  /** Visible label. */
  children?: ReactNode;
  /** Class for the wrapping <label>; `className` styles the radio circle. */
  labelClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, disabled, children, className, labelClassName, onChange, ...props }, ref) => {
    const group = useRadioGroup("Radio");
    const { variants } = group;
    const checked = group.value === value;

    return (
      <label
        data-slot="radio-group-item"
        {...variantData(variants)}
        className={slotClass(slots, "item", variants, labelClassName)}
      >
        <span
          data-slot="radio-group-control"
          {...variantData(variants)}
          className={slotClass(slots, "control", variants)}
        >
          <input
            {...props}
            ref={ref}
            type="radio"
            name={group.name}
            value={value}
            checked={checked}
            disabled={group.disabled || disabled}
            required={group.required || undefined}
            aria-invalid={group.invalid || undefined}
            data-state={checked ? "checked" : "unchecked"}
            data-slot="radio-group-radio"
            {...variantData(variants)}
            className={slotClass(slots, "radio", variants, className)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange?.(event);
              if (!event.defaultPrevented && event.target.checked) group.setValue(value);
            }}
          />
          {checked && <span data-part="indicator" aria-hidden="true" />}
        </span>
        {children}
      </label>
    );
  },
);

Radio.displayName = "Radio";
