import { createContext, forwardRef, useContext, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type EmptyStateVariants = { size: "sm" | "md" };
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const EmptyStateContext = createContext<{ variants: EmptyStateVariants; headingLevel: HeadingLevel }>({
  variants: { size: "md" },
  headingLevel: 3,
});

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  size?: EmptyStateVariants["size"];
  /** Level of the EmptyStateTitle heading; match your page outline. */
  headingLevel?: HeadingLevel;
}

/**
 * `<EmptyState><EmptyStateIcon/><EmptyStateTitle/><EmptyStateDescription/>
 * <EmptyStateActions/></EmptyState>` — for empty lists and searches.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ size = "md", headingLevel = 3, className, ...props }, ref) => {
    const variants = { size };
    return (
      <EmptyStateContext.Provider value={{ variants, headingLevel }}>
        <div
          {...props}
          ref={ref}
          data-slot="empty-state"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        />
      </EmptyStateContext.Provider>
    );
  },
);
EmptyState.displayName = "EmptyState";

/** Decorative illustration or icon (aria-hidden). */
export const EmptyStateIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variants } = useContext(EmptyStateContext);
    return (
      <div
        aria-hidden="true"
        {...props}
        ref={ref}
        data-slot="empty-state-icon"
        {...variantData(variants)}
        className={slotClass(slots, "icon", variants, className)}
      />
    );
  },
);
EmptyStateIcon.displayName = "EmptyStateIcon";

export const EmptyStateTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { variants, headingLevel } = useContext(EmptyStateContext);
    const Heading = `h${headingLevel}` as const;
    return (
      <Heading
        {...props}
        ref={ref}
        data-slot="empty-state-title"
        {...variantData(variants)}
        className={slotClass(slots, "title", variants, className)}
      />
    );
  },
);
EmptyStateTitle.displayName = "EmptyStateTitle";

export const EmptyStateDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { variants } = useContext(EmptyStateContext);
  return (
    <p
      {...props}
      ref={ref}
      data-slot="empty-state-description"
      {...variantData(variants)}
      className={slotClass(slots, "description", variants, className)}
    />
  );
});
EmptyStateDescription.displayName = "EmptyStateDescription";

export const EmptyStateActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variants } = useContext(EmptyStateContext);
    return (
      <div
        {...props}
        ref={ref}
        data-slot="empty-state-actions"
        {...variantData(variants)}
        className={slotClass(slots, "actions", variants, className)}
      />
    );
  },
);
EmptyStateActions.displayName = "EmptyStateActions";
