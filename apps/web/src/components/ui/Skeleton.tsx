import { createContext, forwardRef, useContext, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex flex-col gap-prism-2",
    "variants": {}
  },
  "shape": {
    "base": "block bg-prism-muted [animation:prism-pulse_calc(var(--prism-duration-slow)_*_5)_var(--prism-easing-standard)_infinite]",
    "variants": {
      "variant": {
        "text": "w-full [height:1em] rounded-prism-sm",
        "rect": "w-full [height:6rem] rounded-prism-md",
        "circle": "w-(--prism-control-md) h-(--prism-control-md) rounded-prism-full"
      }
    }
  },
  "label": {
    "base": "absolute [width:1px] [height:1px] p-0 [margin:-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap [border-width:0]",
    "variants": {}
  }
});

type SkeletonVariant = "text" | "rect" | "circle";

const SkeletonContext = createContext<SkeletonVariant | null>(null);

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Default shape for the Skeletons inside. */
  variant?: SkeletonVariant;
  /** Announced (visually hidden) while loading. */
  label?: string;
}

/**
 * The loading region: `role="status"` + `aria-busy="true"` with a hidden
 * label, so assistive technology hears "Loading" once instead of a pile of
 * empty shapes. Render the real content in its place when loading finishes.
 */
export const SkeletonGroup = forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ variant = "text", label = "Loading", className, children, ...props }, ref) => {
    const variants = { variant };
    return (
      <SkeletonContext.Provider value={variant}>
        <div
          role="status"
          {...props}
          ref={ref}
          aria-busy="true"
          data-slot="skeleton"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          <span
            data-slot="skeleton-label"
            {...variantData(variants)}
            className={slotClass(slots, "label", variants)}
          >
            {label}
          </span>
          {children}
        </div>
      </SkeletonContext.Provider>
    );
  },
);
SkeletonGroup.displayName = "SkeletonGroup";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shape; defaults to the group's variant, else "text". */
  variant?: SkeletonVariant;
}

/** A decorative placeholder shape (aria-hidden). Size it with className/style. */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ variant, className, ...props }, ref) => {
    const inherited = useContext(SkeletonContext);
    const variants = { variant: variant ?? inherited ?? "text" };
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        data-slot="skeleton-shape"
        {...variantData(variants)}
        className={slotClass(slots, "shape", variants, className)}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
