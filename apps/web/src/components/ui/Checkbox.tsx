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
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

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
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "appearance-none box-border block shrink-0 m-0 [border-width:1px] border-solid border-prism-border-strong rounded-prism-sm bg-prism-bg cursor-pointer [transition:border-color_var(--prism-duration-fast)_var(--prism-easing-standard)] enabled:not-aria-disabled:hover:border-prism-fg focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] aria-invalid:border-prism-danger-solid disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "size": {
        "sm": "[width:1rem] [height:1rem]",
        "md": "[width:1.25rem] [height:1.25rem]"
      }
    }
  },
  "label": {
    "base": "inline-flex items-center gap-prism-2 text-prism-fg font-prism-sans leading-prism-tight",
    "variants": {
      "size": {
        "sm": "text-prism-sm",
        "md": "text-prism-md"
      }
    }
  },
  "control": {
    "base": "relative inline-flex shrink-0 [&_[data-part=indicator]]:absolute [&_[data-part=indicator]]:inset-0 [&_[data-part=indicator]]:flex [&_[data-part=indicator]]:items-center [&_[data-part=indicator]]:justify-center [&_[data-part=indicator]]:rounded-prism-sm [&_[data-part=indicator]]:bg-prism-primary [&_[data-part=indicator]]:text-prism-primary-fg [&_[data-part=indicator]]:pointer-events-none [&_[data-part=indicator]]:[animation:prism-scale-in_var(--prism-duration-fast)_var(--prism-easing-emphasized)] [&_[data-part=mark]]:[--prism-draw-length:1] [&_[data-part=mark]]:[stroke-dasharray:1] [&_[data-part=mark]]:[animation:prism-draw_var(--prism-duration-normal)_var(--prism-easing-emphasized)_var(--prism-duration-fast)_both]",
    "variants": {}
  }
});

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
