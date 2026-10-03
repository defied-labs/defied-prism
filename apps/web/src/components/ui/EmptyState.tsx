import { createContext, forwardRef, useContext, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex flex-col items-center text-center [margin-inline:auto] font-prism-sans text-prism-fg",
    "variants": {
      "size": {
        "sm": "gap-prism-2 py-prism-6 px-prism-4",
        "md": "gap-prism-3 py-prism-12 px-prism-6"
      }
    }
  },
  "icon": {
    "base": "inline-flex items-center justify-center rounded-prism-full bg-prism-muted text-prism-muted-fg",
    "variants": {
      "size": {
        "sm": "w-(--prism-control-md) h-(--prism-control-md)",
        "md": "w-prism-12 h-prism-12"
      }
    }
  },
  "title": {
    "base": "m-0 font-prism-semibold leading-prism-tight",
    "variants": {
      "size": {
        "sm": "text-prism-md",
        "md": "text-prism-lg"
      }
    }
  },
  "description": {
    "base": "m-0 [max-width:36rem] text-prism-muted-fg leading-prism-normal",
    "variants": {
      "size": {
        "sm": "text-prism-sm",
        "md": "text-prism-md"
      }
    }
  },
  "actions": {
    "base": "flex flex-wrap justify-center gap-prism-2",
    "variants": {
      "size": {
        "sm": "mt-prism-2",
        "md": "mt-prism-4"
      }
    }
  }
});

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
