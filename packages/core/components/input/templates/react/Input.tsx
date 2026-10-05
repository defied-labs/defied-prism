import {
  forwardRef,
  useEffect,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { useFieldControlProps, useMachine } from "@defied-labs/prism-react";
import {
  inputMachineDefinition,
  InputEvents,
} from "@defied-labs/prism-core/components/input";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "aria-invalid"> {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
