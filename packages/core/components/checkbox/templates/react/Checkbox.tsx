import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  useComposedRefs,
  useControllableState,
  useFieldControlProps,
} from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "checked" | "defaultChecked" | "children" | "aria-invalid"
  > {
  "aria-invalid"?: boolean | "true" | "false";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state ("some selected"). Controlled: stays on until you clear it. */
  indeterminate?: boolean;
  size?: "sm" | "md";
  /** Visible label, rendered in a <label> that wraps the box. */
  children?: ReactNode;
  /** Class for the wrapping <label>; `className` styles the box. */
  labelClassName?: string;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      indeterminate = false,
      size = "md",
      children,
      className,
      labelClassName,
      onChange,
      ...ownProps
    },
    forwardedRef,
  ) => {
    const props = useFieldControlProps(ownProps);
    const [checked, setChecked] = useControllableState({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    const innerRef = useRef<HTMLInputElement>(null);
    const ref = useComposedRefs(forwardedRef, innerRef);
    const variants = { size };

    // `indeterminate` only exists as a DOM property; re-apply it after every
    // toggle because the browser clears it on click.
    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate, checked]);

    const state = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";

    return (
      <label
        data-slot="checkbox-label"
        {...variantData(variants)}
        className={slotClass(slots, "label", variants, labelClassName)}
      >
        <span
          data-slot="checkbox-control"
          {...variantData(variants)}
          className={slotClass(slots, "control", variants)}
        >
          <input
            {...props}
            ref={ref}
            type="checkbox"
            checked={checked}
            aria-checked={indeterminate ? "mixed" : undefined}
            data-state={state}
            data-slot="checkbox"
            {...variantData(variants)}
            className={slotClass(slots, "root", variants, className)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange?.(event);
              setChecked(event.target.checked);
            }}
          />
          {state !== "unchecked" && (
            <span data-part="indicator" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="75%" height="75%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {state === "indeterminate" ? (
                  <path key="dash" data-part="mark" pathLength={1} d="M3.5 8h9" />
                ) : (
                  <path key="tick" data-part="mark" pathLength={1} d="M3.5 8.5l3 3 6-7" />
                )}
              </svg>
            </span>
          )}
        </span>
        {children}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
