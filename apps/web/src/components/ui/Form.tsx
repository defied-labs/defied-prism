import { forwardRef, useEffect, useRef, type FormHTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex flex-col gap-prism-6 font-prism-sans",
    "variants": {}
  }
});

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** After submit, focus the first invalid control. Default true. */
  focusInvalid?: boolean;
}

type SubmitEvent = Parameters<NonNullable<FormHTMLAttributes<HTMLFormElement>["onSubmit"]>>[0];

const INVALID = '[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid';

/**
 * A <form>. After `onSubmit` runs and its updates render (e.g. new
 * FieldErrors), focus moves to the first control marked invalid.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ focusInvalid = true, onSubmit, className, children, ...props }, ref) => {
    const inner = useRef<HTMLFormElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const handleSubmit = (event: SubmitEvent) => {
      onSubmit?.(event);
      if (!focusInvalid) return;
      // After the submit's re-renders settle (errors render, then FieldErrors
      // mark their controls invalid in an effect)
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const target = Array.from(inner.current?.querySelectorAll<HTMLElement>(INVALID) ?? []).find(
          (el) => !(el as HTMLInputElement).disabled && el.getAttribute("aria-disabled") !== "true",
        );
        target?.focus();
      });
    };

    const setRef = (node: HTMLFormElement | null) => {
      inner.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <form
        {...props}
        ref={setRef}
        onSubmit={handleSubmit}
        data-slot="form"
        {...variantData({})}
        className={slotClass(slots, "root", {}, className)}
      >
        {children}
      </form>
    );
  },
);
Form.displayName = "Form";
