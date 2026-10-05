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
import { tailwindSlots } from "@defied-labs/prism-core/tailwind";

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
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "block box-border [min-width:0] text-prism-fg font-prism-sans leading-prism-normal [border-width:1px] border-solid border-prism-border-strong [transition:border-color_var(--prism-duration-fast)_var(--prism-easing-standard)] placeholder:text-prism-muted-fg enabled:not-aria-disabled:hover:border-prism-fg focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:0] aria-invalid:border-prism-danger-solid disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "variant": {
        "outlined": "bg-prism-bg",
        "filled": "bg-prism-muted"
      },
      "size": {
        "sm": "[min-height:4rem] px-prism-2 py-prism-1 text-prism-sm rounded-prism-md",
        "md": "[min-height:5rem] px-prism-3 py-prism-2 text-prism-sm rounded-prism-md",
        "lg": "[min-height:6rem] px-prism-4 py-prism-3 text-prism-md rounded-prism-lg"
      },
      "resize": {
        "none": "[resize:none]",
        "vertical": "[resize:vertical]",
        "both": "[resize:both]"
      },
      "fullWidth": {
        "true": "w-full"
      }
    }
  }
});

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
