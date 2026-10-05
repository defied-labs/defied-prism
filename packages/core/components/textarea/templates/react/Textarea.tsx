import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";
import { useComposedRefs, useFieldControlProps } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "aria-invalid"> {
  "aria-invalid"?: boolean | "true" | "false";
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  resize?: "none" | "vertical" | "both";
  fullWidth?: boolean;
  /** Grow (and shrink) the height with the content. */
  autoResize?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function fitContent(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = "outlined",
      size = "md",
      resize = "vertical",
      fullWidth = false,
      autoResize = false,
      className,
      style,
      onChange,
      ...ownProps
    },
    forwardedRef,
  ) => {
    const props = useFieldControlProps(ownProps);
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const ref = useComposedRefs(forwardedRef, innerRef);
    const variants = { variant, size, resize, fullWidth };

    // Controlled value changes (and the first render) resize too
    useIsomorphicLayoutEffect(() => {
      if (autoResize && innerRef.current) fitContent(innerRef.current);
    }, [autoResize, props.value]);

    return (
      <textarea
        {...props}
        ref={ref}
        style={autoResize ? { overflow: "hidden", ...style } : style}
        data-slot="textarea"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          onChange?.(event);
          if (autoResize) fitContent(event.currentTarget);
        }}
      />
    );
  },
);

Textarea.displayName = "Textarea";
