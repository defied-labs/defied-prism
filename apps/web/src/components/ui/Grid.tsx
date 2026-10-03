import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

export type GridElement = "div" | "section" | "ul" | "ol";

type ColumnName = "one" | "two" | "three" | "four" | "six" | "twelve";

const COLUMN_NAMES: Record<number, ColumnName> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  6: "six",
  12: "twelve",
};

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. */
  as?: GridElement;
  /** Equal-width columns, or "auto" for as many >= 16rem columns as fit. */
  columns?: 1 | 2 | 3 | 4 | 6 | 12 | ColumnName | "auto";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "grid [min-width:0]",
    "variants": {
      "columns": {
        "one": "[grid-template-columns:repeat(1,_minmax(0,_1fr))]",
        "two": "[grid-template-columns:repeat(2,_minmax(0,_1fr))]",
        "three": "[grid-template-columns:repeat(3,_minmax(0,_1fr))]",
        "four": "[grid-template-columns:repeat(4,_minmax(0,_1fr))]",
        "six": "[grid-template-columns:repeat(6,_minmax(0,_1fr))]",
        "twelve": "[grid-template-columns:repeat(12,_minmax(0,_1fr))]",
        "auto": "[grid-template-columns:repeat(auto-fit,_minmax(min(16rem,_100%),_1fr))]"
      },
      "gap": {
        "none": "[gap:0]",
        "xs": "gap-prism-1",
        "sm": "gap-prism-2",
        "md": "gap-prism-4",
        "lg": "gap-prism-6",
        "xl": "gap-prism-8"
      }
    }
  }
});

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ as = "div", columns = "one", gap = "md", className, ...props }, ref) => {
    const Tag = as as ElementType;
    const variants = {
      columns: typeof columns === "number" ? COLUMN_NAMES[columns] : columns,
      gap,
    };
    return (
      <Tag
        {...props}
        ref={ref}
        data-slot="grid"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      />
    );
  },
);

Grid.displayName = "Grid";
