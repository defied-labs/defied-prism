import { createContext, forwardRef, useContext, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
