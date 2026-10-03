<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export type GridElement = "div" | "section" | "ul" | "ol";

type ColumnName = "one" | "two" | "three" | "four" | "six" | "twelve";

export interface GridProps {
  /** Element to render. */
  as?: GridElement;
  /** Equal-width columns, or "auto" for as many >= 16rem columns as fit. */
  columns?: 1 | 2 | 3 | 4 | 6 | 12 | ColumnName | "auto";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

const COLUMN_NAMES: Record<number, ColumnName> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  6: "six",
  12: "twelve",
};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<GridProps>(), { as: "div", columns: "one", gap: "md" });

const attrs = useAttrs();
const variants = () => ({
  columns: typeof props.columns === "number" ? COLUMN_NAMES[props.columns] : props.columns,
  gap: props.gap,
});

// Read in the render, so attribute changes re-render the grid
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "grid",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <component :is="props.as" v-bind="rootAttrs()"><slot /></component>
</template>
