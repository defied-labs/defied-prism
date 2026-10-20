import {
  forwardRef,
  useEffect,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { useFieldControlProps, useMachine } from "@defied/prism-react";
import {
  inputMachineDefinition,
  InputEvents,
} from "@defied/prism-core/components/input";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "aria-invalid"> {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "block box-border text-prism-fg font-prism-sans leading-prism-normal [border-width:1px] border-solid border-prism-border-strong [transition:border-color_var(--prism-duration-fast)_var(--prism-easing-standard)] placeholder:text-prism-muted-fg enabled:not-aria-disabled:hover:border-prism-fg focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:0] aria-invalid:border-prism-danger-solid disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "variant": {
        "outlined": "bg-prism-bg",
        "filled": "bg-prism-muted"
      },
      "size": {
        "sm": "min-h-(--prism-control-sm) px-prism-2 text-prism-sm rounded-prism-md",
        "md": "min-h-(--prism-control-md) px-prism-3 text-prism-sm rounded-prism-md",
        "lg": "min-h-(--prism-control-lg) px-prism-4 text-prism-md rounded-prism-lg"
      },
      "fullWidth": {
        "true": "w-full"
      }
    }
  }
});

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "outlined",
      size = "md",
      fullWidth = false,
      className,
      onChange,
      onBlur,
      onFocus,
      ...ownProps
    },
    ref,
  ) => {
    // Labels, descriptions and errors belong to Field: inside one, it
    // supplies id, aria-describedby, aria-invalid, disabled and required;
    // explicit props still win.
    const props = useFieldControlProps(ownProps);
    const disabled = props.disabled ?? false;

    // The DOM (or the caller, when controlled) owns the value; the machine
    // only tracks focus / filled / disabled for data-state.
    const { status, send } = useMachine(inputMachineDefinition);

    useEffect(() => {
      send(disabled ? InputEvents.disable() : InputEvents.enable());
    }, [disabled, send]);

    const variants = { variant, size, fullWidth };

    return (
      <input
        {...props}
        ref={ref}
        disabled={disabled}
        data-state={status}
        data-slot="input"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          send(InputEvents.change(event.target.value));
          onChange?.(event);
        }}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          send(InputEvents.focus());
          onFocus?.(event);
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          send(InputEvents.blur());
          onBlur?.(event);
        }}
      />
    );
  },
);

Input.displayName = "Input";
